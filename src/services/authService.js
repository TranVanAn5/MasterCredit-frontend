import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Tự động gắn JWT token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Register ───────────────────────────────────────────
export const register = (data) =>
  api.post("/api/auth/register", data).then((r) => r.data);

export const verifyRegisterOtp = (email, otpCode) =>
  api.post("/api/auth/register/verify-otp", { email, otpCode }).then((r) => r.data);

export const uploadCitizenId = (email, frontFile, backFile) => {
  const form = new FormData();
  form.append("email", email);
  form.append("citizenImgFront", frontFile);
  form.append("citizenImgBack", backFile);
  return api
    .post("/api/auth/register/upload-citizen-id", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const setPin = (email, pin, confirmPin) =>
  api.post("/api/auth/register/set-pin", { email, pin, confirmPin }).then((r) => r.data);

// ── Login ──────────────────────────────────────────────
export const login = (username, password) =>
  api.post("/api/auth/login", { username, password }).then((r) => r.data);

export const verifyLoginOtp = (email, otpCode) =>
  api.post("/api/auth/login/verify-otp", { email, otpCode }).then((r) => r.data);

// ── Shared ─────────────────────────────────────────────
export const resendOtp = (email, otpType) =>
  api.post("/api/auth/resend-otp", { email, otpType }).then((r) => r.data);

// ── Profile ────────────────────────────────────────────
export const getProfile = () =>
  api.get("/api/auth/profile").then((r) => r.data);
