// Small shared helper used by every page.
// Keeps the login token in localStorage and attaches it to every API call.

const API_BASE = '/api'; // same origin as the frontend, since Express serves both

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Redirects to login if not logged in, or if logged in as the wrong role.
function requireRole(role) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = 'index.html';
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
    return null;
  }
  return user;
}

// Wrapper around fetch() that adds the Authorization header automatically.
async function apiRequest(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}
