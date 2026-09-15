import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Hero from './components/Hero.jsx'
import Strip from './components/Strip.jsx'
import About from './components/About.jsx'
import Products from './components/Products.jsx'
import RitualVideo from './components/RitualVideo.jsx'
import Visit from './components/Visit.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
import OutageBanner from './components/OutageBanner.jsx'
import MaintenancePlaceholder from './components/MaintenancePlaceholder.jsx'
import { useScrollToHash } from './hooks/useScrollToHash.js'
import { useSiteStatus } from './hooks/useSiteStatus.js'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import EmailVerifyPage from './pages/EmailVerifyPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import ServiceDetailPage from './pages/ServiceDetailPage.jsx'
import BasketPage from './pages/BasketPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import PaymentReturnPage from './pages/PaymentReturnPage.jsx'
import ThankYouPage from './pages/ThankYouPage.jsx'
import OrderDetailPage from './pages/OrderDetailPage.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireRole from './components/RequireRole.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import ProductsPage from './pages/admin/ProductsPage.jsx'
import ServicesPage from './pages/admin/ServicesPage.jsx'
import BookingsPage from './pages/admin/BookingsPage.jsx'
import OrdersPage from './pages/admin/OrdersPage.jsx'
import CustomersPage from './pages/admin/CustomersPage.jsx'
import CustomerDetailPage from './pages/admin/CustomerDetailPage.jsx'
import BlacklistPage from './pages/admin/BlacklistPage.jsx'
import FraudPage from './pages/admin/FraudPage.jsx'
import RefundRequestsPage from './pages/admin/RefundRequestsPage.jsx'
import BranchesPage from './pages/admin/BranchesPage.jsx'
import DeliveryPage from './pages/admin/DeliveryPage.jsx'
import AdminsPage from './pages/admin/AdminsPage.jsx'
import LogsPage from './pages/admin/LogsPage.jsx'
import SettingsPage from './pages/admin/SettingsPage.jsx'
import MaintenancePage from './pages/admin/MaintenancePage.jsx'

// Routes that must ALWAYS be reachable regardless of maintenance mode —
// otherwise turning maintenance mode on would lock the admin out of the
// one page (Maintenance) that turns it back off. /login and the password
// reset flow are included too, since you can't reach /admin without
// signing in first.
const MAINTENANCE_BYPASS_EXACT = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
function isMaintenanceBypassPath(pathname) {
  return pathname.startsWith('/admin') || MAINTENANCE_BYPASS_EXACT.includes(pathname)
}

function Storefront() {
  useScrollToHash()
  return (
    <>
      <Nav />
      <Hero />
      <Strip />
      <About />
      <Products />
      <RitualVideo />
      <Visit />
      <Footer />
    </>
  )
}

export default function App() {
  const location = useLocation()
  const { loading, maintenanceMode, maintenanceSchedule, upcomingOutage } = useSiteStatus()
  const bypass = isMaintenanceBypassPath(location.pathname)

  // Never gate admin/login/password-reset — this is what lets an admin
  // actually get back in to turn maintenance mode off. Also never gate
  // while the status is still loading, so a slow API response doesn't
  // flash the placeholder for every visitor on every page load.
  if (!loading && maintenanceMode && !bypass) {
    return (
      <>
        <ScrollToTop />
        <MaintenancePlaceholder schedule={maintenanceSchedule} />
      </>
    )
  }

  return (
    <>
      <ScrollToTop />
      {!bypass && <OutageBanner outage={upcomingOutage} />}
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<EmailVerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />
        <Route path="/basket" element={<BasketPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/payment/return" element={<PaymentReturnPage />} />
        <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole roles={['admin', 'superadmin']}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="blacklist" element={<BlacklistPage />} />
          <Route path="fraud" element={<FraudPage />} />
          <Route path="refunds" element={<RefundRequestsPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          {/* Page content (text, photos, backgrounds) moved into
              Settings — redirect anyone with the old link bookmarked. */}
          <Route path="homepage-content" element={<Navigate to="/admin/settings" replace />} />
          <Route
            path="admins"
            element={
              <RequireRole roles={['superadmin']}>
                <AdminsPage />
              </RequireRole>
            }
          />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>
      </Routes>
      {/* Rendered once at the top level (outside all routes) so they
          show on every page — Shop, checkout, account, anywhere — not
          just the homepage. CartDrawer used to only be mounted inside
          Storefront, so "Add to Basket" from any other page silently
          did nothing visible; moved here to fix that. */}
      <CartDrawer />
      <WhatsAppButton />
    </>
  )
}
