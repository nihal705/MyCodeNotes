import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SiLeetcode, SiGithub } from 'react-icons/si'
import { FiUser, FiClock, FiExternalLink } from 'react-icons/fi'
import { profileApi } from '../../api/profile'

const Footer = () => {
  const [lastUpdated, setLastUpdated] = useState('Loading...')

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const data = await profileApi.get('last_updated')
        if (data && data.value) {
          setLastUpdated(data.value)
        } else {
          setLastUpdated('Not set')
        }
      } catch (error) {
        console.error('Error fetching last updated:', error)
        setLastUpdated('Unknown')
      }
    }
    fetchLastUpdated()
  }, [])

  return (
    <footer className="flex flex-col items-center w-full py-12 text-sm bg-slate-50 text-gray-800/70 mt-auto border-t border-gray-200">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 -mt-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" stroke="#FFA116" strokeWidth="2.5" />
          <path d="M12 11L8 16L12 21" stroke="#FFA116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 11L24 16L20 21" stroke="#FFA116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="2" fill="#FFA116" />
        </svg>
        <span className="text-base font-bold text-gray-800">MyCodeNotes</span>
      </Link>

      {/* Credit Section */}
      <div className="max-w-2xl text-center mt-3 mb-4 px-4">
        <p className="text-gray-600 text-base leading-relaxed">
          Built and maintained by <span className="font-semibold text-gray-900">G Nihal</span> — 
          a place to document what I learn, so it might help someone else learning the same thing.
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://your-portfolio-url.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-leetcode-yellow transition-all duration-200"
        >
          <FiExternalLink size={16} className="text-leetcode-yellow" />
          Portfolio
        </a>

        <div className="h-4 w-px bg-gray-300"></div>

        <a
          href="https://github.com/nihal705/MyCodeNotes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-leetcode-yellow transition-all duration-200"
        >
          <SiGithub size={16} />
          GitHub
        </a>

        <div className="h-4 w-px bg-gray-300"></div>

        <div className="h-4 w-px bg-gray-300"></div>

        <Link
          to="/admin"
          className="flex items-center gap-1.5 font-medium text-gray-400 hover:text-gray-700 transition-all duration-200"
        >
          <FiUser size={16} />
          Admin
        </Link>
      </div>

      {/* Copyright & Last Updated */}
      <div className="flex flex-col items-center mt-2 -mb-3">
        <p className="text-center text-gray-500 text-sm px-4">
          Copyright © {new Date().getFullYear()} <Link to="https://your-portfolio-url.vercel.app" className="hover:text-leetcode-yellow transition-colors">G Nihal</Link>. All rights reserved.
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
          <FiClock size={14} />
          <span>Last Updated: {lastUpdated}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer