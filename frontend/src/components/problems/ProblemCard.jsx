import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

const ProblemCard = ({ problem }) => {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  }

  const getLeetCodeUrl = (title) => {
    return `https://leetcode.com/problems/${title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '')}/`
  }

  return (
    <Link to={`/problems/${problem.id}`}>
      <Card className="p-4 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-leetcode-yellow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500">#{problem.leetcode_id}</span>
              <a
                href={getLeetCodeUrl(problem.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lg hover:text-leetcode-yellow transition-colors hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {problem.title}
                <span className="text-xs text-gray-400">↗</span>
              </a>
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {problem.concept && (
                <span className="text-xs text-gray-500">{problem.concept}</span>
              )}
              {problem.pattern && (
                <span className="text-xs text-gray-500">{problem.pattern}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {problem.java_solution && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Java</span>
            )}
            {problem.python_solution && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Python3</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default ProblemCard