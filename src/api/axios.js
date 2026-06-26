import axios from "axios";
import { toast } from 'react-toastify';


const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL,
  timeout: 30000,
});

let hasHandledAuthExpiry = false;

const clearExpiredSession = () => {
  if (hasHandledAuthExpiry) return;

  hasHandledAuthExpiry = true;
  localStorage.removeItem("lease_token");
  window.dispatchEvent(new Event("lease-auth-expired"));
  toast("Session expired. Please sign in again.");

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const getJwtPayload = (token) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = getJwtPayload(token);

  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lease_token");

    if (token) {
      if (isTokenExpired(token)) {
        clearExpiredSession();
        return Promise.reject(new Error("Session expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const hasToken = Boolean(localStorage.getItem("lease_token"));

    if (status === 401 && hasToken && !requestUrl.includes("/auth/sign-in")) {
      clearExpiredSession();
      return Promise.reject(error);
    }

    const message = error?.response?.data?.message || "Something went wrong";
    toast(message);
    return Promise.reject(error);
  },
);

export default api;
