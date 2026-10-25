import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiClock,
  FiCheck,
  FiPlay,
  FiAward,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { userProgressApi } from "../../api/userProgress";
import ConfirmDialog from "../common/ConfirmDialog";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MockTestRunner({ open, onClose, onComplete, resumeId }) {
  const [phase, setPhase] = useState("setup"); // setup | picking | running | done
  const [mode, setMode] = useState("random"); // 'random' | 'specific'
  const [count, setCount] = useState(2);
  const [difficulty, setDifficulty] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [test, setTest] = useState(null);
  const [solved, setSolved] = useState(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  // Confirm dialog state
  const [closeConfirm, setCloseConfirm] = useState(false);

  // Picker state
  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateDiff, setCandidateDiff] = useState("");
  const [picked, setPicked] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [expandedProblem, setExpandedProblem] = useState(null);

  // Timer
  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  // Auto submit when time's up
  useEffect(() => {
    if (
      phase === "running" &&
      durationMinutes &&
      !autoSubmittedRef.current &&
      elapsed >= durationMinutes * 60
    ) {
      autoSubmittedRef.current = true;
      toast("Time's up — submitting");
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setPhase("setup");
      setMode("random");
      setTest(null);
      setSolved(new Set());
      setElapsed(0);
      setResult(null);
      setPicked([]);
      setCandidates([]);
      setCandidateSearch("");
      setCandidateDiff("");
      autoSubmittedRef.current = false;
      setCloseConfirm(false);
    }
  }, [open]);

  // Load test on resume
  useEffect(() => {
    if (open && resumeId) {
      (async () => {
        try {
          const data = await userProgressApi.getMockTest(resumeId);
          setTest(data);
          setSolved(new Set(data.solved_ids || []));
          setElapsed(0);
          setPhase("running");
        } catch {
          toast.error("Could not resume test");
          onClose?.();
        }
      })();
    }
  }, [open, resumeId, onClose]);

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const params = {};
      if (candidateDiff) params.difficulty = candidateDiff;
      if (candidateSearch) params.q = candidateSearch;
      setCandidates(await userProgressApi.getMockCandidates(params));
    } catch {
      toast.error("Could not load problems");
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (phase === "picking" && candidates.length === 0) loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = async () => {
    try {
      let payload;
      if (mode === "specific") {
        if (picked.length === 0) {
          toast.error("Pick at least one problem");
          return;
        }
        payload = {
          specific_ids: picked.map((p) => p.id),
          duration_minutes: durationMinutes,
        };
      } else {
        payload = {
          count,
          difficulty: difficulty || null,
          duration_minutes: durationMinutes,
        };
      }
      const data = await userProgressApi.startMockTest(payload);
      setTest(data);
      setPhase("running");
      setElapsed(0);
      setSolved(new Set());
      autoSubmittedRef.current = false;
    } catch (e) {
      toast.error(e.message || "Failed to start");
    }
  };

  const submit = async () => {
    if (!test) return;
    try {
      const res = await userProgressApi.submitMockTest(
        test.mock_test_id,
        [...solved],
        elapsed
      );
      setResult(res);
      setPhase("done");
      onComplete?.();
    } catch (e) {
      toast.error(e.message || "Failed to submit");
    }
  };

  const toggleSolved = (pid) => {
    setSolved((prev) => {
      const n = new Set(prev);
      if (n.has(pid)) n.delete(pid);
      else n.add(pid);
      return n;
    });
  };

  const togglePick = (p) => {
    setPicked((prev) => {
      if (prev.some((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id);
      if (prev.length >= 5) {
        toast.error("Max 5 problems");
        return prev;
      }
      return [...prev, p];
    });
  };

  // Handle close button — swap native confirm for our dialog
  const handleCloseClick = () => {
    if (phase === "running" && test) {
      setCloseConfirm(true);
      return;
    }
    onClose();
  };

  const confirmClose = () => {
    setCloseConfirm(false);
    // Notify parent so profile refreshes and shows the in-progress test
    onComplete?.();
    onClose();
  };

  const remaining = durationMinutes ? durationMinutes * 60 - elapsed : null;
  const isLowTime = remaining !== null && remaining <= 60;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-beige-200 dark:border-dark-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-beige-200 dark:border-dark-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Mock Test
                </h3>
                <div className="flex items-center gap-3">
                  {phase === "running" && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        isLowTime
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
                          : "bg-leetcode-yellow/20 text-leetcode-yellow"
                      }`}
                    >
                      <FiClock size={12} /> {formatTime(elapsed)}
                      {remaining !== null && (
                        <span className="opacity-70">
                          / {formatTime(durationMinutes * 60)}
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleCloseClick}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {phase === "setup" && (
                  <div className="space-y-5">
                    <div className="text-center pt-2">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-leetcode-yellow/20 mb-3">
                        <FiPlay className="text-leetcode-yellow" size={24} />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        Configure your test
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Pick problems yourself or let us choose randomly.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode("random")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          mode === "random"
                            ? "bg-leetcode-yellow text-gray-900 border-leetcode-yellow"
                            : "bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-700"
                        }`}
                      >
                        Random
                      </button>
                      <button
                        onClick={() => {
                          setMode("specific");
                          setPhase("picking");
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          mode === "specific"
                            ? "bg-leetcode-yellow text-gray-900 border-leetcode-yellow"
                            : "bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-700"
                        }`}
                      >
                        Pick problems
                      </button>
                    </div>

                    {mode === "random" && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Number of problems
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setCount(n)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                  count === n
                                    ? "bg-leetcode-yellow text-gray-900 border-leetcode-yellow"
                                    : "bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-700"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Difficulty (optional)
                          </label>
                          <div className="flex gap-2">
                            {[
                              { v: "", l: "Any" },
                              { v: "Easy", l: "Easy" },
                              { v: "Medium", l: "Medium" },
                              { v: "Hard", l: "Hard" },
                            ].map((d) => (
                              <button
                                key={d.v}
                                onClick={() => setDifficulty(d.v)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                  difficulty === d.v
                                    ? "bg-leetcode-yellow text-gray-900 border-leetcode-yellow"
                                    : "bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-700"
                                }`}
                              >
                                {d.l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Time limit (minutes)
                      </label>
                      <div className="flex gap-2">
                        {[15, 30, 45, 60, 90].map((m) => (
                          <button
                            key={m}
                            onClick={() => setDurationMinutes(m)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                              durationMinutes === m
                                ? "bg-leetcode-yellow text-gray-900 border-leetcode-yellow"
                                : "bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-700"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Auto-submits when time runs out.
                      </p>
                    </div>

                    <button
                      onClick={start}
                      className="w-full py-3 rounded-xl bg-leetcode-yellow text-gray-900 font-semibold text-sm hover:bg-yellow-500 transition-colors"
                    >
                      Start test
                    </button>
                  </div>
                )}

                {phase === "picking" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Pick {picked.length}/5 problems
                      </h4>
                      <button
                        onClick={() => setPhase("setup")}
                        className="text-xs text-gray-500 hover:text-leetcode-yellow"
                      >
                        ← Back
                      </button>
                    </div>

                    {picked.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-leetcode-yellow/5 border border-leetcode-yellow/20">
                        {picked.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-leetcode-yellow/20 text-leetcode-yellow border border-leetcode-yellow/40"
                          >
                            #{p.leetcode_id} {p.title.slice(0, 20)}
                            <button
                              onClick={() => togglePick(p)}
                              className="text-leetcode-yellow/70 hover:text-leetcode-yellow"
                            >
                              <FiX size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 relative">
                        <FiSearch
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={14}
                        />
                        <input
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          placeholder="Search by title or concept…"
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                        />
                      </div>
                      <select
                        value={candidateDiff}
                        onChange={(e) => setCandidateDiff(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                      >
                        <option value="">All difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <button
                      onClick={loadCandidates}
                      className="w-full py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600"
                    >
                      Apply filters
                    </button>

                    <div className="max-h-80 overflow-y-auto border border-beige-200 dark:border-dark-700 rounded-xl">
                      {loadingCandidates ? (
                        <p className="text-center text-xs text-gray-400 py-8">Loading…</p>
                      ) : candidates.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-8">
                          No problems found.
                        </p>
                      ) : (
                        <ul className="divide-y divide-beige-100 dark:divide-dark-700">
                          {candidates.map((p) => {
                            const isPicked = picked.some((x) => x.id === p.id);
                            return (
                              <li key={p.id}>
                                <button
                                  onClick={() => togglePick(p)}
                                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 transition-colors ${
                                    isPicked
                                      ? "bg-leetcode-yellow/10"
                                      : "hover:bg-gray-50 dark:hover:bg-dark-700"
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                      isPicked
                                        ? "bg-leetcode-yellow border-leetcode-yellow"
                                        : "border-gray-300 dark:border-dark-600"
                                    }`}
                                  >
                                    {isPicked && (
                                      <FiCheck
                                        size={12}
                                        strokeWidth={3}
                                        className="text-gray-900"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono text-gray-400">
                                        #{p.leetcode_id}
                                      </span>
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                          p.difficulty?.toUpperCase() === "EASY"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/40"
                                            : p.difficulty?.toUpperCase() === "MEDIUM"
                                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/40"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/40"
                                        }`}
                                      >
                                        {p.difficulty}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                      {p.title}
                                    </p>
                                    {p.concept && (
                                      <p className="text-[10px] text-gray-500 truncate">
                                        {p.concept}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={start}
                      disabled={picked.length === 0}
                      className="w-full py-3 rounded-xl bg-leetcode-yellow text-gray-900 font-semibold text-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
                    >
                      Start test with {picked.length} problem
                      {picked.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                )}

                {phase === "running" && test && (
                  <div className="space-y-4">
                    {test.problems.map((p) => {
                      const isDone = solved.has(p.id);
                      const isExpanded = expandedProblem === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`rounded-xl border transition-all ${
                            isDone
                              ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40"
                              : "bg-white dark:bg-dark-900 border-beige-200 dark:border-dark-700"
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono text-gray-400">
                                    #{p.leetcode_id}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                      p.difficulty?.toUpperCase() === "EASY"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/40"
                                        : p.difficulty?.toUpperCase() === "MEDIUM"
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/40"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/40"
                                    }`}
                                  >
                                    {p.difficulty}
                                  </span>
                                  {p.concept && (
                                    <span className="text-[10px] text-gray-500">
                                      · {p.concept}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {p.title}
                                </h4>
                              </div>
                              <button
                                onClick={() => toggleSolved(p.id)}
                                className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isDone
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300 dark:border-dark-600 hover:border-green-400"
                                }`}
                                title={isDone ? "Marked solved" : "Mark as solved"}
                              >
                                {isDone && <FiCheck size={14} strokeWidth={3} />}
                              </button>
                            </div>

                            <div
                              className={`text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap relative ${
                                isExpanded ? "" : "max-h-32 overflow-hidden"
                              }`}
                            >
                              {p.statement}
                              {p.description && <div className="mt-2">{p.description}</div>}
                              {!isExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-dark-900 to-transparent pointer-events-none" />
                              )}
                            </div>

                            {p.statement && p.statement.length > 300 && (
                              <button
                                onClick={() =>
                                  setExpandedProblem(isExpanded ? null : p.id)
                                }
                                className="mt-2 flex items-center gap-1 text-[11px] text-leetcode-yellow hover:underline"
                              >
                                {isExpanded ? (
                                  <>
                                    <FiChevronUp size={11} /> Show less
                                  </>
                                ) : (
                                  <>
                                    <FiChevronDown size={11} /> Show full problem
                                  </>
                                )}
                              </button>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <a
                                href={`https://leetcode.com/problems/${p.title
                                  .toLowerCase()
                                  .replace(/ /g, "-")
                                  .replace(/[^a-z0-9-]/g, "")}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-leetcode-yellow hover:underline"
                              >
                                Open on LeetCode ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {phase === "done" && result && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-leetcode-yellow/20 mb-4">
                      <FiAward className="text-leetcode-yellow" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Test complete!
                    </h4>
                    <p className="text-3xl font-bold text-leetcode-yellow mt-3">
                      {result.score} / {result.total}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Duration: {formatTime(elapsed)}
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setPhase("setup");
                          setTest(null);
                          setSolved(new Set());
                          setResult(null);
                          setElapsed(0);
                          setPicked([]);
                          autoSubmittedRef.current = false;
                        }}
                        className="px-4 py-2 rounded-lg bg-leetcode-yellow text-gray-900 text-sm font-medium hover:bg-yellow-500"
                      >
                        Take another
                      </button>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {phase === "running" && test && (
                <div className="px-5 py-3 border-t border-beige-200 dark:border-dark-700 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {solved.size} of {test.total} marked solved
                  </p>
                  <button
                    onClick={submit}
                    className="px-5 py-2 rounded-lg bg-leetcode-yellow text-gray-900 text-sm font-medium hover:bg-yellow-500"
                  >
                    Submit test
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled in-app confirm dialog — replaces window.confirm */}
      <ConfirmDialog
        open={closeConfirm}
        title="Close mock test?"
        message="Your progress is saved. You can resume this test later from your profile."
        confirmLabel="Close anyway"
        cancelLabel="Stay"
        danger={false}
        onConfirm={confirmClose}
        onCancel={() => setCloseConfirm(false)}
      />
    </>
  );
}