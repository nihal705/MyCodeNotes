import { useState, useEffect } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import AdminPanel from '../components/admin/AdminPanel'
import { useAuth } from '../hooks/useAuth'

const AdminPage = () => {
  const { isAuthenticated, verifyAuth } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      await verifyAuth()
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-leetcode-yellow border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="container-custom mx-auto">
      {isAuthenticated ? <AdminPanel /> : <AdminLogin />}
    </div>
  )
}

export default AdminPage