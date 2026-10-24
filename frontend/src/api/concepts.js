import apiClient from './apiClient'

let conceptsCache = null

export const conceptsApi = {
  // Clear in-memory cache
  clearCache: () => {
    conceptsCache = null
  },

  // Get all concepts - No auth required
  getAll: async (params = {}) => {
    const isDefault = !params || Object.keys(params).length === 0
    if (isDefault && conceptsCache) {
      return conceptsCache
    }
    const response = await apiClient.get('/api/concepts', { params })
    if (isDefault) {
      conceptsCache = response.data
    }
    return response.data
  },

  // Get single concept by ID - No auth required
  getById: async (id) => {
    if (conceptsCache) {
      const found = conceptsCache.find((c) => c.id === parseInt(id))
      if (found) return found
    }
    const response = await apiClient.get(`/api/concepts/${id}`)
    return response.data
  },

  // Get concept by name - No auth required
  getByName: async (name) => {
    if (conceptsCache) {
      const found = conceptsCache.find((c) => c.name.toLowerCase() === name.toLowerCase())
      if (found) return found
    }
    const response = await apiClient.get(`/api/concepts/name/${name}`)
    return response.data
  },

  // Create new concept - Admin only
  create: async (data) => {
    conceptsCache = null
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.post('/api/concepts', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },

  // Update concept - Admin only
  update: async (id, data) => {
    conceptsCache = null
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/concepts/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}
