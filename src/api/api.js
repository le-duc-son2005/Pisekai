import axios from "axios";

// Tạo axios instance cho backend (thay URL nếu deploy)
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Tự động thêm token nếu có
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Log detailed errors to console to aid debugging
API.interceptors.response.use(
  (res) => res,
  (error) => {
    try {
      const { config, response } = error || {};
      const meta = {
        method: config?.method,
        url: `${config?.baseURL || ''}${config?.url || ''}`,
        params: config?.params,
        requestData: config?.data,
        status: response?.status,
        statusText: response?.statusText,
        responseData: response?.data,
      };
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', meta);
    } catch (_) {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', error?.message || error);
    }
    return Promise.reject(error);
  }
);

export default API;
