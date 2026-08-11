import { useState } from 'react'
import { FiEye, FiEyeOff, FiCopy, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const SolutionReveal = ({ solution, language }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solution)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-300">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
          🔧 Solution
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            {isVisible ? <FiEyeOff /> : <FiEye />}
            {isVisible ? 'Hide' : 'Show'}
          </button>
          {isVisible && (
            <button
              onClick={copyToClipboard}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
            </button>
          )}
        </div>
      </div>
      <div className={`transition-all duration-300 overflow-hidden ${
        isVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <pre className="bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-x-auto">
          <code>{solution}</code>
        </pre>
      </div>
    </div>
  )
}

export default SolutionReveal