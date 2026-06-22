/**
 * Firebase Auth + Firestore via the REST API — no `firebase` npm package needed.
 * Uses the project's public web config. All calls run in the browser.
 */

export const firebaseConfig = {
  apiKey: 'AIzaSyDK6nQLWJF40Asv5PHTk20kiUkbpYxzDQE',
  authDomain: 'osp-careercounselling.firebaseapp.com',
  projectId: 'osp-careercounselling',
  storageBucket: 'osp-careercounselling.firebasestorage.app',
  messagingSenderId: '1036116176636',
  appId: '1:1036116176636:web:5a254b77fe993c4cf0b179',
  measurementId: 'G-5XTQHGDL51',
};

const IDENTITY = 'https://identitytoolkit.googleapis.com/v1/accounts';
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const SESSION_KEY = 'onegrasp:firebase-session';

/** Only this account can see the admin dashboard / read all leads. */
export const ADMIN_EMAIL = 'admin@onegrasp.com';

export interface FbSession {
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  /** Epoch ms when the idToken expires (Firebase ID tokens last 1 hour). */
  expiresAt?: number;
}

/**
 * Returns a session with a non-expired idToken, refreshing it via the refresh
 * token when needed. Firebase ID tokens expire after 1 hour, so a long exam can
 * outlive the token created at sign-up — without this, the final Firestore
 * write (report/lead) would fail with a permission error.
 */
export async function ensureFreshSession(session: FbSession | null): Promise<FbSession | null> {
  if (!session) return null;
  // Still valid for >2 minutes → use as-is.
  if (session.expiresAt && session.expiresAt - Date.now() > 120000) return session;
  try {
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(session.refreshToken)}`,
    });
    if (!res.ok) return session;
    const data = await res.json();
    const fresh: FbSession = {
      ...session,
      idToken: data.id_token ?? session.idToken,
      refreshToken: data.refresh_token ?? session.refreshToken,
      expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
    };
    setSession(fresh);
    return fresh;
  } catch {
    return session;
  }
}

// ---------- session (localStorage) ----------
export function getSession(): FbSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as FbSession) : null;
  } catch {
    return null;
  }
}
function setSession(s: FbSession | null) {
  if (typeof window === 'undefined') return;
  if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else window.localStorage.removeItem(SESSION_KEY);
}
export function signOut() {
  setSession(null);
}

/** Update the locally-stored display name (used by Settings). */
export function updateSessionName(name: string) {
  const s = getSession();
  if (s) setSession({ ...s, name });
}

async function identityCall(action: string, body: Record<string, unknown>) {
  const res = await fetch(`${IDENTITY}:${action}?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message || 'AUTH_ERROR';
    const err = new Error(friendlyAuthError(code)) as Error & { code?: string };
    err.code = code;
    throw err;
  }
  return data as { idToken: string; refreshToken: string; localId: string; email: string; displayName?: string; emailVerified?: boolean; expiresIn?: string };
}

function friendlyAuthError(code: string) {
  if (code.includes('EMAIL_EXISTS')) return 'That email is already registered — try signing in.';
  if (code.includes('EMAIL_NOT_FOUND') || code.includes('INVALID_PASSWORD') || code.includes('INVALID_LOGIN_CREDENTIALS'))
    return "That email or password doesn't match — try again?";
  if (code.includes('WEAK_PASSWORD')) return 'Password should be at least 6 characters.';
  if (code.includes('INVALID_EMAIL')) return 'That email looks off — try again?';
  if (code.includes('OPERATION_NOT_ALLOWED')) return 'Email/password sign-in is disabled for this project. Enable it in Firebase Auth.';
  return 'Authentication failed. Please try again.';
}

/** Register: email + password + name. Creates the Firebase account and signs the user in. */
export async function signUp(email: string, password: string, name?: string): Promise<FbSession> {
  const data = await identityCall('signUp', { email, password });
  if (name) {
    try {
      await fetch(`${IDENTITY}:update?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: data.idToken, displayName: name, returnSecureToken: false }),
      });
    } catch { /* non-fatal */ }
  }
  const session: FbSession = {
    idToken: data.idToken, refreshToken: data.refreshToken, uid: data.localId,
    email: data.email, name: name || data.email.split('@')[0], emailVerified: true,
    expiresAt: Date.now() + Number(data.expiresIn ?? 3600) * 1000,
  };
  setSession(session);
  return session;
}

/** Login: email + password. Checks the credentials against Firebase. */
export async function signIn(email: string, password: string): Promise<FbSession> {
  const data = await identityCall('signInWithPassword', { email, password });
  const session: FbSession = {
    idToken: data.idToken, refreshToken: data.refreshToken, uid: data.localId,
    email: data.email, name: data.displayName || data.email.split('@')[0],
    emailVerified: true,
    expiresAt: Date.now() + Number(data.expiresIn ?? 3600) * 1000,
  };
  setSession(session);
  return session;
}

export function isFirebaseConfigured() {
  return /^AIza/.test(firebaseConfig.apiKey);
}

// ---------- Firestore (store report as one JSON string field) ----------
function encodeFields(obj: Record<string, string | number>) {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = typeof v === 'number' ? { integerValue: String(v) } : { stringValue: v };
  }
  return fields;
}

/** Save a report. Returns the document id. Falls back silently if Firestore denies. */
export async function saveReport(id: string, profile: unknown, session: FbSession | null): Promise<boolean> {
  const s = await ensureFreshSession(session);
  if (!s) return false;
  try {
    const res = await fetch(`${FIRESTORE}/reports?documentId=${id}&key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.idToken}` },
      body: JSON.stringify({
        fields: encodeFields({
          uid: s.uid,
          data: JSON.stringify(profile),
          createdAt: new Date().toISOString(),
        }),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Save a student lead (all collected info, both forms). Upserts ONE document per
 * student (doc id = their uid) so the pre-exam and post-exam saves merge into a
 * single record with NO duplicates. Best-effort.
 */
export async function saveLead(
  lead: Record<string, string | number>,
  session: FbSession | null
): Promise<boolean> {
  try {
    const s = await ensureFreshSession(session);
    if (!s) return false;
    const res = await fetch(`${FIRESTORE}/leads/${s.uid}?key=${firebaseConfig.apiKey}`, {
      method: 'PATCH', // PATCH on a missing doc creates it; on an existing one updates it
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.idToken}` },
      body: JSON.stringify({
        fields: encodeFields({ ...lead, uid: s.uid, updatedAt: new Date().toISOString() }),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface LeadRecord {
  id: string;
  createTime?: string;
  [key: string]: string | number | boolean | undefined;
}

/** Decode a Firestore REST document's fields into plain JS values. */
function decodeFields(fields: Record<string, Record<string, unknown>> = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(fields)) {
    if ('stringValue' in v) out[k] = v.stringValue as string;
    else if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('doubleValue' in v) out[k] = Number(v.doubleValue);
    else if ('booleanValue' in v) out[k] = Boolean(v.booleanValue);
  }
  return out;
}

/** Admin only: list every lead. Firestore rules restrict reads to ADMIN_EMAIL. */
export async function listLeads(session: FbSession | null): Promise<LeadRecord[]> {
  const s = await ensureFreshSession(session);
  if (!s) return [];
  const leads: LeadRecord[] = [];
  let pageToken = '';
  try {
    do {
      const url = `${FIRESTORE}/leads?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${s.idToken}` } });
      if (!res.ok) break;
      const data = await res.json();
      for (const doc of data.documents ?? []) {
        const id = String(doc.name).split('/').pop() as string;
        leads.push({ id, createTime: doc.createTime, ...decodeFields(doc.fields) });
      }
      pageToken = data.nextPageToken ?? '';
    } while (pageToken);
  } catch {
    /* return whatever we collected */
  }
  // Newest first (by Firestore createTime — no index needed).
  leads.sort((a, b) => String(b.createTime ?? '').localeCompare(String(a.createTime ?? '')));
  return leads;
}

export interface SchoolRecord { id: string; name: string }

/** Admin only: list schools the admin has created. */
export async function listSchools(session: FbSession | null): Promise<SchoolRecord[]> {
  const s = await ensureFreshSession(session);
  if (!s) return [];
  try {
    const res = await fetch(`${FIRESTORE}/schools?pageSize=300`, { headers: { Authorization: `Bearer ${s.idToken}` } });
    if (!res.ok) return [];
    const data = await res.json();
    const rows: SchoolRecord[] = (data.documents ?? []).map((doc: { name: string; fields?: Record<string, Record<string, unknown>> }) => ({
      id: String(doc.name).split('/').pop() as string,
      name: String(decodeFields(doc.fields).name ?? ''),
    }));
    return rows.filter((r) => r.name).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/** Admin only: create a school. */
export async function createSchool(name: string, session: FbSession | null): Promise<boolean> {
  if (!name.trim()) return false;
  const s = await ensureFreshSession(session);
  if (!s) return false;
  try {
    const res = await fetch(`${FIRESTORE}/schools?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.idToken}` },
      body: JSON.stringify({ fields: { name: { stringValue: name.trim() }, createdAt: { stringValue: new Date().toISOString() } } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Admin only: assign/reassign a lead to a school. */
export async function updateLeadSchool(id: string, school: string, session: FbSession | null): Promise<boolean> {
  const s = await ensureFreshSession(session);
  if (!s) return false;
  try {
    const res = await fetch(`${FIRESTORE}/leads/${id}?updateMask.fieldPaths=school&key=${firebaseConfig.apiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.idToken}` },
      body: JSON.stringify({ fields: { school: { stringValue: school } } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Admin only: mark a lead's report as emailed. */
export async function markLeadEmailed(id: string, session: FbSession | null): Promise<boolean> {
  const s = await ensureFreshSession(session);
  if (!s) return false;
  try {
    const res = await fetch(
      `${FIRESTORE}/leads/${id}?updateMask.fieldPaths=emailed&updateMask.fieldPaths=emailedAt&key=${firebaseConfig.apiKey}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.idToken}` },
        body: JSON.stringify({
          fields: { emailed: { booleanValue: true }, emailedAt: { stringValue: new Date().toISOString() } },
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Admin only: list every document id in a collection. */
async function listDocIds(collection: string, session: FbSession): Promise<string[]> {
  const ids: string[] = [];
  let pageToken = '';
  try {
    do {
      const url = `${FIRESTORE}/${collection}?pageSize=300&key=${firebaseConfig.apiKey}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.idToken}` } });
      if (!res.ok) break;
      const data = await res.json();
      for (const doc of data.documents ?? []) ids.push(String(doc.name).split('/').pop() as string);
      pageToken = data.nextPageToken ?? '';
    } while (pageToken);
  } catch { /* return what we have */ }
  return ids;
}

async function deleteDoc(collection: string, id: string, session: FbSession): Promise<boolean> {
  try {
    const res = await fetch(`${FIRESTORE}/${collection}/${id}?key=${firebaseConfig.apiKey}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.idToken}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Admin only: permanently delete every student lead and every saved report.
 * Used to reset the database before a fresh round of school testing.
 * Returns counts of what was removed (and any that failed).
 */
export async function clearAllStudentData(
  session: FbSession | null
): Promise<{ leadsDeleted: number; reportsDeleted: number; failed: number }> {
  const s = await ensureFreshSession(session);
  if (!s || s.email.toLowerCase() !== ADMIN_EMAIL) return { leadsDeleted: 0, reportsDeleted: 0, failed: 0 };

  // Gather report ids from the reports collection AND from each lead (belt and braces).
  const leadIds = await listDocIds('leads', s);
  const reportIdsFromCollection = await listDocIds('reports', s);
  const reportIdsFromLeads = (await listLeads(s)).map((l) => String(l.reportId ?? '')).filter(Boolean);
  const reportIds = Array.from(new Set([...reportIdsFromCollection, ...reportIdsFromLeads]));

  let leadsDeleted = 0; let reportsDeleted = 0; let failed = 0;
  for (const id of leadIds) { (await deleteDoc('leads', id, s)) ? leadsDeleted++ : failed++; }
  for (const id of reportIds) { (await deleteDoc('reports', id, s)) ? reportsDeleted++ : failed++; }
  return { leadsDeleted, reportsDeleted, failed };
}

/** Read a report by id from Firestore. Returns parsed profile or null. */
export async function loadReport(id: string, session: FbSession | null): Promise<any | null> {
  try {
    const headers: Record<string, string> = {};
    if (session) headers.Authorization = `Bearer ${session.idToken}`;
    const res = await fetch(`${FIRESTORE}/reports/${id}?key=${firebaseConfig.apiKey}`, { headers });
    if (!res.ok) return null;
    const doc = await res.json();
    const raw = doc?.fields?.data?.stringValue;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
