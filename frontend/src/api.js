import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

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

export default api;
