import { useState } from 'react'
import { notesApi } from '../../api/notes'
import toast from 'react-hot-toast'

const AddNoteForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    icon: '📓',
    content: {
      chapters: [
        {
          title: 'Chapter 1',
          topics: [
            {
              title: 'Topic 1',
              content: 'Your content here...',
              code_examples: []
            }
          ]
        }
      ]
    },
    tags: []
  })

  const [chapterInput, setChapterInput] = useState('')
  const [topicInput, setTopicInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [editingChapter, setEditingChapter] = useState(null)
  const [editingTopic, setEditingTopic] = useState(null)

  const icons = [
    { value: '📓', label: '📓 Notes' },
    { value: '⚛️', label: '⚛️ React' },
    { value: '📊', label: '📊 Data Science' },
    { value: '🐍', label: '🐍 Python' },
    { value: '☕', label: '☕ Java' },
    { value: '🚀', label: '🚀 JavaScript' },
    { value: '💻', label: '💻 Web Dev' },
    { value: '🤖', label: '🤖 AI/ML' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleContentChange = (e) => {
    try {
      const parsed = JSON.parse(e.target.value)
      setFormData((prev) => ({ ...prev, content: parsed }))
    } catch {
      // Invalid JSON, ignore
    }
  }

  const addChapter = () => {
    if (!chapterInput.trim()) return
    const newChapter = {
      title: chapterInput.trim(),
      topics: []
    }
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        chapters: [...prev.content.chapters, newChapter]
      }
    }))
    setChapterInput('')
  }

  const removeChapter = (index) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        chapters: prev.content.chapters.filter((_, i) => i !== index)
      }
    }))
  }

  const addTopic = (chapterIndex) => {
    if (!topicInput.trim()) return
    const newTopic = {
      title: topicInput.trim(),
      content: '',
      code_examples: []
    }
    const updatedChapters = [...formData.content.chapters]
    updatedChapters[chapterIndex].topics.push(newTopic)
    setFormData((prev) => ({
      ...prev,
      content: { ...prev.content, chapters: updatedChapters }
    }))
    setTopicInput('')
  }

  const removeTopic = (chapterIndex, topicIndex) => {
    const updatedChapters = [...formData.content.chapters]
    updatedChapters[chapterIndex].topics = updatedChapters[chapterIndex].topics.filter(
      (_, i) => i !== topicIndex
    )
    setFormData((prev) => ({
      ...prev,
      content: { ...prev.content, chapters: updatedChapters }
    }))
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()]
    }))
    setTagInput('')
  }

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await notesApi.create(formData)
      toast.success('Note created successfully!')
      setFormData({
        title: '',
        slug: '',
        description: '',
        icon: '📓',
        content: {
          chapters: [
            {
              title: 'Chapter 1',
              topics: [
                {
                  title: 'Topic 1',
                  content: 'Your content here...',
                  code_examples: []
                }
              ]
            }
          ]
        },
        tags: []
      })
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-beige-200 dark:border-dark-700 rounded-lg p-4 bg-cream-50 dark:bg-dark-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📝 Create New Note</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
          <select
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            {icons.map((icon) => (
              <option key={icon.value} value={icon.value}>{icon.label}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-700 rounded-md hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  #{tag}
                  <button type="button" onClick={() => removeTag(index)} className="text-blue-500 hover:text-blue-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (JSON)</label>
          <textarea
            value={JSON.stringify(formData.content, null, 2)}
            onChange={handleContentChange}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
            placeholder='{"chapters": [{"title": "Chapter 1", "topics": [{"title": "Topic 1", "content": "Content here...", "code_examples": [{"language": "javascript", "code": "console.log()"}]}]}]}'
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Note'}
        </button>
      </form>
    </div>
  )
}

export default AddNoteForm