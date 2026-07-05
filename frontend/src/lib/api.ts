export const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

let authToken: string | null = localStorage.getItem('hrms_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('hrms_token', token);
  else localStorage.removeItem('hrms_token');
}

export function getAuthToken() {
  return authToken;
}

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError || ((err as Error)?.message?.includes('Failed to fetch'));
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (body && typeof body.detail === 'string') {
      throw new Error(body.detail);
    }
    throw new Error(body?.detail?.[0]?.msg?.replace('Value error, ', '') || `Request failed (${res.status})`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// --- Real API calls ---

export async function apiLogin(email: string, password: string) {
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
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        if (Array.isArray(body.detail)) {
          const msgs = body.detail.map((d: any) => d.msg?.replace(/^Value error,\s*/i, '') || '');
          detail = msgs.join('; ');
        } else {
          detail = String(body.detail);
        }
      }
    } catch {}
    throw new Error(detail);
  }
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

export async function apiGetUsers() {
  return request('/api/admin/users');
}

export async function apiGetLeaves() {
  return request('/api/leaves/');
}

export async function apiApproveLeave(leaveId: number, status: string, adminComments?: string) {
  return request(`/api/leaves/admin/${leaveId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, admin_comments: adminComments || null }),
  });
}

// --- Mock fallback (only when backend is unreachable) ---

const mockState: {
  isLoggedIn: boolean;
  role: 'admin' | 'employee';
  user: { name: string; role: string; employee_id: string };
  attendance: { checkedIn: boolean; todayHours: string };
  leaves: Array<{ id: string; status: string; [key: string]: unknown }>;
} = {
  isLoggedIn: false,
  role: 'employee',
  user: { name: 'Demo User', role: 'Employee', employee_id: 'REVE000042' },
  attendance: { checkedIn: false, todayHours: '0h 00m' },
  leaves: [],
};

export async function mockLogin(email: string, _password: string, chosenRole: 'admin' | 'employee') {
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

export async function mockApplyLeave(payload: Record<string, unknown>) {
  const item = { id: 'L' + Date.now(), ...payload, status: 'Pending' };
  mockState.leaves.unshift(item);
  return item;
}

// --- Public API used by the UI ---

export async function login(email: string, password: string, chosenRole: 'admin' | 'employee') {
  try {
    await apiLogin(email, password);
    const profile = await apiGetProfile().catch(() => null);
    return { ok: true, role: profile?.role?.toLowerCase().includes('admin') ? 'admin' : 'employee', profile };
  } catch (err) {
    if (isNetworkError(err)) {
      await mockLogin(email, password, chosenRole);
      return { ok: true, role: chosenRole, profile: await mockGetProfile() };
    }
    throw err;
  }
}

export async function getProfile() {
  try { return await apiGetProfile(); } catch (err) {
    if (isNetworkError(err)) return await mockGetProfile();
    throw err;
  }
}

export async function checkIn() {
  try { return await apiCheckIn(); } catch (err) {
    if (isNetworkError(err)) return await mockCheckIn();
    throw err;
  }
}

export async function checkOut() {
  try { return await apiCheckOut(); } catch (err) {
    if (isNetworkError(err)) return await mockCheckOut();
    throw err;
  }
}

export async function applyLeave(payload: { leave_type: string; start_date: string; end_date: string; remarks?: string }) {
  try { return await apiApplyLeave(payload); } catch (err) {
    if (isNetworkError(err)) return await mockApplyLeave(payload);
    throw err;
  }
}

export async function getUsers() {
  try { return await apiGetUsers(); } catch (err) {
    if (isNetworkError(err)) return [];
    throw err;
  }
}

export async function getLeaves() {
  try { return await apiGetLeaves(); } catch (err) {
    if (isNetworkError(err)) return [];
    throw err;
  }
}

export async function approveLeave(leaveId: number, status: string, adminComments?: string) {
  return await apiApproveLeave(leaveId, status, adminComments);
}
