const Card = ({ children, className = '', hoverable = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${hoverable ? 'hover:shadow-xl transition-shadow duration-300' : ''} ${className}`}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '' }) => {
  return <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>
}

const CardBody = ({ children, className = '' }) => {
  return <div className={`p-4 ${className}`}>{children}</div>
}

const CardFooter = ({ children, className = '' }) => {
  return <div className={`p-4 border-t border-gray-200 ${className}`}>{children}</div>
}

export { Card, CardHeader, CardBody, CardFooter }