import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';

/**
 * Header component with sticky navigation, search, and category dropdown
 * Shows admin link only when user is logged in as admin
 * Includes responsive mobile menu with hamburger icon
 */
export function Header() {
  const { isAdmin, logout, adminUser } = useAuth();
  const { getCategories } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = getCategories();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#5E35B1] shadow-md">
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold font-heading text-white hover:text-[#D1C4E9] transition-colors"
            aria-label="Home"
          >
            Sahithi Enterprises
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-[#D1C4E9] hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/announcements"
              className="text-[#D1C4E9] hover:text-white transition-colors font-medium"
            >
              Announcements
            </Link>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
                className="text-[#D1C4E9] hover:text-white transition-colors font-medium flex items-center"
                aria-expanded={categoryDropdownOpen}
                aria-haspopup="true"
              >
                Categories
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {categoryDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                  role="menu"
                >
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/category/${category}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-[#5E35B1] transition-colors capitalize"
                      role="menuitem"
                      onClick={() => setCategoryDropdownOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>



            {/* Desktop Navigation */}

            {/* Desktop Navigation */}

            {/* Admin Links (Desktop) */}
            {isAdmin && (
              <div className="relative group">
                <button className="text-[#D1C4E9] hover:text-white transition-colors font-medium flex items-center gap-1">
                  Manage
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-100">
                  <Link to="/admin?view=products" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-[#5E35B1]">
                    Manage Products
                  </Link>
                  <Link to="/admin?view=interests" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-[#5E35B1]">
                    User Interests
                  </Link>
                  <Link to="/admin?view=traffic" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-[#5E35B1]">
                    Site Analytics
                  </Link>
                  <Link to="/admin?view=announcements" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-[#5E35B1]">
                    Manage Announcements
                  </Link>
                  {(adminUser?.role === 'superadmin' || adminUser?.permissions?.content !== false) && (
                    <Link to="/admin?view=content" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-[#5E35B1]">
                      Card Editing
                    </Link>
                  )}
                  {adminUser?.role === 'superadmin' && (
                    <>
                      <Link to="/admin?view=admins" className="block px-4 py-2.5 text-sm text-[#5E35B1] font-semibold bg-primary-50/50 hover:bg-primary-50 border-t border-gray-50 mt-1">
                        Admin Management
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Logout Button - Only visible when logged in */}
            {isAdmin && (
              <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                <span className="text-white font-medium">Hello, {adminUser?.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
}
