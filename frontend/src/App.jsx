import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'

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

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-grow container-custom py-8">
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
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App