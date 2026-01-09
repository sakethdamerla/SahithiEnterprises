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
  const { isAdmin, logout } = useAuth();
  const { getCategories } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = getCategories();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const targetPath = location.pathname.startsWith('/category/')
        ? `${location.pathname}?search=${encodeURIComponent(searchQuery)}`
        : `/?search=${encodeURIComponent(searchQuery)}`;
      navigate(targetPath);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

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



            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                aria-label="Search products"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* Logout Button - Only visible when logged in */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Logout
              </button>
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

              {/* Search in Sidebar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              <div className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <span>Home</span>
                </Link>
              </div>

              {/* Categories */}
              <div>
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
              </div>

              {isAdmin && (
                <div className="pt-4 border-t">
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

            <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-400">
              &copy; Sahithi Enterprises
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
