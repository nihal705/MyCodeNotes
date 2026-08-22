import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SiLeetcode, SiGithub } from 'react-icons/si'
import { FiUser, FiClock } from 'react-icons/fi'
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
    <footer className="flex flex-col items-center justify-around w-full py-12 text-sm bg-slate-50 dark:bg-dark-900 text-gray-800/70 dark:text-gray-400 mt-auto border-t border-gray-200 dark:border-dark-700">
      <Link to="/" className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" stroke="#FFA116" strokeWidth="2.5" />
          <path d="M12 11L8 16L12 21" stroke="#FFA116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 11L24 16L20 21" stroke="#FFA116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="2" fill="#FFA116" />
        </svg>
        <span className="text-base font-bold text-gray-800 dark:text-white">MyCodeNotes</span>
      </Link>

      {/* Copyright */}
      <p className="mt-4 text-center text-gray-600 dark:text-gray-400 px-4">
        Copyright © {new Date().getFullYear()} <Link to="/" className="hover:text-leetcode-yellow transition-colors">MyCodeNotes</Link>. All rights reserved.
      </p>

      {/* Last Updated - From Database */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <FiClock size={14} />
        <span>Last Updated: {lastUpdated}</span>
      </div>

      {/* Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <a
          href="https://leetcode.com/nihal705"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-leetcode-yellow dark:hover:text-leetcode-yellow transition-all duration-200"
        >
          <SiLeetcode size={16} className="text-leetcode-yellow" />
          LeetCode
        </a>

        <div className="h-4 w-px bg-gray-300 dark:bg-dark-600"></div>

        <a
          href="https://github.com/nihal705/MyCodeNotes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-leetcode-yellow dark:hover:text-leetcode-yellow transition-all duration-200"
        >
          <SiGithub size={16} />
          GitHub
        </a>

        <div className="h-4 w-px bg-gray-300 dark:bg-dark-600"></div>

        <Link
          to="/admin"
          className="flex items-center gap-1.5 font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
        >
          <FiUser size={16} />
          Admin
        </Link>
      </div>
    </footer>
  )
}

export default Footer