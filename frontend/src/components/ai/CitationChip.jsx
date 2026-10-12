import { FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function CitationChip({ index, citation }) {
  if (!citation) return null;

  const label = `[${index}]`;
  const title = citation.title || citation.source_type || "Source";

  const inner = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-leetcode-yellow/15 hover:bg-leetcode-yellow/30 text-gray-800 dark:text-gray-200 border border-leetcode-yellow/30 transition-colors">
      <span className="font-semibold text-leetcode-yellow">{label}</span>
      <span className="truncate max-w-[140px]">{title}</span>
      <FiExternalLink size={10} className="opacity-60" />
    </span>
  );

  if (citation.url && citation.url.startsWith("/")) {
    return (
      <Link to={citation.url} target="_blank" title={title}>
        {inner}
      </Link>
    );
  }
  if (citation.url) {
    return (
      <a href={citation.url} target="_blank" rel="noopener noreferrer" title={title}>
        {inner}
      </a>
    );
  }
  return inner;
}