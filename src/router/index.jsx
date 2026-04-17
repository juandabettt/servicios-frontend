import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import AppShell from '../components/layout/AppShell';

// Lazy-load pages for better performance
import { lazy, Suspense } from 'react';

const Onboarding = lazy(() => import('../pages/Onboarding'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Invoices = lazy(() => import('../pages/Invoices'));
const InvoiceUpload = lazy(() => import('../pages/InvoiceUpload'));
const InvoiceDetail = lazy(() => import('../pages/InvoiceDetail'));
const AiInsights = lazy(() => import('../pages/AiInsights'));
const Payments = lazy(() => import('../pages/Payments'));
const PaymentResult = lazy(() => import('../pages/PaymentResult'));
const Notifications = lazy(() => import('../pages/Notifications'));
const AutoPay = lazy(() => import('../pages/AutoPay'));
const Profile = lazy(() => import('../pages/Profile'));
const Properties = lazy(() => import('../pages/Properties'));
const DatosPersonales = lazy(() => import('../pages/profile/DatosPersonales'));
const MetodosPago = lazy(() => import('../pages/profile/MetodosPago'));
const Seguridad = lazy(() => import('../pages/profile/Seguridad'));
const AyudaSoporte = lazy(() => import('../pages/profile/AyudaSoporte'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-surface">
      <div className="w-8 h-8 border-4 border-primary-fixed border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute() {
  const { accessToken } = useAuthStore();
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { accessToken } = useAuthStore();
  return !accessToken ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/', element: <Suspense fallback={<LoadingSpinner />}><Onboarding /></Suspense> },
      { path: '/login', element: <Suspense fallback={<LoadingSpinner />}><Login /></Suspense> },
      { path: '/register', element: <Suspense fallback={<LoadingSpinner />}><Register /></Suspense> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense> },
          { path: '/invoices', element: <Suspense fallback={<LoadingSpinner />}><Invoices /></Suspense> },
          { path: '/invoices/upload', element: <Suspense fallback={<LoadingSpinner />}><InvoiceUpload /></Suspense> },
          { path: '/invoices/:id', element: <Suspense fallback={<LoadingSpinner />}><InvoiceDetail /></Suspense> },
          { path: '/payments/:invoiceId', element: <Suspense fallback={<LoadingSpinner />}><Payments /></Suspense> },
          { path: '/payments/result/:transactionId', element: <Suspense fallback={<LoadingSpinner />}><PaymentResult /></Suspense> },
          { path: '/ai', element: <Suspense fallback={<LoadingSpinner />}><AiInsights /></Suspense> },
          { path: '/notifications', element: <Suspense fallback={<LoadingSpinner />}><Notifications /></Suspense> },
          { path: '/autopay', element: <Suspense fallback={<LoadingSpinner />}><AutoPay /></Suspense> },
          { path: '/profile', element: <Suspense fallback={<LoadingSpinner />}><Profile /></Suspense> },
          { path: '/properties', element: <Suspense fallback={<LoadingSpinner />}><Properties /></Suspense> },
          { path: '/profile/datos-personales', element: <Suspense fallback={<LoadingSpinner />}><DatosPersonales /></Suspense> },
          { path: '/profile/metodos-pago', element: <Suspense fallback={<LoadingSpinner />}><MetodosPago /></Suspense> },
          { path: '/profile/seguridad', element: <Suspense fallback={<LoadingSpinner />}><Seguridad /></Suspense> },
          { path: '/profile/ayuda', element: <Suspense fallback={<LoadingSpinner />}><AyudaSoporte /></Suspense> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
