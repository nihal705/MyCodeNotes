const DEFAULT_CHIPS = [
  "Explain this problem in simple words",
  "Show me the optimal approach",
  "What pattern does this use?",
  "Give me 2 similar problems to practice",
];

const CONTEXT_CHIPS = {
  leetcode: [
    "Explain the algorithm step by step",
    "What is the time complexity?",
    "Show alternative approaches",
    "Find similar problems",
  ],
  practice: [
    "Give me a hint without the solution",
    "Explain the concept used here",
    "What's a common mistake in this?",
  ],
  concept: [
    "Give me an example of this concept",
    "How is this used in real problems?",
    "Compare with a related concept",
  ],
  note: [
    "Summarize this note in 5 bullet points",
    "What should I learn next?",
  ],
};

export default function SuggestionChips({ pageContext, onPick, disabled }) {
  if (!onPick) return null;

  const sourceType = pageContext?.source_type;
  const chips = CONTEXT_CHIPS[sourceType] || DEFAULT_CHIPS;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => !disabled && onPick(chip)}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-full bg-cream-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 border border-beige-200 dark:border-dark-600 hover:border-leetcode-yellow hover:text-leetcode-yellow transition-colors disabled:opacity-50"
        >
          💡 {chip}
        </button>
      ))}
    </div>
  );
}