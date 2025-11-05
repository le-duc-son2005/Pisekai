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

      // Extra hints for common issues
      if (meta.status === 404 && typeof meta.url === 'string') {
        // eslint-disable-next-line no-console
        console.warn('[HINT] 404 Not Found received from backend. This usually means the route does not exist or backend was not restarted.');
        // eslint-disable-next-line no-console
        console.warn('[HINT] Open this in browser to test quickly: http://localhost:5000/api/battle/ping');
        if (meta.url.includes('/battle/levels')) {
          // eslint-disable-next-line no-console
          console.warn('[HINT] The endpoint /api/battle/levels should be registered. Verify in backend/server.js:');
          // eslint-disable-next-line no-console
          console.warn("  - app.use('/api/battle', battleRoutes) and app.get('/api/battle/levels', listLevels)");
          // eslint-disable-next-line no-console
          console.warn('[HINT] Also check routes list: http://localhost:5000/api/_routes');
        }
      }
    } catch (_) {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', error?.message || error);
    }
    return Promise.reject(error);
  }
);

export default API;
