import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi'
import NoteDetail from '../components/notes/NoteDetail'
import TableOfContents from '../components/notes/TableOfContents'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { notesApi } from '../api/notes'
import toast from 'react-hot-toast'

const NoteDetailPage = () => {
  const { slug } = useParams()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChapter, setActiveChapter] = useState(0)
  const [activeTopic, setActiveTopic] = useState(0)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const data = await notesApi.getBySlug(slug)
        setNote(data)
      } catch (error) {
        console.error('Error fetching note:', error)
        toast.error('Note not found')
      } finally {
        setLoading(false)
      }
    }
    fetchNote()
  }, [slug])

  const handleTopicClick = (chapterIndex, topicIndex) => {
    setActiveChapter(chapterIndex)
    setActiveTopic(topicIndex)
  }

  if (loading) return <LoadingSpinner />
  if (!note) return <div className="text-center py-12">Note not found</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link to="/notes" className="inline-flex items-center text-leetcode-yellow hover:underline">
        <FiArrowLeft className="mr-2" /> Back to Notes
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-cream-50 to-beige-50 dark:from-dark-800 dark:to-dark-900 rounded-2xl p-6 border border-beige-200 dark:border-dark-700">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{note.icon || '📓'}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
            {note.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{note.description}</p>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {note.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TableOfContents 
              chapters={note.content.chapters || []}
              activeChapter={activeChapter}
              activeTopic={activeTopic}
              onTopicClick={handleTopicClick}
            />
          </div>
        </div>

        {/* Note Content */}
        <div className="lg:col-span-3">
          <NoteDetail 
            chapters={note.content.chapters || []}
            activeChapter={activeChapter}
            activeTopic={activeTopic}
          />
        </div>
      </div>
    </div>
  )
}

export default NoteDetailPage