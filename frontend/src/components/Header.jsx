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
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold font-heading text-primary-600 hover:text-primary-700 transition-colors"
            aria-label="Home"
          >
            Sahithi Enterprises
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/announcements"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Announcements
            </Link>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center"
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
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors capitalize"
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
                <button className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center gap-1">
                  Manage
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-100">
                  <Link to="/admin?view=products" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                    Manage Products
                  </Link>
                  <Link to="/admin?view=interests" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                    User Interests
                  </Link>
                  <Link to="/admin?view=traffic" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                    Site Analytics
                  </Link>
                  <Link to="/admin?view=announcements" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                    Manage Announcements
                  </Link>
                  {adminUser?.role === 'superadmin' && (
                    <Link to="/admin?view=admins" className="block px-4 py-2.5 text-sm text-primary-700 font-semibold bg-gray-50/50 hover:bg-primary-50 border-t border-gray-50 mt-1">
                      Admin Management
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Logout Button - Only visible when logged in */}
            {isAdmin && (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <span className="text-gray-700 font-medium">Hello, {adminUser?.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Sidebar Menu - Always rendered for smooth transitions */}
        <div
          className={`fixed inset-0 z-[500] md:hidden transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <span className="text-xl font-bold font-heading text-primary-700">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <span>Home</span>
                </Link>
                {!isAdmin && (
                  <Link
                    to="/announcements"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    <span>Announcements</span>
                  </Link>
                )}
              </div>

              {/* Categories / Admin Dashboard */}
              <div>
                {!isAdmin ? (
                  <>
                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          to={`/category/${category}`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors capitalize group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary-500 transition-colors"></span>
                          <span>{category}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Dashboard</h3>
                    <div className="space-y-1">
                      {/* <Link
                        to="/admin"
                        className="flex items-center space-x-3 px-4 py-3 text-primary-700 bg-primary-50 rounded-xl transition-colors font-bold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        <span>Full Dashboard</span>
                      </Link> */}

                      {/* Detailed Admin Routes in Sidebar */}
                      {[
                        { id: 'products', label: 'Manage Products', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
                        { id: 'interests', label: 'User Interests', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                        { id: 'traffic', label: 'Site Analytics', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                        { id: 'announcements', label: 'Manage Announcements', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
                      ].filter(item => {
                        if (adminUser?.role === 'superadmin') return true;
                        return adminUser?.permissions?.[item.id] !== false;
                      }).map(item => (
                        <Link
                          key={item.id}
                          to={`/admin?view=${item.id}`}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-xl transition-all text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ))}

                      {/* Superadmin Only: Admin Management */}
                      {adminUser?.role === 'superadmin' && (
                        <Link
                          to="/admin?view=admins"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded-xl transition-all text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          <span>Admin Management</span>
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>

              {isAdmin && (
                <div className="mt-auto pt-4 border-t">
                  <div className="px-4 mb-3 text-gray-700 font-medium">
                    Hello, {adminUser?.username}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            <div className={`p-4 bg-gray-50 border-t text-center text-xs text-gray-400 ${!isAdmin ? 'mt-auto' : ''}`}>
              &copy; Sahithi Enterprises
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
