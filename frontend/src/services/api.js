import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// API service functions
export const enrichmentAPI = {
  /**
   * Enrich email or domain data
   * @param {string} inputData - Email address or domain
   * @returns {Promise} API response
   */
  enrich: async (inputData) => {
    const response = await api.post("/api/enrich", {
      input_data: inputData,
    });
    return response.data;
  },

  /**
   * Validate input data
   * @param {string} inputData - Input to validate
   * @returns {Promise} Validation response
   */
  validate: async (inputData) => {
    const response = await api.get(
      `/api/enrich/validate/${encodeURIComponent(inputData)}`
    );
    return response.data;
  },
};

export const historyAPI = {
  /**
   * Get enrichment history
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise} History response
   */
  getHistory: async (limit = null) => {
    const params = limit ? { limit } : {};
    const response = await api.get("/api/history", { params });
    return response.data;
  },

  /**
   * Get specific history item
   * @param {string} id - History item ID
   * @returns {Promise} History item
   */
  getHistoryItem: async (id) => {
    const response = await api.get(`/api/history/${id}`);
    return response.data;
  },

  /**
   * Clear all history
   * @returns {Promise} Success response
   */
  clearHistory: async () => {
    const response = await api.delete("/api/history");
    return response.data;
  },

  /**
   * Search history
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  searchHistory: async (query) => {
    const response = await api.get(
      `/api/history/search/${encodeURIComponent(query)}`
    );
    return response.data;
  },

  /**
   * Get history statistics
   * @returns {Promise} Statistics
   */
  getStats: async () => {
    const response = await api.get("/api/history/stats");
    return response.data;
  },
};

export const healthAPI = {
  /**
   * Check API health
   * @returns {Promise} Health status
   */
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
