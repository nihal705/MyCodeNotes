import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { List } from 'react-virtualized'

const ConceptList = ({ concepts }) => {
  const [showAll, setShowAll] = useState(false)
  const initialDisplayCount = 20

  if (!concepts || concepts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No concepts found</p>
      </div>
    )
  }

  const displayedConcepts = showAll ? concepts : concepts.slice(0, initialDisplayCount)
  const isLargeList = concepts.length > 50

  const Row = ({ index, style }) => {
    const concept = displayedConcepts[index]
    return (
      <div style={style} className="px-1 py-1">
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isLargeList && showAll ? (
        <div className="border border-beige-200 dark:border-dark-700 rounded-lg overflow-hidden">
          <List
            height={600}
            itemCount={displayedConcepts.length}
            itemSize={180}
            width="100%"
          >
            {Row}
          </List>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedConcepts.map((concept) => (
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
      )}

      {concepts.length > initialDisplayCount && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-leetcode-yellow/10 text-leetcode-yellow rounded-lg hover:bg-leetcode-yellow/20 transition-colors duration-200"
          >
            {showAll ? 'Show Less' : `Show All (${concepts.length} concepts)`}
          </button>
        </div>
      )}
    </div>
  )
}

export default ConceptList