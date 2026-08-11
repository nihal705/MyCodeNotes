import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { Card, CardBody, CardHeader } from '../ui/Card'
import toast from 'react-hot-toast'

const ProblemDetail = ({ problem }) => {
  const [copiedJava, setCopiedJava] = useState(false)
  const [copiedPython, setCopiedPython] = useState(false)

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'java') {
      setCopiedJava(true)
      setTimeout(() => setCopiedJava(false), 2000)
    } else {
      setCopiedPython(true)
      setTimeout(() => setCopiedPython(false), 2000)
    }
    toast.success('Copied to clipboard!')
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">#{problem.leetcode_id}</span>
            <h1 className="text-2xl md:text-3xl font-bold">{problem.title}</h1>
          </div>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${difficultyColor[problem.difficulty]}`}>
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
          <p className="text-gray-700 whitespace-pre-wrap">{problem.statement}</p>
        </div>

        {/* Description */}
        {problem.description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Detailed Description:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
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
          {(problem.algorithm || problem.notebookConcept) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {problem.algorithm && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                     Algorithm
                  </h2>
                  <pre className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 font-mono text-sm leading-relaxed">
                    {problem.algorithm}
                  </pre>
                </div>
              )}
              
              {problem.notebookConcept && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Notebook Concept
                  </h2>
                  <pre className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 font-mono text-sm leading-relaxed">
                    {problem.notebookConcept}
                  </pre>
                </div>
              )}
            </div>
          )}

        {/* Solutions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">🔧 Solutions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {problem.java_solution && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold flex items-center gap-2">Java Solution</h3>
                  <button
                    onClick={() => copyToClipboard(problem.java_solution, 'java')}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {copiedJava ? <FiCheck className="text-green-500" /> : <FiCopy />}
                    {copiedJava ? 'Copied!' : 'Copy'}
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
                  <h3 className="font-semibold flex items-center gap-2">Python3 Solution</h3>
                  <button
                    onClick={() => copyToClipboard(problem.python_solution, 'python')}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {copiedPython ? <FiCheck className="text-green-500" /> : <FiCopy />}
                    {copiedPython ? 'Copied!' : 'Copy'}
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
  )
}

export default ProblemDetail