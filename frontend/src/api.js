const API_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('rsc_token');
}

async function request(path, { method = 'GET', body, isForm = false, auth = true } = {}) {
  const headers = {};
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me'),
  updateProfile: (formData) => request('/api/auth/me', { method: 'PUT', body: formData, isForm: true }),
  getUserByUsername: (username) => request(`/api/auth/users/${encodeURIComponent(username)}`, { auth: false }),

  // Recipes
  searchRecipes: (params) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/api/recipes?${qs}`, { auth: false });
  },
  getCategories: () => request('/api/recipes/categories', { auth: false }),
  getRecipe: (id) => request(`/api/recipes/${id}`, { auth: false }),
  createRecipe: (formData) => request('/api/recipes', { method: 'POST', body: formData, isForm: true }),
  updateRecipe: (id, formData) => request(`/api/recipes/${id}`, { method: 'PUT', body: formData, isForm: true }),
  deleteRecipe: (id) => request(`/api/recipes/${id}`, { method: 'DELETE' }),

  // Ratings
  rateRecipe: (id, payload) => request(`/api/recipes/${id}/ratings`, { method: 'POST', body: payload }),
  removeRating: (id) => request(`/api/recipes/${id}/ratings`, { method: 'DELETE' }),
};

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}
