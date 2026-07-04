// Lightweight API client for HRMS frontend
// - Uses real backend when available (http://localhost:8000 by default)
// - Falls back to in-memory mock data so the UI works end-to-end in demo mode

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

let authToken: string | null = localStorage.getItem('hrms_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('hrms_token', token);
  else localStorage.removeItem('hrms_token');
}

export function getAuthToken() {
  return authToken;
}

async function request(path: string, options: RequestInit = {}) {
  const headers: any = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// --- Real API calls (best effort) ---

export async function apiLogin(email: string, password: string) {
  // Backend login expects form data with username=email
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  setAuthToken(data.access_token);
  return data;
}

export async function apiSignup(payload: { email: string; password: string; name: string; role?: string }) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, role: payload.role || 'Employee' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetProfile() {
  return request('/api/profile/me');
}

export async function apiCheckIn() {
  return request('/api/attendance/check-in', { method: 'POST' });
}

export async function apiCheckOut() {
  return request('/api/attendance/check-out', { method: 'POST' });
}

export async function apiApplyLeave(payload: { leave_type: string; start_date: string; end_date: string; remarks?: string }) {
  return request('/api/leaves/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- Mock fallback layer (used when backend is unreachable) ---

const mockState = {
  isLoggedIn: false,
  role: 'employee' as 'admin' | 'employee',
  user: { name: 'Demo User', role: 'Employee', employee_id: 'REVE000042' },
  attendance: { checkedIn: false, todayHours: '0h 00m' },
  leaves: [] as any[],
};

export async function mockLogin(email: string, password: string, chosenRole: 'admin' | 'employee') {
  // Accept any non-empty password for demo
  if (!password) throw new Error('Password required');
  mockState.isLoggedIn = true;
  mockState.role = chosenRole;
  mockState.user = {
    name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    role: chosenRole === 'admin' ? 'Admin' : 'Employee',
    employee_id: 'REVE000099',
  };
  setAuthToken('mock-token-' + Date.now());
  return { access_token: 'mock-token' };
}

export async function mockGetProfile() {
  return {
    ...mockState.user,
    email: 'demo@nimbus.co',
    phone: '+1 (555) 0100',
    address: '123 Market St, SF',
  };
}

export async function mockCheckIn() {
  mockState.attendance.checkedIn = true;
  mockState.attendance.todayHours = '0h 01m';
  return { message: 'Check-in successful (mock)' };
}

export async function mockCheckOut() {
  mockState.attendance.checkedIn = false;
  mockState.attendance.todayHours = '8h 05m';
  return { message: 'Check-out successful (mock)' };
}

export async function mockApplyLeave(payload: any) {
  const item = { id: 'L' + Date.now(), ...payload, status: 'Pending' };
  mockState.leaves.unshift(item);
  return item;
}

// --- Public API used by the UI ---

export async function login(email: string, password: string, chosenRole: 'admin' | 'employee') {
  try {
    await apiLogin(email, password);
    // If real login worked, fetch profile to know the role
    const profile = await apiGetProfile().catch(() => null);
    return { ok: true, role: profile?.role?.toLowerCase().includes('admin') ? 'admin' : 'employee', profile };
  } catch {
    // Fallback to mock
    await mockLogin(email, password, chosenRole);
    return { ok: true, role: chosenRole, profile: await mockGetProfile() };
  }
}

export async function getProfile() {
  try { return await apiGetProfile(); } catch { return await mockGetProfile(); }
}

export async function checkIn() {
  try { return await apiCheckIn(); } catch { return await mockCheckIn(); }
}

export async function checkOut() {
  try { return await apiCheckOut(); } catch { return await mockCheckOut(); }
}

export async function applyLeave(payload: any) {
  try { return await apiApplyLeave(payload); } catch { return await mockApplyLeave(payload); }
}

// Add these to the bottom of frontend/src/lib/api.ts

export async function apiGetUsers() {
  return request('/api/admin/users');
}

export async function getUsers() {
  try {
    return await apiGetUsers();
  } catch {
    // Fallback mock users if backend is ever disconnected
    return [
      { id: 1, employee_id: "REVE000001", name: "Sofia Rossi", job_title: "Product Designer", email: "sofia@nimbus.co", role: "HR" },
      { id: 2, employee_id: "REVE000002", name: "James Whitfield", job_title: "Backend Engineer", email: "james@nimbus.co", role: "Employee" }
    ];
  }
}