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
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Streaming chat. Now accepts contexts[], mode.
 */
export function streamChat({
  message,
  conversationId,
  pageContext,
  contexts,
  mode,
  onEvent,
  onError,
  onDone,
}) {
  const controller = new AbortController();
  const body = JSON.stringify({
    message,
    conversation_id: conversationId || null,
    page_context: pageContext || null,
    contexts: contexts || [],
    mode: mode || "normal",
  });

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        const t = await res.text();
        let detail = `HTTP ${res.status}`;
        try {
          detail = JSON.parse(t).detail || detail;
        } catch {}
        throw new Error(detail);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let splitIdx;
        while ((splitIdx = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, splitIdx);
          buffer = buffer.slice(splitIdx + 2);
          const line = rawEvent.trim();
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            onEvent?.(payload);
          } catch {}
        }
      }
      onDone?.();
    } catch (e) {
      if (e.name === "AbortError") {
        onDone?.();
        return;
      }
      onError?.(e);
    }
  })();

  return { abort: () => controller.abort() };
}

export const aiApi = {
  getUsage: () => request("/api/ai/usage"),
  getConversations: () => request("/api/ai/conversations"),
  getMessages: (conversationId) => request(`/api/ai/messages/${conversationId}`),
  sendFeedback: (messageId, feedback, note) =>
    request("/api/ai/feedback", {
      method: "POST",
      body: JSON.stringify({ message_id: messageId, feedback, note }),
    }),
  deleteConversation: (conversationId) =>
    request(`/api/ai/conversation/${conversationId}`, { method: "DELETE" }),
  exportConversation: (conversationId) =>
    request(`/api/ai/export/${conversationId}`),
};

export const inviteApi = {
  redeem: (code) =>
    request("/api/invite/redeem", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  create: (payload) =>
    request("/api/invite/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: () => request("/api/invite/list"),
};

export const adminAiApi = {
  getStats: () => request("/api/admin/ai/stats"),
  triggerCleanup: () => request("/api/admin/ai/cleanup", { method: "POST" }),
};