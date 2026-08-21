import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { problemsApi } from "../api/problems";
import toast from "react-hot-toast";

const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await problemsApi.getById(id);
        setProblem(data);
      } catch (error) {
        console.error("Error fetching problem:", error);
        toast.error("Problem not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

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
      .replace(/[^a-z0-9-]/g, '')}/`
  }

  if (loading) return <LoadingSpinner />;
  if (!problem)
    return <div className="text-center py-12">Problem not found</div>;

  const difficultyColor = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="container-custom mx-auto">
      <div className="space-y-0">
        <Link
          to="/problems"
          className="inline-flex items-center text-leetcode-yellow hover:underline -mt-6 -mb-0"
        >
          <FiArrowLeft className="mr-2" /> Back to Problems
        </Link>

        <Card>
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
                  <span className="text-sm text-gray-400">↗</span>
                </a>
              </div>
              <span
                className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${difficultyColor[problem.difficulty]}`}
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

          <CardBody className="space-y-6">
            {/* Statement */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Problem Statement:</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {problem.statement}
              </p>
            </div>

            {/* Description */}
            {problem.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Detailed Description:
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>
            )}

            {/* Concept */}
            {problem.concept && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Concept:</h2>
                <p className="text-gray-700">{problem.concept}</p>
              </div>
            )}

            {/* Pattern */}
            {problem.pattern && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Pattern:</h2>
                <p className="text-gray-700">{problem.pattern}</p>
              </div>
            )}

            {/* Algorithm & Notebook Concept - Side by Side */}
            {(problem.algorithm || problem.notebook_concept) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Algorithm */}
                {problem.algorithm && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="text-leetcode-yellow"></span> Algorithm:
                    </h2>
                    <pre className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 font-mono text-sm leading-relaxed">
                      {problem.algorithm}
                    </pre>
                  </div>
                )}

                {/* Notebook Concept */}
                {problem.notebook_concept && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span className="text-leetcode-yellow"></span> Notebook
                      Concept:
                    </h2>
                    <pre className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 font-mono text-sm leading-relaxed">
                      {problem.notebook_concept}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Solutions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Solutions:</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {problem.java_solution && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        Java Solution
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(problem.java_solution, "java")
                        }
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        {copiedJava ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiCopy />
                        )}
                        {copiedJava ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{problem.java_solution}</code>
                    </pre>
                  </div>
                )}

                {problem.python_solution && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        Python3 Solution
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(problem.python_solution, "python")
                        }
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        {copiedPython ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiCopy />
                        )}
                        {copiedPython ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{problem.python_solution}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProblemDetailPage;