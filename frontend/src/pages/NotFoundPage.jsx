import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiBook, FiCode, FiTrendingUp, FiFileText, FiTerminal, FiSend } from 'react-icons/fi'

const NotFoundPage = () => {
  const location = useLocation()
  const [jokeIndex, setJokeIndex] = useState(0)
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(true)
  const [showGlitch, setShowGlitch] = useState(false)
  const terminalEndRef = useRef(null)

  const jokes = [
    {
      title: "404: Page Not Found",
      joke: "Time Complexity: O(∞) — we searched everywhere and still couldn't find it 🔍",
      space: "Space Complexity: O(this page doesn't exist), so no memory was wasted at least 😅"
    },
    {
      title: "404: Lost in the Code",
      joke: "Looks like this page took a wrong turn at the pointer and never came back 🧭",
      space: "We tried recursion, but we couldn't find the base case 😅"
    },
    {
      title: "404: Syntax Error",
      joke: "The page you're looking for threw a ReferenceError — it's not defined 💻",
      space: "We checked the DOM, the Virtual DOM, and even the Shadow DOM. Nothing. 🕵️"
    },
    {
      title: "404: Not Found",
      joke: "This page has been garbage collected by the universe 🌌",
      space: "Don't worry, we'll keep it in the cache until you need it again (just kidding, we already flushed it) 🗑️"
    }
  ]

  const currentJoke = jokes[jokeIndex % jokes.length]

  // Auto-scroll terminal to bottom - REMOVED
  // useEffect(() => {
  //   if (terminalEndRef.current) {
  //     terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
  //   }
  // }, [history])

  // Command responses for the terminal
  const commands = {
    help: () => ({
      output: `📖 Available Commands:
  📂 ls          - List all available pages
  📁 cd <page>   - Navigate to a page
  👤 whoami      - Who am I?
  🛠️  fix         - Try to fix the 404
  🔄 clear       - Clear terminal
  ❓ help        - Show this help
  ℹ️  about       - About this website
  ❤️  love        - Spread some love
  ⭐ credits     - See who built this
  📅 date        - Show current date & time
  ⚡ tech        - Tech stack details`,
      isCommand: true
    }),
    ls: () => ({
      output: `📁  /home
  📂  /problems   - LeetCode Problems (DSA solutions with notes)
  📂  /practice   - Practice Problems (Coding challenges)
  📂  /concepts   - Programming Concepts (Core CS fundamentals)
  📂  /notes      - Notes & Guides (Structured learning material)`,
      isCommand: true
    }),
    cd: (arg) => {
      const pages = {
        'problems': '/problems',
        'practice': '/practice', 
        'concepts': '/concepts',
        'notes': '/notes',
        'admin': '/admin',
        'home': '/',
        '..': '/'
      }
      const target = pages[arg]
      if (target) {
        window.location.href = target
        return { output: `🔗 Navigating to ${arg}...`, isCommand: true }
      }
      return { output: `❌ cd: ${arg}: No such page found. Try 'ls' to see available pages.`, isCommand: true }
    },
    whoami: () => ({
      output: `👤 You are a curious developer exploring MyCodeNotes!
  
  💡 Here's a fun fact: You're currently on a 404 page,
  but you're using a terminal to find your way back.
  That's pretty cool if you ask me 😎
  
  🎯 You're probably someone who:
  - Loves solving DSA problems
  - Wants to learn programming concepts
  - Enjoys well-organized study materials
  - Appreciates clean, modern UI
  - Is definitely not lost (you're just exploring!)`,
      isCommand: true
    }),
    about: () => ({
      output: `ℹ️  About MyCodeNotes
  
  📚 A personal knowledge base for coding, DSA, and programming concepts.
  
  🎯 Purpose:
  • Document everything I learn while solving LeetCode problems
  • Create structured, easy-to-understand study materials
  • Help others who are on the same learning journey
  • Build a comprehensive reference for DSA and web development
  
  📚 What You'll Find Here:
  • LeetCode Problems - Solved problems with detailed notes
  • Practice Problems - Coding problems with hints
  • DSA Concepts - Quick reference with definitions & examples
  • Notes - Structured notes on everything I've learned
  
  💡 "Learn in public, grow together."`,
      isCommand: true
    }),
    credits: () => ({
      output: `⭐ Credits
  
  👨‍💻 Built by: G Nihal
  
  💡 Why this exists:
  I was tired of scattered notes, random bookmarks, and
  "I'll remember this later" moments. So I built a
  central place for everything I learn — from DSA to
  web development — so I (and others) can reference
  it anytime.
  
  🔗 Connect with me:
  • GitHub: https://github.com/nihal705
  • LinkedIn: https://linkedin.com/in/gnihal
  • Portfolio: https://gnihal.com
  • Email: nihalmohammad705@gmail.com
  
  🌟 Special thanks to everyone who uses this site!
  Your support keeps me motivated to keep building.`,
      isCommand: true
    }),
    love: () => ({
      output: `❤️  Sending love back to you! 💕
  
  You're awesome for exploring this page!
  Here's a virtual high-five ✋
  
  Fun fact: This site is completely open-source!
  Check it out on GitHub: https://github.com/nihal705/MyCodeNotes`,
      isCommand: true
    }),
    date: () => ({
      output: `📅 ${new Date().toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })}`,
      isCommand: true
    }),
    tech: () => ({
      output: `⚡ Tech Stack
  
  🎨 Frontend:
  • React 18 + Vite
  • Tailwind CSS (with dark mode)
  • Framer Motion (animations)
  • React Router v6
  • React Hot Toast (notifications)
  
  🔧 Backend:
  • FastAPI (Python)
  • PostgreSQL (Neon)
  • SQLAlchemy (ORM)
  • JWT Authentication
  • bcrypt (password hashing)
  
  🚀 Deployment:
  • Frontend: Vercel
  • Backend: Render
  • Database: Neon (PostgreSQL)`,
      isCommand: true
    }),
    fix: () => ({
      output: `🛠️  Running diagnostics...
  
  ✅ Your internet is working
  ✅ Our server is alive
  ✅ DNS resolution is fine
  ❌ This page doesn't exist (that's why you're here!)
  
  💡 Suggestions:
  • Try 'ls' to see available pages
  • Use 'cd <page>' to navigate
  • Click on the suggestion cards below
  • Go back to Home using 'cd home'
  
  🚀 You got this!`,
      isCommand: true
    }),
    clear: () => ({
      output: '',
      isCommand: true,
      clear: true
    }),
    default: (cmd) => ({
      output: `❌ command not found: ${cmd}
  
  💡 Try 'help' to see all available commands.
  Or 'ls' to see all available pages.`,
      isCommand: true
    })
  }

  const handleCommand = (e) => {
    if (e.key === 'Enter' && command.trim()) {
      const cmdParts = command.trim().split(' ')
      const mainCmd = cmdParts[0].toLowerCase()
      const args = cmdParts.slice(1).join(' ')
      
      const commandHandler = commands[mainCmd] || commands.default
      const result = mainCmd === 'cd' ? commandHandler(args) : commandHandler()
      
      setHistory(prev => [
        ...prev,
        { type: 'input', text: `$ ${command}` },
        { type: 'output', text: result.output }
      ])
      
      if (result.clear) {
        setTimeout(() => setHistory([]), 100)
      }
      
      setCommand('')
    }
  }

  // Random joke on page load
  useEffect(() => {
    setJokeIndex(Math.floor(Math.random() * jokes.length))
  }, [])

  // Learning paths for quick nav
  const learningPaths = [
    {
      to: "/problems",
      icon: FiBook,
      title: "LeetCode Problems",
      description: "Solved problems with detailed notes",
      color: "from-yellow-50 to-orange-50",
      iconColor: "text-yellow-600"
    },
    {
      to: "/practice",
      icon: FiCode,
      title: "Practice & Learn",
      description: "Coding problems with hints",
      color: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600"
    },
    {
      to: "/concepts",
      icon: FiTrendingUp,
      title: "Programming Concepts",
      description: "Core concepts with examples",
      color: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600"
    },
    {
      to: "/notes",
      icon: FiFileText,
      title: "Notes",
      description: "Structured notes and guides",
      color: "from-green-50 to-emerald-50",
      iconColor: "text-green-600"
    }
  ]

  // Build URL suggestion
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const lastSegment = pathSegments[pathSegments.length - 1] || ''
  
  const suggestions = {
    'notttes': '/notes',
    'homme': '/',
    'problemms': '/problems',
    'practisce': '/practice',
    'conceptts': '/concepts',
    'leet': '/problems',
    'dsa': '/problems'
  }

  const suggestedPath = suggestions[lastSegment.toLowerCase()]

  return (
    <div className="container-custom mx-auto px-4 py-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* 404 Header with Glitch */}
        <motion.div
          className="relative inline-block"
          animate={showGlitch ? {
            x: [0, -10, 10, -5, 5, 0],
            rotate: [0, -2, 2, -1, 1, 0],
            transition: { duration: 0.3 }
          } : {}}
        >
          <h1 
            className="text-8xl md:text-9xl font-bold text-gray-900 dark:text-white cursor-pointer select-none"
            onClick={() => {
              setShowGlitch(true)
              setTimeout(() => setShowGlitch(false), 500)
              setJokeIndex(prev => (prev + 1) % jokes.length)
            }}
          >
            404
          </h1>
          <motion.span
            className="absolute -top-2 -right-6 text-3xl"
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔍
          </motion.span>
        </motion.div>

        {/* Joke */}
        <motion.div
          key={jokeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-4">
            {currentJoke.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
            {currentJoke.joke}
          </p>
          <p className="text-md text-gray-500 dark:text-gray-500 mt-1 max-w-2xl mx-auto">
            {currentJoke.space}
          </p>
        </motion.div>

        {/* Suggestion */}
        {suggestedPath && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Link
              to={suggestedPath}
              className="inline-flex items-center gap-2 px-6 py-3 bg-leetcode-yellow text-gray-900 rounded-xl font-semibold hover:bg-yellow-500 transition-colors shadow-md"
            >
              <FiSend size={18} />
              Did you mean <span className="font-bold">{suggestedPath}</span>? →
            </Link>
          </motion.div>
        )}

        {/* Terminal Toggle */}
        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
        >
          <FiTerminal size={18} />
          {isTerminalOpen ? 'Close Terminal' : 'Open Terminal'}
        </button>

        {/* Terminal - No auto-scroll, user controls scroll */}
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-gray-900 dark:bg-gray-950 rounded-xl p-4 text-left overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-400 ml-2">terminal@mycodenotes:~</span>
              <span className="text-xs text-gray-500 ml-auto">
                {history.length > 0 ? `${history.length / 2} commands` : 'ready'}
              </span>
            </div>
            
            <div 
              className="font-mono text-sm max-h-80 overflow-y-auto"
              style={{ minHeight: '100px' }}
            >
              {history.map((item, idx) => (
                <div key={idx} className={item.type === 'input' ? 'text-gray-300' : 'text-gray-400 mt-1'}>
                  {item.type === 'input' ? (
                    <span>{item.text}</span>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{item.text}</div>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
              
              <div className="flex items-center gap-2 mt-2 text-gray-300">
                <span>$</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleCommand}
                  className="flex-1 bg-transparent border-none outline-none text-gray-300 font-mono text-sm"
                  placeholder="Type 'help' for commands..."
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Nav Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {learningPaths.map((path) => (
            <Link
              key={path.to}
              to={path.to}
              className="group bg-white dark:bg-dark-800 rounded-xl p-5 shadow-sm border border-beige-200 dark:border-dark-700 hover:shadow-md hover:border-leetcode-yellow transition-all duration-200 hover:-translate-y-1 text-left"
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <path.icon size={20} className={path.iconColor} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {path.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {path.description}
              </p>
            </Link>
          ))}
        </motion.div>

        {/* Home Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 text-gray-600 dark:text-gray-400 hover:text-leetcode-yellow transition-colors"
        >
          <FiHome size={16} />
          Return to Home
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFoundPage