import { FiCheck } from "react-icons/fi";
import { useUser } from "../../contexts/AuthContext";
import { useProgress } from "../../contexts/ProgressContext";

export default function SolvedCheckbox({ problemType, problemId, size = "md" }) {
  const { isAuthenticated } = useUser();
  const { isSolved, toggle } = useProgress();

  if (!isAuthenticated) return null;

  const checked = isSolved(problemType, problemId);
  const dim = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(problemType, problemId);
      }}
      title={checked ? "Mark as unsolved" : "Mark as solved"}
      className={`${dim} shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
        checked
          ? "bg-green-500 border-green-500 text-white shadow-sm"
          : "border-gray-300 dark:border-dark-600 hover:border-green-400"
      }`}
    >
      {checked && <FiCheck size={size === "sm" ? 12 : 14} strokeWidth={3} />}
    </button>
  );
}