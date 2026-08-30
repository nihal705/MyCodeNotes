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
  timeout: 30000, // 30 seconds timeout for all requests
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout errors gracefully
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('Request timeout - backend might be sleeping')
      // Return a specific error so we can handle it in the component
      return Promise.reject({
        ...error,
        isTimeout: true,
        message: 'Request timeout - backend might be sleeping'
      })
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken')
      if (!window.location.pathname.includes('/admin')) {
        window.location.href = '/admin'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient