import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import CodeArea from "../components/practice/CodeArea";
import SolutionReveal from "../components/practice/SolutionReveal";
import HintsReveal from "../components/practice/HintsReveal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { practiceApi } from "../api/practice";
import toast from "react-hot-toast";

const PracticeDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSolution, setUserSolution] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await practiceApi.getById(id);
        setProblem(data);
        // Load saved solution from localStorage
        const saved = localStorage.getItem(`practice_solution_${id}`);
        if (saved) setUserSolution(saved);
      } catch (error) {
        console.error("Error fetching practice problem:", error);
        toast.error("Problem not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleSolutionChange = (value) => {
    setUserSolution(value);
    localStorage.setItem(`practice_solution_${id}`, value);
  };

  const handleClearSolution = () => {
    setUserSolution("");
    localStorage.removeItem(`practice_solution_${id}`);
    toast.success("Solution cleared");
  };

  if (loading) return <LoadingSpinner />;
  if (!problem)
    return <div className="text-center py-12">Practice problem not found</div>;

  const difficultyColor = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-700",
  };

  return (
    <div className="container-custom mx-auto">
      <div className="space-y-0">
        <Link
          to="/practice"
          className="inline-flex items-center text-leetcode-yellow hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Practice
        </Link>

        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {problem.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${difficultyColor[problem.difficulty]}`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  {problem.language === "Java" ? "Java" : "Python3"}
                </span>
              </div>
            </div>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          <CardBody className="space-y-6">
            {/* Question */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Question:</h2>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                {problem.question}
              </div>
            </div>

            {/* Hints */}
            {problem.hints && problem.hints.length > 0 && (
              <HintsReveal hints={problem.hints} />
            )}

            {/* Practice Area */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Solution:</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <CodeArea
                    language={problem.language.toLowerCase()}
                    value={userSolution}
                    onChange={handleSolutionChange}
                    placeholder={`Write your ${problem.language} solution here...`}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleClearSolution}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear Solution
                    </button>
                  </div>
                </div>
                <div>
                  <SolutionReveal
                    solution={problem.solution}
                    language={problem.language.toLowerCase()}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PracticeDetailPage;
