import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiX,
  FiCheck,
  FiExternalLink,
  FiTarget,
  FiCalendar,
  FiAward,
  FiLoader,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { userProgressApi } from "../../api/userProgress";
import { useProgress } from "../../contexts/ProgressContext";

export default function GoalDetailModal({ open, goalId, onClose, onUpdate }) {
  const { isSolved, toggle } = useProgress();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!goalId) return;
    setLoading(true);
    try {
      const data = await userProgressApi.getGoal(goalId);
      setGoal(data);
    } catch (e) {
      toast.error("Could not load goal");
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && goalId) load();
    if (!open) setGoal(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goalId]);

  // Re-fetch when a problem's solved status changes externally
  useEffect(() => {
    if (open && goalId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggle = async (problemId) => {
    await toggle("leetcode", problemId);
    // Reload goal to refresh solved count from backend
    setTimeout(load, 300);
    onUpdate?.();
  };

  const problemUrl = (title) =>
    `https://leetcode.com/problems/${(title || "")
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "")}/`;

  const percent = goal?.progress_percent || 0;
  const solvedCount = goal?.solved_count || 0;
  const targetCount = goal?.target_count || 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[230] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-beige-200 dark:border-dark-700"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-beige-200 dark:border-dark-700">
              <div className="flex items-start gap-3 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-leetcode-yellow/20 flex items-center justify-center">
                  <FiTarget className="text-leetcode-yellow" size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {goal?.title || "Study Goal"}
                  </h3>
                  {goal?.description && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 shrink-0"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Progress summary */}
            {goal && (
              <div className="px-5 py-3 bg-cream-50 dark:bg-dark-900 border-b border-beige-200 dark:border-dark-700">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                    {solvedCount} / {targetCount} · {percent}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, percent)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-leetcode-yellow to-yellow-500"
                  />
                </div>
                {goal.target_date && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <FiCalendar size={10} /> Target:{" "}
                    {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <FiLoader className="animate-spin" size={20} />
                </div>
              ) : !goal || !goal.plan || goal.plan.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-700 mb-3">
                    <FiAward className="text-gray-400" size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    No problems in this goal
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This goal was created manually. Solve any problem and it will count toward it.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {goal.plan.map((item, idx) => {
                    const checked = isSolved("leetcode", item.id);
                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          checked
                            ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40"
                            : "bg-white dark:bg-dark-900 border-beige-200 dark:border-dark-700"
                        }`}
                      >
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                            checked
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 dark:border-dark-600 hover:border-green-400"
                          }`}
                          title={checked ? "Mark as unsolved" : "Mark as solved"}
                        >
                          {checked && <FiCheck size={14} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            {item.day && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-leetcode-yellow text-gray-900 font-medium">
                                Day {item.day}
                              </span>
                            )}
                            {item.difficulty && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  item.difficulty?.toUpperCase() === "EASY"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/40"
                                    : item.difficulty?.toUpperCase() === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/40"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/40"
                                }`}
                              >
                                {item.difficulty}
                              </span>
                            )}
                            {item.leetcode_id && (
                              <span className="text-[10px] font-mono text-gray-400">
                                #{item.leetcode_id}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm font-semibold ${
                              checked
                                ? "text-gray-500 line-through"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.reason && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 italic">
                              {item.reason}
                            </p>
                          )}
                          <div className="flex gap-3 mt-2 text-[11px]">
                            <Link
                              to={`/problems/${item.id}`}
                              onClick={onClose}
                              className="text-leetcode-yellow hover:underline"
                            >
                              Open in app
                            </Link>
                            <a
                              href={problemUrl(item.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-leetcode-yellow flex items-center gap-1"
                            >
                              LeetCode <FiExternalLink size={9} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-beige-200 dark:border-dark-700 flex items-center justify-between">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {goal?.plan?.length || 0} problem
                {(goal?.plan?.length || 0) !== 1 ? "s" : ""} in plan
              </p>
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