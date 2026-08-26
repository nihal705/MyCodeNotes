import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiArrowUp, FiBook } from "react-icons/fi";
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
  const [relatedProblems, setRelatedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSolution, setUserSolution] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await practiceApi.getById(id);
        setProblem(data);
        
        // Fetch related problems (same tags)
        if (data.tags && data.tags.length > 0) {
          const allProblems = await practiceApi.getAll();
          const related = allProblems.filter(p => 
            p.id !== parseInt(id) && 
            p.tags && Array.isArray(p.tags) &&
            data.tags.some(tag => p.tags.includes(tag))
          );
          setRelatedProblems(related.slice(0, 4));
        }
        
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

  // Scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSolutionChange = (value) => {
    setUserSolution(value);
    localStorage.setItem(`practice_solution_${id}`, value);
  };

  const handleClearSolution = () => {
    setUserSolution("");
    localStorage.removeItem(`practice_solution_${id}`);
    toast.success("Solution cleared");
  };

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!problem) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Practice problem not found</div>;

  return (
    <div className="container-custom mx-auto px-4 sm:px-6 pb-20" ref={contentRef}>
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#FFA116] text-gray-900 rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 hover:scale-110"
          aria-label="Back to top"
        >
          <FiArrowUp size={20} />
        </button>
      )}

      <div className="space-y-0">
        <Link
          to="/practice"
          className="inline-flex items-center text-leetcode-yellow hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Practice
        </Link>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {problem.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${getDifficultyColor(problem.difficulty)}`}
                >
                  {problem.difficulty}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  problem.language === "Java" 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  {problem.language === "Java" ? "Java" : "Python3"}
                </span>
              </div>
            </div>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          <CardBody className="space-y-6 p-4 sm:p-6">
            {/* Question */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Question:</h2>
              <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700">
                {problem.question}
              </div>
            </div>

            {/* Hints */}
            {problem.hints && problem.hints.length > 0 && (
              <HintsReveal hints={problem.hints} />
            )}

            {/* Practice Area */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Solution:</h2>
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
                      className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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

            {/* Related Practice Problems */}
            {relatedProblems.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiBook size={18} className="text-[#FFA116]" /> Related Practice Problems
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedProblems.map((related) => (
                    <Link
                      key={related.id}
                      to={`/practice/${related.id}`}
                      className="group p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 hover:border-[#FFA116] hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#FFA116] transition-colors">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            related.difficulty === "Beginner"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : related.difficulty === "Intermediate"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {related.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {related.language}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PracticeDetailPage;