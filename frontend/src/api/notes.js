import apiClient from './apiClient'

export const notesApi = {
  // Get all notes - No auth required
  getAll: async (params = {}) => {
    console.log('📤 Fetching notes...')
    const response = await apiClient.get('/api/notes', { params })
    return response.data
  },

  // Get single note by slug - No auth required
  getBySlug: async (slug) => {
    console.log(`📤 Fetching note: ${slug}...`)
    const response = await apiClient.get(`/api/notes/${slug}`)
    return response.data
  },

  // Create new note - Admin only
  create: async (data) => {
    console.log('📤 Creating note...')
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.post('/api/notes', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('✅ Note created:', response.data)
    return response.data
  },

  // Update note - Admin only
  update: async (slug, data) => {
    console.log(`📤 Updating note: ${slug}...`)
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/notes/${slug}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },

  // Delete note - Admin only
  delete: async (slug) => {
    console.log(`Deleting note: ${slug}...`)
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.delete(`/api/notes/${slug}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}