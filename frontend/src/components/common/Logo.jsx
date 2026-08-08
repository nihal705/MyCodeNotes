const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Circle background */}
        <circle cx="16" cy="16" r="14" stroke="#FFA116" strokeWidth="2.5" />
        
        {/* Code symbol */}
        <path d="M12 11L8 16L12 21" stroke="#FFA116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 11L24 16L20 21" stroke="#FFA116" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Center dot */}
        <circle cx="16" cy="16" r="2" fill="#FFA116" />
      </svg>
      <span className="font-bold text-gray-800 dark:text-white text-lg hidden sm:block">
        MyCodeNotes
      </span>
    </div>
  )
}

export default Logo