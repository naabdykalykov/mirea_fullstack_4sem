import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

let accessToken = localStorage.getItem(STORAGE_KEYS.accessToken) || null;
let refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken) || null;

export function getStoredTokens() {
  return { accessToken, refreshToken };
}

export function setTokens(nextAccessToken, nextRefreshToken) {
  accessToken = nextAccessToken || null;
  refreshToken = nextRefreshToken || null;

  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
  }

  if (nextRefreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, nextRefreshToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }
}

export function clearTokens() {
  setTokens(null, null);
}

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

async function refreshAccessToken() {
  if (!refreshToken) return null;
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const { data } = await api.post("/api/auth/refresh", { refreshToken });
    const newAccessToken = data?.accessToken || null;
    const newRefreshToken = data?.refreshToken || refreshToken;
    if (!newAccessToken) {
      clearTokens();
      pendingRequests.forEach((p) => p.reject(new Error("No access token")));
      pendingRequests = [];
      return null;
    }
    setTokens(newAccessToken, newRefreshToken);
    pendingRequests.forEach((p) => p.resolve(newAccessToken));
    pendingRequests = [];
    return newAccessToken;
  } catch (e) {
    clearTokens();
    pendingRequests.forEach((p) => p.reject(e));
    pendingRequests = [];
    return null;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (!original || original.__isRetryRequest) throw error;

    const status = error.response?.status;
    const url = original.url || "";

    const isAuthUrl =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      url.includes("/api/auth/refresh");

    if (status === 401 && !isAuthUrl && refreshToken) {
      const newAccess = await refreshAccessToken();
      if (!newAccess) throw error;

      original.__isRetryRequest = true;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    }

    throw error;
  }
);

