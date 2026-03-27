import axios from 'axios';

const ACCESS_TOKEN_KEY = 'authAccessToken';
const REFRESH_TOKEN_KEY = 'authRefreshToken';
const TOKEN_TYPE_KEY = 'authTokenType';
const DEFAULT_TOKEN_TYPE = 'Bearer';
const API_BASE_URL = 'https://self-service-kiosk-production-10bc.up.railway.app';
const REFRESH_INTERVAL_MINUTES = 10;

let refreshIntervalId = null;

const normalizeTokenType = (tokenType) => {
  if (!tokenType) {
    return DEFAULT_TOKEN_TYPE;
  }

  return tokenType.toLowerCase() === 'bearer' ? 'Bearer' : tokenType;
};

const extractAuthPayload = (responseBody) => responseBody?.data || responseBody;

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || '';
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY) || '';
export const getTokenType = () => localStorage.getItem(TOKEN_TYPE_KEY) || DEFAULT_TOKEN_TYPE;

export const isAuthenticated = () => Boolean(getAccessToken());

export const saveAuthSession = ({ access_token, refresh_token, token_type }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  localStorage.setItem(TOKEN_TYPE_KEY, normalizeTokenType(token_type));
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
    refresh_token: refreshToken
  });
  const responseBody = response.data;
  const tokens = extractAuthPayload(responseBody);

  if (!tokens?.access_token || !tokens?.refresh_token) {
    throw new Error('Refresh token is invalid');
  }

  saveAuthSession(tokens);
  return tokens;
};

export const startAuthRefreshScheduler = (
  intervalMinutes = REFRESH_INTERVAL_MINUTES
) => {
  if (!getRefreshToken()) {
    return;
  }

  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  refreshIntervalId = setInterval(async () => {
    try {
      await refreshAccessToken();
    } catch (error) {
      clearAuthSession();
      stopAuthRefreshScheduler();
    }
  }, intervalMinutes * 60 * 1000);
};

export const stopAuthRefreshScheduler = () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

export { API_BASE_URL, REFRESH_INTERVAL_MINUTES };
