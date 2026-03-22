// src/lib/api.js — Central API client for CSIT Hub backend
// All requests go through this — automatically attaches JWT,
// handles 401 token refresh with exponential backoff, CSRF protection, and provides typed helpers.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("csit_token");

// Store new token
const setToken = (token) => localStorage.setItem("csit_token", token);

// Get CSRF token from sessionStorage
const getCsrfToken = () => sessionStorage.getItem("csit_csrf");

// Store CSRF token
const setCsrfToken = (token) => sessionStorage.setItem("csit_csrf", token);

// Fetch CSRF token from server
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/csrf-token`, {
      method: "GET",
      credentials: "include",
    });
    
    if (response.ok) {
      const csrfToken = response.headers.get("x-csrf-token");
      if (csrfToken) {
        setCsrfToken(csrfToken);
        return csrfToken;
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to fetch CSRF token:", err.message);
  }
  return null;
};

// isRefreshing flag prevents multiple simultaneous refresh calls
let isRefreshing = false;
let refreshQueue = [];
let refreshRetries = 0;
const MAX_REFRESH_RETRIES = 2;

const processQueue = (error, token) => {
  refreshQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  refreshQueue = [];
};

// Exponential backoff delay
const getBackoffDelay = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5 seconds
};

// ── Core fetch wrapper ──
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  let csrfToken = getCsrfToken();

  // Unauthenticated endpoints that shouldn't require CSRF
  const unauthenticatedEndpoints = [
    "/auth/login",
    "/auth/refresh",
    "/auth/register/student",
    "/auth/register/teacher",
    "/auth/forgot-password",
    "/auth/verify-otp",
    "/auth/reset-password",
    "/auth/csrf-token",
  ];

  const isUnauthenticatedEndpoint = unauthenticatedEndpoints.some((ep) =>
    endpoint.includes(ep)
  );

  // For state-changing operations on authenticated endpoints, ensure CSRF token exists
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (
    stateChangingMethods.includes((options.method || "GET").toUpperCase()) &&
    !isUnauthenticatedEndpoint &&
    !csrfToken
  ) {
    csrfToken = await fetchCsrfToken();
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
    ...(options.headers || {}),
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const config = {
    method: options.method || "GET",
    headers,
    credentials: "include", // For httpOnly refresh token cookie
    ...options,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle 401 — try to refresh token
  if (response.status === 401 && !options._retry) {
    // Don't try to refresh if this is already a refresh attempt
    if (endpoint === "/auth/refresh") {
      handleAuthFailure();
      throw new Error("Token refresh failed. Please log in again.");
    }

    if (isRefreshing) {
      // Another refresh is in progress, queue this request
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          return apiFetch(endpoint, {
            ...options,
            _retry: true,
            headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
          });
        })
        .catch((error) => {
          handleAuthFailure();
          throw error;
        });
    }

    isRefreshing = true;
    refreshRetries = 0;

    const tryRefresh = async () => {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        // Check if we hit rate limit
        if (refreshRes.status === 429) {
          // Rate limited — stop retrying
          throw new Error("Token refresh rate limited. Please try again later.");
        }

        const refreshData = await refreshRes.json().catch(() => ({}));

        if (
          refreshRes.ok &&
          refreshData.success &&
          refreshData.data?.accessToken
        ) {
          const newToken = refreshData.data.accessToken;
          setToken(newToken);
          refreshRetries = 0;
          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request with new token
          return apiFetch(endpoint, { ...options, _retry: true });
        } else {
          throw new Error(
            refreshData.message ||
              "Token refresh failed. Please log in again."
          );
        }
      } catch (error) {
        if (refreshRetries < MAX_REFRESH_RETRIES) {
          // Retry with exponential backoff
          refreshRetries++;
          const delay = getBackoffDelay(refreshRetries - 1);
          console.warn(
            `⚠️ Token refresh failed, retrying in ${delay}ms... (${refreshRetries}/${MAX_REFRESH_RETRIES})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return tryRefresh();
        }

        // All retries exhausted
        handleAuthFailure();
        processQueue(error, null);
        isRefreshing = false;
        throw error;
      }
    };

    return tryRefresh();
  }

  // Check for new CSRF token in response headers
  const newCsrfToken = response.headers.get("x-csrf-token");
  if (newCsrfToken) {
    setCsrfToken(newCsrfToken);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed: ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;

    // Handle 403 (Forbidden) — could be CSRF token issue
    if (response.status === 403) {
      console.error("❌ Access forbidden:", errorMsg);
      // Reset CSRF token on 403 — it might be expired
      sessionStorage.removeItem("csit_csrf");
    }

    throw err;
  }

  return data;
};

// Handle authentication failures
const handleAuthFailure = () => {
  localStorage.removeItem("csit_token");
  localStorage.removeItem("csit-auth");
  // Redirect to login only if not already there
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
};

// ── Convenience methods ──
export const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: "PUT", body }),

  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: "PATCH", body }),

  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),

  // File upload — uses FormData, no JSON stringify
  upload: (endpoint, formData, options = {}) =>
    apiFetch(endpoint, { ...options, method: "POST", body: formData }),
};

export default api;
