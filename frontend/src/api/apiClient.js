import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:8080' : '')).replace(/\/$/, '');

if (import.meta.env.PROD && !API_BASE_URL) {
  console.warn(
    'PackCheck AI: VITE_API_BASE_URL is not configured. Set it to the deployed Spring Boot API URL in Vercel Environment Variables.'
  );
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.PROD && !API_BASE_URL) {
      return Promise.reject(
        new Error('PackCheck API is not configured. Set VITE_API_BASE_URL in the deployment environment.')
      );
    }

    const token = localStorage.getItem('packcheck_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('packcheck_token');
      localStorage.removeItem('packcheck_user');
      window.dispatchEvent(new Event('packcheck_logout'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
