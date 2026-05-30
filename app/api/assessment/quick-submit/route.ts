import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateFullReport } from '@/lib/report-generator';
import { scoreQuickAssessment } from '@/lib/career-assessment';
import { buildLocalDemoReport, isLocalMode } from '@/lib/local-db';

type QuickAnswer = { id: string; value: number };

function sseEvent(event: string, payload: Record<string, any>) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const stream = url.searchParams.get('stream') === '1';

    const body = await req.json();
    const answers = (body.answers ?? []) as QuickAnswer[];
    const name = body.name as string | undefined;
    const futureCareer = body.futureCareer as string | undefined;

    const insight = scoreQuickAssessment(answers, name, futureCareer);
    const mapped = { ...insight.assessmentAnswers } as any;

    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const localMode = isLocalMode();
    // In local mode we always persist (anonymous students get a stable demo id);
    // in production we only persist for an authenticated user.
    const userId = user?.id ?? (localMode ? 'anon-local' : null);
    const canPersist = Boolean(userId);

    // Build the report body once. With no Anthropic key (local mode) we use the
    // deterministic student report; otherwise we call the full generator.
    async function buildReport(assessmentId: string, onProgress?: (e: any) => void) {
      if (localMode || !user) {
        return buildLocalDemoReport(mapped, userId ?? 'anon-local', assessmentId, new Date().toISOString());
      }
      return generateFullReport(mapped, user.id, assessmentId, onProgress);
    }

    async function persist(onProgress?: (e: any) => void): Promise<string> {
      // 1. Save the assessment
      let assessmentId = `local-${Date.now()}`;
      if (canPersist) {
        const { data: assessment } = await supabase
          .from('assessments')
          .insert({ user_id: userId, answers: mapped })
          .select()
          .single();
        if (assessment && (assessment as any).id) assessmentId = (assessment as any).id;
      }

      // 2. Generate the report
      const report = await buildReport(assessmentId, onProgress);

      // 3. Save the report and return its row id (so the report page can load it)
      let savedId = assessmentId;
      if (canPersist) {
        const { data: savedReport } = await supabase
          .from('reports')
          .insert({ user_id: userId, assessment_id: assessmentId, report_data: report })
          .select()
          .single();
        if (savedReport && (savedReport as any).id) savedId = (savedReport as any).id;
        if (user) {
          await supabase
            .from('profiles')
            .update({ last_report_id: savedId, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      }
      return savedId;
    }

    if (stream) {
      const encoder = new TextEncoder();
      const sseStream = new ReadableStream({
        async start(controller) {
          const emit = (event: string, payload: Record<string, any>) =>
            controller.enqueue(encoder.encode(sseEvent(event, payload)));
          try {
            emit('progress', { step: 'starting', progress: 5, message: 'Preparing your report...' });
            emit('progress', { step: 'analysis', progress: 35, message: 'Analyzing strengths and interests...' });

            const savedId = await persist((e) =>
              emit('progress', { step: e.step, progress: e.progress, message: e.message })
            );

            emit('progress', { step: 'complete', progress: 95, message: 'Report ready.' });
            emit('done', {
              reportId: savedId,
              overallScore: insight.overallScore,
              topCareerChoices: insight.topCareerChoices,
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Quick submit failed';
            emit('error', { step: 'error', progress: 0, message });
          } finally {
            controller.close();
          }
        },
      });

      return new NextResponse(sseStream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

    // Non-streaming
    const savedId = await persist();
    return NextResponse.json({
      reportId: savedId,
      overallScore: insight.overallScore,
      topCareerChoices: insight.topCareerChoices,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quick submit failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
