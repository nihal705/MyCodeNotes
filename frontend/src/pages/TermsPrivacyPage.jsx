import { motion } from 'framer-motion'
import { FiShield, FiLock, FiMail, FiGithub, FiUser, FiCheck, FiBookOpen, FiCode } from 'react-icons/fi'

const TermsPrivacyPage = () => {
  return (
    <div className="w-full px-4 md:px-8 max-w-6xl mx-auto py-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-leetcode-yellow/10 rounded-full">
            <FiShield className="text-leetcode-yellow text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms & Privacy</h1>
          </div>
        </div>

        {/* 3-Column Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800/20 text-center">
            <FiCheck className="text-green-600 dark:text-green-400 text-xl mx-auto mb-1" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Minimal Data</p>
            <p className="text-xs text-green-600 dark:text-green-400">Only what's needed</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800/20 text-center">
            <FiShield className="text-blue-600 dark:text-blue-400 text-xl mx-auto mb-1" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">No Tracking</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">No cookies or analytics</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800/20 text-center">
            <FiCode className="text-purple-600 dark:text-purple-400 text-xl mx-auto mb-1" />
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Open Source</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Code is public</p>
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Privacy */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiShield className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Privacy</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>Only essential data is collected for functionality</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>No tracking cookies, analytics, or third-party tools</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>Local storage is used only for preferences and session data</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>No data is shared, sold, or transmitted to any third party</span>
              </li>
            </ul>
          </div>

          {/* Terms */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiLock className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Terms</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>This is a personal learning journal and knowledge base</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>All content is original work — available for learning and reference</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>The source code is open and publicly available</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>This site is provided "as is" without any warranties</span>
              </li>
            </ul>
          </div>

          {/* Open Source */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiGithub className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Source Code</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>The codebase is publicly available on GitHub</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>Licensed under MIT — free to use, modify, and learn from</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <a 
                  href="https://github.com/nihal705/MyCodeNotes" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-leetcode-yellow hover:underline inline-flex items-center gap-1"
                >
                  <FiGithub size={14} />
                  Explore the repository →
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiMail className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Contact</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Questions or feedback? Reach out:
            </p>
            <div className="space-y-2.5 text-sm">
              <a 
                href="mailto:nihalmohammad705@gmail.com"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-leetcode-yellow transition-colors"
              >
                <FiMail size={16} className="text-leetcode-yellow" />
                nihalmohammad705@gmail.com
              </a>
              <a 
                href="https://github.com/nihal705"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-leetcode-yellow transition-colors"
              >
                <FiGithub size={16} className="text-leetcode-yellow" />
                Github
              </a>
              <a
                href="https://linkedin.com/in/gnihal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-leetcode-yellow transition-colors"
              >
                <FiUser size={16} className="text-leetcode-yellow" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

export default TermsPrivacyPage