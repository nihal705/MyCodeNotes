import apiClient from './apiClient'

export const notesApi = {
  // Get all notes - No auth required
  getAll: async (params = {}, config = {}) => {
    try {
      const response = await apiClient.get('/api/notes', { 
        params,
        ...config // Allow passing abort signal and other config
      })
      return response.data
    } catch (error) {
      // Handle timeout errors specifically
      if (error.isTimeout || error.code === 'ECONNABORTED') {
        console.warn('Request timeout - backend might be sleeping')
        throw { ...error, isTimeout: true, message: 'Backend is waking up...' }
      }
      throw error
    }
  },

  // Get single note by slug - No auth required
  getBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/api/notes/${slug}`)
      return response.data
    } catch (error) {
      if (error.isTimeout || error.code === 'ECONNABORTED') {
        throw { ...error, isTimeout: true, message: 'Backend is waking up...' }
      }
      throw error
    }
  },

  // Create new note - Admin only
  create: async (data) => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await apiClient.post('/api/notes', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      if (error.isTimeout || error.code === 'ECONNABORTED') {
        throw { ...error, isTimeout: true, message: 'Backend is waking up...' }
      }
      throw error
    }
  },

  // Update note - Admin only
  update: async (slug, data) => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await apiClient.put(`/api/notes/${slug}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      if (error.isTimeout || error.code === 'ECONNABORTED') {
        throw { ...error, isTimeout: true, message: 'Backend is waking up...' }
      }
      throw error
    }
  },

  // Delete note - Admin only
  delete: async (slug) => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await apiClient.delete(`/api/notes/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      if (error.isTimeout || error.code === 'ECONNABORTED') {
        throw { ...error, isTimeout: true, message: 'Backend is waking up...' }
      }
      throw error
    }
  },
}