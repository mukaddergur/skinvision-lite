import { authHeaders } from './authApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export async function analyzeImage(file, skinType = 'normal') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('skin_type', skinType);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => d.msg).join(', ')
        : 'Analiz sırasında bir hata oluştu.';
    throw new Error(message);
  }

  return data;
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('API bağlantısı kurulamadı.');
  return response.json();
}
