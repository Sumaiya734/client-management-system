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
    
    // If the response has our standard format {success: true, data: ...}, normalize it
    if (response.data && response.data.hasOwnProperty('success')) {
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
      // Remove the Authorization header
      delete api.defaults.headers.common['Authorization'];
      // Dispatch a custom event to notify the app of auth failure
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
