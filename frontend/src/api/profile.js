import apiClient from './apiClient'

export const profileApi = {
  // Get all profile settings
  getAll: async () => {
    const response = await apiClient.get('/api/profile')
    return response.data
  },

  // Get a specific profile setting
  get: async (key) => {
    const response = await apiClient.get(`/api/profile/${key}`)
    return response.data
  },

  // Update a profile setting (Admin only)
  update: async (key, value) => {
    const response = await apiClient.put(`/api/profile/${key}`, { key, value })
    return response.data
  },

  // Update multiple profile settings (Admin only)
  updateBulk: async (settings) => {
    // ✅ Send settings directly as the request body (NOT wrapped in { settings })
    const response = await apiClient.put('/api/profile/bulk', settings)
    return response.data
  },
}