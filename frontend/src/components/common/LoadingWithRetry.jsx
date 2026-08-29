import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLoader, FiClock, FiCoffee, FiAlertCircle } from 'react-icons/fi'

const LoadingWithRetry = ({ onRetry, retryCount, isRetrying }) => {
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    // Show message after 3 seconds of loading (reduced from 5)
    const timer = setTimeout(() => {
      setShowMessage(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const messages = [
    " Waking up the server...",
    "☕ Coffee break? Server is stretching...",
    "🚀 Almost there!",
    "🔄 One moment please...",
    "⚠️ This is taking longer than expected..."
  ]

  const currentMessage = retryCount < messages.length ? messages[retryCount] : messages[messages.length - 1]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Spinner */}
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-dark-600 border-t-leetcode-yellow rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiLoader className="text-leetcode-yellow text-2xl animate-pulse" />
          </div>
        </div>
        
        {/* Status Message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={retryCount}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <>
                <FiLoader className="animate-spin" size={14} />
                Retrying connection...
              </>
            ) : (
              <span className="flex items-center gap-2">
                <FiClock size={14} />
                {currentMessage}
              </span>
            )}
          </motion.p>
        </AnimatePresence>

        {/* Additional Info */}
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg px-4 py-3 max-w-sm mx-auto">
              <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                <FiCoffee size={14} />
                Server is waking up. This may take 20-30 seconds.
              </p>
            </div>
            
            {retryCount >= 3 && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-leetcode-yellow text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Retry Now
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default LoadingWithRetry