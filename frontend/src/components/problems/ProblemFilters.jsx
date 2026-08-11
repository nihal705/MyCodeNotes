import { Card } from '../ui/Card'

const ProblemFilters = ({ filters, setFilters }) => {
  const difficulties = ['Easy', 'Medium', 'Hard']

  const handleChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleCheckbox = (key) => {
    setFilters({ ...filters, [key]: !filters[key] })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      difficulty: '',
      hasJava: false,
      hasPython: false,
    })
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by title, #, concept..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
        />
        
        <select
          value={filters.difficulty}
          onChange={(e) => handleChange('difficulty', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
        >
          <option value="">All Difficulties</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hasJava}
              onChange={() => handleCheckbox('hasJava')}
              className="w-4 h-4 text-leetcode-yellow focus:ring-leetcode-yellow"
            />
            Java
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hasPython}
              onChange={() => handleCheckbox('hasPython')}
              className="w-4 h-4 text-leetcode-yellow focus:ring-leetcode-yellow"
            />
            Python3
          </label>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </Card>
  )
}

export default ProblemFilters