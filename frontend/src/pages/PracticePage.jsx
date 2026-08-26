import { useState, useEffect, useMemo } from "react";
import PracticeList from "../components/practice/PracticeList";
import { Card } from "../components/ui/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { practiceApi } from "../api/practice";
import { FiChevronDown, FiChevronUp, FiTag, FiCode } from "react-icons/fi";

const PracticePage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [showTags, setShowTags] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    language: "",
    difficulty: "",
    tags: [],
  });

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    const tagSet = new Set();
    problems.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [problems]);

  // Difficulty distribution
  const difficultyStats = useMemo(() => {
    const stats = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    if (!problems || problems.length === 0) return stats;
    problems.forEach(p => {
      if (p.difficulty === "Beginner") stats.Beginner++;
      else if (p.difficulty === "Intermediate") stats.Intermediate++;
      else if (p.difficulty === "Advanced") stats.Advanced++;
    });
    return stats;
  }, [problems]);

  // Language distribution
  const languageStats = useMemo(() => {
    const stats = { Java: 0, Python: 0 };
    if (!problems || problems.length === 0) return stats;
    problems.forEach(p => {
      if (p.language === "Java") stats.Java++;
      else if (p.language === "Python") stats.Python++;
    });
    return stats;
  }, [problems]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await practiceApi.getAll();
        const problemsData = Array.isArray(data) ? data : [];
        setProblems(problemsData);
        setFilteredProblems(problemsData);
      } catch (error) {
        console.error("Error fetching practice problems:", error);
        setProblems([]);
        setFilteredProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    if (!problems || problems.length === 0) {
      setFilteredProblems([]);
      return;
    }

    let result = [...problems];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(searchLower) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
      );
    }

    // Apply language filter
    if (filters.language) {
      result = result.filter((p) => p.language === filters.language);
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      result = result.filter((p) => p.difficulty === filters.difficulty);
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((p) => {
        if (!p.tags || !Array.isArray(p.tags)) return false;
        return filters.tags.some(tag => p.tags.includes(tag));
      });
    }

    // Apply sorting
    const sortedResult = [...result];
    switch (sortBy) {
      case "recent":
        sortedResult.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case "oldest":
        sortedResult.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
      case "beginner":
        sortedResult.sort((a, b) => {
          const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
          return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
        });
        break;
      case "advanced":
        sortedResult.sort((a, b) => {
          const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
          return (order[b.difficulty] || 0) - (order[a.difficulty] || 0);
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
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  const clearAllFilters = () => {
    setFilters({ 
      search: "", 
      language: "", 
      difficulty: "", 
      tags: [] 
    });
    setSortBy("recent");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-custom mx-auto px-4 sm:px-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice & Learn</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Practice coding and general programming problems with hints and hidden solutions
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProblems?.length || 0} problems found
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty:</span>
            <div className="flex gap-3">
              <span className="text-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                <span className="font-semibold text-green-600 dark:text-green-400">{difficultyStats.Beginner || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">Beginner</span>
              </span>
              <span className="text-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{difficultyStats.Intermediate || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">Intermediate</span>
              </span>
              <span className="text-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span className="font-semibold text-red-600 dark:text-red-400">{difficultyStats.Advanced || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">Advanced</span>
              </span>
            </div>
          </div>
          <div className="w-px h-6 bg-gray-300 dark:bg-dark-600"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages:</span>
            <div className="flex gap-3">
              <span className="text-sm flex items-center gap-1.5">
                <FiCode size={14} className="text-blue-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{languageStats.Java || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">Java</span>
              </span>
              <span className="text-sm flex items-center gap-1.5">
                <FiCode size={14} className="text-green-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{languageStats.Python || 0}</span>
                <span className="text-gray-500 dark:text-gray-400">Python</span>
              </span>
            </div>
          </div>
          <div className="flex-1"></div>
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFA116] focus:border-transparent"
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="beginner">Difficulty (Beginner → Advanced)</option>
              <option value="advanced">Difficulty (Advanced → Beginner)</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Tag/Pattern chips - Collapsible */}
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
              {showTags ? <FiChevronUp size={18} className="text-gray-400" /> : <FiChevronDown size={18} className="text-gray-400" />}
            </button>
            
            {showTags && (
              <div className="flex flex-wrap items-center gap-2 p-4 pt-0 border-t border-gray-100 dark:border-dark-700">
                {allTags.map(tag => (
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
                    onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title or tag..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA116]"
            />
            <select
              value={filters.language}
              onChange={(e) =>
                setFilters({ ...filters, language: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA116]"
            >
              <option value="">All Languages</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFA116]"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </Card>

        {/* Empty state */}
        {!filteredProblems || filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {problems && problems.length > 0 ? "No practice problems match these filters" : "No practice problems available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {problems && problems.length > 0 
                ? "Try adjusting your search, language, difficulty, or tag filters"
                : "Check back later for new practice problems"}
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
          <PracticeList problems={filteredProblems} />
        )}
      </div>
    </div>
  );
};

export default PracticePage;