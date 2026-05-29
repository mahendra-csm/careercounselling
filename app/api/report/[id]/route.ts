import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const shareToken = req.nextUrl.searchParams.get('token');

  let query = supabase.from('reports').select('*').eq('id', params.id);

  if (!user && !shareToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (shareToken) {
    query = supabase.from('reports').select('*').eq('share_token', shareToken);
  } else {
    query = query.eq('user_id', user!.id);
  }

  const { data: report, error } = await query.maybeSingle();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...report.report_data,
    id: report.id,
    shareToken: report.share_token,
    generatedAt: report.generated_at,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId, completed, phaseIndex } = await req.json();

  const { data: report, error } = await supabase
    .from('reports')
    .select('report_data')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const reportData = report.report_data as { roadmap: Array<{ tasks: Array<{ id: string; completed: boolean }> }> };
  if (reportData.roadmap?.[phaseIndex]?.tasks) {
    const task = reportData.roadmap[phaseIndex].tasks.find((t) => t.id === taskId);
    if (task) task.completed = completed;
  }

  await supabase
    .from('reports')
    .update({ report_data: reportData })
    .eq('id', params.id)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
