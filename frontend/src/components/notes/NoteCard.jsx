import { motion } from 'framer-motion'
import { FiCode, FiBox } from 'react-icons/fi'
import { SiPython, SiDocker, SiGithub, SiReact, SiRedux, SiMysql } from 'react-icons/si'

const NoteCard = ({ note }) => {
  if (!note || !note.slug) return null

  const isProjectsNote = note.content && note.content.projects
  const chapterCount = note.content?.chapters?.length || 0
  const topicCount = note.content?.chapters?.reduce((acc, ch) => acc + (ch.topics?.length || 0), 0) || 0
  const projectCount = note.content?.projects?.length || 0

  const displayType = isProjectsNote ? 'Projects' : 'Chapters'
  const displayCount = isProjectsNote ? projectCount : chapterCount

  const icon = note.slug === 'web-development' ? <FiCode className="text-3xl" /> 
              : note.slug === 'web-projects' ? <FiBox className="text-3xl" /> 
              : note.slug === 'python' ? <SiPython className="text-3xl" /> 
              : note.slug === 'docker-guide' ? <SiDocker className="text-3xl" /> 
              : note.slug === 'git-github-guide' ? <SiGithub className="text-3xl" /> 
              : note.slug === 'react-basics' || note.slug === 'react-projects' ? <SiReact className="text-3xl" /> 
              : note.slug === 'react-redux' ? <SiRedux className="text-3xl" /> 
              : note.slug === 'mysql-guide' ? <SiMysql className="text-3xl" />
              : note.icon || '📓'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-dark-800 rounded-xl p-5 shadow-md border border-beige-200 dark:border-dark-700 hover:shadow-xl transition-all duration-300 hover:border-leetcode-yellow cursor-pointer h-[230px] w-full flex flex-col justify-between"
    >
      <div className="flex-1 flex flex-col justify-start">
        <div className="flex items-start justify-between mb-2">
          <div className="mr-2 text-leetcode-yellow">{icon}</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">{note.title}</h3>
        </div>
        
        {note.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{note.description}</p>
        )}
      </div>

      <div>
        <div className="pt-2 border-t border-beige-200 dark:border-dark-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{displayCount} {displayType}</span>
          {!isProjectsNote && topicCount > 0 && (
            <>
              <span>•</span>
              <span>{topicCount} Topics</span>
            </>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400">
                #{tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-[10px] text-gray-400">+{note.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default NoteCard