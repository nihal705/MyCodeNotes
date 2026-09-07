import { motion } from 'framer-motion'
import { FiShield, FiLock, FiMail, FiUser, FiCheck } from 'react-icons/fi'

const TermsPrivacyPage = () => {
  return (
    <div className="w-full px-4 md:px-8 max-w-6xl mx-auto py-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-leetcode-yellow/10 rounded-full">
              <FiShield className="text-leetcode-yellow text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms & Privacy</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last updated: September 6, 2026</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
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
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800/20 text-center">
            <FiLock className="text-amber-600 dark:text-amber-400 text-xl mx-auto mb-1" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Secure by Design</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Built with privacy in mind</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Privacy */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiShield className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Privacy Policy</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>Only essential data is collected, strictly for functionality</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>No tracking cookies, analytics, or third-party tools are used</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>Local storage is used only for preferences and session data</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>No data is shared, sold, or transmitted to any third party</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FiCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
                <span>You may request removal of any personal data by contacting us directly</span>
              </li>
            </ul>
          </div>

          {/* Terms */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiLock className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Terms of Use</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>This platform is intended for personal, educational use</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>All content reflects the author's own work, provided for learning and reference</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>Content is provided "as is," without warranties of accuracy or completeness</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>The author is not liable for any loss or damage arising from use of this site</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-leetcode-yellow text-sm mt-0.5">◆</span>
                <span>These terms may be updated at any time; continued use constitutes acceptance</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiMail className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Contact</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              For questions, concerns, or data removal requests, please reach out:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
              <a 
                href="mailto:nihalmohammad705@gmail.com"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-leetcode-yellow transition-colors"
              >
                <FiMail size={16} className="text-leetcode-yellow" />
                nihalmohammad705@gmail.com
              </a>
              <a
                href="https://linkedin.com/in/gnihal705"
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