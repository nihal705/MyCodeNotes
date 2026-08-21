import apiClient from './apiClient'

export const problemsApi = {
  // Get all problems - No auth required
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/problems', { params })
    return response.data
  },

  // Get single problem by ID - No auth required
  getById: async (id) => {
    const response = await apiClient.get(`/api/problems/${id}`)
    return response.data
  },

  // Get problem by LeetCode ID - No auth required
  getByLeetCodeId: async (leetcodeId) => {
    const response = await apiClient.get(`/api/problems/leetcode/${leetcodeId}`)
    return response.data
  },

  // Create new problem - Admin only
  create: async (data) => {
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.post('/api/problems', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },

  // Update problem - Admin only
  update: async (id, data) => {
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/problems/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}