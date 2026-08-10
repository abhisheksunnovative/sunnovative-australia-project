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
const EpcMyRateCard        = lazy(() => import('../pages/epc/profile/MyRateCard'));
const EpcWallet            = lazy(() => import('../pages/epc/wallet/EpcWallet')); // ✅ ADDED
const EpcRewardsDashboard  = lazy(() => import('../pages/epc/rewards/EpcRewardsDashboard')); // ✅ ADDED
const EpcCalendarView      = lazy(() => import('../pages/epc/calendar/EpcCalendarView'));
const EpcStcDashboard      = lazy(() => import('../pages/epc/dashboard/EpcStcDashboard'));
const EpcIncentiveChecker  = lazy(() => import('../pages/epc/dashboard/EpcIncentiveChecker'));

// Inline content-area loader (sidebar stays static!)
const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-xs font-medium">Loading...</p>
    </div>
  </div>
);

const EpcRoutes = () => (
  <EpcAuthProvider>
    <Routes>
      {/* Public — NO Suspense needed, these are lightweight */}
      <Route path="login"    element={<Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}><EpcLogin /></Suspense>} />
      <Route path="register" element={<Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}><EpcRegister /></Suspense>} />

      {/* Protected — EpcLayout renders sidebar+header first, then Outlet inside Suspense */}
      <Route
        element={
          <EpcProtectedRoute>
            <EpcLayout />
          </EpcProtectedRoute>
        }
      >
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<Suspense fallback={<PageLoader />}><EpcDashboard /></Suspense>} />
        <Route path="enquiries"     element={<Suspense fallback={<PageLoader />}><EpcMyEnquiries /></Suspense>} />
        <Route path="orders"        element={<Suspense fallback={<PageLoader />}><EpcOrders /></Suspense>} />
        <Route path="orders/:id"    element={<Suspense fallback={<PageLoader />}><EpcOrderDetail /></Suspense>} />
        <Route path="projects"      element={<Suspense fallback={<PageLoader />}><EpcProjectManagement /></Suspense>} />
        <Route path="projects/:id"  element={<Suspense fallback={<PageLoader />}><EpcProjectDetail /></Suspense>} />
        <Route path="team"          element={<Suspense fallback={<PageLoader />}><EpcMyTeam /></Suspense>} />
        <Route path="settings"      element={<Suspense fallback={<PageLoader />}><EpcAdminSettings /></Suspense>} />
        <Route path="plan"          element={<Suspense fallback={<PageLoader />}><EpcMyPlan /></Suspense>} />
        <Route path="profile"       element={<Suspense fallback={<PageLoader />}><EpcMyProfile /></Suspense>} />
        <Route path="rate-card"     element={<Suspense fallback={<PageLoader />}><EpcMyRateCard /></Suspense>} />
        <Route path="calendar"      element={<Suspense fallback={<PageLoader />}><EpcCalendarView /></Suspense>} />
        <Route path="wallet"        element={<Suspense fallback={<PageLoader />}><EpcWallet /></Suspense>} />
        <Route path="rewards"       element={<Suspense fallback={<PageLoader />}><EpcRewardsDashboard /></Suspense>} />
        <Route path="stc-dashboard" element={<Suspense fallback={<PageLoader />}><EpcStcDashboard /></Suspense>} />
        <Route path="incentives"    element={<Suspense fallback={<PageLoader />}><EpcIncentiveChecker /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  </EpcAuthProvider>
);

export default EpcRoutes;