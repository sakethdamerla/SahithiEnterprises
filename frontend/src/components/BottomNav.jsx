import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';

export function BottomNav() {
  const { isAdmin, adminUser, logout } = useAuth();
  const { getCategories } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const categories = getCategories();

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (activeOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeOverlay]);

  // Define admin permitted items
  const allAdminItems = [
    { id: 'products', label: 'Products', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
    { id: 'interests', label: 'Interests', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: 'traffic', label: 'Analytics', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'announcements', label: 'Announcements', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
  ];

  if (adminUser?.role === 'superadmin') {
    allAdminItems.push({ id: 'admins', label: 'Admins', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> });
    allAdminItems.push({ id: 'content', label: 'Cards', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> });
  }

  const permittedAdminItems = allAdminItems.filter(item => {
    if (adminUser?.role === 'superadmin') return true;
    return adminUser?.permissions?.[item.id] !== false;
  });

  const getActiveState = (id) => {
    if (id === 'home' && location.pathname === '/') return true;
    if (isAdmin && location.pathname === '/admin') {
      const searchParams = new URLSearchParams(location.search);
      const view = searchParams.get('view') || 'products';
      if (id === view) return true;
    }
    if (!isAdmin && id === 'announcements' && location.pathname === '/announcements') return true;
    if (activeOverlay === id) return true;
    
    // Check if current view is in the "more" list and 'more' tab should be highlighted
    if (isAdmin && id === 'more' && !activeOverlay && location.pathname === '/admin') {
       const searchParams = new URLSearchParams(location.search);
       const view = searchParams.get('view') || 'products';
       const isMainTab = permittedAdminItems.slice(0, 2).some(item => item.id === view);
       if (!isMainTab && view !== 'home') return true;
    }
    return false;
  };

  const handleNavClick = (id) => {
    if (id === 'home') {
      setActiveOverlay(null);
      setShowContactForm(false);
      setFormSubmitted(false);
      navigate('/');
    } else if (id === 'more' || id === 'categories' || id === 'help') {
      setActiveOverlay(activeOverlay === id ? null : id);
      setShowContactForm(false);
      setFormSubmitted(false);
    } else if (isAdmin) {
      setActiveOverlay(null);
      navigate(`/admin?view=${id}`);
    } else {
      setActiveOverlay(null);
      if (id === 'announcements') navigate('/announcements');
    }
  };

  // Determine bottom tabs
  const bottomTabs = [];
  bottomTabs.push({ id: 'home', label: 'Home', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> });
  
  if (isAdmin) {
    bottomTabs.push(...permittedAdminItems.slice(0, 2)); // e.g. Products, Analytics
    bottomTabs.push({ id: 'more', label: 'More', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> });
  } else {
    bottomTabs.push({ id: 'categories', label: 'Categories', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> });
    bottomTabs.push({ id: 'announcements', label: 'News', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> });
    bottomTabs.push({ id: 'help', label: 'Help', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> });
  }

  const moreItems = isAdmin ? permittedAdminItems.slice(2) : [];

  return (
    <>
      {/* Overlay View (More / Categories / Help) */}
      {activeOverlay && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveOverlay(null)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-[70px] z-[40] bg-primary-50 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300 max-h-[80vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {activeOverlay === 'more' ? 'More Options' : activeOverlay === 'help' ? 'Help & Service' : 'Categories'}
              </h2>
              <button onClick={() => setActiveOverlay(null)} className="p-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 pb-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activeOverlay === 'more' && isAdmin ? (
                <>
                  {moreItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-[#9575CD] hover:-translate-y-1 transition-all text-center"
                    >
                      <div className="w-14 h-14 bg-purple-50 text-[#7E57C2] rounded-full flex items-center justify-center shadow-inner">
                        {item.icon}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      setActiveOverlay(null);
                      navigate('/');
                    }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-red-200 hover:-translate-y-1 transition-all text-center"
                  >
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-red-500">Logout</span>
                  </button>
                </>
              ) : activeOverlay === 'help' ? (
                <>
                  <a
                    href="https://wa.me/6301776156?text=Hello,%20I%20need%20help"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setActiveOverlay(null)}
                    className="col-span-2 sm:col-span-1 bg-[#25D366]/10 p-6 rounded-3xl shadow-sm border border-[#25D366]/20 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-[#25D366] hover:-translate-y-1 transition-all text-center"
                  >
                    <div className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    </div>
                    <span className="text-sm font-bold text-[#25D366]">WhatsApp Us</span>
                  </a>
                  <Link
                    to="/help-form"
                    onClick={() => setActiveOverlay(null)}
                    className="col-span-2 sm:col-span-1 bg-primary-50 p-6 rounded-3xl shadow-sm border border-primary-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary-300 hover:-translate-y-1 transition-all text-center"
                  >
                    <div className="w-14 h-14 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-primary-600">Fill Form</span>
                  </Link>
                </>
              ) : activeOverlay === 'categories' ? (
                categories.map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category}`}
                    onClick={() => setActiveOverlay(null)}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-[#9575CD] hover:-translate-y-1 transition-all text-center"
                  >
                    <div className="w-14 h-14 bg-purple-50 text-[#7E57C2] rounded-full flex items-center justify-center shadow-inner capitalize text-xl font-bold">
                      {category.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 capitalize">{category}</span>
                  </Link>
                ))
              ) : null}
              </div>
            </div>
          </div>
        </>
      )}



      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#5E35B1] pb-safe z-50 shadow-[0_-10px_30px_rgba(94,53,177,0.2)]">
        <div className="flex justify-around items-center px-4 py-3 max-w-md mx-auto">
          {bottomTabs.map(item => {
            const isActive = getActiveState(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 w-16 ${
                  isActive
                    ? 'text-white -translate-y-1'
                    : 'text-[#D1C4E9] hover:text-white'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-1 transition-all duration-300 ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-80'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
