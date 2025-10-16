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

export default API;
