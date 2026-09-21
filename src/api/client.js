// In local dev, .env sets this to http://localhost:4000 (a real address,
// since your React dev server and API run on different ports on your own
// machine). In production, this is set to an EMPTY string on purpose —
// see shaniz-site/vercel.json — so requests go to THIS site's own /api/
// path instead of a different domain, and Vercel forwards them to the
// real backend behind the scenes. `??` (not `||`) matters here: an
// intentionally empty string must NOT fall back to localhost.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

// Every mutating request needs this header — the backend's CSRF
// middleware (src/middleware/csrf.js in shaniz-api) rejects POST/PUT/
// DELETE requests without it. GET requests don't need it.
const CSRF_HEADER = { 'X-Requested-With': 'shaniz-frontend' }

async function handle(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : null
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return body
}

export function apiGet(path) {
  return fetch(`${API_URL}${path}`, {
    credentials: 'include',
  }).then(handle)
}

export function apiSend(method, path, data) {
  return fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...CSRF_HEADER },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  }).then(handle)
}

export const apiPost = (path, data) => apiSend('POST', path, data)
export const apiPut = (path, data) => apiSend('PUT', path, data)
export const apiDelete = (path, data) => apiSend('DELETE', path, data)

// File uploads use FormData, so no Content-Type header — the browser sets
// the multipart boundary itself. The CSRF header still applies.
export function apiUpload(path, file) {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...CSRF_HEADER },
    body: formData,
  }).then(handle)
}
