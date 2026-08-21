import apiClient from './apiClient'

export const conceptsApi = {
  // Get all concepts - No auth required
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/concepts', { params })
    return response.data
  },

  // Get single concept by ID - No auth required
  getById: async (id) => {
    const response = await apiClient.get(`/api/concepts/${id}`)
    return response.data
  },

  // Get concept by name - No auth required
  getByName: async (name) => {
    const response = await apiClient.get(`/api/concepts/name/${name}`)
    return response.data
  },

  // Create new concept - Admin only
  create: async (data) => {
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
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/concepts/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}