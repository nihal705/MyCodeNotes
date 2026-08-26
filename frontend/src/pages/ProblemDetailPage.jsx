import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiCopy, 
  FiCheck, 
  FiArrowUp,
  FiBook,
  FiTag,
  FiCode,
  FiTrendingUp
} from "react-icons/fi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { problemsApi } from "../api/problems";
import toast from "react-hot-toast";

const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [relatedProblems, setRelatedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await problemsApi.getById(id);
        setProblem(data);
        
        // Fetch related problems (same concept or pattern)
        if (data.concept || data.pattern) {
          const allProblems = await problemsApi.getAll();
          const related = allProblems.filter(p => 
            p.id !== parseInt(id) && (
              (data.concept && p.concept === data.concept) ||
              (data.pattern && p.pattern === data.pattern)
            )
          );
          setRelatedProblems(related.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
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

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "java") {
      setCopiedJava(true);
      setTimeout(() => setCopiedJava(false), 2000);
    } else {
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const getLeetCodeUrl = (title) => {
    return `https://leetcode.com/problems/${title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '')}/`;
  };

  // Render code with line numbers
  const renderCodeWithLineNumbers = (code, language) => {
    if (!code) return null;
    const lines = code.split('\n');
    return (
      <div className="relative overflow-x-auto rounded-lg">
        <div className="flex">
          <div className="select-none text-right pr-4 py-4 min-w-[3rem] bg-gray-800 dark:bg-gray-900 text-gray-500 dark:text-gray-600 font-mono text-sm border-r border-gray-700">
            {lines.map((_, i) => (
              <div key={i} className="leading-relaxed">{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="leading-relaxed whitespace-pre-wrap break-words">
                  {line || ' '}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    );
  };

  // Helper function to get difficulty color class
  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toUpperCase() || '';
    switch(diff) {
      case "EASY":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "HARD":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Helper function to get difficulty dot color
  const getDifficultyDotColor = (difficulty) => {
    const diff = difficulty?.toUpperCase() || '';
    switch(diff) {
      case "EASY":
        return "bg-green-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "HARD":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper function to get difficulty text color
  const getDifficultyTextColor = (difficulty) => {
    const diff = difficulty?.toUpperCase() || '';
    switch(diff) {
      case "EASY":
        return "text-green-700 dark:text-green-400";
      case "MEDIUM":
        return "text-yellow-700 dark:text-yellow-400";
      case "HARD":
        return "text-red-700 dark:text-red-400";
      default:
        return "text-gray-700 dark:text-gray-400";
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!problem) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Problem not found</div>;

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
          to="/problems"
          className="inline-flex items-center text-leetcode-yellow hover:underline -mt-6 -mb-0"
        >
          <FiArrowLeft className="mr-2" /> Back to Problems
        </Link>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">
                  #{problem.leetcode_id}
                </span>
                <a
                  href={getLeetCodeUrl(problem.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl md:text-3xl font-bold hover:text-leetcode-yellow transition-colors hover:underline flex items-center gap-2"
                >
                  {problem.title}
                  <span className="text-sm text-gray-400 mt-3">Solve ↗</span>
                </a>
              </div>
              <span
                className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${getDifficultyColor(problem.difficulty)}`}
              >
                {problem.difficulty}
              </span>
            </div>
            <div className="flex gap-2">
              {problem.java_solution && (
                <span className="bg-gray-100 px-3 py-1 rounded-md text-sm flex items-center gap-1">
                  Java
                </span>
              )}
              {problem.python_solution && (
                <span className="bg-gray-100 px-3 py-1 rounded-md text-sm flex items-center gap-1">
                  Python3
                </span>
              )}
            </div>
          </CardHeader>

          <CardBody className="space-y-6 p-4 sm:p-6">
            {/* Statement */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Problem Statement:</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {problem.statement}
              </p>
            </div>

            {/* Description */}
            {problem.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Detailed Description:
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {problem.description}
                </p>
              </div>
            )}

            {/* Concept & Pattern - Side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problem.concept && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-2">
                    <FiTrendingUp size={16} /> Concept
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">{problem.concept}</p>
                </div>
              )}
              {problem.pattern && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                  <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-2">
                    <FiTag size={16} /> Pattern
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">{problem.pattern}</p>
                </div>
              )}
            </div>

            {/* Algorithm & Notebook Concept - Side by Side */}
            {(problem.algorithm || problem.notebook_concept) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {problem.algorithm && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      Algorithm:
                    </h2>
                    <pre className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 font-mono text-sm leading-relaxed">
                      {problem.algorithm}
                    </pre>
                  </div>
                )}
                {problem.notebook_concept && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      Notebook Concept:
                    </h2>
                    <pre className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 font-mono text-sm leading-relaxed">
                      {problem.notebook_concept}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Solutions with line numbers */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Solutions:</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {problem.java_solution && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <FiCode size={16} className="text-[#FFA116]" /> Java Solution
                      </h3>
                      <button
                        onClick={() => copyToClipboard(problem.java_solution, "java")}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                      >
                        {copiedJava ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiCopy />
                        )}
                        {copiedJava ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    {renderCodeWithLineNumbers(problem.java_solution, "java")}
                  </div>
                )}

                {problem.python_solution && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <FiCode size={16} className="text-[#FFA116]" /> Python3 Solution
                      </h3>
                      <button
                        onClick={() => copyToClipboard(problem.python_solution, "python")}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                      >
                        {copiedPython ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiCopy />
                        )}
                        {copiedPython ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    {renderCodeWithLineNumbers(problem.python_solution, "python")}
                  </div>
                )}
              </div>
            </div>

            {/* Related Problems */}
            {relatedProblems.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiBook size={18} className="text-[#FFA116]" /> Related Problems
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedProblems.map((related) => (
                    <Link
                      key={related.id}
                      to={`/problems/${related.id}`}
                      className="group p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 hover:border-[#FFA116] hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            #{related.leetcode_id}
                          </span>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#FFA116] transition-colors">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-2 h-2 rounded-full inline-block ${getDifficultyDotColor(related.difficulty)}`}></span>
                            <span className={`text-xs font-medium ${getDifficultyTextColor(related.difficulty)}`}>
                              {related.difficulty}
                            </span>
                          </div>
                        </div>
                        <FiArrowLeft className="text-gray-300 group-hover:text-[#FFA116] group-hover:translate-x-1 transition-all duration-300 rotate-180" />
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

export default ProblemDetailPage;