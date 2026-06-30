import { authHeaders } from './authApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === 'string' ? detail : 'İstek başarısız.');
  }
  return data;
}

export function fetchAnalyses() {
  return request('/panel/analyses');
}

export function fetchProducts() {
  return request('/panel/products');
}

export function addProduct(product) {
  return request('/panel/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return request(`/panel/products/${id}`, { method: 'DELETE' });
}

export function fetchRoutineLogs(month) {
  return request(`/panel/routine?month=${month}`);
}

export function saveRoutineLog(log) {
  return request('/panel/routine', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
}

export function fetchAdminStats() {
  return request('/admin/stats');
}

export function fetchAdminUsers() {
  return request('/admin/users');
}

export function fetchAdminUserAnalyses(userId) {
  return request(`/admin/users/${userId}/analyses`);
}
