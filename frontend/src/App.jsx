import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import { AdminGuard } from './components/AdminGuard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Loader } from './components/Loader';
import './index.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Category = lazy(() => import('./pages/Category').then(module => ({ default: module.Category })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

/**
 * Root application component
 * Sets up routing, global providers, and shared layout (Header/Footer)
 */
function AppLayout() {
  const location = useLocation();
  const showFooter = location.pathname !== '/admin/login';
  const { isLoading } = useProducts();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {showFooter && <Footer />}
      <PWAInstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ProductsProvider>
    </AuthProvider>
  );
}
