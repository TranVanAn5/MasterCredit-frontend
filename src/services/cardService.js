import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// GET /api/cards — danh sách thẻ của user đang đăng nhập
export const getMyCards = () =>
  api.get("/api/cards").then((r) => r.data);

// GET /api/cards/{cardId} — chi tiết thông tin một thẻ (bao gồm CVV và số thẻ đầy đủ)
export const getCardDetail = (cardId) =>
  api.get(`/api/cards/${cardId}`).then((r) => r.data);

// GET /api/cards/types — danh sách tất cả loại thẻ (public, không cần auth)
export const getAllCardTypes = () =>
  api.get("/api/cards/types").then((r) => r.data);

// POST /api/cards/compare — so sánh các loại thẻ (public)
export const compareCardTypes = (cardTypeIds) =>
  api.post("/api/cards/compare", cardTypeIds).then((r) => r.data);

// GET /api/cards/types/{id} — lấy chi tiết một loại thẻ theo ID (public)
export const getCardTypeById = (cardTypeId) =>
  api.get(`/api/cards/types/${cardTypeId}`).then((r) => r.data);

// ── Card Application – 7-step flow ──────────────────────────────────────────

// B2: POST /api/cards/apply/start — tạo đơn nháp với thông tin tài chính
export const startCardApplication = (dto) =>
  api.post("/api/cards/apply/start", dto).then((r) => r.data);

// B3: POST /api/cards/apply/{id}/upload-documents — upload CCCD + bảng lương
export const uploadApplicationDocuments = (applicationId, idCard, salarySlip) => {
  const form = new FormData();
  form.append("idCard", idCard);
  form.append("salarySlip", salarySlip);
  return api.post(`/api/cards/apply/${applicationId}/upload-documents`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

// B4: GET /api/cards/apply/{id}/review — xem lại thông tin đơn
export const getApplicationReview = (applicationId) =>
  api.get(`/api/cards/apply/${applicationId}/review`).then((r) => r.data);

// B5: POST /api/cards/apply/{id}/send-otp — gửi OTP về email hoặc phone
export const sendApplicationOtp = (applicationId, type) =>
  api.post(`/api/cards/apply/${applicationId}/send-otp`, { type }).then((r) => r.data);

// B6: POST /api/cards/apply/{id}/submit — xác minh OTP và hoàn tất đơn
export const submitApplication = (applicationId, otpCode) =>
  api.post(`/api/cards/apply/${applicationId}/submit`, { otpCode }).then((r) => r.data);

// Lấy danh sách tất cả đơn đã nộp
export const getMyApplications = () =>
  api.get("/api/cards/apply/my-applications").then((r) => r.data);
