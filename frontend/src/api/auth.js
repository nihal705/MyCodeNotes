const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
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
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  signup: (payload) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),

  verifyOtp: (email, otp) =>
    request("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request("/api/auth/logout", { method: "POST" }),

  me: () => request("/api/auth/me"),

  forgot: (email) =>
    request("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email }) }),

  reset: (email, otp, new_password) =>
    request("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password }),
    }),

  updateProfile: (payload) =>
    request("/api/auth/me", { method: "PATCH", body: JSON.stringify(payload) }),

  changePassword: (current_password, new_password) =>
    request("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/auth/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { detail: text };
    }
    if (!res.ok) {
      const err = new Error(data?.detail || "Avatar upload failed");
      err.status = res.status;
      throw err;
    }
    return data;
  },
};