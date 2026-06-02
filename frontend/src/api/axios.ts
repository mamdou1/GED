/**
 * api/axios.ts
 *
 * Configuration de l'instance Axios pour les appels API
 * - Définition de l'URL de base via .env
 * - Timeout global pour les requêtes
 * - Intercepteur automatique du token JWT
 */

// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
//   timeout: 10000,
// });

// // Request interceptor : ajoute le token si present
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");

//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

// axios.ts
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  //||"https://paleobiologic-unfederatively-brigette.ngrok-free.dev/api",
  timeout: 10000,
});

// Interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Vérifier si c'est une navigation depuis la sidebar
  const isSidebarNavigation =
    sessionStorage.getItem("sidebar_navigation") === "true";

  if (isSidebarNavigation) {
    config.headers["x-sidebar-navigation"] = "true";
    // Ne pas effacer le flag immédiatement, le laisser pour toute la navigation
  }

  if ((config as any).audit === true) {
    config.headers["x-audit"] = "true";
  }

  return config;
});

export default api;

export const BACKEND_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api").replace("/api", "");
