import axios from 'axios'

// Use relative URL when using proxy, or full URL when direct
const API_URL = import.meta.env.VITE_API_URL || ''

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    console.log('🔍 Interceptor - Token exists:', !!token)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token attached to request:', config.url, token.substring(0, 20) + '...')
    } else {
      console.log('❌ No token found for request:', config.url)
    }
    
    // Log full request headers for debugging
    console.log('📤 Request headers:', config.headers)
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 Response success:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.config?.headers
    })
    
    // Handle 401/403 errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Authentication error, clearing token')
      localStorage.removeItem('adminToken')
      
      // Only redirect if not already on admin page
      if (!window.location.pathname.includes('/admin')) {
        window.location.href = '/admin'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient