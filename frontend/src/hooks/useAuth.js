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
      console.log('🔐 Attempting login...')
      const response = await apiClient.post('/api/admin/login', { password })
      console.log('📥 Login response:', response.data)
      
      const { access_token } = response.data
      if (access_token) {
        localStorage.setItem('adminToken', access_token)
        setIsAuthenticated(true)
        console.log('✅ Login successful, token stored')
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
    console.log('👋 Logged out')
  }

  const verifyAuth = async () => {
    setLoading(true)
    const token = localStorage.getItem('adminToken')
    console.log('🔍 Verifying auth, token exists:', !!token)
    
    if (!token) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }
    
    try {
      await apiClient.get('/api/admin/verify')
      console.log('✅ Token verified')
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