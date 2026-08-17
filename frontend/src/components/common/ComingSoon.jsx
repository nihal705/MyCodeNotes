import { motion } from 'framer-motion'
import { FiLock } from 'react-icons/fi'

const ComingSoon = ({ title = "Notes" }) => {
  return (
    <div className="w-full h-full flex-1 bg-white/10 dark:bg-dark-800/10 backdrop-blur-lg rounded-3xl border border-white/20 dark:border-white/10 flex flex-col items-center justify-center p-10 text-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.05)]">
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl px-4"
      >
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="text-7xl mb-6 text-leetcode-yellow/90 mx-auto"
        >
          <FiLock className="inline-block drop-shadow-lg" />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          {title} are Coming Soon!
        </h2>

        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
          ""<p>"Working on updating new notes, guides, projects, and code examples. 
          <br />Something amazing is on the way!"</p>""
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-6">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></span>
          <span>Currently in development</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-2.5 border border-gray-300/70 dark:border-gray-600/70 backdrop-blur-sm bg-white/40 dark:bg-dark-800/40 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/70 dark:hover:bg-dark-800/70 transition-all duration-300 text-sm">
            Notify Me
          </button>
        </div>
      </motion.div>
    </div>

  )
}

export default ComingSoon