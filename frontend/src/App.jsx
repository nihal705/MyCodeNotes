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
  
  // Check if backend was already awake in this session
  const isBackendInitialized = sessionStorage.getItem('backendInitialized') === 'true'

  // Actual fetch function to check backend health
  const checkBackendHealth = async () => {
    try {
      // If backend was already initialized, skip the check
      if (isBackendInitialized) {
        return true
      }

      // Increase timeout to 10 seconds for Render's cold start
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout - backend might be sleeping'))
        }, 10000)
      })

      const fetchPromise = notesApi.getAll()
      await Promise.race([fetchPromise, timeoutPromise])
      
      clearTimeout(timeoutRef.current)
      // Mark backend as initialized
      sessionStorage.setItem('backendInitialized', 'true')
      return true
    } catch (error) {
      console.error('Backend not responding:', error)
      clearTimeout(timeoutRef.current)
      return false
    }
  }

  // Retry handler
  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
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
    }
  }, [isBackendInitialized])

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