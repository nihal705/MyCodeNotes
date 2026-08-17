import { useState } from 'react'
import { practiceApi } from '../../api/practice'
import toast from 'react-hot-toast'

const AddPracticeForm = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    language: '',
    difficulty: '',
    question: '',
    hints: [],
    solution: '',
    tags: [],
  })
  const [hintInput, setHintInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  const languages = [
    { value: 'Java', label: '☕ Java' },
    { value: 'Python', label: '🐍 Python' },
  ]

  const difficulties = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addHint = () => {
    if (hintInput.trim()) {
      setFormData((prev) => ({ 
        ...prev, 
        hints: [...prev.hints, hintInput.trim()] 
      }))
      setHintInput('')
    }
  }

  const removeHint = (index) => {
    setFormData((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({ 
        ...prev, 
        tags: [...prev.tags, tagInput.trim()] 
      }))
      setTagInput('')
    }
  }

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
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

      await practiceApi.create(formData)
      toast.success('Practice problem added successfully!')
      setFormData({
        title: '',
        language: '',
        difficulty: '',
        question: '',
        hints: [],
        solution: '',
        tags: [],
      })
      setHintInput('')
      setTagInput('')
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.status === 403) {
        toast.error('Authentication failed. Please login again.')
        localStorage.removeItem('adminToken')
        window.location.href = '/admin'
      } else {
        toast.error(error.response?.data?.detail || 'Failed to add practice problem')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          placeholder="Palindromic Pattern with Numbers"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Language & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language <span className="text-red-500">*</span>
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="">Select Difficulty</option>
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Question <span className="text-red-500">*</span>
        </label>
        <textarea
          name="question"
          rows={4}
          placeholder="Write a program to print the pattern...\n    1\n   212\n  32123..."
          value={formData.question}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Hints */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hints
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={hintInput}
            onChange={(e) => setHintInput(e.target.value)}
            placeholder="Add a hint..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={addHint}
            className="px-4 py-2 bg-gray-200 dark:bg-dark-700 rounded-md hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            Add
          </button>
        </div>
        {formData.hints.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.hints.map((hint, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-dark-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                {hint}
                <button
                  type="button"
                  onClick={() => removeHint(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Solution */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Solution <span className="text-red-500">*</span>
        </label>
        <textarea
          name="solution"
          rows={6}
          placeholder="public class JavaBasics {\n    public static void main...\n}"
          value={formData.solution}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
        />
      </div>

      {/* Tags */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-200 dark:bg-dark-700 rounded-md hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Practice Problem'}
      </button>
    </form>
  )
}

export default AddPracticeForm