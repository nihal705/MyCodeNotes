import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import PracticePage from './pages/PracticePage'
import ConceptsPage from './pages/ConceptsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import PracticeDetailPage from './pages/PracticeDetailPage'
import ConceptDetailPage from './pages/ConceptDetailPage'
import StatsPage from './pages/StatsPage'
import AdminPage from './pages/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'problems', element: <ProblemsPage /> },
      { path: 'problems/:id', element: <ProblemDetailPage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'practice/:id', element: <PracticeDetailPage /> },
      { path: 'concepts', element: <ConceptsPage /> },
      { path: 'concepts/:id', element: <ConceptDetailPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
])