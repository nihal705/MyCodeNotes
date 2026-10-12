const TIER_STYLES = {
  1: {
    label: "From MyCodeNotes",
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800/40",
  },
  2: {
    label: "AI Analysis",
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/40",
  },
  3: {
    label: "General Knowledge",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800/40",
  },
  4: {
    label: "Not in my domain",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/40",
  },
};

export default function TierBadge({ tier }) {
  if (!tier) return null;
  const s = TIER_STYLES[tier] || TIER_STYLES[3];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}