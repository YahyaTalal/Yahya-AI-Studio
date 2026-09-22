// ─────────────────────────────────────────────────────────────────────────────
// api.js — central fetch wrapper for the Yahya AI Studio backend.
// - Base URL from VITE_API_BASE (default "" = same origin).
// - Attaches `Authorization: Bearer <supabase-jwt>` when a session token exists.
// - Skips the header in bypass (local) mode — no token is registered there.
// - Throws an Error with `err.status = 401` on 401 and fires the registered
//   unauthorized handler (AuthContext uses it to send the user back to login).
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

let _getToken = null;
let _onUnauthorized = null;

/** AuthContext registers a token getter so this module never holds auth state. */
export function setTokenGetter(fn) {
  _getToken = fn;
}

/** Called with no args whenever a 401 is received. */
export function onUnauthorized(fn) {
  _onUnauthorized = fn;
}

function joinUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path;
  return API_BASE + (path.startsWith('/') ? path : '/' + path);
}

export async function apiFetch(path, options = {}) {
  const token = typeof _getToken === 'function' ? _getToken() : null;
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(joinUrl(path), { ...options, headers });
  if (res.status === 401) {
    const err = new Error('Session expired — please sign in again.');
    err.status = 401;
    if (typeof _onUnauthorized === 'function') {
      try { _onUnauthorized(); } catch { /* noop */ }
    }
    throw err;
  }
  return res;
}

/** Parse JSON, but throw a meaningful error (with the HTTP status) instead of
 *  the cryptic "Unexpected end of JSON input" when the server returns an
 *  empty body, an error page, or non-JSON (e.g. the backend is down). */
async function parseJson(res) {
  const text = await res.text();
  if (!res.ok) {
    const snippet = text.slice(0, 120).trim();
    throw new Error(`Request failed (${res.status})${snippet ? ': ' + snippet : ''}`);
  }
  if (!text.trim()) {
    throw new Error(`Empty response from server (${res.status}) — is the backend running?`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server returned a non-JSON response (${res.status}).`);
  }
}

/** GET + parse JSON. */
export async function apiGet(path) {
  const res = await apiFetch(path);
  return parseJson(res);
}

/** POST JSON body + parse JSON. */
export async function apiPostJson(path, body) {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

/** POST multipart FormData + parse JSON. */
export async function apiPostForm(path, formData) {
  const res = await apiFetch(path, { method: 'POST', body: formData });
  return parseJson(res);
}

// ── Media library ────────────────────────────────────────────────────────────
// GET /api/media  → [{ id, filename, kind, size_bytes, signed_url }]
export const listMedia = () => apiGet('/api/media');

// POST /api/media/upload (multipart: file, kind)
export function uploadMedia(file, kind) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('kind', kind);
  return apiPostForm('/api/media/upload', fd);
}

// DELETE /api/media/{id}
export const deleteMedia = (id) => apiFetch(`/api/media/${id}`, { method: 'DELETE' });

// ── Account ──────────────────────────────────────────────────────────────────
// GET /api/account → { email, display_name, storage_used_bytes, storage_quota_bytes }
export const getAccount = () => apiGet('/api/account');

// PATCH /api/account { display_name } → updated profile
export function updateDisplayName(displayName) {
  return apiFetch('/api/account', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName }),
  }).then((r) => r.json());
}

// DELETE /api/account
export const deleteAccount = () => apiFetch('/api/account', { method: 'DELETE' });
