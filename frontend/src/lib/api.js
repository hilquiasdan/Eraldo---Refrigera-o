const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('eraldo.token') || null;
}

export function setToken(token) {
  if (token) localStorage.setItem('eraldo.token', token);
  else localStorage.removeItem('eraldo.token');
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { error: text }; }
  }

  if (!res.ok) {
    const err = new ApiError(res.status, data?.error || res.statusText, data?.details);
    if (res.status === 401) {
      setToken(null);
      window.dispatchEvent(new Event('eraldo:logout'));
    }
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

export const auth = {
  async login(email, senha) {
    const data = await api.post('/auth/login', { email, senha });
    setToken(data.token);
    localStorage.setItem('eraldo.user', JSON.stringify(data.user));
    return data.user;
  },
  logout() {
    setToken(null);
    localStorage.removeItem('eraldo.user');
  },
  getUser() {
    const raw = localStorage.getItem('eraldo.user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  isAuthenticated() {
    return !!getToken();
  },
};
