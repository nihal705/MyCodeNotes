import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiWifiOff, FiWifi, FiRefreshCw } from 'react-icons/fi'

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isBackOnline, setIsBackOnline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setIsBackOnline(true)
      setTimeout(() => setIsBackOnline(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setIsBackOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Manual retry
  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false)
      setIsBackOnline(true)
      setTimeout(() => setIsBackOnline(false), 3000)
    }
  }

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 z-[999] bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white shadow-lg"
          >
            <div className="container-custom mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FiWifiOff size={20} className="shrink-0" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    📡 <span className="hidden sm:inline">Looks like you're offline.</span> Hang tight — we'll reconnect automatically.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiRefreshCw size={14} />
                  <span className="hidden xs:inline">Retry</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Online Confirmation */}
      <AnimatePresence>
        {isBackOnline && !isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-6 py-3 rounded-xl shadow-lg border border-green-200 dark:border-green-800 flex items-center gap-3"
          >
            <FiWifi size={18} className="text-green-600 dark:text-green-400" />
            <span className="font-medium">Back online! ✅</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default OfflineBanner