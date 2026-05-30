import {
  createLocalUser,
  parseLocalSession,
  serializeLocalSession,
} from '@/lib/local-db';

type LocalQueryPayload = {
  table: 'profiles' | 'reports' | 'assessments';
  op: 'select' | 'insert' | 'update';
  filters?: Array<{ field: string; value: unknown }>;
  values?: Record<string, unknown> | Record<string, unknown>[];
  mode?: 'many' | 'single' | 'maybeSingle';
};

function setSessionCookie(value: string | null) {
  if (typeof document === 'undefined') return;
  if (value) {
    document.cookie = `onegrasp-local-session=${value}; Path=/; SameSite=Lax`;
  } else {
    document.cookie = 'onegrasp-local-session=; Path=/; Max-Age=0; SameSite=Lax';
  }
}

function getSessionCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )onegrasp-local-session=([^;]+)/);
  return parseLocalSession(match?.[1] ?? null);
}

function createLocalAuthClient() {
  return {
    async getUser() {
      const user = getSessionCookie();
      return { data: { user }, error: null };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      void password;
      const user = createLocalUser(email);
      setSessionCookie(serializeLocalSession(user));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('onegrasp-local-user', JSON.stringify(user));
      }
      return { data: { user, session: { user } }, error: null };
    },
    async signUp({ email, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
      const user = createLocalUser(email, options?.data?.full_name);
      setSessionCookie(serializeLocalSession(user));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('onegrasp-local-user', JSON.stringify(user));
      }
      return { data: { user, session: { user } }, error: null };
    },
    async signOut() {
      setSessionCookie(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('onegrasp-local-user');
      }
      return { error: null };
    },
  };
}

function createLocalQueryClient(table: LocalQueryPayload['table']) {
  const state = {
    op: 'select' as LocalQueryPayload['op'],
    filters: [] as Array<{ field: string; value: unknown }>,
    values: {} as Record<string, unknown> | Record<string, unknown>[],
    mode: 'many' as NonNullable<LocalQueryPayload['mode']>,
  };

  const execute = async () => {
    const payload: LocalQueryPayload = {
      table,
      op: state.op,
      filters: state.filters,
      values: state.values,
      mode: state.mode,
    };

    const res = await fetch('/api/local-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
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
    catch(onrejected?: (reason: unknown) => unknown) {
      return execute().catch(onrejected);
    },
  };

  return builder;
}

function createLocalClient() {
  return {
    auth: createLocalAuthClient(),
    from(table: LocalQueryPayload['table']) {
      return createLocalQueryClient(table);
    },
  };
}

let client: ReturnType<typeof createLocalClient> | null = null;

export function createClient() {
  if (client) return client;

  client = createLocalClient();
  return client;
}
