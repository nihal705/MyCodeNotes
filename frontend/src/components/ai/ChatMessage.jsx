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

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children || "").replace(/\n$/, "");
  // Block code if language tag exists or if content spans multiple lines
  const isBlock = Boolean(match || String(children || "").includes("\n"));

  if (!isBlock) {
    return (
      <code className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-100/90 dark:bg-amber-950/60 font-mono text-[0.85em] font-semibold border border-amber-300/80 dark:border-amber-700/60 inline-block align-baseline break-all !text-amber-950 dark:!text-amber-200">
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
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-700 shadow-sm not-prose">
      <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 dark:bg-black/50 text-xs">
        <span className="text-gray-400 font-mono font-medium">{match?.[1] || "code"}</span>
        <button
          onClick={copy}
          className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          {copied ? <FiCheck className="text-green-400" size={12} /> : <FiCopy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-3 overflow-x-auto text-xs leading-relaxed font-mono">
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
      <div className="flex justify-end mb-3 sm:mb-4">
        <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-br from-leetcode-yellow to-yellow-500 text-gray-900 text-[13px] sm:text-sm leading-relaxed shadow-sm break-words overflow-hidden">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-2.5 mb-3 sm:mb-4">
      <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/10 border border-leetcode-yellow/30 flex items-center justify-center">
        <NextraLogo size={14} glow />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
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

        <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 sm:px-4 sm:py-3 bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 border border-beige-200 dark:border-dark-700 shadow-sm break-words overflow-hidden">
          <div className="prose-chat text-[13px] sm:text-sm leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ children }) => <>{children}</>,
                code: CodeBlock,
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 sm:pl-5 mb-2 space-y-0.5 sm:space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 sm:pl-5 mb-2 space-y-0.5 sm:space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-sm sm:text-base font-bold mb-1.5 mt-2.5 text-gray-900 dark:text-white">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[13px] sm:text-sm font-bold mb-1 mt-2 text-gray-900 dark:text-white">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[13px] sm:text-sm font-semibold mb-1 mt-1.5 text-gray-900 dark:text-white">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-leetcode-yellow/70 pl-3 my-2.5 italic text-gray-600 dark:text-gray-400">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-700 shadow-sm">
                    <table className="min-w-full text-xs text-left divide-y divide-gray-200 dark:divide-dark-700">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50 dark:bg-dark-900/60 font-semibold text-gray-700 dark:text-gray-200">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-700 bg-white dark:bg-dark-800">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-dark-700/40 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 align-middle">
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr className="my-3 border-gray-200 dark:border-dark-700" />
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-leetcode-yellow hover:underline font-medium"
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
