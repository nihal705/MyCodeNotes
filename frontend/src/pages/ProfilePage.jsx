import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiTarget,
  FiPlus,
  FiTrash2,
  FiTrendingUp,
  FiAward,
  FiCalendar,
  FiZap,
  FiCpu,
  FiDownload,
  FiFileText,
  FiClock,
  FiPlay,
  FiEdit2,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useUser } from "../contexts/AuthContext";
import { useProgress } from "../contexts/ProgressContext";
import { userProgressApi } from "../api/userProgress";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import MockTestRunner from "../components/profile/MockTestRunner";
import StudyPlanGenerator from "../components/profile/StudyPlanGenerator";
import NotesModal from "../components/profile/NotesModal";
import EditProfileModal from "../components/profile/EditProfileModal";
import GoalDetailModal from "../components/profile/GoalDetailModal";
import {
  downloadProgressCSV,
  downloadProgressPDF,
} from "../utils/progressExport";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-beige-200 dark:border-dark-700">
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-3xl font-bold mt-1 ${accent || "text-gray-900 dark:text-white"}`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
      )}
    </div>
  );
}

function ProgressBar({ value, total }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-leetcode-yellow to-yellow-500"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useUser();
  const { stats, refresh } = useProgress();

  const [streak, setStreak] = useState(null);
  const [goals, setGoals] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [solvedWithNotes, setSolvedWithNotes] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    target_count: 10,
    target_date: "",
  });
  const [creating, setCreating] = useState(false);

  const [showMock, setShowMock] = useState(false);
  const [resumeMockId, setResumeMockId] = useState(null);

  const [showPlan, setShowPlan] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [goalModal, setGoalModal] = useState({ open: false, id: null });
  const [notesModal, setNotesModal] = useState({ open: false, item: null });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => loadAll();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadAll = async () => {
    setLoadingGoals(true);
    try {
      const [s, g, m, p] = await Promise.all([
        userProgressApi.getStreak().catch(() => null),
        userProgressApi.listGoals().catch(() => []),
        userProgressApi.listMockTests().catch((e) => {
          console.error("listMockTests failed:", e);
          return [];
        }),
        userProgressApi.list().catch(() => []),
      ]);
      setStreak(s);
      setGoals(g);
      setMockTests(m);
      setSolvedWithNotes(p.filter((x) => x.notes && x.notes.trim()));
      refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGoals(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await userProgressApi.createGoal({
        title: goalForm.title,
        description: goalForm.description || null,
        target_count: parseInt(goalForm.target_count),
        target_date: goalForm.target_date || null,
      });
      toast.success("Goal created!");
      setGoalForm({
        title: "",
        description: "",
        target_count: 10,
        target_date: "",
      });
      setShowGoalForm(false);
      loadAll();
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await userProgressApi.deleteGoal(id);
      toast.success("Goal deleted");
      loadAll();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleDeleteMock = async (id) => {
    try {
      await userProgressApi.deleteMockTest(id);
      toast.success("Test abandoned");
      loadAll();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const data = await userProgressApi.exportProgress();
      if (format === "csv") downloadProgressCSV(data);
      else downloadProgressPDF(data);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-custom mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Please log in to see your profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Sign up to track progress, streaks, and study goals.
        </p>
      </div>
    );
  }

  const avatarSrc = user?.avatar_url
    ? `${import.meta.env.VITE_API_URL || ""}${user.avatar_url}`
    : null;

  return (
    <div className="container-custom mx-auto px-4 sm:px-6 py-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-leetcode-yellow to-yellow-500 flex items-center justify-center text-gray-900 text-2xl font-bold overflow-hidden shadow-md">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-dark-600"
              title="Edit profile"
            >
              <FiEdit2 size={11} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-leetcode-yellow/20 text-leetcode-yellow font-medium capitalize">
              {user?.tier || "free"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600"
            >
              <FiEdit2 size={12} /> Edit profile
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50"
            >
              <FiFileText size={12} /> CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500 disabled:opacity-50"
            >
              <FiDownload size={12} /> PDF
            </button>
          </div>
        </div>

        {/* Stat grid — LeetCode only */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Solved"
              value={stats.leetcode.solved}
              sub={`of ${stats.leetcode.total} LeetCode`}
              accent="text-leetcode-yellow"
            />
            <StatCard
              label="Completion"
              value={`${stats.leetcode.percent}%`}
              sub="LeetCode progress"
            />
            <StatCard
              label="Streak"
              value={streak?.current ?? 0}
              sub={`longest ${streak?.longest ?? 0} days`}
              accent="text-orange-500"
            />
          </div>
        )}

        {/* Difficulty breakdown */}
        {stats && (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-beige-200 dark:border-dark-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-leetcode-yellow" size={16} />{" "}
              LeetCode by difficulty
            </h3>
            <div className="space-y-3">
              {["Easy", "Medium", "Hard"].map((d) => {
                const item = stats.leetcode.by_difficulty[d] || {
                  solved: 0,
                  total: 0,
                };
                const color =
                  d === "Easy"
                    ? "text-green-600"
                    : d === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600";
                return (
                  <div key={d}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className={`font-semibold ${color}`}>{d}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.solved} / {item.total}
                      </span>
                    </div>
                    <ProgressBar value={item.solved} total={item.total} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setResumeMockId(null);
              setShowMock(true);
            }}
            className="p-4 rounded-xl bg-gradient-to-br from-leetcode-yellow/10 to-yellow-500/5 border border-leetcode-yellow/30 hover:border-leetcode-yellow text-center transition-colors"
          >
            <FiPlay className="mx-auto text-leetcode-yellow mb-1.5" size={20} />
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Mock Test
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Timed</p>
          </button>
          <button
            onClick={() => setShowPlan(true)}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-100/30 to-purple-500/5 dark:from-purple-900/20 dark:to-purple-500/5 border border-purple-200 dark:border-purple-800/40 hover:border-purple-400 text-center transition-colors"
          >
            <FiCpu className="mx-auto text-purple-500 mb-1.5" size={20} />
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              AI Study Plan
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Personalised</p>
          </button>
          <Link
            to="/problems"
            className="p-4 rounded-xl bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 hover:border-leetcode-yellow text-center transition-colors"
          >
            <FiZap className="mx-auto text-leetcode-yellow mb-1.5" size={20} />
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Solve
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">LeetCode</p>
          </Link>
        </div>

        {/* Mock test history — always visible */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-beige-200 dark:border-dark-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiClock className="text-leetcode-yellow" size={16} /> Mock test
            history
          </h3>
          {mockTests.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">
              No mock tests yet. Start one from the button above — you can close
              it mid-way and resume later.
            </p>
          ) : (
            <div className="space-y-1.5">
              {mockTests.slice(0, 8).map((m) => {
                const inProgress = m.status === "in_progress";
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between gap-3 text-xs p-3 rounded-lg border ${
                      inProgress
                        ? "bg-leetcode-yellow/5 border-leetcode-yellow/30"
                        : "bg-cream-50 dark:bg-dark-900 border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {m.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(m.created_at).toLocaleDateString()} ·{" "}
                        <span
                          className={
                            inProgress ? "text-leetcode-yellow font-medium" : ""
                          }
                        >
                          {inProgress ? "in progress" : m.status}
                        </span>
                      </p>
                    </div>

                    {inProgress ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setResumeMockId(m.id);
                            setShowMock(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-leetcode-yellow text-gray-900 text-[11px] font-medium hover:bg-yellow-500"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => handleDeleteMock(m.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Abandon"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`font-bold shrink-0 ${
                          m.score === m.total
                            ? "text-green-600"
                            : m.score > 0
                              ? "text-yellow-600"
                              : "text-gray-400"
                        }`}
                      >
                        {m.score}/{m.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Notes */}
        {solvedWithNotes.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-beige-200 dark:border-dark-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiEdit2 className="text-leetcode-yellow" size={14} /> My problem
              notes ({solvedWithNotes.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {solvedWithNotes.slice(0, 20).map((p) => (
                <div
                  key={`${p.problem_type}-${p.problem_id}`}
                  className="p-3 rounded-lg bg-cream-50 dark:bg-dark-900 border border-beige-200 dark:border-dark-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-medium text-gray-500">
                      {p.problem_type} #{p.problem_id}
                    </span>
                    <button
                      onClick={() => setNotesModal({ open: true, item: p })}
                      className="text-[10px] text-leetcode-yellow hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-2">
                    {p.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study goals */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-beige-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiTarget className="text-leetcode-yellow" size={16} /> Study
              goals
            </h3>
            <button
              onClick={() => setShowGoalForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500"
            >
              <FiPlus size={12} /> New
            </button>
          </div>

          {showGoalForm && (
            <form
              onSubmit={handleCreateGoal}
              className="mb-4 p-4 rounded-xl bg-cream-50 dark:bg-dark-900 border border-beige-200 dark:border-dark-700 space-y-3"
            >
              <input
                type="text"
                placeholder="Goal title"
                value={goalForm.title}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, title: e.target.value })
                }
                required
                maxLength={120}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
              />
              <textarea
                placeholder="Description (optional)"
                value={goalForm.description}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">
                    Target problems
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={goalForm.target_count}
                    onChange={(e) =>
                      setGoalForm({ ...goalForm, target_count: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">
                    Target date
                  </label>
                  <input
                    type="date"
                    value={goalForm.target_date}
                    onChange={(e) =>
                      setGoalForm({ ...goalForm, target_date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-800 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loadingGoals ? (
            <LoadingSpinner />
          ) : goals.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">
              No goals yet. Create one or use AI Study Plan.
            </p>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() =>
                    g.has_plan
                      ? setGoalModal({ open: true, id: g.id })
                      : setGoalModal({ open: true, id: g.id })
                  }
                  className="p-4 rounded-xl bg-cream-50 dark:bg-dark-900 border border-beige-200 dark:border-dark-700 hover:border-leetcode-yellow cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-leetcode-yellow transition-colors">
                        {g.title}
                      </h4>
                      {g.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {g.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiAward size={11} /> {g.solved_count}/
                          {g.target_count}
                        </span>
                        {g.target_date && (
                          <span className="flex items-center gap-1">
                            <FiCalendar size={11} />{" "}
                            {new Date(g.target_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-leetcode-yellow opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Click to open →
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirm({ open: true, id: g.id });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                  <ProgressBar value={g.solved_count} total={g.target_count} />
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    {g.progress_percent}% complete
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete goal confirm */}
      <ConfirmDialog
        open={confirm.open}
        title="Delete this goal?"
        message="You can't undo this."
        confirmLabel="Delete"
        onConfirm={() => {
          handleDeleteGoal(confirm.id);
          setConfirm({ open: false, id: null });
        }}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      {/* Mock test runner (supports resume) */}
      <MockTestRunner
        open={showMock}
        resumeId={resumeMockId}
        onClose={() => {
          setShowMock(false);
          setResumeMockId(null);
        }}
        onComplete={() => {
          setResumeMockId(null);
          loadAll();
        }}
      />

      {/* Study plan generator */}
      <StudyPlanGenerator
        open={showPlan}
        onClose={() => setShowPlan(false)}
        onCreated={loadAll}
      />

      {/* Notes editor */}
      <NotesModal
        open={notesModal.open}
        onClose={() => {
          setNotesModal({ open: false, item: null });
          loadAll();
        }}
        problemType={notesModal.item?.problem_type}
        problemId={notesModal.item?.problem_id}
        problemTitle={`${notesModal.item?.problem_type} #${notesModal.item?.problem_id}`}
        initialNotes={notesModal.item?.notes}
      />

      {/* Edit profile */}
      <EditProfileModal open={showEdit} onClose={() => setShowEdit(false)} />
      <GoalDetailModal
        open={goalModal.open}
        goalId={goalModal.id}
        onClose={() => setGoalModal({ open: false, id: null })}
        onUpdate={loadAll}
      />
    </div>
  );
}
