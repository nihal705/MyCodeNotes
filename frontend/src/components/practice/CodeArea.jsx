import { useState } from 'react'
import { FiEdit2 } from 'react-icons/fi'

const CodeArea = ({ language, value, onChange, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      isFocused ? 'border-leetcode-yellow shadow-md' : 'border-gray-300'
    }`}>
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-300">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <FiEdit2 /> {language.charAt(0).toUpperCase() + language.slice(1)}
        </span>
        <span className="text-xs text-gray-400">
          {value ? `${value.split('\n').length} lines` : 'Empty'}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full h-64 p-4 font-mono text-sm bg-white focus:outline-none resize-none"
        spellCheck="false"
      />
    </div>
  )
}

export default CodeArea