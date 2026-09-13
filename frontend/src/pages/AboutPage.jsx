import { motion } from 'framer-motion'
import { FiBook, FiCode, FiTrendingUp, FiFileText, FiZap, FiShield, FiTarget, FiHeart, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const AboutPage = () => {
  return (
    <div className="w-full px-4 md:px-8 max-w-5xl mx-auto py-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-leetcode-yellow/10 text-leetcode-yellow mb-4">
            <img src="./favicon.svg" alt="" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            About MyCodeNotes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            A free, open learning space for programming concepts, solved problems, and study notes.
          </p>
        </div>

        {/* What it is */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700 mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            What is MyCodeNotes?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            MyCodeNotes is a freely available learning platform where structured notes, solved
            coding problems, and reference material for programming live in one place. Learners
            today study from wherever they want — YouTube, textbooks, courses, blog posts.
            MyCodeNotes simply organizes that same kind of knowledge into a clean, searchable
            format that anyone can use at their own pace.
          </p>
        </div>

        {/* Why it exists */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700 mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiTarget className="text-leetcode-yellow" />
            Why It Exists
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Good learning material is scattered. Concepts live on one site, solutions on another,
            notes are buried in private folders that nobody else can access. MyCodeNotes was built
            to change that — to take what would otherwise stay locked away and publish it in a
            form that is genuinely useful for anyone learning to code. If something here helps
            even one person understand a topic faster, the site has done its job.
          </p>
        </div>

        {/* What you'll find */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiCode className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">LeetCode Problems</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Solved problems with step-by-step algorithms, patterns, and solutions in Java & Python.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiZap className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Practice Problems</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Coding challenges with hints and hidden solutions — test yourself before checking.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiTrendingUp className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">DSA Concepts</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quick-reference explanations of core programming concepts with clear examples.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-beige-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg">
                <FiFileText className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Notes & Guides</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Structured notes on web development, databases, tools, and frameworks — with code examples and PDF download.
            </p>
          </div>
        </div>

        {/* How it helps */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700 mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiUsers className="text-leetcode-yellow" />
            Who It's For
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span>Anyone learning to code, at any level</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span>Students preparing for interviews and DSA rounds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span>Developers who want a clean reference for tools and frameworks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span>Anyone who prefers reading structured notes over scattered tutorials</span>
            </li>
          </ul>
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-beige-200 dark:border-dark-700 mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiShield className="text-leetcode-yellow" />
            Privacy First
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            No tracking cookies. No analytics. No third-party scripts. Your preferences stay on
            your device. For full details, see the{' '}
            <Link to="/terms-privacy" className="text-leetcode-yellow hover:underline">
              Terms & Privacy
            </Link>{' '}
            page.
          </p>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-leetcode-yellow/10 to-transparent dark:from-leetcode-yellow/5 rounded-xl p-6 border border-leetcode-yellow/20 mb-5 text-center">
          <FiHeart className="text-leetcode-yellow text-2xl mx-auto mb-2" />
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-w-2xl mx-auto">
            If you're learning something here, it's working as intended. Learn freely,
            study at your own pace, and if it helps — pass it on.
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 pt-5 border-t border-beige-200 dark:border-dark-700">
          MyCodeNotes — Learn in public, grow together.
        </div>
      </motion.div>
    </div>
  )
}

export default AboutPage