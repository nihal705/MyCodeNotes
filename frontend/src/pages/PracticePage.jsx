import { useState, useEffect } from 'react'
import PracticeList from '../components/practice/PracticeList'
import { Card } from '../components/ui/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { practiceApi } from '../api/practice'

const PracticePage = () => {
  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    language: '',
    difficulty: '',
  })

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await practiceApi.getAll()
        setProblems(data)
        setFilteredProblems(data)
      } catch (error) {
        console.error('Error fetching practice problems:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [])

  useEffect(() => {
    let result = [...problems]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (filters.language) {
      result = result.filter((p) => p.language === filters.language)
    }

    if (filters.difficulty) {
      result = result.filter((p) => p.difficulty === filters.difficulty)
    }

    setFilteredProblems(result)
  }, [filters, problems])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Practice & Learn</h1>
          <p className="text-gray-600 mt-1">Practice coding and general programming problems with hints and hidden solutions</p>
        </div>
        <div className="text-sm text-gray-600">
          {filteredProblems.length} problems found
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
          />
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
          >
            <option value="">All Languages</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            onClick={() => setFilters({ search: '', language: '', difficulty: '' })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </Card>

      <PracticeList problems={filteredProblems} />
    </div>
  )
}

export default PracticePage