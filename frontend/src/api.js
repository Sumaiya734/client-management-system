import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors and normalize responses
api.interceptors.response.use(
  (response) => {
    // Don't normalize login responses as they contain both user and token
    if (response.config.url.endsWith('/login')) {
      return response; // Return original response for login
    }

    // If the response has our standard format {success: true, data: ..., statistics: ...}
    if (response.data && response.data.hasOwnProperty('success')) {
      // For payment management endpoints that include statistics
      if (response.data.data !== undefined && response.data.statistics !== undefined) {
        return {
          ...response,
          data: response.data.data, // Just return the data array
        };
      }
      // For responses with data property
      if (response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data
        };
      }
      // For responses with user property (like /user endpoint)
      if (response.data.user !== undefined && response.config.url.endsWith('/user')) {
        return {
          ...response,
          data: response.data.user
        };
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Remove auth token
      localStorage.removeItem('authToken');
      // Remove Authorization header
      delete api.defaults.headers.common['Authorization'];
      // Dispatch a custom event to notify app of auth failure
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

// Currency Rates API functions
export const currencyRatesApi = {
  getAll: () => api.get('/currency-rates'),
  getById: (id) => api.get(`/currency-rates/${id}`),
  create: (data) => api.post('/currency-rates', data),
  update: (id, data) => api.put(`/currency-rates/${id}`, data),
  delete: (id) => api.delete(`/currency-rates/${id}`),
  search: (params) => api.get('/currency-rates-search', { params }),
  summary: () => api.get('/currency-rates-summary'),
};

// User Management API functions
export const userManagementApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updatePermissions: (id, data) => api.patch(`/users/${id}/permissions`, data),
  getPermissions: (id) => api.get(`/users/${id}/permissions`),
};

// Billing Management API functions
export const billingManagementApi = {
  getAll: () => api.get('/billing-managements'),
  getById: (id) => api.get(`/billing-managements/${id}`),
  create: (data) => api.post('/billing-managements', data),
  update: (id, data) => api.put(`/billing-managements/${id}`, data),
  delete: (id) => api.delete(`/billing-managements/${id}`),
  search: (params) => api.get('/billing-managements-search', { params }),
  summary: () => api.get('/billing-managements-summary'),
  downloadBill: (id) => {
    return api.get(`/billing-managements/${id}/download`, { 
      responseType: 'blob' 
    });
  },
  generateReport: (params) => api.post('/reports-generate', params),
};

// Dashboard API functions
export const dashboardApi = {
  getDashboardData: () => api.get('/dashboard'),
  getStats: (params) => api.get('/dashboard-stats', { params }),
};

// Search API functions
export const searchApi = {
  search: (params) => api.get('/search', { params }),
  getSearchableModels: () => api.get('/searchable-models'),
};

// Vendor API functions
export const vendorApi = {
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  search: (params) => api.post('/vendors-search', params),
};

// Invoice API functions
export const invoiceApi = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  generateFromSubscription: (data) => api.post('/invoices/generate-from-subscription', data),
  generateFromPurchase: (data) => api.post('/invoices/generate-from-purchase', data),
  getByClient: (clientId) => api.get(`/invoices/client/${clientId}`),
  getByStatus: (status) => api.get(`/invoices/status/${status}`),
  downloadInvoice: (id) => {
    return api.get(`/invoices/${id}/download`, { 
      responseType: 'blob' 
    });
  },
};

// Purchase API functions
export const purchaseApi = {
  getAll: () => api.get('/purchases'),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
  getByClient: (clientId) => api.get(`/purchases/client/${clientId}`),
  getByPoNumber: (poNumber) => api.get(`/purchases/po/${poNumber}`),
  getWithRelatedData: (id) => api.get(`/purchases/${id}/with-related`),
  generatePoNumber: () => api.get('/purchases/generate-po'),
};

// Authentication API functions
export const authApi = {
  login: (credentials) => {
    // For login, we need to handle token storage before response normalization
    return api.post('/login', credentials)
      .then(response => {
        // Store token from the original response before normalization
        if (response.data.success && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          // Set the token in the default axios instance as well
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response; // Return as-is, the interceptor will normalize it
      });
  },
  logout: () => {
    return api.post('/logout')
      .then(() => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
      })
      .catch((error) => {
        // Even if the API call fails, remove the token locally
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        throw error;
      });
  },
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  }
};

export default api;
