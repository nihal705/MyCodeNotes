import apiClient from './apiClient'

let notesCache = null

export const notesApi = {
  // Clear in-memory cache
  clearCache: () => {
    notesCache = null
    try {
      sessionStorage.removeItem('navbar_notes')
    } catch {}
  },

  // Get all notes - No auth required
  getAll: async (params = {}, config = {}) => {
    const isDefault = (!params || Object.keys(params).length === 0) && (!config || Object.keys(config).length === 0)
    if (isDefault && notesCache) {
      return notesCache
    }
    try {
      const response = await apiClient.get('/api/notes', { 
        params,
        ...config // Allow passing abort signal and other config
      })
      if (isDefault) {
        notesCache = response.data
      }
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
    if (notesCache) {
      const found = notesCache.find((n) => n.slug === slug)
      if (found && found.content) return found
    }
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
    notesCache = null
    try {
      sessionStorage.removeItem('navbar_notes')
    } catch {}
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
    notesCache = null
    try {
      sessionStorage.removeItem('navbar_notes')
    } catch {}
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
    notesCache = null
    try {
      sessionStorage.removeItem('navbar_notes')
    } catch {}
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
