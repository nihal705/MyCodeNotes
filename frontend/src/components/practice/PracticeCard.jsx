import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

const PracticeCard = ({ problem }) => {
  const difficultyColor = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  }

  return (
    <Link to={`/practice/${problem.id}`}>
      <Card className="p-4 hover:shadow-xl transition-all duration-300 h-full border-2 border-transparent hover:border-leetcode-yellow">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{problem.title}</h3>
            <span className="text-sm">
              {problem.language === 'Java' ? 'Java' : 'Python'}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs text-gray-500">{problem.language}</span>
          </div>
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {problem.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  #{tag}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{problem.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

export default PracticeCard