import { NextRequest, NextResponse } from 'next/server';
import { insertLocalRow, maybeSingleLocalRow, selectLocalRows, updateLocalRows } from '@/lib/local-db';

type LocalDbPayload = {
  table: 'profiles' | 'reports' | 'assessments';
  op: 'select' | 'insert' | 'update';
  filters?: Array<{ field: string; value: unknown }>;
  values?: Record<string, unknown> | Record<string, unknown>[];
  mode?: 'many' | 'single' | 'maybeSingle';
};

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as LocalDbPayload;

    if (!payload?.table || !payload?.op) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const filters = payload.filters ?? [];

    if (payload.op === 'select') {
      const data =
        payload.mode === 'maybeSingle' || payload.mode === 'single'
          ? maybeSingleLocalRow(payload.table, filters)
          : selectLocalRows(payload.table, filters);

      return NextResponse.json({ data, error: null });
    }

    if (payload.op === 'insert') {
      const data = insertLocalRow(payload.table, payload.values ?? {});
      return NextResponse.json({
        data: payload.mode === 'maybeSingle' || payload.mode === 'single' ? data[0] ?? null : data,
        error: null,
      });
    }

    if (payload.op === 'update') {
      const data = updateLocalRows(payload.table, (payload.values ?? {}) as Record<string, unknown>, filters);
      return NextResponse.json({
        data: payload.mode === 'maybeSingle' || payload.mode === 'single' ? data[0] ?? null : data,
        error: null,
      });
    }

    return NextResponse.json({ error: 'Unsupported operation' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Local DB request failed' },
      { status: 500 }
    );
  }
}
