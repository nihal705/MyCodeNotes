import apiClient from './apiClient'

let practiceCache = null

export const practiceApi = {
  // Clear in-memory cache
  clearCache: () => {
    practiceCache = null
  },

  // Get all practice problems - No auth required
  getAll: async (params = {}) => {
    const isDefault = !params || Object.keys(params).length === 0
    if (isDefault && practiceCache) {
      return practiceCache
    }
    const response = await apiClient.get('/api/practice', { params })
    if (isDefault) {
      practiceCache = response.data
    }
    return response.data
  },

  // Get single practice problem by ID - No auth required
  getById: async (id) => {
    if (practiceCache) {
      const found = practiceCache.find((p) => p.id === parseInt(id))
      if (found) return found
    }
    const response = await apiClient.get(`/api/practice/${id}`)
    return response.data
  },

  // Create new practice problem - Admin only
  create: async (data) => {
    practiceCache = null
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.post('/api/practice', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },

  // Update practice problem - Admin only
  update: async (id, data) => {
    practiceCache = null
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/practice/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}
