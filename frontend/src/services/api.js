const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export function getSessionUser() {
  try { return JSON.parse(localStorage.getItem("collabsphereUser") || "null"); }
  catch { return null; }
}
export function saveSession(token, user = {}) {
  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("authToken", token);
  }
  localStorage.setItem("collabsphereUser", JSON.stringify(user || {}));
  if (user?.name) localStorage.setItem("userName", user.name);
  if (user?.email) localStorage.setItem("userEmail", user.email);
}
export function clearSession() {
  ["token","authToken","collabsphereUser","userName","userEmail"].forEach(k=>localStorage.removeItem(k));
}
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = { ...(isFormData ? {} : options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
  let response;
  try {
    response = await fetch(`${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the backend at ${API_URL}. Start your backend server and check VITE_API_URL.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      if (typeof window !== "undefined" && !["/login","/register"].includes(window.location.pathname)) window.location.assign("/login");
    }
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }
  return data;
}
