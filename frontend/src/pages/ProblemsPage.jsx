import { useState, useEffect, useMemo } from "react";
import ProblemList from "../components/problems/ProblemList";
import ProblemFilters from "../components/problems/ProblemFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProgressHeader from "../components/profile/ProgressHeader";
import { problemsApi } from "../api/problems";
import { userProgressApi } from "../api/userProgress";
import { useUser } from "../contexts/AuthContext";
import { useProgress } from "../contexts/ProgressContext";
import { FiChevronDown, FiChevronUp, FiTag } from "react-icons/fi";

const ProblemsPage = () => {
  const { isAuthenticated } = useUser();
  const { stats } = useProgress();

  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [showTags, setShowTags] = useState(false);
  const [streak, setStreak] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    hasJava: false,
    hasPython: false,
    tags: [],
  });

  // Fetch problems once
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await problemsApi.getAll();
        let problemsData = [];
        if (Array.isArray(data)) {
          problemsData = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          problemsData = data.data;
        } else if (data && data.problems && Array.isArray(data.problems)) {
          problemsData = data.problems;
        } else if (data && typeof data === "object") {
          const values = Object.values(data);
          const arrayValue = values.find((v) => Array.isArray(v));
          if (arrayValue) problemsData = arrayValue;
        }
        setProblems(problemsData);
        setFilteredProblems(problemsData);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setProblems([]);
        setFilteredProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Fetch streak for logged-in users
  useEffect(() => {
    if (!isAuthenticated) {
      setStreak(null);
      return;
    }
    userProgressApi.getStreak().then(setStreak).catch(() => setStreak(null));
  }, [isAuthenticated]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    const tagSet = new Set();
    problems.forEach((p) => {
      if (p.concept) tagSet.add(p.concept);
      if (p.pattern) tagSet.add(p.pattern);
    });
    return Array.from(tagSet).sort();
  }, [problems]);

  // Difficulty distribution of all problems
  const difficultyStats = useMemo(() => {
    const stats = { EASY: 0, MEDIUM: 0, HARD: 0 };
    if (!problems || problems.length === 0) return stats;
    problems.forEach((p) => {
      const d = p.difficulty?.toUpperCase() || "";
      if (d === "EASY") stats.EASY++;
      else if (d === "MEDIUM") stats.MEDIUM++;
      else if (d === "HARD") stats.HARD++;
    });
    return stats;
  }, [problems]);

  // Apply filters + sort
  useEffect(() => {
    if (!problems || problems.length === 0) {
      setFilteredProblems([]);
      return;
    }

    let result = [...problems];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(s) ||
          (p.leetcode_id || "").toString().includes(s) ||
          (p.concept || "").toLowerCase().includes(s) ||
          (p.pattern || "").toLowerCase().includes(s)
      );
    }

    if (filters.difficulty) {
      const target = filters.difficulty.toUpperCase();
      result = result.filter((p) => p.difficulty?.toUpperCase() === target);
    }

    if (filters.hasJava) result = result.filter((p) => p.java_solution);
    if (filters.hasPython) result = result.filter((p) => p.python_solution);

    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((p) => {
        const problemTags = [p.concept, p.pattern].filter(Boolean);
        return filters.tags.some((tag) => problemTags.includes(tag));
      });
    }

    const sortedResult = [...result];
    switch (sortBy) {
      case "recent":
        sortedResult.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case "oldest":
        sortedResult.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
      case "easy":
        sortedResult.sort((a, b) => {
          const o = { EASY: 0, MEDIUM: 1, HARD: 2 };
          return (
            (o[a.difficulty?.toUpperCase()] || 0) -
            (o[b.difficulty?.toUpperCase()] || 0)
          );
        });
        break;
      case "hard":
        sortedResult.sort((a, b) => {
          const o = { EASY: 0, MEDIUM: 1, HARD: 2 };
          return (
            (o[b.difficulty?.toUpperCase()] || 0) -
            (o[a.difficulty?.toUpperCase()] || 0)
          );
        });
        break;
      case "alphabetical":
        sortedResult.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      default:
        break;
    }

    setFilteredProblems(sortedResult);
  }, [filters, problems, sortBy]);

  const toggleTag = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      difficulty: "",
      hasJava: false,
      hasPython: false,
      tags: [],
    });
    setSortBy("recent");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-custom mx-auto px-4 sm:px-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              LeetCode Problems
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredProblems?.length || 0} problems found
            </p>
          </div>
        </div>

        {/* Progress header — same as profile (only for logged-in users) */}
        {isAuthenticated && stats && (
          <ProgressHeader stats={stats} streak={streak} compact />
        )}

        {/* Difficulty distribution summary + sort */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Difficulty:
          </span>
          <div className="flex gap-4">
            <span className="text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {difficultyStats.EASY || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400">Easy</span>
            </span>
            <span className="text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                {difficultyStats.MEDIUM || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400">Medium</span>
            </span>
            <span className="text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {difficultyStats.HARD || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400">Hard</span>
            </span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFA116] focus:border-transparent"
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="easy">Difficulty (Easy → Hard)</option>
              <option value="hard">Difficulty (Hard → Easy)</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Tag filter chips */}
        {allTags && allTags.length > 0 && (
          <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <button
              onClick={() => setShowTags(!showTags)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FiTag size={16} className="text-[#FFA116]" />
                Filter by tag
                {filters.tags && filters.tags.length > 0 && (
                  <span className="ml-1 text-xs bg-[#FFA116] text-gray-900 px-2 py-0.5 rounded-full">
                    {filters.tags.length}
                  </span>
                )}
              </span>
              {showTags ? (
                <FiChevronUp size={18} className="text-gray-400" />
              ) : (
                <FiChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {showTags && (
              <div className="flex flex-wrap items-center gap-2 p-4 pt-0 border-t border-gray-100 dark:border-dark-700">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      filters.tags?.includes(tag)
                        ? "bg-[#FFA116] text-gray-900 shadow-md"
                        : "bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {filters.tags && filters.tags.length > 0 && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, tags: [] }))}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <ProblemFilters filters={filters} setFilters={setFilters} />

        {/* List / Empty state */}
        {!filteredProblems || filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {problems && problems.length > 0
                ? "No problems match these filters"
                : "No problems available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {problems && problems.length > 0
                ? "Try adjusting your search, difficulty, or tag filters"
                : "Check back later for new problems"}
            </p>
            {problems && problems.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-[#FFA116] text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <ProblemList problems={filteredProblems} />
        )}
      </div>
    </div>
  );
};

export default ProblemsPage;