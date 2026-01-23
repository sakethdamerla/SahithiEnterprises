import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import { AdminGuard } from './components/AdminGuard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import './index.css';

import { Footer } from './components/Footer';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { AnnouncementPopup } from './components/AnnouncementNotification';
import { NotificationPersistentPrompt } from './components/NotificationPersistentPrompt';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Category = lazy(() => import('./pages/Category').then(module => ({ default: module.Category })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Announcements = lazy(() => import('./pages/Announcements').then(module => ({ default: module.Announcements })));

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

  const { isAdmin } = useAuth();

  // Record Visit on Entry - Only once per session
  useEffect(() => {
    const visitRecorded = sessionStorage.getItem('visitRecorded');

    if (!visitRecorded && !isAdmin) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Send local date (YYYY-MM-DD) to ensure visits are recorded for the correct day in the user's timezone
      const localDate = new Date().toLocaleDateString('en-CA');

      fetch(`${API_URL}/record-visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: localDate })
      })
        .then(() => {
          sessionStorage.setItem('visitRecorded', 'true');
        })
        .catch(err => console.error("Error recording visit", err));
    }
  }, []);

  // if (isLoading) {
  //   return <Loader />;
  // }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {!location.pathname.startsWith('/admin/login') && <Header />}

      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/announcements" element={<Announcements />} />
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

      {!location.pathname.startsWith('/admin') && <Footer />}

      <PWAUpdatePrompt />
      <AnnouncementPopup />
      <NotificationPersistentPrompt />
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
