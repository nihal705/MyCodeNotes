import apiClient from './apiClient'

let problemsCache = null

export const problemsApi = {
  // Clear in-memory cache (e.g. after mutations)
  clearCache: () => {
    problemsCache = null
  },

  // Get all problems - No auth required
  getAll: async (params = {}) => {
    const isDefault = !params || Object.keys(params).length === 0
    if (isDefault && problemsCache) {
      return problemsCache
    }
    const response = await apiClient.get('/api/problems', { params })
    if (isDefault) {
      problemsCache = response.data
    }
    return response.data
  },

  // Get single problem by ID - No auth required
  getById: async (id) => {
    if (problemsCache) {
      const found = problemsCache.find((p) => p.id === parseInt(id))
      if (found && found.statement && (found.java_solution || found.python_solution)) {
        return found
      }
    }
    const response = await apiClient.get(`/api/problems/${id}`)
    return response.data
  },

  // Get problem by LeetCode ID - No auth required
  getByLeetCodeId: async (leetcodeId) => {
    if (problemsCache) {
      const found = problemsCache.find((p) => p.leetcode_id === parseInt(leetcodeId))
      if (found) return found
    }
    const response = await apiClient.get(`/api/problems/leetcode/${leetcodeId}`)
    return response.data
  },

  // Create new problem - Admin only
  create: async (data) => {
    problemsCache = null
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
    problemsCache = null
    const token = localStorage.getItem('adminToken')
    const response = await apiClient.put(`/api/problems/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },
}
