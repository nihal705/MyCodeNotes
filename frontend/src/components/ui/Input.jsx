const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = '',
  rows = 4,
  multiline = false,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 ${className}`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 ${className}`}
        />
      )}
    </div>
  )
}

export default Input