import axios from 'axios';
import {
  API_BASE_URL,
  clearAuthSession,
  getAccessToken,
  getTokenType,
  refreshAccessToken
} from './auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

let refreshPromise = null;

const getRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use(config => {
  const accessToken = getAccessToken();
  const tokenType = getTokenType();

  if (!accessToken) {
    return config;
  }

  const headers = config.headers || {};

  return {
    ...config,
    headers: {
      ...headers,
      Authorization: `${tokenType} ${accessToken}`
    }
  };
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';

    if (status !== 401 || originalRequest?._retry || requestUrl.includes('/api/v1/auth/refresh')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await getRefreshPromise();
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
