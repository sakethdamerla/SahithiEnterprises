import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { AdminGuard } from './components/AdminGuard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import './index.css';

/**
 * Root application component
 * Sets up routing, global providers, and shared layout (Header/Footer)
 */
export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Header />

            <main className="flex-1">
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
            </main>

            <Footer />
            <PWAInstallPrompt />
          </div>
        </BrowserRouter>
      </ProductsProvider>
    </AuthProvider>
  );
}
