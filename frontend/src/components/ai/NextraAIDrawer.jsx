import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiPlus,
  FiSend,
  FiMaximize2,
  FiClock,
  FiDownload,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useAIChat } from "../../contexts/AIContext";
import { useUser } from "../../contexts/AuthContext";
import { usePageContext } from "../../hooks/usePageContext";
import ChatMessage from "./ChatMessage";
import SuggestionChips from "./SuggestionChips";
import VoiceInput from "./VoiceInput";
import AuthModal from "./AuthModal";
import LoadingSpinner from "../common/LoadingSpinner";
import NextraLogo from "./NextraLogo";
import ModeSelector from "./ModeSelector";
import ConfirmDialog from "../common/ConfirmDialog";
import { downloadChatAsPDF } from "../../utils/chatPdf";

export default function NextraAIDrawer() {
  // ---------- HOOKS FIRST ----------
  const {
    isOpen,
    isFullScreen,
    closeDrawer,
    toggleFullScreen,
    messages,
    draftMessage,
    setDraftMessage,
    conversations,
    loadingHistory,
    pinnedContexts,
    unpinContext,
    mode,
    setMode,
    usage,
    isStreaming,
    streamingText,
    streamingCitations,
    streamingTier,
    startNewChat,
    handleSend,
    abortStream,
    loadHistory,
    loadConversation,
    deleteConversation,
    exportChat,
    setShowPicker,
    setShowInvite,
  } = useAIChat();
  const { isAuthenticated } = useUser();
  usePageContext();

  const [showHistory, setShowHistory] = useState(false);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        closeDrawer();
      }
    }
  }, [location.pathname, closeDrawer]);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamingText]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeDrawer]);

  // ---------- EARLY RETURN (safe now) ----------
  if (isFullScreen) return null;

  // ---------- HANDLERS ----------
  const send = () => {
    const val = draftMessage.trim();
    if (!val) return;
    setDraftMessage("");
    handleSend(val);
  };

  const openHistory = async () => {
    setShowHistory(true);
    await loadHistory();
  };

  const handleExport = async () => {
    const data = await exportChat();
    if (!data) return;
    try {
      await downloadChatAsPDF(data);
      toast.success("Chat exported");
    } catch {
      toast.error("PDF failed");
    }
  };

  // ---------- JSX ----------
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/40 z-[70] md:hidden"
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="
    fixed z-[80] flex flex-col shadow-2xl bg-gradient-to-b from-cream-50 to-white dark:from-dark-900 dark:to-dark-950
    top-[74px] inset-x-0 h-[calc(100dvh-74px)] w-full max-w-full overflow-hidden rounded-t-2xl
    md:top-[92px] md:left-auto md:right-3 md:inset-x-auto md:h-[calc(100vh-108px)] md:w-[440px]
    md:rounded-2xl md:border md:border-beige-200 md:dark:border-dark-700
    border-t md:border-t-0 border-beige-200 dark:border-dark-700
  "
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-beige-200 dark:border-dark-700 bg-white/80 dark:bg-[#0B0F17]/90 backdrop-blur-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/10 border border-leetcode-yellow/30 flex items-center justify-center shrink-0">
                    <NextraLogo size={20} glow />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      NextraAI{" "}
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </h3>
                    {isAuthenticated && usage && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {usage.used}/{usage.limit} today ·{" "}
                        <span className="capitalize font-medium">
                          {usage.tier}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={() => {
                          startNewChat();
                          setShowHistory(false);
                        }}
                        className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800"
                        title="New chat"
                      >
                        <FiPlus size={16} />
                      </button>
                      <button
                        onClick={openHistory}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                          showHistory
                            ? "text-leetcode-yellow bg-yellow-500/10"
                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800"
                        }`}
                        title="History"
                      >
                        <FiClock size={16} />
                      </button>
                      <button
                        onClick={handleExport}
                        className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800"
                        title="Export PDF"
                      >
                        <FiDownload size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={toggleFullScreen}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800"
                    title="Full screen"
                  >
                    <FiMaximize2 size={16} />
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800"
                    title="Close"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              {!isAuthenticated ? (
                <AuthModal />
              ) : showHistory ? (
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <FiClock size={14} className="text-leetcode-yellow" /> Recent chats
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          startNewChat();
                          setShowHistory(false);
                        }}
                        className="text-xs px-2.5 py-1 rounded-md bg-leetcode-yellow/10 text-leetcode-yellow font-medium hover:bg-leetcode-yellow/20"
                      >
                        + New chat
                      </button>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                  {loadingHistory ? (
                    <LoadingSpinner />
                  ) : conversations.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">
                      No history yet.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {conversations.map((c) => (
                        <li key={c.conversation_id}>
                          <button
                            onClick={() => {
                              loadConversation(c);
                              setShowHistory(false);
                            }}
                            className="w-full text-left p-3 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 hover:border-leetcode-yellow transition-colors group flex items-start gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {c.title || "Untitled"}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(c.updated_at).toLocaleString()}
                              </p>
                            </div>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirm({
                                  open: true,
                                  id: c.conversation_id,
                                });
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                            >
                              <FiTrash2 size={12} />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  {pinnedContexts.length > 0 && (
                    <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5 border-b border-beige-200 dark:border-dark-700">
                      {pinnedContexts.map((c) => (
                        <span
                          key={`${c.source_type}-${c.source_id}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-300/50"
                        >
                          📌 {c.title?.slice(0, 24) || c.source_type}
                          <button
                            onClick={() => unpinContext(c)}
                            className="text-sky-500/70 hover:text-sky-700 dark:hover:text-sky-300"
                          >
                            <FiX size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 sm:py-4"
                  >
                    {messages.length === 0 && !isStreaming && (
                      <div className="text-center pt-10 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/5 border border-leetcode-yellow/30 mb-4">
                          <NextraLogo size={36} glow />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                          Hi! 👋
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto leading-relaxed">
                          Ask anything about DSA, coding, or MyCodeNotes. Use
                          full-screen for a roomier experience.
                        </p>
                      </div>
                    )}
                    {messages.map((m) => (
                      <ChatMessage
                        key={m.id}
                        role={m.role}
                        content={m.content}
                        citations={m.citations}
                        tier={m.tier}
                        mode={m.mode}
                        messageId={m.messageId}
                      />
                    ))}
                    {isStreaming && (
                      <ChatMessage
                        role="assistant"
                        content={streamingText || ""}
                        citations={streamingCitations}
                        tier={streamingTier}
                        mode={mode}
                        streaming
                      />
                    )}
                  </div>

                  {messages.length === 0 && !isStreaming && (
                    <div className="px-3 pb-2">
                      <SuggestionChips
                        pageContext={null}
                        onPick={(t) => handleSend(t)}
                      />
                    </div>
                  )}

                  <div className="px-3 pt-2 pb-1.5 flex items-center justify-between gap-2 border-t border-beige-200 dark:border-dark-700 bg-white/70 dark:bg-dark-900/70 backdrop-blur-sm shrink-0 overflow-x-auto">
                    <div className="flex-1 min-w-0 overflow-x-auto">
                      <ModeSelector mode={mode} onChange={setMode} />
                    </div>
                    <button
                      onClick={() => setShowPicker(true)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-leetcode-yellow/20 hover:text-leetcode-yellow transition-colors"
                    >
                      <FiTag size={11} /> Pin
                      {pinnedContexts.length > 0 && (
                        <span className="ml-0.5 px-1.5 rounded-full bg-leetcode-yellow text-gray-900 text-[9px]">
                          {pinnedContexts.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 sm:p-3 pt-1 bg-white dark:bg-dark-900 shrink-0 border-t border-beige-200/50 dark:border-dark-800">
                    <div className="flex items-end gap-1.5 sm:gap-2">
                      <VoiceInput
                        onTranscript={(t) =>
                          setDraftMessage((p) => (p ? `${p} ${t}` : t))
                        }
                      />
                      <textarea
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                          }
                        }}
                        rows={1}
                        placeholder="Ask NextraAI…"
                        className="flex-1 min-w-0 resize-none px-3 py-2 text-[13px] sm:text-sm rounded-xl bg-gray-100 dark:bg-dark-800 border border-transparent focus:border-leetcode-yellow focus:outline-none text-gray-900 dark:text-gray-100 max-h-28"
                        style={{ minHeight: "38px" }}
                      />
                      {isStreaming ? (
                        <button
                          onClick={abortStream}
                          className="p-2 sm:p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 shrink-0"
                          title="Stop"
                        >
                          <FiX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={send}
                          disabled={!draftMessage.trim()}
                          className="p-2 sm:p-2.5 rounded-xl bg-leetcode-yellow text-gray-900 hover:bg-yellow-500 disabled:opacity-50 shrink-0"
                          title="Send"
                        >
                          <FiSend size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <button
                        onClick={() => setShowInvite(true)}
                        className="text-[10px] text-gray-400 hover:text-leetcode-yellow truncate"
                      >
                        Have an invite code?
                      </button>
                      <p className="text-[10px] text-gray-400 truncate ml-2 text-right">
                        Verify important info.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirm.open}
        title="Delete this chat?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          deleteConversation(confirm.id);
          setConfirm({ open: false, id: null });
        }}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </>
  );
}
