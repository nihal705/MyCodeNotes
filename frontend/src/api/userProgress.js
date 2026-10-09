const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { detail: text };
  }
  if (!res.ok) {
    const err = new Error(data?.detail || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const userProgressApi = {
  toggle: (problem_type, problem_id, solved, notes = null) =>
    request("/api/user/progress/toggle", {
      method: "POST",
      body: JSON.stringify({ problem_type, problem_id, solved, notes }),
    }),
  list: () => request("/api/user/progress"),
  stats: () => request("/api/user/progress/stats"),
  updateNotes: (problem_type, problem_id, notes) =>
    request(`/api/user/progress/${problem_type}/${problem_id}/notes`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    }),
  getStreak: () => request("/api/user/progress/streak"),

  createGoal: (payload) =>
    request("/api/user/goals", { method: "POST", body: JSON.stringify(payload) }),
  listGoals: () => request("/api/user/goals"),
  getGoal: (id) => request(`/api/user/goals/${id}`),
  updateGoal: (id, payload) =>
    request(`/api/user/goals/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteGoal: (id) => request(`/api/user/goals/${id}`, { method: "DELETE" }),

  getMockCandidates: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/user/mock-test/candidates${q ? `?${q}` : ""}`);
  },
  startMockTest: (payload) =>
    request("/api/user/mock-test/start", { method: "POST", body: JSON.stringify(payload) }),
  submitMockTest: (id, solved_ids, duration_seconds) =>
    request(`/api/user/mock-test/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ solved_ids, duration_seconds }),
    }),
  listMockTests: () => request("/api/user/mock-test/list"),

  getMockTest: (id) => request(`/api/user/mock-test/${id}`),
  deleteMockTest: (id) => request(`/api/user/mock-test/${id}`, { method: "DELETE" }),

  generateStudyPlan: (payload) =>
    request("/api/user/study-plan/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  exportProgress: () => request("/api/user/export/progress"),
};