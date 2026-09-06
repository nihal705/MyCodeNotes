import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import Button from '../ui/Button'
import { problemsApi } from '../../api/problems'
import { practiceApi } from '../../api/practice'
import { conceptsApi } from '../../api/concepts'
import { useAuth } from '../../hooks/useAuth'
import { profileApi } from '../../api/profile'
import toast from 'react-hot-toast'
import { FiSearch } from 'react-icons/fi' 
import { notesApi } from '../../api/notes'
import AddNoteForm from './AddNoteForm'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('problems')
  const [problems, setProblems] = useState([])
  const [practiceProblems, setPracticeProblems] = useState([])
  const [concepts, setConcepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [profileSettings, setProfileSettings] = useState({})
  const [editingProfile, setEditingProfile] = useState(false)
  const { logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProblems, setFilteredProblems] = useState([])
  const [filteredPractice, setFilteredPractice] = useState([])
  const [filteredConcepts, setFilteredConcepts] = useState([])
  const [notes, setNotes] = useState([])  
  const [notesSearch, setNotesSearch] = useState('') 
  const [filteredNotes, setFilteredNotes] = useState([])

  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [problemsData, practiceData, conceptsData, notesData] = await Promise.all([
        problemsApi.getAll(),
        practiceApi.getAll(),
        conceptsApi.getAll(),
        notesApi.getAll(),
      ])
      setProblems(problemsData)
      setPracticeProblems(practiceData)
      setConcepts(conceptsData)
      setNotes(notesData)
      setFilteredProblems(problemsData)
      setFilteredPractice(practiceData)
      setFilteredConcepts(conceptsData)
      setFilteredNotes(notesData)
      
      await fetchProfileSettings()
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

//Search Bar
const handleSearch = (query, type) => {
  setSearchQuery(query)
  const lowerQuery = query.toLowerCase().trim()
  
  if (type === 'problems') {
    if (!lowerQuery) {
      setFilteredProblems(problems)
      return
    }
    const filtered = problems.filter(p => 
      p.title?.toLowerCase().includes(lowerQuery) ||
      p.leetcode_id?.toString().includes(lowerQuery) ||
      p.concept?.toLowerCase().includes(lowerQuery) ||
      p.pattern?.toLowerCase().includes(lowerQuery)
    )
    setFilteredProblems(filtered)
  } else if (type === 'practice') {
    if (!lowerQuery) {
      setFilteredPractice(practiceProblems)
      return
    }
    const filtered = practiceProblems.filter(p => 
      p.title?.toLowerCase().includes(lowerQuery) ||
      p.language?.toLowerCase().includes(lowerQuery) ||
      p.difficulty?.toLowerCase().includes(lowerQuery) ||
      p.tags?.some(tag => tag?.toLowerCase().includes(lowerQuery))
    )
    setFilteredPractice(filtered)
  } else if (type === 'concepts') {
    if (!lowerQuery) {
      setFilteredConcepts(concepts)
      return
    }
    const filtered = concepts.filter(c => 
      c.name?.toLowerCase().includes(lowerQuery) ||
      c.definition?.toLowerCase().includes(lowerQuery)
    )
    setFilteredConcepts(filtered)
  }
}

const handleNotesSearch = (query) => {
  setNotesSearch(query)
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) {
    setFilteredNotes(notes)
    return
  }
  const filtered = notes.filter(n => 
    n.title?.toLowerCase().includes(lowerQuery) ||
    n.description?.toLowerCase().includes(lowerQuery) ||
    n.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
  setFilteredNotes(filtered)
}

  const updateProfileSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('http://localhost:8000/api/profile/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: profileSettings
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Profile settings updated!')
        setEditingProfile(false)
        await fetchProfileSettings()
      } else {
        toast.error('Failed to update profile settings')
      }
    } catch (error) {
      toast.error('Failed to update profile settings')
    }
  }

  const handleEdit = (item, type) => {
    setEditingId(item.id)
    setEditData({ ...item })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveEdit = async (type) => {
    try {
      if (type === 'problems') {
        await problemsApi.update(editData.id, editData)
        const updatedProblems = problems.map(p => p.id === editData.id ? editData : p)
        setProblems(updatedProblems)
        setFilteredProblems(updatedProblems)  
        toast.success('Problem updated successfully!')
      } else if (type === 'practice') {
        await practiceApi.update(editData.id, editData)
        const updatedPractice = practiceProblems.map(p => p.id === editData.id ? editData : p)
        setPracticeProblems(updatedPractice)
        setFilteredPractice(updatedPractice) 
        toast.success('Practice problem updated successfully!')
      } else if (type === 'concepts') {
        await conceptsApi.update(editData.id, editData)
        const updatedConcepts = concepts.map(c => c.id === editData.id ? editData : c)
        setConcepts(updatedConcepts)
        setFilteredConcepts(updatedConcepts)  
        toast.success('Concept updated successfully!')
      }
      setEditingId(null)
      setEditData({})
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this?')) return
    try {
      if (type === 'problems') {
        toast.info('Please delete from Neon SQL Editor')
        return
      } else if (type === 'practice') {
        toast.info('Please delete from Neon SQL Editor')
        return
      } else if (type === 'concepts') {
        toast.info('Please delete from Neon SQL Editor')
        return
      }
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const fetchProfileSettings = async () => {
    try {
      const data = await profileApi.getAll()
      setProfileSettings(Array.isArray(data) ? data[0] : data)
    } catch (error) {
      toast.error('Failed to fetch profile settings')
    }
  }

  const tabs = [
    { id: 'problems', label: 'LeetCode Problems' },
    { id: 'practice', label: 'Practice Problems' },
    { id: 'concepts', label: 'Concepts' },
    { id: 'notes', label: 'My Notes' },
    { id: 'profile', label: 'Profile Settings' },
  ]

// ============================================================
// SEARCH BAR COMPONENT
// ============================================================
const SearchBar = ({ type, placeholder }) => (
  <div className="relative mb-4">
    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value, type)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
    />
  </div>
)

  // Search Bar for Notes
  const NotesSearchBar = () => (
    <div className="relative mb-4">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search notes by title, description, or tags..."
        value={notesSearch}
        onChange={(e) => handleNotesSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
      />
    </div>
  )

  // Render Problem Edit Form
  const renderProblemEditForm = () => {
    const difficulties = ['Easy', 'Medium', 'Hard']
    return (
      <div className="container-custom mx-auto">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LeetCode ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="leetcode_id"
              value={editData.leetcode_id || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={editData.title || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            name="difficulty"
            value={editData.difficulty || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="">Select Difficulty</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Statement <span className="text-red-500">*</span>
          </label>
          <textarea
            name="statement"
            rows={4}
            value={editData.statement || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            value={editData.description || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Concept
          </label>
          <input
            type="text"
            name="concept"
            value={editData.concept || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pattern
          </label>
          <input
            type="text"
            name="pattern"
            value={editData.pattern || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Algorithm
          </label>
          <textarea
            name="algorithm"
            rows={5}
            value={editData.algorithm || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notebook Concept
          </label>
          <textarea
            name="notebook_concept" 
            rows={6}
            value={editData.notebook_concept || ''} 
            onChange={handleEditChange}
            placeholder="Add your notebook concept here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Java Solution
          </label>
          <textarea
            name="java_solution"
            rows={8}
            value={editData.java_solution || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Python Solution
          </label>
          <textarea
            name="python_solution"
            rows={8}
            value={editData.python_solution || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSaveEdit('problems')}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    )
  }

  // Render Practice Edit Form
  const renderPracticeEditForm = () => {
    const languages = ['Java', 'Python']
    const difficulties = ['Beginner', 'Intermediate', 'Advanced']
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={editData.title || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={editData.language || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            >
              <option value="">Select Language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              name="difficulty"
              value={editData.difficulty || ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            >
              <option value="">Select Difficulty</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            name="question"
            rows={6}
            value={editData.question || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hints (comma separated)
          </label>
          <input
            type="text"
            name="hints"
            value={Array.isArray(editData.hints) ? editData.hints.join(', ') : ''}
            onChange={(e) => setEditData({...editData, hints: e.target.value.split(',').map(h => h.trim())})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Solution <span className="text-red-500">*</span>
          </label>
          <textarea
            name="solution"
            rows={8}
            value={editData.solution || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={Array.isArray(editData.tags) ? editData.tags.join(', ') : ''}
            onChange={(e) => setEditData({...editData, tags: e.target.value.split(',').map(t => t.trim())})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSaveEdit('practice')}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Render Concept Edit Form
  const renderConceptEditForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={editData.name || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Definition <span className="text-red-500">*</span>
          </label>
          <textarea
            name="definition"
            rows={6}
            value={editData.definition || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Example
          </label>
          <textarea
            name="example"
            rows={4}
            value={editData.example || ''}
            onChange={handleEditChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSaveEdit('concepts')}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const renderProfileSettings = () => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Update your profile information here. All changes are saved to the database.
          </p>
        </div>
        
        {editingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={profileSettings.name || ''}
                  onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={profileSettings.title || ''}
                  onChange={(e) => setProfileSettings({...profileSettings, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea
                rows={3}
                value={profileSettings.bio || ''}
                onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={profileSettings.github || ''}
                  onChange={(e) => setProfileSettings({...profileSettings, github: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={profileSettings.linkedin || ''}
                  onChange={(e) => setProfileSettings({...profileSettings, linkedin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LeetCode URL</label>
                <input
                  type="text"
                  value={profileSettings.leetcode || ''}
                  onChange={(e) => setProfileSettings({...profileSettings, leetcode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Solved</label>
                <input
                  type="number"
                  value={profileSettings.totalSolved || 0}
                  onChange={(e) => setProfileSettings({...profileSettings, totalSolved: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Easy</label>
                <input
                  type="number"
                  value={profileSettings.easy || 0}
                  onChange={(e) => setProfileSettings({...profileSettings, easy: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medium</label>
                <input
                  type="number"
                  value={profileSettings.medium || 0}
                  onChange={(e) => setProfileSettings({...profileSettings, medium: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hard</label>
                <input
                  type="number"
                  value={profileSettings.hard || 0}
                  onChange={(e) => setProfileSettings({...profileSettings, hard: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Submissions</label>
                <input
                  type="number"
                  value={profileSettings.totalSubmissions || 0}
                  onChange={(e) => setProfileSettings({...profileSettings, totalSubmissions: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Languages (JSON)</label>
                <input
                  type="text"
                  value={typeof profileSettings.languages === 'object' ? JSON.stringify(profileSettings.languages) : profileSettings.languages || '{}'}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setProfileSettings({...profileSettings, languages: parsed})
                    } catch {
                      setProfileSettings({...profileSettings, languages: {}})
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder='{"Python3": 9, "Java": 5}'
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Updated (date string)</label>
              <input
                type="text"
                value={profileSettings.last_updated || ''}
                onChange={(e) => setProfileSettings({...profileSettings, last_updated: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                placeholder="e.g., August 2, 2026"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={updateProfileSettings}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Save All Changes
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                <span className="text-gray-900 dark:text-white">{profileSettings.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Title:</span>
                <span className="text-gray-900 dark:text-white">{profileSettings.title || 'Not set'}</span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Bio:</span>
                <span className="text-gray-900 dark:text-white truncate max-w-xs">{profileSettings.bio || 'Not set'}</span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Solved:</span>
                <span className="text-gray-900 dark:text-white">{profileSettings.totalSolved || 0}</span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Languages:</span>
                <span className="text-gray-900 dark:text-white">
                  {typeof profileSettings.languages === 'object' ? Object.keys(profileSettings.languages).join(', ') : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                <span className="text-gray-900 dark:text-white">{profileSettings.last_updated || 'Not set'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingProfile(true)
                fetchProfileSettings()
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
             Edit Profile Settings
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderNotesList = () => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          📓 Create and manage your notes here. Click Edit to modify content.
        </p>
      </div>
      
      <NotesSearchBar />
      
      {filteredNotes.map((note) => (
        <div key={note.id} className="border border-beige-200 dark:border-dark-700 rounded-lg p-4 bg-white dark:bg-dark-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{note.icon || '📓'}</span>
                <h3 className="font-semibold text-lg">{note.title}</h3>
              </div>
              {note.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{note.description}</p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {note.tags && note.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Updated: {new Date(note.updated_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => {
                  setEditingId(note.id)
                  setEditData(note)
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this note?')) {
                    notesApi.delete(note.slug)
                      .then(() => {
                        toast.success('Note deleted!')
                        fetchAllData()
                      })
                      .catch(() => toast.error('Failed to delete note'))
                  }
                }}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      {filteredNotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">No notes found.</div>
      )}
      
      <div className="mt-4">
        <AddNoteForm onSuccess={fetchAllData} />
      </div>
    </div>
  )
}



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <div className="flex gap-3">
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
          >
            Add Data in Neon
          </a>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearchQuery('')
                  if (tab.id === 'problems') setFilteredProblems(problems)
                  else if (tab.id === 'practice') setFilteredPractice(practiceProblems)
                  else if (tab.id === 'concepts') setFilteredConcepts(concepts)
                  else if (tab.id === 'notes') setFilteredNotes(notes)
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-leetcode-yellow text-gray-900 font-medium'
                    : 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-dark-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <>
              {activeTab === 'problems' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      To add new problems, use the Neon SQL Editor. Click Edit to modify all fields.
                    </p>
                  </div>
                  
                  <SearchBar type="problems" placeholder="Search problems by title, ID, concept, or pattern..." />
                  
                  {filteredProblems.map((problem) => (
                    <div key={problem.id} className="border border-beige-200 dark:border-dark-700 rounded-lg p-4 bg-white dark:bg-dark-800">
                      {editingId === problem.id ? (
                        renderProblemEditForm()
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm text-gray-500">#{problem.leetcode_id}</div>
                            <h3 className="font-semibold text-lg">{problem.title}</h3>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {problem.difficulty}
                              </span>
                              {problem.concept && (
                                <span className="text-xs text-gray-500">{problem.concept}</span>
                              )}
                              {problem.pattern && (
                                <span className="text-xs text-gray-500">{problem.pattern}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(problem, 'problems')}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(problem.id, 'problems')}
                              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredProblems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No problems found matching your search.</div>
                  )}
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      To add new practice problems, use the Neon SQL Editor. Click Edit to modify all fields.
                    </p>
                  </div>
                  
                  <SearchBar type="practice" placeholder="Search practice by title, language, difficulty, or tags..." />
                  
                  {filteredPractice.map((problem) => (
                    <div key={problem.id} className="border border-beige-200 dark:border-dark-700 rounded-lg p-4 bg-white dark:bg-dark-800">
                      {editingId === problem.id ? (
                        renderPracticeEditForm()
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{problem.title}</h3>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className="text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-full">
                                {problem.language}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                problem.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                problem.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {problem.difficulty}
                              </span>
                              {problem.tags && problem.tags.length > 0 && problem.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-xs text-gray-500">#{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(problem, 'practice')}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(problem.id, 'practice')}
                              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredPractice.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No practice problems found matching your search.</div>
                  )}
                </div>
              )}

              {activeTab === 'concepts' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      To add new concepts, use the Neon SQL Editor. Click Edit to modify all fields.
                    </p>
                  </div>
                  
                  <SearchBar type="concepts" placeholder="Search concepts by name or definition..." />
                  
                  {filteredConcepts.map((concept) => (
                    <div key={concept.id} className="border border-beige-200 dark:border-dark-700 rounded-lg p-4 bg-white dark:bg-dark-800">
                      {editingId === concept.id ? (
                        renderConceptEditForm()
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{concept.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{concept.definition}</p>
                            {concept.example && (
                              <p className="text-sm text-gray-500 mt-1">{concept.example.substring(0, 60)}...</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(concept, 'concepts')}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(concept.id, 'concepts')}
                              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredConcepts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No concepts found matching your search.</div>
                  )}
                </div>
              )}
              
              {activeTab === 'profile' && renderProfileSettings()}
              {activeTab === 'notes' && renderNotesList()}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminPanel