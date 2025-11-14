import axios from "axios";

// Default backend base (can be overridden with VITE_API_BASE)
const BACKEND = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  // register requires multipart/form-data (eSign image)
  register: (formData) =>
    api.post(`/auth/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  login: (payload) => api.post(`/auth/login`, payload),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Users
export const users = {
  me: () => api.get(`/users/me`),
  getPublic: (userId) => api.get(`/users/${userId}/public`),
  getPrivate: (userId) => api.get(`/users/${userId}/private`),
  updateMe: (payload) => api.patch(`/users/update-me`, payload),
  toggleRole: (payload) => api.post(`/users/toggle-my-role`, payload),
};

// Dashboard endpoints
export const dashboard = {
  myStats: () => api.get(`/dashboard/my-stats`),
  myPending: () => api.get(`/dashboard/my-pending-actions`),
  myActiveContracts: () => api.get(`/dashboard/my-active-contracts`),
  myEndorsers: () => api.get(`/dashboard/my-endorsers`),
  tiHistory: () => api.get(`/dashboard/ti-history`),
  eligibleGuarantors: () => api.get(`/dashboard/eligible-guarantors`),
};

// Brochures
export const brochures = {
  list: () => api.get(`/brochures`),
  create: (payload) => api.post(`/brochures`, payload),
  update: (id, payload) => api.patch(`/brochures/${id}`, payload),
  toggleStatus: (id) => api.patch(`/brochures/${id}/toggle-status`),
  delete: (id) => api.delete(`/brochures/${id}`),
};

// Loan requests (borrower + lender flows)
export const loanRequests = {
  create: (payload) => api.post(`/loan-requests`, payload),
  listForLender: () => api.get(`/lender/requests`),
  acceptByLender: (loanReqId) => api.post(`/lender/requests/${loanReqId}/accept`),
};

// Contracts
export const contracts = {
  get: (id) => api.get(`/contracts/${id}`),
  downloadPdf: (id) => api.get(`/contracts/${id}/download-pdf`, { responseType: "blob" }),
  sign: (id) => api.post(`/contracts/${id}/sign`),
  confirmReceipt: (id) => api.post(`/contracts/${id}/confirm-receipt`),
  confirmDisbursal: (id, formData) =>
    api.post(`/contracts/${id}/confirm-disbursal`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  receiverUpi: (id) => api.get(`/contracts/${id}/receiver-upi`),
  disbursalProof: (id) => api.get(`/contracts/${id}/disbursal-proof`),
  triggerDefaultCheck: (payload) => api.post(`/contracts/admin/trigger-default-check`, payload),
  guarantorPay: (id) => api.post(`/contracts/${id}/guarantor-pay`),
};

// Guarantor requests
export const guarantorRequests = {
  create: (payload) => api.post(`/guarantor-requests`, payload),
  update: (id, payload) => api.patch(`/guarantor-requests/${id}`, payload),
};

// Endorsements
export const endorsements = {
  create: (payload) => api.post(`/endorsements`, payload),
  remove: (id) => api.delete(`/endorsements/${id}`),
};

// Payments
export const payments = {
  pay: (payload) => api.post(`/payments/pay`, payload),
  callback: (payload) => api.post(`/payments/callback`, payload),
};

// Notifications
export const notifications = {
  list: (params) => api.get(`/notifications`, { params }),
  create: (payload) => api.post(`/notifications`, payload),
};

export default api;
