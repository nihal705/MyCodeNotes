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