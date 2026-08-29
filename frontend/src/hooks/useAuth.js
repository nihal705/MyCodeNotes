import { useState, useEffect } from 'react'
import apiClient from '../api/apiClient'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyAuth()
  }, [])

  const login = async (password) => {
    try {
      const response = await apiClient.post('/api/admin/login', { password })
      
      const { access_token } = response.data
      if (access_token) {
        localStorage.setItem('adminToken', access_token)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, error: 'No token received' }
    } catch (error) {
      console.error('❌ Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  const verifyAuth = async () => {
    setLoading(true)
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }
    
    try {
      await apiClient.get('/api/admin/verify')
      setIsAuthenticated(true)
    } catch (error) {
      console.error('❌ Token verification failed:', error)
      setIsAuthenticated(false)
      localStorage.removeItem('adminToken')
    } finally {
      setLoading(false)
    }
  }

  return { isAuthenticated, loading, login, logout, verifyAuth }
}