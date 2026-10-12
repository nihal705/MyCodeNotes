import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch, FiPlus, FiCheck } from "react-icons/fi";
import { problemsApi } from "../../api/problems";
import { practiceApi } from "../../api/practice";
import { conceptsApi } from "../../api/concepts";
import { notesApi } from "../../api/notes";
import { useAIChat } from "../../contexts/AIContext";

const TABS = [
  { id: "leetcode", label: "LeetCode", api: () => problemsApi.getAll() },
  { id: "practice", label: "Practice", api: () => practiceApi.getAll() },
  { id: "concept", label: "Concepts", api: () => conceptsApi.getAll() },
  { id: "note", label: "Notes", api: () => notesApi.getAll() },
];

export default function ContextPicker({ open, onClose }) {
  const { pinnedContexts, pinContext, unpinContext } = useAIChat();
  const [tab, setTab] = useState("leetcode");
  const [itemsByTab, setItemsByTab] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const current = TABS.find((t) => t.id === tab);
    if (itemsByTab[tab]) return;
    setLoading(true);
    current
      .api()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setItemsByTab((prev) => ({ ...prev, [tab]: list }));
      })
      .catch(() => setItemsByTab((prev) => ({ ...prev, [tab]: [] })))
      .finally(() => setLoading(false));
  }, [open, tab, itemsByTab]);

  const items = itemsByTab[tab] || [];
  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 60);
    const q = query.toLowerCase();
    return items
      .filter((it) => {
        const t = (it.title || it.name || "").toLowerCase();
        const d = (it.description || it.definition || "").toLowerCase();
        return t.includes(q) || d.includes(q);
      })
      .slice(0, 60);
  }, [items, query]);

  const isPinned = (id) =>
    pinnedContexts.some((c) => c.source_type === tab && c.source_id === id);

  const labelFor = (it) => it.title || it.name || "Untitled";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-beige-200 dark:border-dark-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-beige-200 dark:border-dark-700">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Pin context for NextraAI
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  NextraAI will prioritise these sources in the conversation.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-3 pt-3 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === t.id
                      ? "bg-leetcode-yellow text-gray-900"
                      : "bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-dark-700 border border-transparent focus:border-leetcode-yellow focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {loading ? (
                <p className="text-xs text-center text-gray-500 py-8">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-center text-gray-500 py-8">No results.</p>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((it) => {
                    const pinned = isPinned(it.id);
                    return (
                      <li key={`${tab}-${it.id}`}>
                        <button
                          onClick={() => {
                            if (pinned) {
                              unpinContext({ source_type: tab, source_id: it.id });
                            } else {
                              pinContext({
                                source_type: tab,
                                source_id: it.id,
                                title: labelFor(it),
                              });
                            }
                          }}
                          className={`w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-lg transition-colors ${
                            pinned
                              ? "bg-leetcode-yellow/15 border border-leetcode-yellow/40"
                              : "hover:bg-gray-50 dark:hover:bg-dark-700 border border-transparent"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {labelFor(it)}
                            </p>
                            {(it.concept || it.difficulty || it.description || it.definition) && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {it.difficulty ? `${it.difficulty} · ` : ""}
                                {it.concept || it.definition || it.description || ""}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 p-1.5 rounded-md ${
                              pinned
                                ? "bg-leetcode-yellow text-gray-900"
                                : "bg-gray-100 dark:bg-dark-700 text-gray-500"
                            }`}
                          >
                            {pinned ? <FiCheck size={14} /> : <FiPlus size={14} />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-beige-200 dark:border-dark-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {pinnedContexts.length} pinned
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}