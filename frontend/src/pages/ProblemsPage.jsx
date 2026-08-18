import { useState, useEffect } from "react";
import ProblemList from "../components/problems/ProblemList";
import ProblemFilters from "../components/problems/ProblemFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { problemsApi } from "../api/problems";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    hasJava: false,
    hasPython: false,
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await problemsApi.getAll();
        setProblems(data);
        setFilteredProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    let result = [...problems];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.leetcode_id.toString().includes(searchLower) ||
          p.concept?.toLowerCase().includes(searchLower) ||
          p.pattern?.toLowerCase().includes(searchLower),
      );
    }

    if (filters.difficulty) {
      result = result.filter((p) => p.difficulty === filters.difficulty);
    }

    if (filters.hasJava) {
      result = result.filter((p) => p.java_solution);
    }

    if (filters.hasPython) {
      result = result.filter((p) => p.python_solution);
    }

    setFilteredProblems(result);
  }, [filters, problems]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-custom mx-auto">
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">LeetCode Problems</h1>
            <p className="text-gray-600 mt-1">My Solved Problems</p>
          </div>
          <div className="text-sm text-gray-600">
            {filteredProblems.length} problems found
          </div>
        </div>

        <ProblemFilters filters={filters} setFilters={setFilters} />
        <ProblemList problems={filteredProblems} />
      </div>
    </div>
  );
};

export default ProblemsPage;
