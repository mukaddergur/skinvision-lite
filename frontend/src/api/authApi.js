const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'skinvision_token';
const USER_KEY = 'skinvision_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  return data.detail || 'İşlem başarısız.';
}

export async function register(username, email, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchMe() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
