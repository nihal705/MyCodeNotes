import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBook, FiSearch } from 'react-icons/fi'
import NoteList from '../components/notes/NoteList'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { notesApi } from '../api/notes'

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await notesApi.getAll()
        setNotes(data)
        setFilteredNotes(data)
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    const lowerQuery = query.toLowerCase().trim()
    
    if (!lowerQuery) {
      setFilteredNotes(notes)
      return
    }
    
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.description?.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    setFilteredNotes(filtered)
  }

  if (loading) return <LoadingSpinner />

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-cream-50 to-beige-50 dark:from-dark-800 dark:to-dark-900 rounded-2xl p-6 border border-beige-200 dark:border-dark-700"
      >
        <div className="flex items-center gap-4">
          <div className="bg-leetcode-yellow/20 p-4 rounded-xl">
            <FiBook className="text-3xl text-leetcode-yellow" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-leetcode-yellow bg-white dark:bg-dark-800 text-gray-900 dark:text-white transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Note List */}
      <motion.div variants={itemVariants}>
        <NoteList notes={filteredNotes} />
      </motion.div>
    </motion.div>
  )
}

export default NotesPage