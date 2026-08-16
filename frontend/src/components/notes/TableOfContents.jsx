import { useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

const TableOfContents = ({ chapters, activeChapter, activeTopic, onTopicClick }) => {
  const [expandedChapters, setExpandedChapters] = useState(
    chapters.map((_, index) => index === 0)
  )

  const toggleChapter = (index) => {
    setExpandedChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  if (!chapters || chapters.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-beige-200 dark:border-dark-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">No chapters available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-beige-200 dark:border-dark-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <span className="text-leetcode-yellow">📑</span> Table of Contents
      </h3>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
        {chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="border border-beige-100 dark:border-dark-700 rounded-lg overflow-hidden">
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapterIndex)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeChapter === chapterIndex
                  ? 'bg-leetcode-yellow/10 text-leetcode-yellow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              <span className="truncate">{chapter.title || `Chapter ${chapterIndex + 1}`}</span>
              {expandedChapters[chapterIndex] ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>

            {/* Topics */}
            {expandedChapters[chapterIndex] && chapter.topics && (
              <div className="space-y-1 p-2">
                {chapter.topics.map((topic, topicIndex) => (
                  <button
                    key={topicIndex}
                    onClick={() => onTopicClick(chapterIndex, topicIndex)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeChapter === chapterIndex && activeTopic === topicIndex
                        ? 'bg-leetcode-yellow text-gray-900 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    {topic.title || `Topic ${topicIndex + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableOfContents