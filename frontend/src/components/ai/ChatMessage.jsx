import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiCopy, FiCheck, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import toast from "react-hot-toast";
import CitationChip from "./CitationChip";
import TierBadge from "./TierBadge";
import StreamingText from "./StreamingText";
import NextraLogo from "./NextraLogo";
import { aiApi } from "../../api/ai";

function CodeBlock({ inline, className, children }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-700 text-[0.85em] font-mono">
        {children}
      </code>
    );
  }

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied!");
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-700 shadow-sm">
      <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 dark:bg-black/40 text-xs">
        <span className="text-gray-400 font-mono">{match?.[1] || "code"}</span>
        <button
          onClick={copy}
          className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          {copied ? <FiCheck className="text-green-400" size={12} /> : <FiCopy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-3 overflow-x-auto text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ChatMessage({
  role,
  content,
  citations = [],
  tier,
  mode,
  streaming = false,
  messageId,
  onFeedback,
}) {
  const [localFeedback, setLocalFeedback] = useState(0);
  const isUser = role === "user";

  const handleFeedback = async (value) => {
    if (!messageId) return;
    const next = localFeedback === value ? 0 : value;
    setLocalFeedback(next);
    try {
      await aiApi.sendFeedback(messageId, next);
      onFeedback?.(messageId, next);
    } catch {}
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-gradient-to-br from-leetcode-yellow to-yellow-500 text-gray-900 text-sm leading-relaxed shadow-sm">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 mb-4">
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/10 border border-leetcode-yellow/30 flex items-center justify-center">
        <NextraLogo size={16} glow />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            NextraAI
          </span>
          {tier && <TierBadge tier={tier} />}
          {mode && mode !== "normal" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
              {mode.replace("_", " ")}
            </span>
          )}
        </div>

        <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 border border-beige-200 dark:border-dark-700 shadow-sm">
          <div className="prose-chat text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock,
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
                ),
                li: ({ children }) => <li className="ml-1">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-base font-bold mb-2 mt-3">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold mb-1.5 mt-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-leetcode-yellow underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {streaming && <StreamingText />}
          </div>
        </div>

        {citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {citations.map((c) => (
              <CitationChip key={c.index} index={c.index} citation={c} />
            ))}
          </div>
        )}

        {messageId && !streaming && (
          <div className="flex gap-1 mt-1.5">
            <button
              onClick={() => handleFeedback(1)}
              className={`p-1.5 rounded-md transition-colors ${
                localFeedback === 1
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"
              }`}
            >
              <FiThumbsUp size={13} />
            </button>
            <button
              onClick={() => handleFeedback(-1)}
              className={`p-1.5 rounded-md transition-colors ${
                localFeedback === -1
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                  : "text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"
              }`}
            >
              <FiThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}