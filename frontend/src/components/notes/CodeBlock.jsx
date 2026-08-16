import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'React JSX',
    'ts': 'TypeScript',
    'tsx': 'React TSX',
    'py': 'Python',
    'java': 'Java',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'bash': 'Bash',
    'sql': 'SQL',
  }

  const displayLanguage = languageMap[language] || language || 'Code'

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700 bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{displayLanguage}</span>
        <button
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-200 font-mono whitespace-pre-wrap">
          {code}
        </code>
      </pre>
    </div>
  )
}

export default CodeBlock