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

  // ============================================================
  // IMAGE TOPIC DETECTION
  // ============================================================
  // If topic title ends with an image extension → treat as image topic
  const isImageTopic = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(topic.title)

  // Try to find the markdown image path from the content
  // Content example: "![Rock](stone-paper-scissor/images/rock.png)"
  const extractImagePath = () => {
    if (!topic.content) return null
    const match = topic.content.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    if (match) {
      const rawPath = match[2]
      // Resolve  X/images/Y  →  /assets/X/Y
      return rawPath.replace(/^([^/]+)\/images\/(.+)$/, '/assets/$1/$2')
    }
    return null
  }

  const imagePath = isImageTopic ? extractImagePath() : null

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-beige-200 dark:border-dark-700 overflow-hidden max-w-4xl mx-auto"
    >
      <div className="flex flex-col min-h-[80vh] max-h-[85vh]">
        {/* Breadcrumb */}
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

        {/* Scrollable content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-600"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {topic.title}
          </h2>

          {/* ============ IMAGE TOPIC VIEW ============ */}
          {imagePath ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-gradient-to-br from-cream-50 to-beige-50 dark:from-dark-900 dark:to-dark-800 rounded-2xl p-6 border border-beige-200 dark:border-dark-700 shadow-sm">
                <img
                  src={imagePath}
                  alt={topic.title}
                  className="max-w-[280px] max-h-[280px] h-auto rounded-xl object-contain"
                  loading="lazy"
                  onError={(e) => {
                    console.error('❌ Image failed:', imagePath)
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center max-w-md">
                {topic.content?.split('\n')[0] || `Image: ${topic.title}`}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                📁 {imagePath}
              </p>
            </div>
          ) : (
            /* ============ NORMAL TEXT TOPIC VIEW ============ */
            <>
              {topic.content && (
                <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                  {topic.content.split('\n').map((line, index) => {
                    // Inline image rendering (for mixed content)
                    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
                    if (imgMatch) {
                      const [, alt, rawPath] = imgMatch
                      const resolvedPath = rawPath.replace(
                        /^([^/]+)\/images\/(.+)$/,
                        '/assets/$1/$2'
                      )
                      return (
                        <div key={index} className="my-4 flex justify-center">
                          <img
                            src={resolvedPath}
                            alt={alt}
                            className="max-w-[220px] h-auto rounded-xl border border-beige-200 dark:border-dark-700 shadow-sm"
                            loading="lazy"
                          />
                        </div>
                      )
                    }
                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        {line}
                      </p>
                    )
                  })}
                </div>
              )}
            </>
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

        {/* Navigation */}
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