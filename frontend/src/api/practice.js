import apiClient from './apiClient'

export const practiceApi = {
  // Get all practice problems - No auth required
  getAll: async (params = {}) => {
    console.log('📤 Fetching practice problems...')
    const response = await apiClient.get('/api/practice', { params })
    console.log('📥 Practice problems fetched:', response.data)
    return response.data
  },

  // Get single practice problem by ID - No auth required
  getById: async (id) => {
    console.log(`📤 Fetching practice problem ${id}...`)
    const response = await apiClient.get(`/api/practice/${id}`)
    return response.data
  },

  // Create new practice problem - Admin only
  create: async (data) => {
    console.log('📤 Creating practice problem...')
    const token = localStorage.getItem('adminToken')
    console.log('🔑 Token for create:', !!token)
    
    const response = await apiClient.post('/api/practice', data, {
      headers: {
        'Authorization': `Bearer ${token}`  // Explicitly set header
      }
    })
    console.log('✅ Practice problem created:', response.data)
    return response.data
  },

  // Update practice problem - Admin only
  update: async (id, data) => {
    console.log(`📤 Updating practice problem ${id}...`)
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/practice/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}