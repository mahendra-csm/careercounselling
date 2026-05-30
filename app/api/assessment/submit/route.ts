import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateFullReport } from '@/lib/report-generator';
import type { AssessmentAnswers } from '@/types/assessment';

const AnswersSchema = z.object({
  name: z.string().min(1),
  currentRole: z.string().min(1),
  yearsExperience: z.number().min(0).max(40),
  industry: z.string().min(1),
  currentSkills: z.array(z.string()).min(1),
  targetRole: z.string().min(1),
  companyType: z.string().min(1),
  locationPreference: z.string().min(1),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
  workPace: z.string().min(1),
  teamSize: z.string().min(1),
  managementStyle: z.string().min(1),
  learningStyle: z.string().min(1),
  timeline: z.string().min(1),
  topPriority: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const supabase = createSupabaseServerClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          send({ step: 'error', progress: 0, message: 'Authentication required.' });
          controller.close();
          return;
        }

        const body = await req.json();
        const parsed = AnswersSchema.safeParse(body);
        if (!parsed.success) {
          send({
            step: 'error',
            progress: 0,
            message: 'Invalid input: ' + parsed.error.issues[0]?.message,
          });
          controller.close();
          return;
        }

        const answers = parsed.data as AssessmentAnswers;

        // Save assessment
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({ user_id: user.id, answers })
          .select()
          .single();

        if (assessmentError || !assessment) {
          send({ step: 'error', progress: 0, message: 'Failed to save assessment.' });
          controller.close();
          return;
        }

        send({ step: 'profile', progress: 15, message: 'Reviewing your answers...' });

        const report = await generateFullReport(
          answers,
          user.id,
          assessment.id,
          (evt) => send(evt)
        );

        // Save report
        const { data: savedReport, error: reportError } = await supabase
          .from('reports')
          .insert({
            user_id: user.id,
            assessment_id: assessment.id,
            report_data: report,
          })
          .select()
          .single();

        if (reportError || !savedReport) {
          send({ step: 'error', progress: 0, message: 'Failed to save report.' });
          controller.close();
          return;
        }

        // Update profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('assessments_completed')
          .eq('id', user.id)
          .maybeSingle();

        await supabase
          .from('profiles')
          .update({
            job_title: answers.currentRole,
            industry: answers.industry,
            years_experience: answers.yearsExperience,
            last_report_id: savedReport.id,
            assessments_completed: Number((existingProfile as { assessments_completed?: number } | null)?.assessments_completed ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        send({
          step: 'complete',
          progress: 100,
          message: 'Your report is ready!',
          reportId: savedReport.id,
          shareToken: savedReport.share_token,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
        send({ step: 'error', progress: 0, message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
