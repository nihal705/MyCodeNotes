import { motion } from 'framer-motion'
import { FiCode, FiBox } from 'react-icons/fi'

const NoteCard = ({ note }) => {
  if (!note || !note.slug) return null

  const isProjectsNote = note.content && note.content.projects
  const chapterCount = note.content?.chapters?.length || 0
  const topicCount = note.content?.chapters?.reduce((acc, ch) => acc + (ch.topics?.length || 0), 0) || 0
  const projectCount = note.content?.projects?.length || 0

  const displayType = isProjectsNote ? 'Projects' : 'Chapters'
  const displayCount = isProjectsNote ? projectCount : chapterCount

  // Choose icon based on slug
  const icon = note.slug === 'web-development' ? <FiCode className="text-3xl" /> 
              : note.slug === 'web-projects' ? <FiBox className="text-3xl" /> 
              : note.icon || '📓'

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-dark-800 rounded-xl p-5 shadow-sm border border-beige-200 dark:border-dark-700 hover:shadow-md transition-all duration-200 hover:border-leetcode-yellow cursor-pointer h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="mr-3 text-leetcode-yellow">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">{note.title}</h3>
      </div>
      
      {note.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{note.description}</p>
      )}

      <div className="mt-auto pt-3 border-t border-beige-200 dark:border-dark-700 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>{displayCount} {displayType}</span>
        {!isProjectsNote && topicCount > 0 && (
          <>
            <span>•</span>
            <span>{topicCount} Topics</span>
          </>
        )}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {note.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
              #{tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default NoteCard