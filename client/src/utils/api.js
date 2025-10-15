import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://ecom-backend-hu1c.onrender.com/api'
export const BASE_URL = API_URL.replace('/api', '') // Base URL without /api for static files

// Auth API
export const authAPI = {
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  adminLogin: (data) => axios.post(`${API_URL}/auth/admin/login`, data),
  initAdmin: () => axios.post(`${API_URL}/auth/init-admin`)
}

// Products API
export const productsAPI = {
  getAll: (params) => axios.get(`${API_URL}/products`, { params }),
  getOne: (id) => axios.get(`${API_URL}/products/${id}`),
  create: (data) => axios.post(`${API_URL}/products`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => axios.put(`${API_URL}/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => axios.delete(`${API_URL}/products/${id}`),
  getCategories: () => axios.get(`${API_URL}/products/meta/categories`)
}

// Orders API
export const ordersAPI = {
  create: (data) => axios.post(`${API_URL}/orders`, data),
  getUserOrders: () => axios.get(`${API_URL}/orders`),
  getOne: (id) => axios.get(`${API_URL}/orders/${id}`),
  getAllOrders: (params) => axios.get(`${API_URL}/orders/admin/all`, { params }),
  update: (id, data) => axios.put(`${API_URL}/orders/${id}`, data),
  cancel: (id) => axios.post(`${API_URL}/orders/${id}/cancel`)
}

// Settings API
export const settingsAPI = {
  get: () => axios.get(`${API_URL}/settings`),
  update: (data) => axios.put(`${API_URL}/settings`, data),
  generateQR: (data) => axios.post(`${API_URL}/settings/qrcode`, data)
}

// Wallet API
export const walletAPI = {
  getWallet: () => axios.get(`${API_URL}/wallet`),
  getGiftCardTypes: () => axios.get(`${API_URL}/wallet/giftcard-types`),
  deposit: (data) => axios.post(`${API_URL}/wallet/deposit`, data),
  depositGiftCard: (formData) => axios.post(`${API_URL}/wallet/deposit/giftcard`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  confirmDeposit: (transactionId) => axios.post(`${API_URL}/wallet/deposit/${transactionId}/confirm`),
  rejectDeposit: (transactionId) => axios.post(`${API_URL}/wallet/deposit/${transactionId}/reject`),
  getTransactions: () => axios.get(`${API_URL}/wallet/transactions`),
  getAllTransactions: () => axios.get(`${API_URL}/wallet/transactions/all`),
  updateTransactionStatus: (id, data) => axios.put(`${API_URL}/wallet/transactions/${id}`, data),
  getPendingDeposits: () => axios.get(`${API_URL}/wallet/admin/pending-deposits`),
  getUsersBalances: () => axios.get(`${API_URL}/wallet/admin/users-balances`),
  recalculateBalance: (userId) => axios.post(`${API_URL}/wallet/admin/recalculate-balance/${userId}`)
}

// Payment Requests API
export const paymentRequestsAPI = {
  create: (data) => axios.post(`${API_URL}/payment-requests`, data),
  getUserRequests: () => axios.get(`${API_URL}/payment-requests/user`),
  getAllRequests: (params) => axios.get(`${API_URL}/payment-requests/all`, { params }),
  accept: (id) => axios.post(`${API_URL}/payment-requests/${id}/accept`),
  reject: (id) => axios.post(`${API_URL}/payment-requests/${id}/reject`),
  delete: (id) => axios.delete(`${API_URL}/payment-requests/${id}`)
}

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  settings: settingsAPI,
  wallet: walletAPI
}
