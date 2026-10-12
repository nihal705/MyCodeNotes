import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus, FiSend, FiTrash2, FiDownload, FiTag, FiMenu, FiMessageSquare, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

import { useAIChat } from "../../contexts/AIContext";
import { useUser } from "../../contexts/AuthContext";
import ChatMessage from "./ChatMessage";
import SuggestionChips from "./SuggestionChips";
import VoiceInput from "./VoiceInput";
import NextraLogo from "./NextraLogo";
import ModeSelector from "./ModeSelector";
import ConfirmDialog from "../common/ConfirmDialog";
import { downloadChatAsPDF } from "../../utils/chatPdf";

export default function NextraAIFullScreen() {
  const {
    isFullScreen, sidebarOpen, toggleSidebar, closeDrawer,
    messages, currentConversationId, conversations, loadingHistory,
    pinnedContexts, unpinContext, mode, setMode, usage,
    isStreaming, streamingText, streamingCitations, streamingTier,
    startNewChat, handleSend, abortStream,
    loadHistory, loadConversation, deleteConversation, exportChat,
    setShowPicker, setShowInvite,
  } = useAIChat();
  const { user, logout } = useUser();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamingText]);

  useEffect(() => {
    if (isFullScreen) loadHistory();
  }, [isFullScreen, loadHistory]);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (isFullScreen) inputRef.current?.focus();
  }, [isFullScreen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isFullScreen) closeDrawer(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullScreen, closeDrawer]);

  const handleExport = async () => {
    const data = await exportChat();
    if (!data) return;
    try { await downloadChatAsPDF(data); toast.success("Chat exported"); } catch { toast.error("PDF failed"); }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const val = e.target.value;
      e.target.value = "";
      handleSend(val);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-[#0B0F17] flex overflow-hidden"
          >
            <aside className={`${sidebarOpen ? "w-[260px]" : "w-0"} shrink-0 bg-[#F7F7F8] dark:bg-[#14161A] border-r border-gray-200 dark:border-[#1F2328] transition-all duration-300 overflow-hidden flex flex-col`}>
              <div className="flex flex-col h-full w-[260px]">
                <div className="px-4 py-4 flex items-center gap-2.5 border-b border-gray-200 dark:border-[#1F2328]">
                  <NextraLogo size={24} glow />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">NextraAI</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">by MyCodeNotes</p>
                  </div>
                </div>

                <div className="p-3">
                  <button
                    onClick={startNewChat}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1A1D21] border border-gray-200 dark:border-[#26292E] hover:border-leetcode-yellow transition-all text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    <FiPlus size={16} className="text-leetcode-yellow" /> New chat
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  <p className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Chats</p>
                  {loadingHistory ? (
                    <p className="text-xs text-center text-gray-400 py-6">Loading…</p>
                  ) : conversations.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 py-6">No chats yet</p>
                  ) : (
                    <ul className="space-y-0.5">
                      {conversations.map((c) => (
                        <li key={c.conversation_id}>
                          <div
                            className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                              currentConversationId === c.conversation_id
                                ? "bg-white dark:bg-[#1A1D21] border border-gray-200 dark:border-[#26292E]"
                                : "hover:bg-white/70 dark:hover:bg-[#1A1D21]/60"
                            }`}
                            onClick={() => loadConversation(c)}
                          >
                            <FiMessageSquare size={14} className="text-gray-400 shrink-0" />
                            <span className="flex-1 min-w-0 text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{c.title || "Untitled"}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, id: c.conversation_id }); }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-[#1F2328] p-3">
                  {usage && (
                    <div className="mb-2.5 px-3 py-2 rounded-lg bg-white dark:bg-[#1A1D21] border border-gray-200 dark:border-[#26292E]">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span>Today</span>
                        <span className="font-medium">{usage.used}/{usage.limit}</span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-100 dark:bg-[#0B0F17] overflow-hidden">
                        <div className="h-full bg-leetcode-yellow transition-all" style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-leetcode-yellow text-gray-900 flex items-center justify-center text-xs font-bold shrink-0">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{user?.tier || "free"}</p>
                    </div>
                    <button onClick={logout} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Logout">
                      <FiLogOut size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0B0F17]">
              <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-[#1F2328] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1A1D21]" title={sidebarOpen ? "Collapse" : "Open"}>
                    <FiMenu size={16} />
                  </button>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">NextraAI</span>
                  {mode !== "normal" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">{mode.replace("_", " ")}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleExport} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1A1D21]" title="Export PDF"><FiDownload size={16} /></button>
                  <button onClick={closeDrawer} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1A1D21]" title="Exit (Esc)"><FiX size={18} /></button>
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                  {messages.length === 0 && !isStreaming && (
                    <div className="text-center pt-12 pb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/5 border border-leetcode-yellow/30 mb-5">
                        <NextraLogo size={44} glow />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        Ask me about DSA, coding, or any topic on MyCodeNotes. Pin a source or switch modes below.
                      </p>
                    </div>
                  )}
                  {messages.map((m) => (
                    <ChatMessage key={m.id} role={m.role} content={m.content} citations={m.citations} tier={m.tier} mode={m.mode} messageId={m.messageId} />
                  ))}
                  {isStreaming && (
                    <ChatMessage role="assistant" content={streamingText || ""} citations={streamingCitations} tier={streamingTier} mode={mode} streaming />
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-[#1F2328] bg-white dark:bg-[#0B0F17]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 pb-4">
                  {messages.length === 0 && !isStreaming && (
                    <div className="mb-3">
                      <SuggestionChips pageContext={null} onPick={(t) => handleSend(t)} />
                    </div>
                  )}
                  {pinnedContexts.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {pinnedContexts.map((c) => (
                        <span key={`${c.source_type}-${c.source_id}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-300/50">
                          📌 {c.title?.slice(0, 28) || c.source_type}
                          <button onClick={() => unpinContext(c)} className="text-sky-500/70 hover:text-sky-700 dark:hover:text-sky-300"><FiX size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <ModeSelector mode={mode} onChange={setMode} />
                    <button
                      onClick={() => setShowPicker(true)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-[#1A1D21] text-gray-600 dark:text-gray-300 hover:bg-leetcode-yellow/20 hover:text-leetcode-yellow"
                    >
                      <FiTag size={11} /> Pin
                      {pinnedContexts.length > 0 && (
                        <span className="ml-0.5 px-1.5 rounded-full bg-leetcode-yellow text-gray-900 text-[9px]">{pinnedContexts.length}</span>
                      )}
                    </button>
                  </div>
                  <div className="relative rounded-2xl border border-gray-300 dark:border-[#26292E] bg-white dark:bg-[#14161A] shadow-sm focus-within:border-leetcode-yellow focus-within:shadow-md transition-all">
                    <textarea
                      ref={inputRef}
                      onKeyDown={onKeyDown}
                      rows={1}
                      placeholder={mode === "interview" ? "Say 'start' to begin a mock interview…" : mode === "code_review" ? "Paste your code and I'll review it…" : "Message NextraAI…"}
                      className="w-full resize-none px-4 py-3.5 pr-24 text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 max-h-40"
                      style={{ minHeight: "52px" }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <VoiceInput onTranscript={(t) => { const el = inputRef.current; if (el) el.value = (el.value ? `${el.value} ` : "") + t; }} />
                      {isStreaming ? (
                        <button onClick={abortStream} className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"><FiX size={16} /></button>
                      ) : (
                        <button
                          onClick={() => { const el = inputRef.current; if (!el) return; const v = el.value; el.value = ""; handleSend(v); }}
                          className="p-2 rounded-lg bg-leetcode-yellow text-gray-900 hover:bg-yellow-500"
                        >
                          <FiSend size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                    <button onClick={() => setShowInvite(true)} className="hover:text-leetcode-yellow">Have an invite code?</button>
                    <span>NextraAI can make mistakes. Verify important info.</span>
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirm.open}
        title="Delete this chat?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { deleteConversation(confirm.id); setConfirm({ open: false, id: null }); }}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </>
  );
}