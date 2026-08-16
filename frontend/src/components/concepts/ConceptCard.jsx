import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

const ConceptCard = ({ concept }) => {
  return (
    <Link to={`/concepts/${concept.id}`}>
      <Card className="p-6 hover:shadow-xl transition-all duration-300 h-full border-2 border-transparent hover:border-leetcode-yellow">
        <h3 className="text-lg font-semibold mb-2">{concept.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{concept.definition}</p>
        {concept.example && (
          <div className="mt-3 text-xs text-gray-400">
            Example: {concept.example.substring(0, 60)}...
          </div>
        )}
      </Card>
    </Link>
  )
}

export default ConceptCard