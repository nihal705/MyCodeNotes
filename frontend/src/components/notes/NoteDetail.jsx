import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import CodeBlock from './CodeBlock'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const NoteDetail = ({ 
  chapters, 
  activeChapter, 
  activeTopic, 
  onNavigate,
  totalTopics,
  currentTopicIndex 
}) => {
  const contentRef = useRef(null)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
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

  const isFirstTopic = activeChapter === 0 && activeTopic === 0
  const isLastTopic = activeChapter === chapters.length - 1 && 
    activeTopic === (chapters[chapters.length - 1]?.topics?.length || 0) - 1

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-beige-200 dark:border-dark-700 overflow-hidden max-w-4xl mx-auto"
    >
      {/* Fixed height page card with internal scroll */}
      <div className="flex flex-col min-h-[80vh] max-h-[85vh]">
        {/* Breadcrumb inside card */}
        <div className="flex-shrink-0 px-6 pt-5 pb-3 border-b border-beige-100 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-leetcode-yellow font-medium">{chapter.title}</span>
              <span className="mx-2">›</span>
              <span>{topic.title}</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Page {currentTopicIndex + 1} of {totalTopics}
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-600"
        >
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
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-beige-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-800/50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('prev')}
              disabled={isFirstTopic}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isFirstTopic
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700 hover:text-leetcode-yellow'
              }`}
            >
              <FiChevronLeft size={18} />
              Previous
            </button>

            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {activeChapter + 1} / {chapters.length} · {activeTopic + 1} / {chapter.topics?.length || 0}
            </div>

            <button
              onClick={() => onNavigate('next')}
              disabled={isLastTopic}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLastTopic
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700 hover:text-leetcode-yellow'
              }`}
            >
              Next
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default NoteDetail