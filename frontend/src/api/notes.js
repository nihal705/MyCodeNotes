import apiClient from './apiClient'

export const notesApi = {
  // Get all notes - No auth required
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/notes', { params })
    return response.data
  },

  // Get single note by slug - No auth required
  getBySlug: async (slug) => {
    const response = await apiClient.get(`/api/notes/${slug}`)
    return response.data
  },

  // Create new note - Admin only
  create: async (data) => {
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.post('/api/notes', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },

  // Update note - Admin only
  update: async (slug, data) => {
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
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.delete(`/api/notes/${slug}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}