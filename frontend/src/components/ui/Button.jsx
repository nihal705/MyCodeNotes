const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false 
}) => {
  const variants = {
    primary: 'bg-leetcode-yellow text-gray-900 hover:bg-yellow-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    outline: 'border-2 border-leetcode-yellow text-leetcode-yellow hover:bg-leetcode-yellow hover:text-gray-900',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-md font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-leetcode-yellow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
      {children}
    </button>
  )
}

export default Button