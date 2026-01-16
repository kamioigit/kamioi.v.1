import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const ROLES = { USER: "user", ADMIN: "admin" };
const TOKEN_KEYS = { [ROLES.USER]: "kamioi_user_token", [ROLES.ADMIN]: "kamioi_admin_token" };

export function setToken(role, token) { localStorage.setItem(TOKEN_KEYS[role], token); }
export function getToken(role) { return localStorage.getItem(TOKEN_KEYS[role]) || null; }
export function clearToken(role) { localStorage.removeItem(TOKEN_KEYS[role]); }

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15001 });

client.interceptors.request.use((config) => {
  const role = config.meta?.role;
  const token = role ? getToken(role) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});

/** avoid noisy 422s if no admin token */
const _rawGet = client.get.bind(client);
client.get = (url, config = {}) => {
  if (url === "/api/admin/auth/me") {
    const t = getToken(ROLES.ADMIN);
    if (!t) return Promise.resolve({ data: null });
  }
  return _rawGet(url, config);
};

client.interceptors.response.use((res) => res, (err) => Promise.reject(err));

/* ---- canonical APIs ---- */
export const AuthAPI = {
  loginUser: (email, password) =>
    client.post("/api/user/auth/login", { email, password }, { meta: { role: ROLES.USER } }),
  loginAdmin: (email, password) =>
    client.post("/api/admin/auth/login", { email, password }, { meta: { role: ROLES.ADMIN } }),
  meUser: () => client.get("/api/user/auth/me", { meta: { role: ROLES.USER } }),
  meAdmin: () => client.get("/api/admin/auth/me", { meta: { role: ROLES.ADMIN } }),
};

export const UserAPI = {
  transactions: () => client.get("/api/user/transactions", { meta: { role: ROLES.USER } }),
};

export const AdminAPI = {
  users: () => client.get("/api/admin/users", { meta: { role: ROLES.ADMIN } }),
  performanceStorage: () => client.get("/api/admin/performance/storage", { meta: { role: ROLES.ADMIN } }),
};

/* ---- compatibility helpers so DataContext can call apiService.getTransactions() ---- */
export function getTransactions() { return UserAPI.transactions(); }
export function getAdminMeSafe() {
  const t = getToken(ROLES.ADMIN);
  return t ? AuthAPI.meAdmin() : Promise.resolve({ data: null });
}

/* default export exposes axios + helpers */
const apiService = Object.assign(client, {
  getTransactions,
  getAdminMeSafe,
  setToken,
  getToken,
  clearToken,
  ROLES,
  AuthAPI,
  UserAPI,
  AdminAPI,
});
export { apiService };
export default apiService;
