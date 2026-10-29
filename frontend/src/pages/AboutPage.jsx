import { motion } from 'framer-motion'
import { FiBook, FiCode, FiTrendingUp, FiFileText, FiZap, FiShield, FiTarget, FiHeart, FiUsers, FiCpu } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import NextraLogo from '../components/ai/NextraLogo'

const AboutPage = () => {
  return (
    <div className="w-full px-3.5 sm:px-6 md:px-8 max-w-5xl mx-auto py-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-leetcode-yellow/10 text-leetcode-yellow mb-3.5 sm:mb-4 border border-leetcode-yellow/20 shadow-sm">
            <img src="/favicon.svg" alt="MyCodeNotes" className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            About MyCodeNotes
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 max-w-2xl mx-auto leading-relaxed px-2">
            A free, open learning platform for data structures, algorithms, coding notes, and AI-powered study assistance.
          </p>
        </div>

        {/* What it is */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 mb-3.5 sm:mb-5 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2.5 sm:mb-3">
            What is MyCodeNotes?
          </h2>
          <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
            MyCodeNotes is a freely accessible learning hub where structured notes, solved
            coding problems, and reference materials live in one place. Learners
            today study from across the web — YouTube, textbooks, documentation, and blog posts.
            MyCodeNotes organizes that knowledge into a clean, searchable, and distraction-free
            space that anyone can explore at their own pace.
          </p>
        </div>

        {/* Why it exists */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 mb-3.5 sm:mb-5 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2.5 sm:mb-3 flex items-center gap-2">
            <FiTarget className="text-leetcode-yellow shrink-0" />
            Why It Exists
          </h2>
          <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
            Good learning material is often scattered: concepts live on one site, solutions on another,
            and personal notes remain buried in private folders. MyCodeNotes was built
            to change that — taking what would otherwise stay locked away and publishing it in an
            approachable, open format. If something here helps even one person understand a tricky
            concept or crack an interview problem faster, the site has done its job.
          </p>
        </div>

        {/* What you'll find */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3.5 sm:mb-5">
          {/* NextraAI Featured Card */}
          <div className="bg-gradient-to-br from-yellow-500/10 via-white to-amber-500/5 dark:from-yellow-500/15 dark:via-dark-800 dark:to-dark-800 rounded-2xl p-4 sm:p-5 border border-leetcode-yellow/40 dark:border-leetcode-yellow/30 md:col-span-2 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-leetcode-yellow/20 to-yellow-500/10 border border-leetcode-yellow/30 flex items-center justify-center shrink-0">
                <NextraLogo size={18} glow />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  NextraAI Study Assistant
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-leetcode-yellow/20 text-gray-900 dark:text-leetcode-yellow font-medium">
                  Built-in AI
                </span>
              </div>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
              An intelligent companion grounded directly on MyCodeNotes. Ask questions in English or Hinglish, get step-by-step dry runs, conduct mock DSA interviews, and review code with voice and full-screen modes.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-5 border border-beige-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                <FiCode className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">LeetCode Solutions</h3>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
              Solved problems with step-by-step algorithms, intuitive intuition, pattern breakdowns, and clean code in Java & Python.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-5 border border-beige-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                <FiZap className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Practice Challenges</h3>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
              Hand-picked practice problems with collapsible hints and revealable solutions — test your problem-solving skills before checking answers.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-5 border border-beige-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                <FiTrendingUp className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">DSA Concepts</h3>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
              Quick-reference explanations of core algorithms, data structures, and algorithmic patterns with clear, visual explanations.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-5 border border-beige-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-leetcode-yellow/10 rounded-lg shrink-0">
                <FiFileText className="text-leetcode-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Notes & Guides</h3>
            </div>
            <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">
              Structured roadmaps on web development, databases, developer tools, and frameworks — complete with code snippets and PDF export.
            </p>
          </div>
        </div>

        {/* Who it's for */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 mb-3.5 sm:mb-5 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiUsers className="text-leetcode-yellow shrink-0" />
            Who It's For
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-[13px] sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span className="break-words">Anyone learning to code, from beginners to experienced developers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span className="break-words">Students and engineers preparing for technical interviews and DSA rounds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span className="break-words">Developers seeking a concise, reliable reference for concepts and tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-leetcode-yellow mt-0.5">◆</span>
              <span className="break-words">Learners who prefer organized notes and self-paced study over fragmented tutorials</span>
            </li>
          </ul>
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 sm:p-6 border border-beige-200 dark:border-dark-700 mb-3.5 sm:mb-5 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2.5 sm:mb-3 flex items-center gap-2">
            <FiShield className="text-leetcode-yellow shrink-0" />
            Privacy First
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[13px] sm:text-sm break-words">
            Zero tracking cookies, zero third-party analytics trackers, and no ad scripts. Your preferences and study progress stay secure, and NextraAI queries are processed solely to assist your learning. For full details, see the{' '}
            <Link to="/terms-privacy" className="text-leetcode-yellow hover:underline font-medium">
              Terms & Privacy
            </Link>{' '}
            page.
          </p>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-leetcode-yellow/10 to-transparent dark:from-leetcode-yellow/5 rounded-2xl p-4 sm:p-6 border border-leetcode-yellow/20 mb-5 text-center">
          <FiHeart className="text-leetcode-yellow text-2xl mx-auto mb-2" />
          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            If you're learning something here, it's working as intended. Learn freely,
            study at your own pace, and if it helps — pass it on.
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-beige-200 dark:border-dark-700">
          MyCodeNotes — Learn in public, grow together.
        </div>
      </motion.div>
    </div>
  )
}

export default AboutPage
