import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';

import { AuthProvider } from './context/AuthContext';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import { AdminGuard } from './components/AdminGuard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import './index.css';

import { Footer } from './components/Footer';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Category = lazy(() => import('./pages/Category').then(module => ({ default: module.Category })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

/**
 * Component that automatically scrolls the window to the top
 * whenever the route pathname changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Root application component
 * Sets up routing, global providers, and shared layout (Header/Footer)
 */
function AppLayout() {
  const location = useLocation();

  // Global loading check removed to improve TTI (Time to Interactive).
  // Individual pages will handle their own data loading states.
  // const { isLoading } = useProducts(); 

  // Record Visit on Entry
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/record-visit`, { method: 'POST' })
      .catch(err => console.error("Error recording visit", err));
  }, []);

  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
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

      <Footer />

      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AppLayout />
        </BrowserRouter>
      </ProductsProvider>
    </AuthProvider>
  );
}
