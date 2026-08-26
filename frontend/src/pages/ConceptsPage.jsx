import { useState, useEffect, useMemo } from "react";
import ConceptList from "../components/concepts/ConceptList";
import SearchBar from "../components/common/SearchBar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { conceptsApi } from "../api/concepts";

const ConceptsPage = () => {
  const [concepts, setConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("alphabetical");

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        const data = await conceptsApi.getAll();
        const conceptsData = Array.isArray(data) ? data : [];
        setConcepts(conceptsData);
        setFilteredConcepts(conceptsData);
      } catch (error) {
        console.error("Error fetching concepts:", error);
        setConcepts([]);
        setFilteredConcepts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConcepts();
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      applySort(concepts);
      return;
    }
    const searchLower = query.toLowerCase();
    const filtered = concepts.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(searchLower) ||
        (c.definition || "").toLowerCase().includes(searchLower),
    );
    applySort(filtered);
  };

  const applySort = (data) => {
    const sorted = [...data];
    switch (sortBy) {
      case "alphabetical":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "recent":
        sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case "oldest":
        sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
      default:
        break;
    }
    setFilteredConcepts(sorted);
  };

  useEffect(() => {
    applySort(concepts);
  }, [sortBy, concepts]);

  const clearFilters = () => {
    handleSearch("");
    setSortBy("alphabetical");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-custom mx-auto px-4 sm:px-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Programming Fundamentals & Concepts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Quick reference for programming concepts with examples
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredConcepts?.length || 0} concepts found
          </div>
        </div>

        {/* Sort and Search row */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search concepts by name or definition..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFA116] focus:border-transparent"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        {!filteredConcepts || filteredConcepts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-dashed border-gray-300 dark:border-dark-600">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {concepts && concepts.length > 0 ? "No concepts match your search" : "No concepts available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {concepts && concepts.length > 0 
                ? "Try adjusting your search terms"
                : "Check back later for new concepts"}
            </p>
            {concepts && concepts.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-[#FFA116] text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ConceptList concepts={filteredConcepts} />
        )}
      </div>
    </div>
  );
};

export default ConceptsPage;