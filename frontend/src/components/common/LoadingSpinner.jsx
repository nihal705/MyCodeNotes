const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-leetcode-yellow border-t-transparent"></div>
    </div>
  )
}

export default LoadingSpinner