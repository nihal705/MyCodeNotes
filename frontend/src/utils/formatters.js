// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format time
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return `${formatDate(dateString)} ${formatTime(dateString)}`
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Get difficulty color class
export const getDifficultyColor = (difficulty) => {
  const colors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  }
  return colors[difficulty] || 'bg-gray-100 text-gray-700'
}

// Get language icon
export const getLanguageIcon = (language) => {
  return language === 'Java' ? '☕' : '🐍'
}

// Get language name
export const getLanguageName = (language) => {
  return language === 'Java' ? 'Java' : 'Python'
}