import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { aiApi, streamChat } from "../api/ai";

const AIContext = createContext(null);

export function AIProvider({ children }) {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Chat data
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Context / mode
  const [pageContext, setPageContext] = useState(null);
  const [pinnedContexts, setPinnedContexts] = useState([]);
  const [mode, setMode] = useState("normal");

  // Usage
  const [usage, setUsage] = useState(null);

  // Streaming
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingCitations, setStreamingCitations] = useState([]);
  const [streamingTier, setStreamingTier] = useState(null);
  const streamHandleRef = useRef(null);
  const bufferRef = useRef("");
  const citationsRef = useRef([]);
  const tierRef = useRef(null);

  // ------------------ UI actions ------------------
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setIsFullScreen(false);
  }, []);
  const toggleDrawer = useCallback(() => setIsOpen((v) => !v), []);
  const toggleFullScreen = useCallback(() => setIsFullScreen((v) => !v), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  // ------------------ Context pinning ------------------
  const pinContext = useCallback((ctx) => {
    setPinnedContexts((prev) => {
      if (
        prev.some(
          (c) =>
            c.source_type === ctx.source_type && c.source_id === ctx.source_id,
        )
      )
        return prev;
      return [...prev, ctx];
    });
  }, []);

  const unpinContext = useCallback((ctx) => {
    setPinnedContexts((prev) =>
      prev.filter(
        (c) =>
          !(c.source_type === ctx.source_type && c.source_id === ctx.source_id),
      ),
    );
  }, []);

  // ------------------ Usage ------------------
  const refreshUsage = useCallback(async () => {
    try {
      setUsage(await aiApi.getUsage());
    } catch {}
  }, []);

  // ------------------ New chat ------------------
  const startNewChat = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
    setDraftMessage("");
    setPinnedContexts([]);
    setMode("normal");
    setStreamingText("");
    setStreamingCitations([]);
    setStreamingTier(null);
  }, []);

  // ------------------ Send ------------------
  const handleSend = useCallback(
    (text) => {
      const message = (text || "").trim();
      if (!message || isStreaming) return;

      if (usage && usage.remaining <= 0) {
        toast.error(
          `Daily limit reached (${usage.limit}/day). Try again tomorrow.`,
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: message },
      ]);

      setIsStreaming(true);
      bufferRef.current = "";
      citationsRef.current = [];
      tierRef.current = null;
      setStreamingText("");
      setStreamingCitations([]);
      setStreamingTier(null);

      const ctxs = pinnedContexts.map((c) => ({
        source_type: c.source_type,
        source_id: c.source_id,
      }));
      const capturedMode = mode;

      streamHandleRef.current = streamChat({
        message,
        conversationId: currentConversationId,
        pageContext,
        contexts: ctxs,
        mode: capturedMode,
        onEvent: (evt) => {
          if (evt.type === "token") {
            bufferRef.current += evt.content;
            setStreamingText(bufferRef.current);
          } else if (evt.type === "citations") {
            citationsRef.current = evt.citations || [];
            setStreamingCitations(citationsRef.current);
          } else if (evt.type === "tier") {
            tierRef.current = evt.tier;
            setStreamingTier(evt.tier);
          } else if (evt.type === "saved") {
            // ⚡ Capture values synchronously BEFORE resetting refs
            const finalContent = bufferRef.current;
            const finalCitations = [...citationsRef.current];
            const finalTier = tierRef.current;
            const savedConvId = evt.conversation_id;
            const savedMsgId = evt.message_id;

            setCurrentConversationId(savedConvId);
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${savedMsgId}`,
                messageId: savedMsgId,
                role: "assistant",
                content: finalContent,
                citations: finalCitations,
                tier: finalTier,
                mode: capturedMode,
              },
            ]);

            // Reset refs and streaming state
            bufferRef.current = "";
            citationsRef.current = [];
            tierRef.current = null;
            setStreamingText("");
            setStreamingCitations([]);
            setStreamingTier(null);
            refreshUsage();
          } else if (evt.type === "error") {
            toast.error(evt.message || "Stream error");
          }
        },
        onError: (e) => {
          toast.error(e.message || "Something went wrong");
          setIsStreaming(false);
        },
        onDone: () => {
          setIsStreaming(false);
          streamHandleRef.current = null;
        },
      });
    },
    [
      isStreaming,
      usage,
      pinnedContexts,
      currentConversationId,
      pageContext,
      mode,
      refreshUsage,
    ],
  );

  const abortStream = useCallback(() => {
    if (streamHandleRef.current) {
      streamHandleRef.current.abort();
      streamHandleRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // ------------------ History ------------------
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      setConversations(await aiApi.getConversations());
    } catch {
      toast.error("Could not load history");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const loadConversation = useCallback(async (conv) => {
    try {
      const msgs = await aiApi.getMessages(conv.conversation_id);
      setCurrentConversationId(conv.conversation_id);
      setMessages(
        msgs.map((m) => ({
          id: `h-${m.id}`,
          messageId: m.id,
          role: m.role,
          content: m.content,
          citations: [],
          tier: m.metadata?.tier,
          mode: m.metadata?.mode,
        })),
      );
      setIsOpen(true);
    } catch {
      toast.error("Could not load chat");
    }
  }, []);

  const deleteConversation = useCallback(
    async (id) => {
      try {
        await aiApi.deleteConversation(id);
        setConversations((prev) =>
          prev.filter((c) => c.conversation_id !== id),
        );
        if (currentConversationId === id) {
          setMessages([]);
          setCurrentConversationId(null);
        }
        toast.success("Chat deleted");
      } catch {
        toast.error("Failed to delete");
      }
    },
    [currentConversationId],
  );

  const exportChat = useCallback(async () => {
    if (!currentConversationId) {
      toast.error("Start a conversation first");
      return null;
    }
    try {
      return await aiApi.exportConversation(currentConversationId);
    } catch {
      toast.error("Export failed");
      return null;
    }
  }, [currentConversationId]);

  const value = {
    // UI
    isOpen,
    isFullScreen,
    sidebarOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    toggleFullScreen,
    toggleSidebar,
    showPicker,
    setShowPicker,
    showInvite,
    setShowInvite,
    // Chat data
    messages,
    draftMessage,
    setDraftMessage,
    currentConversationId,
    conversations,
    loadingHistory,
    // Context / mode
    pageContext,
    setPageContext,
    pinnedContexts,
    pinContext,
    unpinContext,
    mode,
    setMode,
    // Usage
    usage,
    refreshUsage,
    // Streaming
    isStreaming,
    streamingText,
    streamingCitations,
    streamingTier,
    // Actions
    startNewChat,
    handleSend,
    abortStream,
    loadHistory,
    loadConversation,
    deleteConversation,
    exportChat,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIChat() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error("useAIChat must be used inside AIProvider");
  return ctx;
}
