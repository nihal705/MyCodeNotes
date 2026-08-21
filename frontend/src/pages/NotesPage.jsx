import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import NoteList from '../components/notes/NoteList'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ComingSoon from '../components/common/ComingSoon'
import { notesApi } from '../api/notes'

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRevealed, setIsRevealed] = useState(true)

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

  // SECRET DEVELOPER REVEAL: Press Ctrl + Shift + D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault()
          setIsRevealed(true)
          console.log('Developer mode activated! Notes revealed.')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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

  return (
    <motion.div
      className="w-full flex flex-col min-h-[60vh] -mt-3"
      initial="hidden"
      animate="visible"
    >
      {!isRevealed ? (
        <div className="relative w-full h-full flex-1 flex flex-col gap-6">
          <ComingSoon title="Notes" />
        </div>
      ) : (
        <div className="w-full px-6 sm:px-8 lg:px-12 pt-0 pb-12 flex flex-col items-center">
          
          {/* Centered Minimal Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-lg text-black-500 dark:text-black-400 mb-6 max-w-3xl font-medium"
          >
            Learn by reading notes, exploring code examples, and downloading PDF handbooks.
          </motion.p>

          {/* Note Grid - Full width */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full"
          >
            <NoteList 
              notes={filteredNotes} 
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />
          </motion.div>

        </div>
      )}
    </motion.div>
  )
}

export default NotesPage