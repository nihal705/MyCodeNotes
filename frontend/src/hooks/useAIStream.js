import { useState, useRef, useCallback } from "react";
import { streamChat } from "../api/ai";

/**
 * Manages a single streaming request to NextraAI.
 * Returns { isStreaming, streamingText, citations, tier, model, send, abort, reset }
 */
export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [citations, setCitations] = useState([]);
  const [tier, setTier] = useState(null);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const handleRef = useRef(null);
  const finalTextRef = useRef("");

  const reset = useCallback(() => {
    setStreamingText("");
    setCitations([]);
    setTier(null);
    setModel(null);
    setError(null);
    finalTextRef.current = "";
  }, []);

  const abort = useCallback(() => {
    handleRef.current?.abort();
    handleRef.current = null;
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    ({ message, conversationId, pageContext, onComplete }) => {
      reset();
      setIsStreaming(true);

      handleRef.current = streamChat({
        message,
        conversationId,
        pageContext,
        onEvent: (evt) => {
          if (evt.type === "token") {
            finalTextRef.current += evt.content;
            setStreamingText(finalTextRef.current);
          } else if (evt.type === "citations") {
            setCitations(evt.citations || []);
          } else if (evt.type === "tier") {
            setTier(evt.tier);
          } else if (evt.type === "model") {
            setModel(evt.name);
          } else if (evt.type === "saved") {
            onComplete?.({
              conversationId: evt.conversation_id,
              messageId: evt.message_id,
              content: finalTextRef.current,
            });
          } else if (evt.type === "error") {
            setError(evt.message);
          }
        },
        onError: (e) => {
          setError(e.message || "Something went wrong");
          setIsStreaming(false);
        },
        onDone: () => {
          setIsStreaming(false);
        },
      });
    },
    [reset]
  );

  return {
    isStreaming,
    streamingText,
    citations,
    tier,
    model,
    error,
    send,
    abort,
    reset,
  };
}