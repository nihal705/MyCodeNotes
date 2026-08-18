import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

const ConceptList = ({ concepts }) => {
  if (!concepts || concepts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No concepts found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {concepts.map((concept) => (
        <Link key={concept.id} to={`/concepts/${concept.id}`}>
          <Card className="p-6 hover:shadow-xl transition-all duration-300 h-full border-2 border-transparent hover:border-leetcode-yellow">
            <h3 className="text-lg font-semibold mb-2">{concept.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-3">{concept.definition}</p>
            {concept.example && (
              <div className="mt-3 text-xs text-gray-400">
                Click to See Example →
              </div>
            )}
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default ConceptList