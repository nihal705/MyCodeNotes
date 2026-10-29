import { motion } from 'framer-motion'
import { FiShield, FiLock, FiMail, FiUser, FiCheck } from 'react-icons/fi'

const TermsPrivacyPage = () => {
  return (
    <div className="w-full px-3.5 sm:px-6 md:px-8 max-w-6xl mx-auto py-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-leetcode-yellow/10 rounded-2xl border border-leetcode-yellow/20 shrink-0">
              <FiShield className="text-leetcode-yellow text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Terms & Privacy
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Last updated: October 29, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800/20 text-center">
            <FiCheck className="text-green-600 dark:text-green-400 text-lg sm:text-xl mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Minimal Data</p>
            <p className="text-[11px] sm:text-xs text-green-600/80 dark:text-green-400/80">Only what is strictly needed</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800/20 text-center">
            <FiShield className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Zero Tracking</p>
            <p className="text-[11px] sm:text-xs text-blue-600/80 dark:text-blue-400/80">No ad trackers or analytics cookies</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/20 text-center">
            <FiLock className="text-amber-600 dark:text-amber-400 text-lg sm:text-xl mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">Secure by Design</p>
            <p className="text-[11px] sm:text-xs text-amber-600/80 dark:text-amber-400/80">Grounded AI & private accounts</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

          {/* Privacy Policy */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                  <FiShield className="text-leetcode-yellow" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                  Privacy Policy
                </h2>
              </div>
              <ul className="space-y-2.5 text-[13px] sm:text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2.5">
                  <FiCheck className="text-green-500 shrink-0 mt-0.5" size={15} />
                  <span className="break-words">Essential account and progress data is collected strictly to support core learning features.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiCheck className="text-green-500 shrink-0 mt-0.5" size={15} />
                  <span className="break-words">No third-party advertising cookies, external tracking pixels, or marketing trackers are used.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiCheck className="text-green-500 shrink-0 mt-0.5" size={15} />
                  <span className="break-words"><strong>NextraAI Interactions:</strong> Prompts are processed securely to provide instant answers and are never sold or used to train public third-party models.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiCheck className="text-green-500 shrink-0 mt-0.5" size={15} />
                  <span className="break-words">Saved chat history and bookmarks are stored privately for your account and can be deleted anytime.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiCheck className="text-green-500 shrink-0 mt-0.5" size={15} />
                  <span className="break-words">Local storage is utilized exclusively for theme selection and active session continuity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiCheck className="text-green-500 shrink-0 mt-0.5" size={15} />
                  <span className="break-words">You may request complete removal of your personal data at any time by contacting us directly.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Terms of Use */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                  <FiLock className="text-leetcode-yellow" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                  Terms of Use
                </h2>
              </div>
              <ul className="space-y-2.5 text-[13px] sm:text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-leetcode-yellow text-sm mt-0.5 shrink-0">◆</span>
                  <span className="break-words">MyCodeNotes is provided entirely free for personal, educational, and interview prep use.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-leetcode-yellow text-sm mt-0.5 shrink-0">◆</span>
                  <span className="break-words">All content reflects curated study work, published openly for learning, reference, and review.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-leetcode-yellow text-sm mt-0.5 shrink-0">◆</span>
                  <span className="break-words">You may freely study, practice, and adapt the code examples and patterns for your own learning projects.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-leetcode-yellow text-sm mt-0.5 shrink-0">◆</span>
                  <span className="break-words">Content is provided "as is" without warranty of completeness; learners should verify platform constraints.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-leetcode-yellow text-sm mt-0.5 shrink-0">◆</span>
                  <span className="break-words"><strong>AI Study Aid:</strong> NextraAI responses are generated for educational guidance and should be verified for mission-critical use.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-leetcode-yellow text-sm mt-0.5 shrink-0">◆</span>
                  <span className="break-words">These terms may be updated periodically; continued use of the platform constitutes acceptance.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 md:col-span-2 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                <FiMail className="text-leetcode-yellow" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                Contact & Support
              </h2>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed break-words">
              For questions, feedback, corrections, or data removal requests, please reach out directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-6 text-[13px] sm:text-sm">
              <a 
                href="mailto:nihalmohammad705@gmail.com"
                className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cream-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:text-leetcode-yellow hover:border-leetcode-yellow transition-all border border-beige-200 dark:border-dark-600 break-all"
              >
                <FiMail size={16} className="text-leetcode-yellow shrink-0" />
                <span>nihalmohammad705@gmail.com</span>
              </a>
              <a
                href="https://linkedin.com/in/gnihal705"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cream-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:text-leetcode-yellow hover:border-leetcode-yellow transition-all border border-beige-200 dark:border-dark-600 shrink-0"
              >
                <FiUser size={16} className="text-leetcode-yellow shrink-0" />
                <span>LinkedIn Profile</span>
              </a>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

export default TermsPrivacyPage
