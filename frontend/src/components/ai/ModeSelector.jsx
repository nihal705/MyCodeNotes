const MODES = [
  { id: "normal", label: "Normal", icon: "💬", hint: "Standard answers" },
  { id: "hinglish", label: "Hinglish", icon: "🇮🇳", hint: "Hindi + English" },
  { id: "interview", label: "Interview", icon: "🎯", hint: "Mock DSA interview" },
  { id: "code_review", label: "Code Review", icon: "🔍", hint: "Senior PR review" },
];

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide w-full min-w-0">
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            title={m.hint}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-all border shrink-0 ${
              active
                ? "bg-leetcode-yellow text-gray-900 border-leetcode-yellow shadow-sm"
                : "bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 border-transparent hover:border-leetcode-yellow/50"
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
