import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200"
        />
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-leetcode-yellow text-gray-900 px-4 py-1.5 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium text-sm"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar