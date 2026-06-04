import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
    }
    return Promise.reject(error)
  }
)

// API functions
export const apiEndpoints = {
  // Dashboard
  getDashboardStats: () => api.get('/api/dashboard/stats'),
  getTransactionTrend: (days: number = 30) => api.get(`/api/dashboard/trend?days=${days}`),

  // Transactions
  getTransactions: (params?: {
    page?: number
    limit?: number
    risk?: string
    method?: string
    startDate?: string
    endDate?: string
    search?: string
  }) => api.get('/api/transactions', { params }),
  getTransactionById: (id: string) => api.get(`/api/transactions/${id}`),

  // Scan
  scanInvoice: (formData: FormData) =>
    api.post('/api/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Analytics
  getAnalytics: () => api.get('/api/analytics'),
  getModelMetrics: () => api.get('/api/analytics/model-metrics'),

  // Auth
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  logout: () => api.post('/auth/logout'),
}

export default api
