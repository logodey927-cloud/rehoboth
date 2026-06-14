import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { lazyWithRetry as lazy } from "./utils/lazyWithRetry";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AOS from "aos";
import "aos/dist/aos.css";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserAuthProvider } from "./contexts/UserAuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import UserProtectedRoute from "./components/auth/UserProtectedRoute";

// ── Eager: core public + auth routes (needed for first paint) ─────────────────
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPasswordUser from "./pages/auth/ForgotPassword";
import ResetPasswordUser from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import GlassNavbar from "./components/GlassNavbar";
import Home from "./pages/Home";
import Services from "./pages/Services";
import NotFoundPage from "./components/pages/NotFoundPage";
import FooterSection from "./components/layout/Footer";
import Preloader from "./components/common09/Preloader";
import VoucherPopup from "./components/common09/VoucherPopup";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import { AuthProvider } from "./admin/context/AuthContext";
import AdminLayout from "./admin/layout/AdminLayout";
import LoginPage from "./admin/pages/LoginPage";
import ForgotPasswordPage from "./admin/pages/ForgotPasswordPage";
import ResetPasswordPage from "./admin/pages/ResetPasswordPage";
import { TeamMemberAuthProvider } from "./contexts/TeamMemberAuthContext";
import TeamProtectedRoute from "./components/team/ProtectedRoute";
import TeamDashboardLayout from "./components/team/TeamDashboardLayout";
import LiveChatFab from "./components/chat/LiveChatFab";
import UserChatPresence from "./components/chat/UserChatPresence";

// ── PWA components ────────────────────────────────────────────────────────────
import InstallPwaBanner from "./components/pwa/InstallPwaBanner";
import OfflineBanner from "./components/pwa/OfflineBanner";
import PwaUpdatePrompt from "./components/pwa/PwaUpdatePrompt";
import { isStandalone } from "./utils/pwa";
import RouteErrorBoundary from "./components/common09/RouteErrorBoundary";

// ── Lazy: account pages ───────────────────────────────────────────────────────
const AccountLayout           = lazy(() => import("./pages/account/AccountLayout"));
const MyAppointmentsPage      = lazy(() => import("./pages/account/MyAppointmentsPage"));
const MyVouchersPage          = lazy(() => import("./pages/account/MyVouchersPage"));
const MyProfilePage           = lazy(() => import("./pages/account/MyProfilePage"));
const AccountChangePasswordPage = lazy(() => import("./pages/account/ChangePasswordPage"));
const MyNotificationsPage     = lazy(() => import("./pages/account/MyNotificationsPage"));
const MyMessagesPage          = lazy(() => import("./pages/account/MyMessagesPage"));
const ReferAFriendPage        = lazy(() => import("./pages/account/ReferAFriendPage"));
const AppointmentDetailsPage  = lazy(() => import("./pages/account/AppointmentDetailsPage"));
const AccountVoucherDetailsPage = lazy(() => import("./pages/account/VoucherDetailsPage"));
const MyAccountCalendarPage   = lazy(() => import("./pages/account/MyAccountCalendarPage"));

// ── Lazy: admin pages (heaviest bundle) ───────────────────────────────────────
const UsersPage               = lazy(() => import("./admin/pages/UsersPage"));
const AdminDashboard          = lazy(() => import("./admin/pages/AdminDashboard"));
const AppointmentsPage        = lazy(() => import("./admin/pages/AppointmentsPage"));
const PaymentsPage            = lazy(() => import("./admin/pages/PaymentsPage"));
const ContactMessagesPage     = lazy(() => import("./admin/pages/ContactMessagesPage"));
const ReviewsPage             = lazy(() => import("./admin/pages/ReviewsPage"));
const SubscribersPage         = lazy(() => import("./admin/pages/SubscribersPage"));
const SocialLinksPage         = lazy(() => import("./admin/pages/SocialLinksPage"));
const SiteSettingsPage        = lazy(() => import("./admin/pages/SiteSettingsPage"));
const BlockedTimeSlotsPage    = lazy(() => import("./admin/pages/BlockedTimeSlotsPage"));
const CalendarPage            = lazy(() => import("./admin/pages/CalendarPage"));
const ChangePasswordPage      = lazy(() => import("./admin/pages/ChangePasswordPage"));
const VouchersPage            = lazy(() => import("./admin/pages/VouchersPage"));
const VoucherFormPage         = lazy(() => import("./admin/pages/VoucherFormPage"));
const VoucherDetailsPage      = lazy(() => import("./admin/pages/VoucherDetailsPage"));
const VoucherVerifyPage       = lazy(() => import("./admin/pages/VoucherVerifyPage"));
const ReferralsPage           = lazy(() => import("./admin/pages/ReferralsPage"));
const ReferralSettingsPage    = lazy(() => import("./admin/pages/ReferralSettingsPage"));
const LiveChatPage            = lazy(() => import("./admin/pages/LiveChatPage"));
const PaymentSettingsPage     = lazy(() => import("./admin/pages/PaymentSettingsPage"));
const NotificationSettingsPage= lazy(() => import("./admin/pages/NotificationSettingsPage"));
const AdminNotificationsPage  = lazy(() => import("./admin/pages/AdminNotificationsPage"));
const ServicesPage            = lazy(() => import("./admin/pages/ServicesPage"));
const ServiceFormPage         = lazy(() => import("./admin/pages/ServiceFormPage"));
const BlogPage                = lazy(() => import("./admin/pages/BlogPage"));
const BlogFormPage            = lazy(() => import("./admin/pages/BlogFormPage"));
const TeamPage                = lazy(() => import("./admin/pages/TeamPage"));
const TeamFormPage            = lazy(() => import("./admin/pages/TeamFormPage"));
const CrmFunnelPage           = lazy(() => import("./admin/pages/CrmFunnelPage"));
const CrmContactsPage         = lazy(() => import("./admin/pages/CrmContactsPage"));
const CrmCampaignsPage        = lazy(() => import("./admin/pages/CrmCampaignsPage"));

// ── Lazy: team member dashboard ───────────────────────────────────────────────
const TeamLogin               = lazy(() => import("./pages/team/TeamLogin"));
const TeamForgotPassword      = lazy(() => import("./pages/team/ForgotPassword"));
const TeamResetPassword       = lazy(() => import("./pages/team/ResetPassword"));
const TeamDashboard           = lazy(() => import("./pages/team/Dashboard"));
const MyAppointments          = lazy(() => import("./pages/team/MyAppointments"));
const TeamCalendar            = lazy(() => import("./pages/team/Calendar"));
const MyProfile               = lazy(() => import("./pages/team/MyProfile"));
const ChangePasswordTeam      = lazy(() => import("./pages/team/ChangePassword"));

// ── Lazy: less-critical public pages ─────────────────────────────────────────
const Products                = lazy(() => import("./pages/Products"));
const Blog                    = lazy(() => import("./pages/Blog"));
const BlogDetails             = lazy(() => import("./pages/BlogDetails"));
const Vouchers                = lazy(() => import("./pages/Vouchers"));
const VoucherDetails          = lazy(() => import("./pages/VoucherDetails"));
const Appointment             = lazy(() => import("./pages/Appointment"));
const AppointmentSummary      = lazy(() => import("./pages/AppointmentSummary"));
const StripeAppointmentPaymentResult = lazy(() => import("./pages/payment/StripeAppointmentPaymentResult"));
const StripeVoucherPaymentResult = lazy(() => import("./pages/payment/StripeVoucherPaymentResult"));
const About                   = lazy(() => import("./pages/About"));
const Team                    = lazy(() => import("./pages/Team"));
const TeamDetails             = lazy(() => import("./pages/TeamDetails"));
const Contact                 = lazy(() => import("./pages/Contact"));
const Gallery                 = lazy(() => import("./pages/Gallery"));
const Calender                = lazy(() => import("./pages/Calender"));
const ComingSoonPage          = lazy(() => import("./components/pages/ComingSoonPage"));
const Testimonials            = lazy(() => import("./pages/Testimonials"));
const OfflinePage             = lazy(() => import("./pages/OfflinePage"));

function ScrollToTop() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Scroll to top on page load/refresh
  useEffect(() => {
    // Scroll immediately on mount
    window.scrollTo(0, 0);
    
    // Also scroll after a small delay to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}

export default function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const navTimerRef = useRef(null);

  // ✅ Disable browser scroll restoration (prevents browser from remembering scroll position on refresh)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // ✅ Initialize AOS globally once when app mounts
  useEffect(() => {
    AOS.init({
      once: true, // run animation only once
      duration: 1000, // animation duration (ms)
      offset: 0, // trigger point offset
      easing: "ease-in-out",
      delay: 100,
    });
  }, []);

  // ✅ Refresh AOS on route change so new elements animate properly
  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  const showPreloader = (ms = 1500) => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    setIsNavigating(true);
    navTimerRef.current = setTimeout(() => setIsNavigating(false), ms);
  };

  // Handle initial load — faster when running as installed PWA
  useEffect(() => {
    const ms = isStandalone() ? 900 : 3000;
    const timer = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(timer);
  }, []);

  // Expose a global setter for programmatic navigations
  useEffect(() => {
    window.__setNavigating = (v) => {
      if (v) {
        showPreloader(3000);
      } else {
        setIsNavigating(false);
      }
    };
    return () => {
      delete window.__setNavigating;
    };
  }, []);

  // Handle route changes (synchronously) to show preloader
  // Skip admin/team/account routes — they manage their own loading states
  useLayoutEffect(() => {
    if (
      !loading &&
      !location.pathname.startsWith("/my-account") &&
      !location.pathname.startsWith("/admin") &&
      !location.pathname.startsWith("/team/")
    ) {
      showPreloader(3000);
    }
    // loading intentionally omitted — including it would restart preloader after initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Global click capture: show preloader on internal links
  useEffect(() => {
    const onClickCapture = (e) => {
      if (loading || isNavigating) return;
      let el = e.target;
      while (el && el !== document.body) {
        if (el.tagName === "A" && el.getAttribute("href")) {
          const href = el.getAttribute("href");
          const isInternal =
            href && href.startsWith("/") && !href.startsWith("//");
          if (
            isInternal &&
            !href.startsWith("/my-account") &&
            !href.startsWith("/admin") &&
            !href.startsWith("/team/")
          ) {
            showPreloader(3000);
            break;
          }
        }
        el = el.parentElement;
      }
    };
    document.addEventListener("click", onClickCapture, { capture: true });
    return () =>
      document.removeEventListener("click", onClickCapture, {
        capture: true,
      });
  }, [loading, isNavigating]);

  const isAdminRoute = location.pathname.startsWith("/admin");
  
  // Check if it's a team route (dashboard, auth, etc.) - exclude public team pages
  const isPublicTeamPage = 
    location.pathname === "/team" || 
    /^\/team\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(location.pathname);
  
  const isTeamRoute = 
    location.pathname.startsWith("/team/") && !isPublicTeamPage;

  const isMyAccountRoute = location.pathname.startsWith("/my-account");

  // Exclude admin, team, and customer account routes from preloader
  const shouldShowPreloader = !isAdminRoute && !isTeamRoute && !isMyAccountRoute;

  return (
    <>
      {/* Show preloader on initial load or route change (skip for admin and team routes) */}
      {(loading || isNavigating) && shouldShowPreloader && <Preloader />}

      {/* PWA: offline status banner (all routes) */}
      <OfflineBanner />

      {/* PWA: SW update notification */}
      <PwaUpdatePrompt />

      {/* Scroll reset on page change */}
      <ScrollToTop />

      {/* Admin Routes - No Navbar/Footer */}
      {isAdminRoute ? (
        <AuthProvider>
          <RouteErrorBoundary>
          <Suspense fallback={<Preloader />}>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/new" element={<ServiceFormPage />} />
              <Route path="services/edit/:id" element={<ServiceFormPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/new" element={<BlogFormPage />} />
              <Route path="blog/edit/:id" element={<BlogFormPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="team/new" element={<TeamFormPage />} />
              <Route path="team/edit/:id" element={<TeamFormPage />} />
              <Route path="vouchers" element={<VouchersPage />} />
              <Route path="vouchers/new" element={<VoucherFormPage />} />
              <Route path="vouchers/edit/:id" element={<VoucherFormPage />} />
              <Route path="vouchers/:id" element={<VoucherDetailsPage />} />
              <Route path="vouchers/verify" element={<VoucherVerifyPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="referrals" element={<ReferralsPage />} />
              <Route path="referrals/settings" element={<ReferralSettingsPage />} />
              <Route path="live-chat" element={<LiveChatPage />} />
              <Route path="payment-settings" element={<PaymentSettingsPage />} />
              <Route path="notification-settings" element={<NotificationSettingsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="contact-messages" element={<ContactMessagesPage />} />
              <Route path="social-links" element={<SocialLinksPage />} />
              <Route path="site-settings" element={<SiteSettingsPage />} />
              <Route path="subscribers" element={<SubscribersPage />} />
              <Route path="blocked-time-slots" element={<BlockedTimeSlotsPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="crm/funnel" element={<CrmFunnelPage />} />
              <Route path="crm/contacts" element={<CrmContactsPage />} />
              <Route path="crm/campaigns" element={<CrmCampaignsPage />} />
            </Route>
          </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </AuthProvider>
      ) : (
        <UserAuthProvider>
        <NotificationProvider>
        <>
          {/* Voucher Popup - Only on public routes (not team routes) */}
          {!isTeamRoute && <VoucherPopup />}
          {!isTeamRoute && <UserChatPresence />}
          {!isTeamRoute && <LiveChatFab />}
          {/* PWA install banner — public + account only, not admin/team dashboard */}
          {!isTeamRoute && <InstallPwaBanner />}

          {/* Header - Hide for team routes */}
          {!isTeamRoute && <GlassNavbar />}

          {/* Main Routes */}
          <RouteErrorBoundary>
          <Suspense fallback={<Preloader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/vouchers/:id" element={<VoucherDetails />} />
            <Route path="/appointment" element={<Navigate to="/book-appointment" replace />} />
            <Route path="/book-appointment" element={<Appointment />} />
            <Route
              path="/payment/appointment/success"
              element={<StripeAppointmentPaymentResult mode="success" />}
            />
            <Route
              path="/payment/appointment/cancel"
              element={<StripeAppointmentPaymentResult mode="cancel" />}
            />
            <Route
              path="/payment/voucher/success"
              element={<StripeVoucherPaymentResult mode="success" />}
            />
            <Route
              path="/payment/voucher/cancel"
              element={<StripeVoucherPaymentResult mode="cancel" />}
            />
            <Route
              path="/appointment-summary/:id"
              element={<AppointmentSummary />}
            />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/:id" element={<TeamDetails />} />
            
            {/* Team Member Auth Routes */}
            <Route
              path="/team/login"
              element={
                <TeamMemberAuthProvider>
                  <TeamLogin />
                </TeamMemberAuthProvider>
              }
            />
            <Route
              path="/team/forgot-password"
              element={
                <TeamMemberAuthProvider>
                  <TeamForgotPassword />
                </TeamMemberAuthProvider>
              }
            />
            <Route
              path="/team/reset-password"
              element={
                <TeamMemberAuthProvider>
                  <TeamResetPassword />
                </TeamMemberAuthProvider>
              }
            />
            
            {/* Team Member Dashboard Routes */}
            <Route
              path="/team"
              element={
                <TeamMemberAuthProvider>
                  <TeamProtectedRoute>
                    <TeamDashboardLayout />
                  </TeamProtectedRoute>
                </TeamMemberAuthProvider>
              }
            >
              <Route path="dashboard" element={<TeamDashboard />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="calendar" element={<TeamCalendar />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="change-password" element={<ChangePasswordTeam />} />
            </Route>
            
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/calender" element={<Calender />} />
            <Route path="/coming-soon" element={<ComingSoonPage />} />

            {/* ── Customer auth routes ──────────────────────────── */}
            <Route path="/login"            element={<Login />} />
            <Route path="/register"         element={<Register />} />
            <Route path="/forgot-password"  element={<ForgotPasswordUser />} />
            <Route path="/reset-password"   element={<ResetPasswordUser />} />
            <Route path="/verify-email"     element={<VerifyEmail />} />

            {/* ── Customer My Account (protected) ──────────────── */}
            <Route
              path="/my-account"
              element={<UserProtectedRoute><AccountLayout /></UserProtectedRoute>}
            >
              <Route index         element={<MyAppointmentsPage />} />
              <Route path="appointments"   element={<MyAppointmentsPage />} />
              <Route path="appointments/:id" element={<AppointmentDetailsPage />} />
              <Route path="calendar"       element={<MyAccountCalendarPage />} />
              <Route path="vouchers"       element={<MyVouchersPage />} />
              <Route path="vouchers/:id"   element={<AccountVoucherDetailsPage />} />
              <Route path="profile"        element={<MyProfilePage />} />
              <Route path="notifications"  element={<MyNotificationsPage />} />
              <Route path="messages"       element={<MyMessagesPage />} />
              <Route path="refer-a-friend" element={<ReferAFriendPage />} />
              <Route path="change-password"element={<AccountChangePasswordPage />} />
            </Route>

            <Route path="/offline" element={<OfflinePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
          </RouteErrorBoundary>

          {/* Footer - Hide for team routes */}
          {!isTeamRoute && <FooterSection />}
        </>
        </NotificationProvider>
        </UserAuthProvider>
      )}
    </>
  );
}
