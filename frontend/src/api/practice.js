import apiClient from './apiClient'

export const practiceApi = {
  // Get all practice problems - No auth required
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/practice', { params })
    return response.data
  },

  // Get single practice problem by ID - No auth required
  getById: async (id) => {
    const response = await apiClient.get(`/api/practice/${id}`)
    return response.data
  },

  // Create new practice problem - Admin only
  create: async (data) => {
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
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/practice/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}