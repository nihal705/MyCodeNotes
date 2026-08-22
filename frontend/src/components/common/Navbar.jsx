import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiMenu, FiX, FiExternalLink } from 'react-icons/fi'
import { SiLeetcode } from 'react-icons/si'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import { notesApi } from '../../api/notes'

const Navbar = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [notes, setNotes] = useState([])

  // Fetch notes for dropdown
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await notesApi.getAll()
        setNotes(data)
      } catch (error) {
        console.error('Error fetching notes:', error)
      }
    }
    fetchNotes()
  }, [])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/problems', label: 'LeetCode' },
    { path: '/practice', label: 'Practice' },
    { path: '/concepts', label: 'Concepts' },
    { path: '/notes', label: 'Notes' },
  ]

  const isActive = (path) => location.pathname === path
  const isNotesActive = location.pathname.startsWith('/notes')

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setActiveMenu(null)
  }

  const toggleNotesMenu = () => {
    // setActiveMenu(activeMenu === 'notes' ? null : 'notes')
  }

  const handleBack = () => {
    setActiveMenu(null)
  }

  // Animation variants
  const mainNavVariants = {
    visible: { x: 0, opacity: 1 },
    hidden: { x: -20, opacity: 0 }
  }

  const subNavVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 md:py-4 shadow-lg max-w-5xl rounded-full mx-auto w-full bg-white/80 backdrop-blur-md mt-4 border border-beige-200 relative">
      {/* Logo with Name */}
      <Link to="/" className="flex items-center flex-shrink-0" onClick={closeMenu}>
        <Logo />
        <span className="text-base font-bold text-gray-800 dark:text-white ml-1 hidden sm:block">MyCodeNotes</span>
      </Link>

      {/* Navigation - Desktop */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeMenu === null ? (
            <motion.nav
              key="main-nav"
              initial="visible"
              animate="visible"
              exit="hidden"
              variants={mainNavVariants}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex items-center gap-6 lg:gap-8 text-gray-900 text-sm font-normal"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    hover:text-leetcode-yellow transition-colors duration-200 whitespace-nowrap
                    ${isActive(link.path) ? 'text-leetcode-yellow font-semibold' : 'text-gray-700'}
                  `}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Portfolio Link - Desktop */}
              <a
                href="https://your-portfolio-url.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-700 hover:text-leetcode-yellow transition-colors duration-200 whitespace-nowrap group"
              >
                Portfolio
                <FiExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </motion.nav>
          ) : (
            <motion.nav
              key="sub-nav"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={subNavVariants}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex items-center gap-4 lg:gap-6 text-gray-900 text-sm font-normal"
            >
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 
                 <span>Back</span>
              </button>

              {/* Divider */}
              <div className="h-5 w-px bg-gray-300" />

              {/* Active Menu Label */}
              <span className="font-semibold text-gray-900">Notes</span>

              {/* Divider */}
              <div className="h-5 w-px bg-gray-300" />

              {/* Notes Links */}
              <div className="flex items-center gap-4 lg:gap-6">
                
                {/* All Notes */}
                {/* <Link
                  to="/notes"
                  onClick={() => setActiveMenu(null)}
                  className={`
                    hover:text-leetcode-yellow transition-colors duration-200 whitespace-nowrap
                    ${location.pathname === '/notes' ? 'text-leetcode-yellow font-semibold' : 'text-gray-700'}
                  `}
                >
                  All Notes
                </Link> */}

                {/* Individual Notes */}
                {/* {notes.map((note) => (
                  <Link
                    key={note.id}
                    to={`/notes/${note.slug}`}
                    onClick={() => setActiveMenu(null)}
                    className={`
                      hover:text-leetcode-yellow transition-colors duration-200 whitespace-nowrap
                      ${location.pathname === `/notes/${note.slug}` ? 'text-leetcode-yellow font-semibold' : 'text-gray-700'}
                    `}
                  >
                    {note.icon || '📓'} {note.title}
                  </Link>
                ))} */}
                
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <a
          href="https://leetmetric-stats.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-yellow-500 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <SiLeetcode size={16} /> 
          LeetCode Stats Tracker
          <FiExternalLink size={12} className="opacity-70" />
        </a>

        <button 
          onClick={toggleMenu} 
          className="md:hidden text-gray-600 hover:text-gray-900 p-1"
        >
          <FiMenu size={28} />
        </button>
      </div>

      {/* Mobile Menu - Fixed UI */}
      <div 
        className={`
          md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-md
          transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <button 
          onClick={closeMenu} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 p-2"
        >
          <FiX size={32} />
        </button>

        {/* Mobile Menu Content - Centered */}
        <div className="flex flex-col items-center justify-center h-full gap-5 text-xl font-medium px-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={`
                hover:text-leetcode-yellow transition-colors duration-200
                ${isActive(link.path) ? 'text-leetcode-yellow font-bold' : 'text-gray-700'}
              `}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Portfolio Link - Mobile */}
          <a
            href="https://your-portfolio-url.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="flex items-center gap-2 text-gray-700 hover:text-leetcode-yellow transition-colors duration-200 font-medium"
          >
            Portfolio
            <FiExternalLink size={16} />
          </a>

          {/* LeetCode Stats Tracker - Mobile */}
          <a
            href="https://leetmetric-stats.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="flex items-center gap-2 bg-leetcode-yellow text-gray-900 px-6 py-3 rounded-full text-base font-semibold hover:bg-yellow-500 transition-all duration-200 shadow-md mt-2"
          >
            <SiLeetcode size={20} /> LeetCode Stats Tracker
            <FiExternalLink size={14} />
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar