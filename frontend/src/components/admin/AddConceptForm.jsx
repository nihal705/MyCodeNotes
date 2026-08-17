import { useState } from 'react'
import { conceptsApi } from '../../api/concepts'
import toast from 'react-hot-toast'

const AddConceptForm = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    definition: '',
    example: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        toast.error('Please login again')
        window.location.href = '/admin'
        return
      }

      await conceptsApi.create(formData)
      toast.success('Concept added successfully!')
      setFormData({
        name: '',
        definition: '',
        example: '',
      })
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.status === 403) {
        toast.error('Authentication failed. Please login again.')
        localStorage.removeItem('adminToken')
        window.location.href = '/admin'
      } else {
        toast.error(error.response?.data?.detail || 'Failed to add concept')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Concept Name */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Concept Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="Recursion, Dynamic Programming, etc."
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Definition */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Definition <span className="text-red-500">*</span>
        </label>
        <textarea
          name="definition"
          rows={4}
          placeholder="A function that calls itself to solve a problem by breaking it down into smaller subproblems..."
          value={formData.definition}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Example */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Example
        </label>
        <textarea
          name="example"
          rows={4}
          placeholder="Factorial: factorial(n) = n * factorial(n-1)\nBase case: factorial(0) = 1"
          value={formData.example}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Concept'}
      </button>
    </form>
  )
}

export default AddConceptForm