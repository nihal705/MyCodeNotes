import { motion } from "framer-motion";

function CircularProgress({ solved, total, size = 130, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? solved / total : 0;
  const offset = circumference - percent * circumference;
  const displayPercent = (percent * 100).toFixed(1);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ph-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA116" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-dark-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ph-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
          {solved}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          / {total}
        </p>
        <p className="text-[10px] font-semibold text-leetcode-yellow mt-0.5">
          {displayPercent}%
        </p>
      </div>
    </div>
  );
}

function DifficultyRow({ label, solved, total, variant }) {
  const pct = total > 0 ? Math.min(100, (solved / total) * 100) : 0;

  const config = {
    easy: {
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      track: "bg-emerald-100/60 dark:bg-emerald-900/20",
    },
    medium: {
      text: "text-yellow-600 dark:text-yellow-400",
      dot: "bg-yellow-500",
      bar: "bg-gradient-to-r from-yellow-400 to-orange-500",
      track: "bg-yellow-100/60 dark:bg-yellow-900/20",
    },
    hard: {
      text: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-500",
      bar: "bg-gradient-to-r from-rose-400 to-red-500",
      track: "bg-rose-100/60 dark:bg-rose-900/20",
    },
  }[variant];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${config.text} flex items-center gap-1.5`}>
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          {label}
        </span>
        <span className="text-gray-500 dark:text-gray-400 tabular-nums font-medium">
          {solved}
          <span className="text-gray-400 dark:text-gray-500">/{total}</span>
        </span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${config.track}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full ${config.bar}`}
        />
      </div>
    </div>
  );
}

export default function ProgressHeader({ stats, streak, compact = false }) {
  if (!stats) return null;

  const { leetcode } = stats;
  const easy = leetcode.by_difficulty.Easy || { solved: 0, total: 0 };
  const medium = leetcode.by_difficulty.Medium || { solved: 0, total: 0 };
  const hard = leetcode.by_difficulty.Hard || { solved: 0, total: 0 };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-beige-200 dark:border-dark-700 overflow-hidden">
      {/* Header strip */}
      <div className="px-5 py-3 border-b border-beige-200 dark:border-dark-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Your Progress
        </h3>
        {streak && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold">
              🔥 {streak.current} day{streak.current !== 1 ? "s" : ""}
            </span>
            <span className="hidden sm:inline text-gray-500 dark:text-gray-400">
              best {streak.longest}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`p-5 flex items-center gap-6 ${compact ? "flex-col sm:flex-row" : "flex-col md:flex-row"}`}>
        {/* Circular ring */}
        <div className="shrink-0 flex justify-center">
          <CircularProgress solved={leetcode.solved} total={leetcode.total} />
        </div>

        {/* Difficulty breakdown */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          <DifficultyRow
            label="Easy"
            solved={easy.solved}
            total={easy.total}
            variant="easy"
          />
          <DifficultyRow
            label="Medium"
            solved={medium.solved}
            total={medium.total}
            variant="medium"
          />
          <DifficultyRow
            label="Hard"
            solved={hard.solved}
            total={hard.total}
            variant="hard"
          />
        </div>
      </div>
    </div>
  );
}