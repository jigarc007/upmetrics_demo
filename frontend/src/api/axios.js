import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // attach token only if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // 🚫 DO NOT redirect for public auth routes
    const publicRoutes = [
      "/user/login",
      "/user/signup",
      "/user/forgot-password",
      "user/reset-password",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      url.includes(route)
    );

    if (status === 401 && !isPublicRoute) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
