import { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { IoBulbOutline } from 'react-icons/io5'

const HintsReveal = ({ hints }) => {
  const [isVisible, setIsVisible] = useState(false)

  if (!hints || hints.length === 0) return null

  return (
    <div className="border border-yellow-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full bg-yellow-50 px-4 py-3 flex justify-between items-center hover:bg-yellow-100 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-yellow-800">
          <IoBulbOutline /> {hints.length} Hints Available
        </span>
        {isVisible ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${
        isVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 space-y-2 bg-white">
          {hints.map((hint, index) => (
            <div key={index} className="flex items-start gap-2 text-gray-700">
              <span className="font-bold text-yellow-600">Hint {index + 1}:</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HintsReveal