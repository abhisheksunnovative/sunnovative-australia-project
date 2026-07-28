import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EpcAuthProvider } from '../context/EpcAuthContext';
import EpcProtectedRoute from '../components/epc/EpcProtectedRoute';
import EpcLayout from '../components/epc/EpcLayout';

// 🚀 Lazy Loading applied to all pages
const EpcLogin             = lazy(() => import('../pages/epc/auth/EpcLogin'));
const EpcRegister          = lazy(() => import('../pages/epc/auth/EpcRegister'));
const EpcDashboard         = lazy(() => import('../pages/epc/dashboard/EpcDashboard'));
const EpcMyEnquiries       = lazy(() => import('../pages/epc/enquiries/EpcMyEnquiries'));
const EpcOrders            = lazy(() => import('../pages/epc/orders/EpcOrders'));
const EpcOrderDetail       = lazy(() => import('../pages/epc/orders/EpcOrderDetail'));
const EpcProjectManagement = lazy(() => import('../pages/epc/projects/EpcProjectManagement'));
const EpcProjectDetail     = lazy(() => import('../pages/epc/projects/EpcProjectDetail'));
const EpcMyTeam            = lazy(() => import('../pages/epc/team/EpcMyTeam'));
const EpcAdminSettings     = lazy(() => import('../pages/epc/settings/EpcAdminSettings'));
const EpcMyPlan            = lazy(() => import('../pages/epc/plan/EpcMyPlan'));
const EpcMyProfile         = lazy(() => import('../pages/epc/profile/EpcMyProfile'));
const EpcWallet            = lazy(() => import('../pages/epc/wallet/EpcWallet')); // ✅ ADDED
const EpcRewardsDashboard  = lazy(() => import('../pages/epc/rewards/EpcRewardsDashboard')); // ✅ ADDED
const EpcCalendarView      = lazy(() => import('../pages/epc/calendar/EpcCalendarView'));

// Ek pyara sa simple loader fallback ke liye (Isko tum apne CSS/Tailwind se style kar sakte ho)
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>
    Loading section...
  </div>
);

const EpcRoutes = () => (
  <EpcAuthProvider>
    {/* Suspense is mandatory when using React.lazy */}
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="login"    element={<EpcLogin />} />
        <Route path="register" element={<EpcRegister />} />

        {/* Protected — EpcLayout ke andar (sidebar + topbar) */}
        <Route
          element={
            <EpcProtectedRoute>
              <EpcLayout />
            </EpcProtectedRoute>
          }
        >
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<EpcDashboard />} />
          <Route path="enquiries"     element={<EpcMyEnquiries />} />
          <Route path="orders"        element={<EpcOrders />} />
          <Route path="orders/:id"    element={<EpcOrderDetail />} />
          <Route path="projects"      element={<EpcProjectManagement />} />
          <Route path="projects/:id"  element={<EpcProjectDetail />} />
          <Route path="team"          element={<EpcMyTeam />} />
          <Route path="settings"      element={<EpcAdminSettings />} />
          <Route path="plan"          element={<EpcMyPlan />} />
          <Route path="profile"       element={<EpcMyProfile />} />
          <Route path="calendar"      element={<EpcCalendarView />} />
          <Route path="wallet"        element={<EpcWallet />} /> {/* ✅ ADDED */}
          <Route path="rewards"       element={<EpcRewardsDashboard />} /> {/* ✅ ADDED */}
        </Route>

        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </Suspense>
  </EpcAuthProvider>
);

export default EpcRoutes;