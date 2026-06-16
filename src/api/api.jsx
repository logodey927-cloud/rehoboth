// client/src/api/api.jsx
import axios from "axios";
import { getApiBaseUrl } from "../config/env.js";
import { applyLegacyAdminResponse } from "./legacyAdminResponse.js";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 second timeout to better handle Supabase latency
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Unwrap `{ success, data }` from axios responses. */
export function unwrapApiData(response) {
  return response?.data?.data ?? response?.data;
}

/** Flatten API validation `details` into `{ field: message }`. */
export function getApiFieldErrors(error) {
  const details = error?.response?.data?.details;
  if (!details || typeof details !== "object") return {};

  return Object.fromEntries(
    Object.entries(details).map(([field, errs]) => {
      const list = Array.isArray(errs) ? errs : [errs];
      const message = list
        .filter(Boolean)
        .map((e) => (typeof e === "string" ? e : e.message))
        .filter(Boolean)
        .join(" ");
      return [field, message];
    }).filter(([, message]) => message)
  );
}

function messagesFromValidationDetails(details) {
  if (!details || typeof details !== "object") return null;

  const messages = Object.values(details).flatMap((errs) => {
    const list = Array.isArray(errs) ? errs : [errs];
    return list
      .filter(Boolean)
      .map((e) => (typeof e === "string" ? e : e.message))
      .filter(Boolean);
  });

  return messages.length ? messages.join(" ") : null;
}

/** User-facing message from API error responses (prefers field-level validation details). */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const body = error?.response?.data;
  const fromDetails = messagesFromValidationDetails(body?.details);
  if (fromDetails) return fromDetails;
  return body?.message || body?.error || error?.message || fallback;
}

// ── Admin session helpers ─────────────────────────────────────────────────────
const ADMIN_URL_PATTERNS = ["/admin/", "/site-settings", "/newsletter/subscribers"];

/** Remove all admin auth keys (use on logout and 401). */
export function clearAdminSessionStorage() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_authenticated");
  localStorage.removeItem("admin_user");
}

/** Call after a successful admin login so a future 401 can redirect again. */
export function resetAdminSessionRedirectGuard() {
  _adminSessionRedirecting = false;
}

let _adminSessionRedirecting = false;

// ── User token refresh on 401 ─────────────────────────────────────────────────
// Routes that carry a user Bearer token and should auto-refresh on expiry.
const USER_AUTH_URLS = ["/users/", "/upload/user-avatar", "/appointments/"];
const REFRESH_URL    = "/auth/user/refresh-token";

let _isRefreshing = false;
/** @type {{ resolve: (token: string) => void, reject: (err: unknown) => void }[]} */
let _refreshQueue = [];

function _onRefreshed(newToken) {
  _refreshQueue.forEach(({ resolve }) => resolve(newToken));
  _refreshQueue = [];
}

function _onRefreshFailed(err) {
  _refreshQueue.forEach(({ reject }) => reject(err));
  _refreshQueue = [];
}

/** Remove customer auth keys from localStorage. */
export function clearUserSessionStorage() {
  localStorage.removeItem("user_access_token");
  localStorage.removeItem("user_refresh_token");
  localStorage.removeItem("user_data");
}

/** Clear storage and notify UserAuthContext to reset in-memory session. */
export function notifyUserSessionExpired() {
  clearUserSessionStorage();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("user:session-expired"));
  }
}

// ── Offline request interceptor ───────────────────────────────────────────────
// Reject immediately with a structured OFFLINE error so callers don't spin forever.
api.interceptors.request.use((config) => config, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    if (response?.data?.success) {
      response.data = applyLegacyAdminResponse(response.data, response.config?.url || "");
    }
    return response;
  },
  async (error) => {
    // Detect network failure while offline — no response object means no server reached
    if (!error.response && !navigator.onLine) {
      const offlineErr = new Error("You are offline");
      offlineErr.code = "OFFLINE";
      offlineErr.isOffline = true;
      return Promise.reject(offlineErr);
    }
    const original = error.config;
    const url      = original?.url ?? "";
    const is401    = error.response?.status === 401;
    const isUser   = USER_AUTH_URLS.some((u) => url.includes(u));
    const isAdmin  = ADMIN_URL_PATTERNS.some((p) => url.includes(p));
    const isRefresh= url.includes(REFRESH_URL);

    // ── Admin token expired → clear full session and redirect once ──
    if (is401 && isAdmin && !isRefresh) {
      clearAdminSessionStorage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin:session-expired"));
        const onLogin = window.location.pathname.startsWith("/admin/login");
        if (!_adminSessionRedirecting && !onLogin) {
          _adminSessionRedirecting = true;
          window.location.replace("/admin/login?session=expired");
        }
      }
      return Promise.reject(error);
    }

    // ── User token expired → attempt silent refresh ──
    if (is401 && isUser && !isRefresh && !original._retry) {
      if (_isRefreshing) {
        // Queue this request until the in-flight refresh finishes.
        return new Promise((resolve, reject) => {
          _refreshQueue.push({
            resolve: (token) => {
              original.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry  = true;
      _isRefreshing    = true;

      try {
        const rt = localStorage.getItem("user_refresh_token");
        if (!rt) throw new Error("no refresh token");

        const res = await api.post(REFRESH_URL, { refreshToken: rt });
        if (!res.data?.success) throw new Error("refresh failed");

        const { accessToken: newAccess, refreshToken: newRefresh } = unwrapApiData(res);
        if (!newAccess) throw new Error("refresh response missing access token");

        localStorage.setItem("user_access_token", newAccess);
        if (newRefresh) localStorage.setItem("user_refresh_token", newRefresh);

        // Sync the new token into UserAuthContext (which holds its own state copy)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("user:token-refreshed", { detail: { accessToken: newAccess } }));
        }

        _onRefreshed(newAccess);
        _isRefreshing = false;

        original.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshErr) {
        _isRefreshing = false;
        _onRefreshFailed(refreshErr);
        notifyUserSessionExpired();
      }
    }

    return Promise.reject(error);
  }
);

export const bookAppointment = (data) => {
  const userToken = localStorage.getItem("user_access_token");
  const config = userToken ? { headers: { Authorization: `Bearer ${userToken}` } } : {};
  return api.post("/appointments", data, config);
};

// Phase A of two-phase booking: validate + assign team member + create Stripe session.
// No appointment row is inserted until payment succeeds (Phase B via webhook).
export const prepareAppointment = (data) => {
  const userToken = localStorage.getItem("user_access_token");
  const config = userToken ? { headers: { Authorization: `Bearer ${userToken}` } } : {};
  return api.post("/appointments/prepare", data, config);
};
export const getAppointments = () => api.get("/admin/appointments", { params: { limit: 100 } });
export const getAppointmentById = (id) => api.get(`/admin/appointments/${id}`);
export const getAvailableDates = (year, month, serviceId = null, teamMemberId = null) =>
  api.get("/appointments/available-dates", {
    params: {
      year,
      month,
      ...(serviceId ? { service_id: serviceId } : {}),
      ...(teamMemberId ? { team_member_id: teamMemberId } : {}),
    },
  });

// Team member auto-assignment preview for booking (public)
export const getAutoAssignedTeamMember = (service, treatment, clientGender) =>
  api.get("/appointments/auto-assign-team-member", {
    params: {
      service,
      treatment,
      client_gender: clientGender,
    },
  });

// Get available time range for a team member on a specific date (for booking)
export const getTeamMemberTimeRange = (teamMemberId, date) =>
  api.get("/appointments/team-member-availability", {
    params: {
      team_member_id: teamMemberId,
      date,
    },
  });

// Admin calendar management: block/unblock dates (legacy)
export const blockCalendarDate = (date, reason) =>
  api.post("/admin/appointments/blocked-dates", { date, reason });

export const unblockCalendarDate = (date) =>
  api.delete("/admin/appointments/blocked-dates", { params: { date } });

// Blocked Time Slots API (new enhanced blocking system)
export const createBlockedTimeSlot = (data) =>
  api.post("/admin/blocked-time-slots", data);
export const getBlockedTimeSlots = (params = {}) =>
  api.get("/admin/blocked-time-slots", { params });
export const deleteBlockedTimeSlot = (id) =>
  api.delete(`/admin/blocked-time-slots/${id}`);

// Service-Team Member Assignment API
export const getServiceTeamMembers = (serviceId) =>
  api.get(`/admin/services/${serviceId}/team-members`);
export const assignServiceTeamMembers = (serviceId, teamMemberIds) =>
  api.put(`/admin/services/${serviceId}/team-members`, { team_member_ids: teamMemberIds });

export const submitContactForm = (data) => api.post("/contact", data);
export const getContactMessages = () => api.get("/admin/contact-messages", { params: { limit: 100 } });

export const subscribeNewsletter = (email) => api.post("/newsletter/subscribe", { email });
export const getSubscribers = () => api.get("/newsletter/subscribers", { params: { limit: 100 } });

// Auth API
export const loginAdmin = (email, password) =>
  api.post("/auth/login", { email, password });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword });

// Team Member Auth API
export const loginTeamMember = (data) => api.post("/team/auth/login", data);
export const forgotPasswordTeamMember = (data) => api.post("/team/auth/forgot-password", data);
export const resetPasswordTeamMember = (data) => api.post("/team/auth/reset-password", data);
export const changePasswordTeamMember = (data) => {
  const token = localStorage.getItem("teamMemberToken");
  return api.post("/team/auth/change-password", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Team Member Profile API
export const getTeamMemberProfile = () => {
  const token = localStorage.getItem("teamMemberToken");
  return api.get("/team/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateTeamMemberProfile = (data) => {
  const token = localStorage.getItem("teamMemberToken");
  return api.put("/team/auth/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTeamMemberAppointmentsAuth = (params = {}) => {
  const token = localStorage.getItem("teamMemberToken");
  return api.get("/team/auth/appointments", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const changePassword = (username, currentPassword, newPassword) =>
  api.post("/auth/change-password", { username, currentPassword, newPassword });

export const initializeAdmin = (username, password, email) =>
  api.post("/auth/initialize", { username, password, email });

// Voucher API
export const getAllVouchers = () => api.get("/vouchers");
export const getVoucherById = (id) => api.get(`/vouchers/${id}`);
export const getVoucherByIdAdmin = (id) => api.get(`/admin/vouchers/${id}`);
export const requestVoucher = (data) => api.post("/vouchers/request", data, {
  timeout: 30000, // 30 second timeout for voucher requests (emails may take time)
});
export const verifyVoucherCode = (code) => api.post(`/vouchers/${code}/verify`);

// Public Voucher Purchase API (prepaid vouchers)
export const getPurchasableVouchers = () => api.get("/vouchers/purchase");
export const purchaseVoucher = (data) => api.post("/vouchers/purchase", data);
export const uploadVoucherPaymentProof = (voucherIssueId, formData) =>
  api.post(`/vouchers/issues/${voucherIssueId}/payment/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000, // uploads + storage fallback can take longer
  });

// Stripe (Stripe-only payments)
export const getStripeCheckoutSession = (sessionId) =>
  api.get(`/stripe/checkout-session/${encodeURIComponent(sessionId)}`);

// PayPal payments
export const createPayPalAppointmentOrder = (appointmentId) =>
  api.post(`/paypal/appointments/${appointmentId}/create-order`);
// Two-phase booking: create PayPal order from a booking_intent (no appointment row yet)
export const createPayPalIntentOrder = (intentId) =>
  api.post(`/paypal/intents/${intentId}/create-order`);
export const createPayPalVoucherOrder = (voucherIssueId) =>
  api.post(`/paypal/vouchers/issues/${voucherIssueId}/create-order`);
export const capturePayPalOrder = (orderId) =>
  api.post(`/paypal/orders/${orderId}/capture`);
export const getPayPalOrderStatus = (orderId) =>
  api.get(`/paypal/orders/${orderId}`);

// Admin Voucher API
export const getAllVouchersAdmin = (params = {}) =>
  api.get("/admin/vouchers", { 
    params,
    timeout: 45000 // 45 second timeout for admin queries (longer than default)
  });
export const createVoucher = (data) => api.post("/admin/vouchers", data);
export const updateVoucher = (id, data) => api.put(`/admin/vouchers/${id}`, data);
export const deleteVoucher = (id, hardDelete = false) =>
  api.delete(`/admin/vouchers/${id}`, { params: { hardDelete } });
export const getVoucherIssues = (voucherId) =>
  api.get(`/admin/vouchers/${voucherId}/issues`);
export const verifyVoucherCodeAdmin = (code) => {
  // Ensure code is a string and not an object
  let codeString = "";
  if (typeof code === "string") {
    codeString = code.trim().toUpperCase();
  } else if (code && typeof code === "object") {
    // If it's an object, try to extract the code property
    codeString = (code.code || code.toString() || "").toString().trim().toUpperCase();
  } else {
    codeString = String(code || "").trim().toUpperCase();
  }
  
  if (!codeString || codeString === "[OBJECT OBJECT]") {
    return Promise.reject(new Error("Invalid voucher code: code must be a string"));
  }
  
  return api.get(`/admin/vouchers/verify/${encodeURIComponent(codeString)}`);
};
export const updateVoucherIssueStatus = (voucherIssueId, status) =>
  api.put(`/admin/vouchers/issues/${voucherIssueId}/status`, { status });

export const verifyVoucherPaymentAdmin = (voucherIssueId, data = {}) =>
  api.put(`/admin/vouchers/issues/${voucherIssueId}/payment/verify`, data);

export const getRecentVoucherIssuesAdmin = (limit = 5) =>
  api.get("/admin/vouchers/issues/recent", { params: { limit } });

// File Upload API
export const uploadVoucherImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload/voucher-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadServiceImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload/service-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadBlogImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload/blog-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadTeamImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload/team-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Services API (Public)
export const getServices = (params = {}) => api.get("/services", { params });
export const getServiceById = (id) => api.get(`/services/${id}`);

// Admin Services API
export const getAllServicesAdmin = (params = {}) =>
  api.get("/admin/services", { params });
export const getServiceByIdAdmin = (id) => api.get(`/admin/services/${id}`);
export const createService = (data) => api.post("/admin/services", data);
export const updateService = (id, data) => api.put(`/admin/services/${id}`, data);
export const deleteService = (id, hardDelete = false) =>
  api.delete(`/admin/services/${id}`, { params: { hardDelete } });

// Team API (Public)
export const getTeamMembers = (params = {}) =>
  api.get("/team", { params });
export const getTeamMemberById = (id) =>
  api.get(`/team/${id}`);
export const getTeamMemberSpecialisationsPublic = (id) =>
  api.get(`/team/${id}/specialisations`);

// Admin Team API
export const getAllTeamMembersAdmin = (params = {}) =>
  api.get("/admin/team", { params });
export const getTeamMemberByIdAdmin = (id) =>
  api.get(`/admin/team/${id}`);
export const createTeamMember = (data) =>
  api.post("/admin/team", data);
export const updateTeamMember = (id, data) =>
  api.put(`/admin/team/${id}`, data, {
    timeout: 60000, // 60 second timeout (emails may be sent when disabling)
  });
export const deleteTeamMember = (id, hardDelete = false) =>
  api.delete(`/admin/team/${id}${hardDelete ? "/hard" : ""}`);
export const getTeamMemberAppointments = (id, params = {}) =>
  api.get(`/admin/team/${id}/appointments`, { params });
export const getTeamMemberSpecialisations = (id) =>
  api.get(`/admin/team/${id}/specialisations`);
export const updateTeamMemberSpecialisations = (id, specialisations) =>
  api.put(`/admin/team/${id}/specialisations`, { specialisations }, {
    timeout: 60000, // 60 second timeout for specialisations update (can be slow with many items)
  });
export const checkEmailAvailability = (email, excludeId = null) => {
  const params = { email };
  if (excludeId) params.excludeId = excludeId;
  return api.get("/admin/team/check-email", { params });
};
export const checkUsernameAvailability = (username, excludeId = null) => {
  const params = { username };
  if (excludeId) params.excludeId = excludeId;
  return api.get("/admin/team/check-username", { params });
};

// Team Member Availability API
export const getTeamMemberAvailability = (id) =>
  api.get(`/admin/team/${id}/availability`);
export const updateTeamMemberAvailability = (id, availability) =>
  api.put(`/admin/team/${id}/availability`, { availability });

// Blog API (Public)
export const getBlogPosts = (params = {}) => api.get("/blog", { params });
export const getBlogPostBySlug = (slug) => api.get(`/blog/${slug}`);
export const getBlogCategories = () => api.get("/blog/categories");
export const getBlogTags = () => api.get("/blog/tags");

// Admin Blog API
export const getAllBlogPostsAdmin = (params = {}) =>
  api.get("/admin/blog", { params });
export const getBlogPostByIdAdmin = (id) => api.get(`/admin/blog/${id}`);
export const createBlogPost = (data) => api.post("/admin/blog", data);
export const updateBlogPost = (id, data) => api.put(`/admin/blog/${id}`, data);
export const deleteBlogPost = (id) => api.delete(`/admin/blog/${id}`);

// Appointment Completion API
export const markAppointmentCompleted = (id) =>
  api.post(`/appointments/${id}/mark-completed`);
export const confirmAppointmentCompletion = (id) =>
  api.post(`/admin/appointments/${id}/confirm-completion`, { action: "confirm" });
export const rejectAppointmentCompletion = (id) =>
  api.post(`/admin/appointments/${id}/confirm-completion`, { action: "reject" });
export const updateAppointmentStatus = (id, status, completionTime) =>
  api.put(`/admin/appointments/${id}/status`, { status, completion_time: completionTime });
export const updateAppointmentTeamMember = (id, teamMemberId) =>
  api.put(`/admin/appointments/${id}/team-member`, { team_member_id: teamMemberId });

export const sendAppointmentCustomerEmail = (appointmentId, data) =>
  api.post(`/admin/appointments/${appointmentId}/send-email`, data);

// Payment API
export const uploadPaymentProof = (appointmentId, formData) => {
  return api.post(`/appointments/${appointmentId}/payment/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getPaymentStatus = (appointmentId) =>
  api.get(`/appointments/${appointmentId}/payment/status`);

// Admin Payment API
export const verifyBankTransfer = (appointmentId, data) =>
  api.put(`/admin/appointments/${appointmentId}/payment/verify`, data);

export const refundPayment = (appointmentId, data) =>
  api.put(`/admin/appointments/${appointmentId}/payment/refund`, data);

// ── Admin API interceptor (attaches admin JWT automatically) ──────────────────
api.interceptors.request.use((config) => {
  const isAdminUrl = ADMIN_URL_PATTERNS.some((p) => config.url?.includes(p));

  // Attach admin token for admin-protected routes
  if (isAdminUrl) {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      config.headers["Authorization"] = `Bearer ${adminToken}`;
    }
  }
  // Attach user token for protected user routes (not admin URLs that contain "/users/")
  if (!isAdminUrl && USER_AUTH_URLS.some((u) => config.url?.includes(u))) {
    const userToken = localStorage.getItem("user_access_token");
    if (userToken && !config.headers?.Authorization) {
      config.headers["Authorization"] = `Bearer ${userToken}`;
    }
  }
  return config;
});

// ── Public Reviews ────────────────────────────────────────────────────────────
export const getPublicReviews = (params = {}) => api.get("/reviews", { params });
export const getReviewStats   = (params = {}) => api.get("/reviews/stats", { params });

export const submitReview = (data) => {
  const userToken = localStorage.getItem("user_access_token");
  return api.post("/reviews", data, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
};

export const getMyAppointmentReview = (token, appointmentId) =>
  api.get(`/reviews/appointment/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── Admin Reviews ─────────────────────────────────────────────────────────────
export const adminGetReviews        = (params = {}) => api.get("/admin/reviews", { params });
export const adminGetReviewById     = (id)           => api.get(`/admin/reviews/${id}`);
export const adminUpdateReview      = (id, data)     => api.put(`/admin/reviews/${id}`, data);
export const adminUpdateReviewStatus= (id, status)   => api.put(`/admin/reviews/${id}/status`, { status });
export const adminDeleteReview      = (id)           => api.delete(`/admin/reviews/${id}`);

// ── Customer (user) authentication ───────────────────────────────────────────
export const registerUser    = (data) => api.post("/auth/user/register", data);
export const loginUser       = (data) => api.post("/auth/user/login", data);
export const logoutUser      = (refreshToken) => api.post("/auth/user/logout", { refreshToken });
export const refreshUserToken= (refreshToken) => api.post("/auth/user/refresh-token", { refreshToken });
export const verifyUserEmail = (token) => api.get(`/auth/user/verify-email?token=${token}`);
export const forgotPasswordUser  = (email) => api.post("/auth/user/forgot-password", { email });
export const resetPasswordUser   = (data)  => api.post("/auth/user/reset-password", data);
export const resendVerificationEmail = (email) => api.post("/auth/user/resend-verification", { email });

// ── Customer My Account ───────────────────────────────────────────────────────
const userApi = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getMyProfile       = (token) => api.get("/users/me",                 userApi(token));
export const updateMyProfile    = (token, data) => api.put("/users/me", data,       userApi(token));
export const getMyAppointments      = (token) => api.get("/users/me/bookings",                      userApi(token));
export const getMyAppointmentById   = (token, id) => api.get(`/appointments/${id}`,                  userApi(token));
export const cancelMyAppointment    = (token, id) => api.post(`/appointments/${id}/cancel`, {},   userApi(token));
export const getMyVouchers        = (token) => api.get("/users/me/vouchers",         userApi(token));
export const getMyVoucherById     = (token, id) => api.get(`/users/me/vouchers/${id}`, userApi(token));
export const changeMyPassword     = (token, data) => api.post("/users/me/change-password", data, userApi(token));
export const getMyReferrals       = (token) => api.get("/users/me/referrals",         userApi(token));

export const uploadUserAvatar = (token, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload/user-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

// ── Admin user management ─────────────────────────────────────────────────────
export const adminGetUsers           = (params)        => api.get("/admin/users", { params });
export const adminGetUserById        = (id)            => api.get(`/admin/users/${id}`);
export const adminUpdateUser         = (id, data)      => api.put(`/admin/users/${id}`, data);
export const adminUpdateUserStatus   = (id, is_active) => api.put(`/admin/users/${id}/status`, { is_active });
export const adminSendUserEmail      = (id, data)      => api.post(`/admin/users/${id}/send-email`, data);
export const adminBroadcastToUsers   = (data)          => api.post("/admin/users/broadcast", data);
export const adminSendContactReply   = (id, data)      => api.post(`/admin/contact-messages/${id}/send-email`, data);

// ── Referral programme ────────────────────────────────────────────────────────
export const adminGetReferrals         = (params = {})   => api.get("/admin/referrals", { params });
export const adminUpdateReferralStatus = (id, data)      => api.put(`/admin/referrals/${id}/status`, data);
export const adminGetReferralSettings  = ()              => api.get("/admin/referrals/settings");
export const adminUpdateReferralSettings = (data)        => api.put("/admin/referrals/settings", data);

// ── Admin notifications ───────────────────────────────────────────────────────
export const getAdminNotifications        = (params) => api.get("/admin/notifications", { params });
export const markNotificationRead         = (id)     => api.put(`/admin/notifications/${id}/read`);
export const markAllNotificationsRead     = ()       => api.put("/admin/notifications/mark-all-read");
export const deleteAdminNotification      = (id)     => api.delete(`/admin/notifications/${id}`);
export const deleteAdminNotificationsBulk = (ids)    => api.delete("/admin/notifications/bulk", { data: { ids } });

// ── Notification rules (admin CRUD) ──────────────────────────────────────────
export const getNotificationRules    = (params) => api.get("/admin/notification-rules", { params });
export const getNotificationRule     = (id)     => api.get(`/admin/notification-rules/${id}`);
export const updateNotificationRule  = (id, data) => api.put(`/admin/notification-rules/${id}`, data);
export const createNotificationRule  = (data)   => api.post("/admin/notification-rules", data);
export const deleteNotificationRule  = (id)     => api.delete(`/admin/notification-rules/${id}`);

// ── User notifications ────────────────────────────────────────────────────────
export const getMyNotifications = (token) =>
  api.get("/users/me/notifications", { headers: { Authorization: `Bearer ${token}` } });
export const markMyNotificationRead = (token, id) =>
  api.put(`/users/me/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const markAllMyNotificationsRead = (token) =>
  api.put("/users/me/notifications/mark-all-read", {}, { headers: { Authorization: `Bearer ${token}` } });
export const deleteMyNotification = (token, id) =>
  api.delete(`/users/me/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
export const deleteMyNotificationsBulk = (token, ids) =>
  api.delete("/users/me/notifications/bulk", { data: { ids }, headers: { Authorization: `Bearer ${token}` } });

// ── Social links (footer) ─────────────────────────────────────────────────────
export const getSocialLinks = () => api.get("/social-links");
export const getSocialLinksAdmin = () => api.get("/admin/social-links");
export const getSocialLinkIconTypes = () => api.get("/admin/social-links/icon-types");
export const createSocialLinkAdmin = (data) => api.post("/admin/social-links", data);
export const updateSocialLinkAdmin = (id, data) => api.put(`/admin/social-links/${id}`, data);
export const deleteSocialLinkAdmin = (id) => api.delete(`/admin/social-links/${id}`);

// ── Site settings (popup + hero images) ──────────────────────────────────────
export const getPublicSiteSettings  = ()       => api.get("/site-settings/public");
export const getAdminSiteSettings   = ()       => api.get("/site-settings");
export const updateAdminSiteSettings = (data)  => api.put("/site-settings", data);
export const uploadPopupImage       = (form)   => api.post("/upload/popup-image", form, { headers: { "Content-Type": "multipart/form-data" } });
export const uploadHeroImage        = (form)   => api.post("/upload/hero-image",  form, { headers: { "Content-Type": "multipart/form-data" } });
export const uploadAdminAvatar      = (form)   => api.post("/upload/admin-avatar", form, { headers: { "Content-Type": "multipart/form-data" } });

// ── Payment methods ───────────────────────────────────────────────────────────
export const getPublicPaymentMethods    = ()         => api.get("/payment-methods/public");
export const adminGetPaymentMethods     = ()         => api.get("/admin/payment-methods");
export const adminCreatePaymentMethod   = (data)     => api.post("/admin/payment-methods", data);
export const adminUpdatePaymentMethod   = (id, data) => api.put(`/admin/payment-methods/${id}`, data);
export const adminDeletePaymentMethod   = (id)       => api.delete(`/admin/payment-methods/${id}`);

// ── Live chat (public — no auth) ──────────────────────────────────────────────
export const getPublicChatFaq   = (channel = "rehoboth")     => api.get(`/chat/faq?channel=${channel}`);

// ── Live chat (user) ──────────────────────────────────────────────────────────
export const getChatThreads     = ()                         => api.get("/users/me/chat/threads");
export const getChatMessages    = (threadId, markRead = true) => api.get(`/users/me/chat/threads/${threadId}/messages${markRead ? "?markRead=1" : ""}`);
export const sendChatMessage    = (threadId, data)           => api.post(`/users/me/chat/threads/${threadId}/messages`, data);
export const requestHumanAgent  = (threadId)                 => api.post(`/users/me/chat/threads/${threadId}/request-human`);
export const getChatFaq         = (channel = "rehoboth")     => api.get(`/users/me/chat/faq?channel=${channel}`);

// ── Live chat (admin) ─────────────────────────────────────────────────────────
export const adminGetChatThreads  = (params)       => api.get("/admin/chat/threads", { params });
export const adminStartChatThread = (data)         => api.post("/admin/chat/threads/start", data);
export const adminGetChatMessages = (threadId)     => api.get(`/admin/chat/threads/${threadId}/messages`);
export const adminSendChatMessage = (threadId, data) => api.post(`/admin/chat/threads/${threadId}/messages`, data);
export const adminPatchChatThread = (threadId, data) => api.patch(`/admin/chat/threads/${threadId}`, data);
export const adminGetChatFaq      = ()             => api.get("/admin/chat/faq");
export const adminCreateChatFaq   = (data)         => api.post("/admin/chat/faq", data);
export const adminUpdateChatFaq   = (id, data)     => api.put(`/admin/chat/faq/${id}`, data);
export const adminDeleteChatFaq   = (id)           => api.delete(`/admin/chat/faq/${id}`);
export const adminGetChatPresence = ()             => api.get("/admin/chat/presence");

// ── CRM — funnel & contacts ───────────────────────────────────────────────────
export const crmGetFunnel       = ()              => api.get("/admin/crm/funnel");
export const crmGetContacts     = (params = {})   => api.get("/admin/crm/contacts", { params });
export const crmGetContact      = (id)            => api.get(`/admin/crm/contacts/${id}`);
export const crmUpdateContact   = (id, data)      => api.patch(`/admin/crm/contacts/${id}`, data);
export const crmAdvanceStage    = (id, data)      => api.post(`/admin/crm/contacts/${id}/advance`, data);

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const campaignGetSummary    = ()              => api.get("/admin/campaigns/summary");
export const campaignList          = (params = {})   => api.get("/admin/campaigns", { params });
export const campaignGetById       = (id)            => api.get(`/admin/campaigns/${id}`);
export const campaignCreate        = (data)          => api.post("/admin/campaigns", data);
export const campaignUpdate        = (id, data)      => api.patch(`/admin/campaigns/${id}`, data);
export const campaignDelete        = (id)            => api.delete(`/admin/campaigns/${id}`);
export const campaignGetPerformance = (id, params)   => api.get(`/admin/campaigns/${id}/performance`, { params });

export default api;