import apiClient from './apiClient'

export const problemsApi = {
  // Get all problems - No auth required
  getAll: async (params = {}) => {
    console.log('📤 Fetching problems...')
    const response = await apiClient.get('/api/problems', { params })
    return response.data
  },

  // Get single problem by ID - No auth required
  getById: async (id) => {
    console.log(`📤 Fetching problem ${id}...`)
    const response = await apiClient.get(`/api/problems/${id}`)
    return response.data
  },

  // Get problem by LeetCode ID - No auth required
  getByLeetCodeId: async (leetcodeId) => {
    console.log(`📤 Fetching problem by LeetCode ID: ${leetcodeId}...`)
    const response = await apiClient.get(`/api/problems/leetcode/${leetcodeId}`)
    return response.data
  },

  // Create new problem - Admin only
  create: async (data) => {
    console.log('📤 Creating problem...')
    const token = localStorage.getItem('adminToken')
    console.log('🔑 Token for create:', !!token)
    
    const response = await apiClient.post('/api/problems', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('✅ Problem created:', response.data)
    return response.data
  },

  // Update problem - Admin only
  update: async (id, data) => {
    console.log(`📤 Updating problem ${id}...`)
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/problems/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}