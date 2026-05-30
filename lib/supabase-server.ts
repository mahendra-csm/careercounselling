import { cookies } from 'next/headers';
import {
  ensureLocalSeedData,
  parseLocalSession,
  selectLocalRows,
  insertLocalRow,
  updateLocalRows,
} from '@/lib/local-db';

function createLocalServerClient() {
  const cookieStore = cookies();

  const getSessionUser = () => {
    const raw = cookieStore.get('onegrasp-local-session')?.value;
    return parseLocalSession(raw ?? null);
  };

  const makeQuery = (table: 'profiles' | 'reports' | 'assessments') => {
    const state = {
      op: 'select' as 'select' | 'insert' | 'update',
      filters: [] as Array<{ field: string; value: unknown }>,
      values: {} as Record<string, unknown> | Record<string, unknown>[],
      mode: 'many' as 'many' | 'single' | 'maybeSingle',
    };

    const execute = async () => {
      if (state.op === 'select') {
        const rows = selectLocalRows(table, state.filters);
        const data = state.mode === 'many' ? rows : rows[0] ?? null;
        return { data, error: null };
      }

      if (state.op === 'insert') {
        const rows = insertLocalRow(table, state.values);
        const data = state.mode === 'many' ? rows : rows[0] ?? null;
        return { data, error: null };
      }

      const rows = updateLocalRows(table, state.values as Record<string, unknown>, state.filters);
      const data = state.mode === 'many' ? rows : rows[0] ?? null;
      return { data, error: null };
    };

    const builder: Record<string, unknown> = {
      select() {
        if (state.op !== 'insert' && state.op !== 'update') {
          state.op = 'select';
        }
        return builder;
      },
      eq(field: string, value: unknown) {
        state.filters.push({ field, value });
        return builder;
      },
      insert(values: Record<string, unknown> | Record<string, unknown>[]) {
        state.op = 'insert';
        state.values = values;
        return builder;
      },
      update(values: Record<string, unknown>) {
        state.op = 'update';
        state.values = values;
        return builder;
      },
      single() {
        state.mode = 'single';
        return execute();
      },
      maybeSingle() {
        state.mode = 'maybeSingle';
        return execute();
      },
      then(onfulfilled?: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) {
        return execute().then(onfulfilled, onrejected);
      },
    };

    return builder;
  };

  return {
    auth: {
      async getUser() {
        const user = getSessionUser();
        if (!user) {
          return { data: { user: null }, error: null };
        }

        ensureLocalSeedData(user);
        return { data: { user, session: { user } }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithPassword() {
        return { error: null };
      },
      async signUp() {
        return { error: null };
      },
    },
    from(table: 'profiles' | 'reports' | 'assessments') {
      return makeQuery(table);
    },
  };
}

export function createSupabaseServerClient() {
  return createLocalServerClient();
}

export function createSupabaseServiceClient() {
  return createLocalServerClient();
}
