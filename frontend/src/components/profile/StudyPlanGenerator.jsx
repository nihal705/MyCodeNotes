import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCpu } from "react-icons/fi";
import toast from "react-hot-toast";
import { userProgressApi } from "../../api/userProgress";
import { Link } from "react-router-dom";

export default function StudyPlanGenerator({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    goal_title: "",
    target_count: 10,
    topic: "",
    difficulty_pref: "",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);
    try {
      const res = await userProgressApi.generateStudyPlan({
        goal_title: form.goal_title,
        target_count: parseInt(form.target_count),
        topic: form.topic || null,
        difficulty_pref: form.difficulty_pref || null,
      });
      setPlan(res);
      toast.success(`Plan ready! ${res.plan.length} problems.`);
      onCreated?.();
    } catch (err) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlan(null);
    setForm({ goal_title: "", target_count: 10, topic: "", difficulty_pref: "" });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[210] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-beige-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-beige-200 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-leetcode-yellow/20 flex items-center justify-center">
                  <FiCpu className="text-leetcode-yellow" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Study Plan Generator</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Powered by NextraAI</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"><FiX size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!plan ? (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Goal</label>
                    <input
                      type="text"
                      value={form.goal_title}
                      onChange={(e) => setForm({ ...form, goal_title: e.target.value })}
                      placeholder="e.g., Master Dynamic Programming in 2 weeks"
                      required
                      className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Problems</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={form.target_count}
                        onChange={(e) => setForm({ ...form, target_count: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Difficulty</label>
                      <select
                        value={form.difficulty_pref}
                        onChange={(e) => setForm({ ...form, difficulty_pref: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                      >
                        <option value="">Any</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Topic (optional)</label>
                    <input
                      type="text"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      placeholder="e.g., Graphs, Trees, Two Pointers"
                      className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !form.goal_title}
                    className="w-full py-3 rounded-xl bg-leetcode-yellow text-gray-900 font-semibold text-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Generating…" : "Generate plan"}
                  </button>
                </form>
              ) : (
                <div>
                  <div className="mb-4 p-3 rounded-xl bg-leetcode-yellow/10 border border-leetcode-yellow/30">
                    <p className="text-xs font-semibold text-leetcode-yellow">Plan ready — {plan.plan.length} problems</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                      A study goal was created on your profile. Work through these in order.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {plan.plan.map((item, i) => (
                      <Link
                        key={`${item.id}-${i}`}
                        to={`/problems/${item.id}`}
                        className="block p-3 rounded-lg bg-cream-50 dark:bg-dark-900 border border-beige-200 dark:border-dark-700 hover:border-leetcode-yellow transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-leetcode-yellow text-gray-900 font-medium">Day {item.day}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.difficulty?.toUpperCase() === "EASY" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/40" :
                            item.difficulty?.toUpperCase() === "MEDIUM" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/40" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/40"
                          }`}>{item.difficulty}</span>
                          <span className="text-[10px] font-mono text-gray-400">#{item.leetcode_id}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                        {item.reason && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 italic">{item.reason}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={reset}
                    className="w-full mt-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Generate another
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}