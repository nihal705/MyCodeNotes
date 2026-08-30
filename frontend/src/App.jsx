import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import LoadingWithRetry from './components/common/LoadingWithRetry'
import OfflineBanner from './components/common/OfflineBanner'
import { notesApi } from './api/notes'

// Pages
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import PracticePage from './pages/PracticePage'
import ConceptsPage from './pages/ConceptsPage'
import NotesPage from './pages/NotesPage'
import NoteDetailPage from './pages/NoteDetailPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import PracticeDetailPage from './pages/PracticeDetailPage'
import ConceptDetailPage from './pages/ConceptDetailPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const timeoutRef = useRef(null)
  const abortControllerRef = useRef(null)
  
  // Check if backend was already awake in this session
  const isBackendInitialized = sessionStorage.getItem('backendInitialized') === 'true'

  // Actual fetch function to check backend health
  const checkBackendHealth = async () => {
    try {
      // If backend was already initialized, skip the check
      if (isBackendInitialized) {
        return true
      }

      // Create abort controller for fetch timeout
      abortControllerRef.current = new AbortController()

      // Increase timeout to 15 seconds for Render's cold start
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout - backend might be sleeping'))
        }, 15000)
      })

      const fetchPromise = notesApi.getAll({ signal: abortControllerRef.current.signal })
      await Promise.race([fetchPromise, timeoutPromise])
      
      clearTimeout(timeoutRef.current)
      // Mark backend as initialized
      sessionStorage.setItem('backendInitialized', 'true')
      return true
    } catch (error) {
      console.error('Backend not responding:', error)
      clearTimeout(timeoutRef.current)
      
      // If it's an abort error, it means we manually cancelled
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        return false
      }
      
      return false
    }
  }

  // Retry handler
  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const success = await checkBackendHealth()
    if (success) {
      setLoading(false)
    }
    setIsRetrying(false)
  }

  // Initial check on app load
  useEffect(() => {
    const initializeApp = async () => {
      // If backend was already initialized, skip loading
      if (isBackendInitialized) {
        setLoading(false)
        return
      }

      const success = await checkBackendHealth()
      if (success) {
        setLoading(false)
      }
    }
    initializeApp()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isBackendInitialized])

  // Auto-retry mechanism - retry every 5 seconds if still loading
  useEffect(() => {
    if (!loading || isBackendInitialized) return

    const autoRetryInterval = setInterval(async () => {
      console.log('🔄 Auto-retrying backend connection...')
      const success = await checkBackendHealth()
      if (success) {
        setLoading(false)
        clearInterval(autoRetryInterval)
      }
    }, 5000)

    return () => clearInterval(autoRetryInterval)
  }, [loading, isBackendInitialized])

  // Show LoadingWithRetry ONLY if backend is not initialized and we're still loading
  if (loading && !isBackendInitialized) {
    return (
      <Router>
        <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-dark-900">
          <Navbar />
          <OfflineBanner />
          <LoadingWithRetry 
            onRetry={handleRetry}
            retryCount={retryCount}
            isRetrying={isRetrying}
          />
          <Footer />
        </div>
      </Router>
    )
  }

  // Once backend is awake, show the full app
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-dark-900">
        <Navbar />
        <OfflineBanner />
        <main className="flex-grow w-full py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/:id" element={<PracticeDetailPage />} />
            <Route path="/concepts" element={<ConceptsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:slug" element={<NoteDetailPage />} />
            <Route path="/concepts/:id" element={<ConceptDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* 404 Catch-all route - MUST BE LAST */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App