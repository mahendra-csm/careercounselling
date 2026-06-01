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

export interface FbSession {
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
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
  return data as { idToken: string; refreshToken: string; localId: string; email: string; displayName?: string; emailVerified?: boolean };
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
  if (!session) return false;
  try {
    const res = await fetch(`${FIRESTORE}/reports?documentId=${id}&key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.idToken}` },
      body: JSON.stringify({
        fields: encodeFields({
          uid: session.uid,
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
