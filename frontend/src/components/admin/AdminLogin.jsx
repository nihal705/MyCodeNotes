import { useState } from 'react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(password)
    setLoading(false)
    
    if (result.success) {
      toast.success('Login successful!')
      // Force reload to update auth state
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } else {
      toast.error(result.error || 'Invalid password')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Admin Login</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Enter your admin password</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-leetcode-yellow focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leetcode-yellow text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminLogin