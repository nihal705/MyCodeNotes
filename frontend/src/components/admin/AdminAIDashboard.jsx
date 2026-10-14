import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
  FiTrash2,
  FiCopy,
  FiPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminAiApi, inviteApi } from "../../api/ai";

export default function AdminAIDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, inv] = await Promise.all([
        adminAiApi.getStats(),
        inviteApi.list().catch(() => []),
      ]);
      setStats(s);
      setInvites(inv);
    } catch (e) {
      toast.error(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createCodes = async () => {
    setCreating(true);
    try {
      const res = await inviteApi.create({
        tier: "premium",
        duration_days: 30,
        count: 5,
        notes: "Admin generated",
      });
      toast.success(`Created ${res.created.length} codes`);
      load();
    } catch (e) {
      toast.error(e.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm("Run 30-day cleanup on free-tier chats?")) return;
    try {
      const res = await adminAiApi.triggerCleanup();
      toast.success(
        `Removed ${res.messages_deleted} messages, ${res.conversations_deleted} conversations`
      );
    } catch (e) {
      toast.error("Cleanup failed");
    }
  };

  if (loading) return <p className="text-sm text-gray-500 py-8 text-center">Loading stats…</p>;
  if (!stats) return null;

  const Stat = ({ icon: Icon, label, value, accent }) => (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-beige-200 dark:border-dark-700">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${accent}`}>
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          NextraAI Analytics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={runCleanup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <FiTrash2 size={12} /> Cleanup old chats
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={FiUsers}
          label="Users"
          value={`${stats.users.verified}/${stats.users.total}`}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
        />
        <Stat
          icon={FiMessageSquare}
          label="Messages 24h"
          value={stats.conversations.messages_24h}
          accent="bg-purple-100 text-purple-600 dark:bg-purple-900/30"
        />
        <Stat
          icon={FiThumbsUp}
          label="Positive"
          value={stats.messages.thumbs_up}
          accent="bg-green-100 text-green-600 dark:bg-green-900/30"
        />
        <Stat
          icon={FiThumbsDown}
          label="Negative"
          value={stats.messages.thumbs_down}
          accent="bg-red-100 text-red-600 dark:bg-red-900/30"
        />
      </div>

      {/* Satisfaction bar */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-beige-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Satisfaction ratio
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {(stats.messages.satisfaction_ratio * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-leetcode-yellow to-yellow-500 transition-all"
            style={{ width: `${stats.messages.satisfaction_ratio * 100}%` }}
          />
        </div>
      </div>

      {/* Recent negative feedback */}
      {stats.recent_negative.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-beige-200 dark:border-dark-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Recent 👎 feedback
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.recent_negative.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
              >
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                  {n.text}
                </p>
                {n.note && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                    User note: {n.note}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  {n.user || "anon"} · {new Date(n.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite codes */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-beige-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Invite codes ({invites.filter((i) => !i.used).length} active)
          </h3>
          <button
            onClick={createCodes}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-leetcode-yellow text-gray-900 text-xs font-medium hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            <FiPlus size={12} /> Generate 5
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-gray-500 dark:text-gray-400 border-b border-beige-200 dark:border-dark-700">
              <tr>
                <th className="py-2 font-medium">Code</th>
                <th className="py-2 font-medium">Tier</th>
                <th className="py-2 font-medium">Days</th>
                <th className="py-2 font-medium">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => (
                <tr key={i.id} className="border-b border-beige-100 dark:border-dark-700/50">
                  <td className="py-2 font-mono text-gray-900 dark:text-white">
                    {i.code}
                  </td>
                  <td className="py-2 capitalize text-gray-600 dark:text-gray-300">
                    {i.tier}
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-300">{i.duration_days}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        i.used
                          ? "bg-gray-100 text-gray-500 dark:bg-dark-700"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {i.used ? "used" : "active"}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(i.code);
                        toast.success("Copied");
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-leetcode-yellow"
                    >
                      <FiCopy size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {invites.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No codes yet. Generate some.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}