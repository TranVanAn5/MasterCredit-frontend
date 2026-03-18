import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Auth token helper
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ═════════════════════════════════════════════════════════════════════════════
//  BILL PAYMENT API - 6-STEP FLOW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * B1: Get bill categories (điện, nước, wifi, học phí...)
 * GET /api/bill-payment/categories
 */
export const getBillCategories = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/bill-payment/categories`);
    return data;
  } catch (error) {
    console.error("getBillCategories error:", error);
    throw error;
  }
};

/**
 * B2: Get providers by category
 * GET /api/bill-payment/categories/{categoryId}/providers
 */
export const getProvidersByCategory = async (categoryId) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/api/bill-payment/categories/${categoryId}/providers`
    );
    return data;
  } catch (error) {
    console.error("getProvidersByCategory error:", error);
    throw error;
  }
};

/**
 * B3: Verify customer code and get bill info
 * POST /api/bill-payment/verify-customer
 */
export const verifyCustomer = async (providerId, customerCode) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/bill-payment/verify-customer`,
      { providerId, customerCode }
    );
    return data;
  } catch (error) {
    console.error("verifyCustomer error:", error);
    throw error;
  }
};

/**
 * B4: Get user cards for payment
 * GET /api/bill-payment/cards (or /api/cards)
 */
export const getUserCards = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/bill-payment/cards`, {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    console.error("getUserCards error:", error);
    throw error;
  }
};

/**
 * B5+B6: Process bill payment with PIN
 * POST /api/bill-payment/process
 */
export const processBillPayment = async (paymentData) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/bill-payment/process`,
      paymentData,
      { headers: getAuthHeader() }
    );
    return data;
  } catch (error) {
    console.error("processBillPayment error:", error);
    throw error;
  }
};

/**
 * Get payment history
 * GET /api/bill-payment/history
 */
export const getPaymentHistory = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/bill-payment/history`, {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    console.error("getPaymentHistory error:", error);
    throw error;
  }
};
