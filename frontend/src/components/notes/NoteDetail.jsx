import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import CodeBlock from './CodeBlock'

const NoteDetail = ({ chapters, activeChapter, activeTopic }) => {
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeChapter, activeTopic])

  if (!chapters || chapters.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm border border-beige-200 dark:border-dark-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No content available for this note.</p>
      </div>
    )
  }

  const chapter = chapters[activeChapter]
  const topic = chapter?.topics?.[activeTopic]

  if (!chapter || !topic) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm border border-beige-200 dark:border-dark-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">Select a topic from the table of contents.</p>
      </div>
    )
  }

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-beige-200 dark:border-dark-700"
    >
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className="text-leetcode-yellow">{chapter.title}</span>
        <span className="mx-2">›</span>
        <span>{topic.title}</span>
      </div>

      {/* Topic Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {topic.title}
      </h2>

      {/* Content */}
      {topic.content && (
        <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
          {topic.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Code Examples */}
      {topic.code_examples && topic.code_examples.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Code Examples</h3>
          {topic.code_examples.map((example, index) => (
            <CodeBlock
              key={index}
              language={example.language || 'javascript'}
              code={example.code}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default NoteDetail