import apiClient from './apiClient'

export const conceptsApi = {
  // Get all concepts - No auth required
  getAll: async (params = {}) => {
    console.log('📤 Fetching concepts...')
    const response = await apiClient.get('/api/concepts', { params })
    return response.data
  },

  // Get single concept by ID - No auth required
  getById: async (id) => {
    console.log(`📤 Fetching concept ${id}...`)
    const response = await apiClient.get(`/api/concepts/${id}`)
    return response.data
  },

  // Get concept by name - No auth required
  getByName: async (name) => {
    console.log(`📤 Fetching concept by name: ${name}...`)
    const response = await apiClient.get(`/api/concepts/name/${name}`)
    return response.data
  },

  // Create new concept - Admin only
  create: async (data) => {
    console.log('📤 Creating concept...')
    const token = localStorage.getItem('adminToken')
    console.log('🔑 Token for create:', !!token)
    
    const response = await apiClient.post('/api/concepts', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('✅ Concept created:', response.data)
    return response.data
  },

  // Update concept - Admin only
  update: async (id, data) => {
    console.log(`📤 Updating concept ${id}...`)
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/concepts/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}