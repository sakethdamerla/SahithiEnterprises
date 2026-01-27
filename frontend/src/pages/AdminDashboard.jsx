import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { ProductCardSkeleton } from '../components/Skeleton';


import { Home } from './Home';
import { AdminContent } from './AdminContent';

// ... other imports ...

const emptyForm = {
  id: null,
  title: '',
  imageUrl: '',
  price: '',
  description: '',
  category: '',
  isTemporarilyClosed: false,
};

/**
 * Admin dashboard for managing products (client-side only).
 * CRUD actions persist to localStorage via ProductsContext.
 */
export function AdminDashboard() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct, getCategories } = useProducts();
  const { adminUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('');
  const [activeView, setActiveView] = useState(searchParams.get('view') || 'products');

  useEffect(() => {
    const view = searchParams.get('view');
    if (view && ['products', 'interests', 'traffic', 'announcements', 'admins', 'home', 'content'].includes(view)) {
      setActiveView(view);
    }
  }, [searchParams]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trafficData, setTrafficData] = useState([]);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);

  // Admin Management State
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({}); // Track loading state for specific IDs/Actions

  const setActionLoading = (id, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [id]: isLoading }));
  };

  useEffect(() => {
    if (activeView === 'traffic') {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${API_URL}/traffic`)
        .then(res => res.json())
        .then(data => setTrafficData(data))
        .catch(err => console.error("Error fetching traffic:", err));
    } else if (activeView === 'announcements') {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${API_URL}/admin/announcements`)
        .then(res => res.json())
        .then(data => setAnnouncements(data))
        .catch(err => console.error("Error fetching announcements:", err));
    } else if (activeView === 'admins' && adminUser?.role === 'superadmin') {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${API_URL}/admin/list`, {
        headers: { 'Authorization': `Bearer ${adminUser.token}` }
      })
        .then(res => res.json())
        .then(data => setAdmins(data))
        .catch(err => console.error("Error fetching admins:", err));
    }
  }, [activeView, adminUser]);

  // ... (rest of the code)

  // (This is a simplified view of where the chart goes. I'll need to carefully insert it)

  const PREDEFINED_CATEGORIES = ['electronics', 'tyres', 'power'];

  const categories = useMemo(() => {
    const unique = new Set([...getCategories(), ...PREDEFINED_CATEGORIES, formState.category].filter(Boolean));
    return [...unique];
  }, [getCategories, formState.category]);

  useEffect(() => {
    setErrors({});
  }, [formState]);

  const [interests, setInterests] = useState([]);
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/interests`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch interests');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setInterests(data);
        } else {
          console.error('Invalid interests data:', data);
          setInterests([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filteredInterests = useMemo(() => {
    if (!interests.length) return [];

    const now = new Date();
    // Normalize "today" to start of day 00:00:00
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return interests.filter(interest => {
      const interestDate = new Date(interest.date).getTime();

      switch (dateFilter) {
        case 'today':
          return interestDate >= todayStart;
        case 'yesterday':
          return interestDate >= (todayStart - oneDay) && interestDate < todayStart;
        case '7days':
          const sevenDaysAgo = todayStart - (7 * oneDay);
          return interestDate >= sevenDaysAgo;
        case 'all':
        default:
          return true;
      }
    });
  }, [interests, dateFilter]);

  // Pagination state for Interested Users
  const [interestPage, setInterestPage] = useState(1);
  const INTERESTS_PER_PAGE = 10;

  // Reset page when filter results change
  useEffect(() => {
    setInterestPage(1);
  }, [dateFilter, interests.length]);

  const { paginatedInterests, totalInterestPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredInterests.length / INTERESTS_PER_PAGE);
    const start = (interestPage - 1) * INTERESTS_PER_PAGE;
    const end = start + INTERESTS_PER_PAGE;
    return {
      paginatedInterests: filteredInterests.slice(start, end),
      totalInterestPages: totalPages
    };
  }, [filteredInterests, interestPage]);

  // If navigated with ?edit=ID, prefill the form
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const product = products.find((p) => p._id === editId);
      if (product) {
        handleEdit(product);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, products]);

  const validate = () => {
    const nextErrors = {};
    if (!formState.title.trim()) nextErrors.title = 'Title is required';
    if (!formState.description.trim()) nextErrors.description = 'Description is required';
    if (!formState.imageUrl.trim() && !selectedFile) nextErrors.imageUrl = 'Image is required';
    if (!formState.category.trim()) nextErrors.category = 'Category is required';
    if (!formState.price || Number.isNaN(Number(formState.price))) nextErrors.price = 'Valid price is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('announcement-submit', true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm)
      });
      if (res.ok) {
        setAnnouncementForm({ title: '', message: '' });
        setIsAnnouncementFormOpen(false);
        // Refresh list
        const updatedList = await fetch(`${API_URL}/admin/announcements`).then(r => r.json());
        setAnnouncements(updatedList);
      }
    } catch (error) {
      console.error("Error creating announcement", error);
    } finally {
      setActionLoading('announcement-submit', false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    setActionLoading(`del-ann-${id}`, true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      await fetch(`${API_URL}/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error("Error deleting", error);
    } finally {
      setActionLoading(`del-ann-${id}`, false);
    }
  };

  const deleteAdmin = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this admin?")) return;
    setActionLoading(`del-admin-${id}`, true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${API_URL}/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminUser.token}`
        }
      });
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a._id !== id));
      } else {
        alert("Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin", error);
    } finally {
      setActionLoading(`del-admin-${id}`, false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('admin-submit', true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // If updating existing admin
    if (selectedAdmin) {
      try {
        const payload = { ...adminForm };
        if (!payload.password) delete payload.password; // Only send password if changed

        const res = await fetch(`${API_URL}/admin/${selectedAdmin._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminUser.token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          setAdmins(prev => prev.map(a => a._id === selectedAdmin._id ? updated : a));
          setAdminForm({ username: '', password: '' });
          setIsAdminFormOpen(false);
          setSelectedAdmin(null);
        } else {
          alert('Failed to update admin');
        }
      } catch (error) {
        console.error("Error updating admin", error);
      } finally {
        setActionLoading('admin-submit', false);
      }
      return;
    }

    // Creating new admin
    try {
      const res = await fetch(`${API_URL}/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.token}`
        },
        body: JSON.stringify(adminForm)
      });
      const data = await res.json();
      if (res.ok) {
        setAdminForm({ username: '', password: '' });
        setIsAdminFormOpen(false);
        setAdmins(prev => [...prev, data]);
      } else {
        alert(data.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error("Error creating admin", error);
    } finally {
      setActionLoading('admin-submit', false);
    }
  };

  const togglePermission = async (adminId, permissionKey) => {
    if (loadingStates[`perm-${adminId}-${permissionKey}`]) return; // Prevent double click

    const adminToUpdate = admins.find(a => a._id === adminId);
    if (!adminToUpdate) return;

    // Optimistic UI Update
    const oldPermissions = { ...adminToUpdate.permissions };
    const newPermissions = {
      ...oldPermissions,
      [permissionKey]: !oldPermissions[permissionKey]
    };

    // Update local state immediately for responsiveness
    setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, permissions: newPermissions } : a));
    if (selectedAdmin?._id === adminId) {
      setSelectedAdmin(prev => ({ ...prev, permissions: newPermissions }));
    }

    setActionLoading(`perm-${adminId}-${permissionKey}`, true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${API_URL}/admin/${adminId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.token}`
        },
        body: JSON.stringify({ permissions: newPermissions })
      });

      if (res.ok) {
        const updatedAdmin = await res.json();
        // Sync with server response
        setAdmins(prev => prev.map(a => a._id === adminId ? updatedAdmin : a));
        if (selectedAdmin?._id === adminId) {
          setSelectedAdmin(updatedAdmin);
        }
      } else {
        // Revert on failure
        setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, permissions: oldPermissions } : a));
        if (selectedAdmin?._id === adminId) {
          setSelectedAdmin(prev => ({ ...prev, permissions: oldPermissions }));
        }
      }
    } catch (error) {
      console.error("Error updating permissions", error);
      // Revert on failure
      setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, permissions: oldPermissions } : a));
      if (selectedAdmin?._id === adminId) {
        setSelectedAdmin(prev => ({ ...prev, permissions: oldPermissions }));
      }
    } finally {
      setActionLoading(`perm-${adminId}-${permissionKey}`, false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    let imageUrl = formState.imageUrl;

    if (selectedFile) {
      try {
        imageUrl = await uploadFile(selectedFile);
      } catch (error) {
        console.error('Upload failed:', error);
        setErrors((prev) => ({ ...prev, imageUrl: 'Failed to upload image' }));
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      imageUrl: imageUrl.trim(),
      category: formState.category.trim(),
      price: Number(formState.price),
      isTemporarilyClosed: formState.isTemporarilyClosed,
    };

    try {
      if (formState.id) {
        await updateProduct(formState.id, payload);
      } else {
        await addProduct(payload);
      }
      setFormState(emptyForm);
      setSelectedFile(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save product", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormState({
      id: product._id,
      title: product.title,
      imageUrl: product.imageUrl,
      price: product.price,
      description: product.description,
      category: product.category,
      isTemporarilyClosed: product.isTemporarilyClosed || false,
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setActionLoading(`del-prod-${id}`, true);
      try {
        await deleteProduct(id);
        if (formState.id === id) {
          setFormState(emptyForm);
        }
      } finally {
        setActionLoading(`del-prod-${id}`, false);
      }
    }
  };

  const handleStockToggle = async (product) => {
    setActionLoading(`stock-${product._id}`, true);
    try {
      await updateProduct(product._id, {
        ...product,
        isTemporarilyClosed: !product.isTemporarilyClosed
      });
    } finally {
      setActionLoading(`stock-${product._id}`, false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter = filter ? p.category === filter : true;
    return matchesFilter;
  });

  const navItems = [
    { id: 'home', label: 'Home', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'products', label: 'Manage Products', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { id: 'interests', label: 'User Interests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: 'traffic', label: 'Site Analytics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'announcements', label: 'Manage Announcements', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
    { id: 'announcements', label: 'Manage Announcements', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
  ].filter(item => {
    if (adminUser?.role === 'superadmin') return true;
    return adminUser?.permissions?.[item.id] !== false;
  });

  if (adminUser?.role === 'superadmin') {
    navItems.push({ id: 'admins', label: 'Admin Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> });
    navItems.push({ id: 'content', label: 'Card Editing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> });
  }

  const { logout } = useAuth();

  // (Old sidebar logic removed for unified navigation)

  // Handle deep linking for actions (e.g. Add Product from Category page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const categoryParam = params.get('category');
    const viewParam = params.get('view');

    // Only process if we are in the right view
    if (viewParam === 'products' || (!viewParam && activeView === 'products')) {
      if (action === 'add') {
        setIsFormOpen(true);
        setFormState(prev => ({
          ...emptyForm,
          category: categoryParam || '', // Pre-fill category if provided
        }));

        // Clean up URL to prevent reopening on refresh
        // navigate('/admin?view=products', { replace: true }); 
        // Actually, let's not auto-navigate away immediately as it might cause flicker, 
        // but maybe just leave it be.
      }
    }
  }, [location.search, activeView]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Dashboard</p>
                <h2 className="text-3xl font-bold text-gray-900 capitalize">
                  {activeView.replace(/([A-Z])/g, ' $1')} Management
                </h2>
              </div>
              {/* Optional secondary action here */}
            </div>

            {/* Conditionally Rendered Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeView === 'products' ? (
                <div>
                  {/* Form Modal */}
                  {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                        {/* ... Header ... */}
                        <div className="p-4 md:p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">{formState.id ? 'Edit Product' : 'Add New Product'}</h2>
                            <p className="text-xs md:text-sm text-gray-500">Enter product details below</p>
                          </div>
                          <button
                            onClick={() => setIsFormOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="p-4 md:p-6">
                          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div>
                              <label className="block text-xs md:text-sm font-medium text-gray-700">Title</label>
                              <input
                                className="input-field mt-1 text-sm py-1.5"
                                value={formState.title}
                                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                                required
                              />
                              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                              <label className="block text-xs md:text-sm font-medium text-gray-700">Product Image</label>
                              <div className="mt-1 space-y-2">
                                {formState.imageUrl && !selectedFile && (
                                  <div className="relative w-full h-32 md:h-40 bg-gray-100 rounded-lg overflow-hidden border">
                                    <img
                                      src={formState.imageUrl}
                                      alt="Current product"
                                      className="w-full h-full object-contain"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setFormState(prev => ({ ...prev, imageUrl: '' }))}
                                      className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                                <div className="flex items-center justify-center w-full">
                                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <svg className="w-6 h-6 md:w-8 md:h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                      </svg>
                                      <p className="mb-1 text-xs text-gray-500"><span className="font-semibold">{selectedFile ? selectedFile.name : 'Click to upload'}</span></p>
                                    </div>
                                    <input
                                      id="dropzone-file"
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setSelectedFile(e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                              {errors.imageUrl && <p className="text-xs text-red-600 mt-1">{errors.imageUrl}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                              <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700">Price</label>
                                <input
                                  className="input-field mt-1 text-sm py-1.5"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={formState.price}
                                  onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                                  required
                                />
                                {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
                              </div>

                              <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700">Category</label>
                                <select
                                  className="input-field mt-1 text-sm py-1.5"
                                  value={formState.category}
                                  onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
                                  required
                                >
                                  <option value="">Select category</option>
                                  {categories.map((c) => (
                                    <option key={c} value={c} className="capitalize">
                                      {c}
                                    </option>
                                  ))}
                                </select>
                                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs md:text-sm font-medium text-gray-700">Description</label>
                              <textarea
                                className="input-field mt-1 text-sm py-1.5"
                                rows="3"
                                value={formState.description}
                                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                                required
                              />
                              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex items-center gap-2 py-2">
                              <input
                                type="checkbox"
                                id="isTemporarilyClosed"
                                checked={formState.isTemporarilyClosed}
                                onChange={(e) => setFormState((prev) => ({ ...prev, isTemporarilyClosed: e.target.checked }))}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor="isTemporarilyClosed" className="text-xs md:text-sm font-medium text-gray-700">
                                Mark as Out of Stock
                              </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormState(emptyForm);
                                  setSelectedFile(null);
                                  setIsFormOpen(false);
                                }}
                                className="btn-secondary flex-1 text-xs md:text-sm py-2"
                                disabled={isSubmitting}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs md:text-sm py-2"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'Processing...' : (formState.id ? 'Save Changes' : 'Create Product')}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product list */}
                  <section className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">Products</h3>
                        <p className="text-xs md:text-sm text-gray-600">
                          {filteredProducts.length} item(s) • Stored in Database
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFormState(emptyForm);
                          setSelectedFile(null);
                          setIsFormOpen(true);
                        }}
                        className="w-full sm:w-auto py-2 px-6 btn-primary flex items-center justify-center gap-2 mb-4 sm:mb-0 shadow-lg shadow-primary-600/20 text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Product
                      </button>
                    </div>

                    {
                      isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-full">
                              <ProductCardSkeleton />
                            </div>
                          ))}
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="bg-white border rounded-lg p-6 text-center text-gray-600">
                          No products match this filter.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                          {filteredProducts.map((product) => (
                            <div key={product._id} className="h-full">
                              <ProductCard
                                product={product}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStock={handleStockToggle}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    }
                  </section >
                </div>
              ) : activeView === 'content' ? (
                <AdminContent />
              ) : activeView === 'interests' ? (
                <div className="container mx-auto pb-10">
                  {/* ... (Existing Interests Code) ... */}
                  <section className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                    {/* ... */}
                    {/* (I'm preserving the existing structure by referencing it, but replacing the whole block if needed or just appending the else if) */}

                    {/* To make this safe, I will just append the traffic view logic */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <h2 className="text-lg md:text-xl font-bold">Interested Users</h2>
                      <div className="relative">
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <option value="today">Today</option>
                          <option value="yesterday">Yesterday</option>
                          <option value="7days">Last 7 Days</option>
                          <option value="all">Overall</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card View for Interests */}
                    <div className="md:hidden space-y-3">
                      {paginatedInterests.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 py-4">No interests found for this date range.</p>
                      ) : (
                        paginatedInterests.map((interest) => (
                          <div key={interest._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-semibold text-gray-900 text-sm">{interest.username}</span>
                                <div className="text-[10px] text-gray-500">{new Date(interest.date).toLocaleDateString()}</div>
                              </div>
                              <a href={`tel:${interest.mobile}`} className="text-primary-600 bg-primary-50 px-2 py-1 rounded text-xs font-medium">
                                {interest.mobile}
                              </a>
                            </div>
                            <div className="text-sm text-gray-700">
                              <span className="text-gray-500 text-[10px] uppercase tracking-wide block mb-0.5">Interested in:</span>
                              {interest.productTitle}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedInterests.map((interest) => (
                            <tr key={interest._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interest.username}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <a href={`tel:${interest.mobile}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                                  {interest.mobile}
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interest.productTitle}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(interest.date).toLocaleString()}</td>
                            </tr>
                          ))}
                          {paginatedInterests.length === 0 && (
                            <tr>
                              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No interests found for this date range.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalInterestPages > 1 && (
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => setInterestPage(p => Math.max(1, p - 1))}
                          disabled={interestPage === 1}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {interestPage} of {totalInterestPages}
                        </span>
                        <button
                          onClick={() => setInterestPage(p => Math.min(totalInterestPages, p + 1))}
                          disabled={interestPage === totalInterestPages}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </section>
                </div>
              ) : activeView === 'announcements' ? (
                <div className="container mx-auto pb-10">
                  <section className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Announcements</h2>
                      <button
                        onClick={() => setIsAnnouncementFormOpen(true)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Add New
                      </button>
                    </div>

                    {/* Add Modal */}
                    {isAnnouncementFormOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                          <h3 className="text-lg font-bold mb-4">New Announcement</h3>
                          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input
                                className="input-field w-full"
                                value={announcementForm.title}
                                onChange={e => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                              <textarea
                                className="input-field w-full h-32"
                                value={announcementForm.message}
                                onChange={e => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                              <button
                                type="button"
                                onClick={() => setIsAnnouncementFormOpen(false)}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                disabled={loadingStates['announcement-submit']}
                              >
                                {loadingStates['announcement-submit'] ? 'Posting...' : 'Post Announcement'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {announcements.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          No announcements yet.
                        </div>
                      ) : (
                        announcements.map(item => (
                          <div key={item._id} className="border rounded-lg p-4 relative group">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <div>
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString()}</p>
                              </div>
                              <button
                                onClick={() => deleteAnnouncement(item._id)}
                                // className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors self-end sm:self-start"
                                className={`p-2 rounded-lg transition-colors self-end sm:self-start ${loadingStates[`del-ann-${item._id}`]
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-red-500 hover:bg-red-50'
                                  }`}
                                disabled={loadingStates[`del-ann-${item._id}`]}
                              >
                                {loadingStates[`del-ann-${item._id}`] ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                )}
                              </button>
                            </div>
                            <p className="text-gray-600 mt-2 whitespace-pre-wrap text-sm">{item.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              ) : activeView === 'admins' && adminUser?.role === 'superadmin' ? (
                <div className="container mx-auto pb-10">
                  <section className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold font-heading">Admin Management</h2>
                      <button
                        onClick={() => {
                          setAdminForm({ username: '', password: '' });
                          setSelectedAdmin(null);
                          setIsAdminFormOpen(true);
                        }}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Add New Admin
                      </button>
                    </div>

                    {/* Add/Edit Admin Modal */}
                    {isAdminFormOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                          <h3 className="text-lg font-bold mb-4 font-heading">{selectedAdmin ? 'Edit Admin' : 'Create New Admin'}</h3>
                          <form onSubmit={handleAdminSubmit} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                              <input
                                className="input-field w-full"
                                value={adminForm.username}
                                onChange={e => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {selectedAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
                              </label>
                              <input
                                type="password"
                                className="input-field w-full"
                                value={adminForm.password}
                                onChange={e => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                                required={!selectedAdmin}
                              />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                              <button
                                type="button"
                                onClick={() => setIsAdminFormOpen(false)}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                disabled={loadingStates['admin-submit']}
                              >
                                {loadingStates['admin-submit'] ? 'Processing...' : (selectedAdmin ? 'Update Admin' : 'Create Admin')}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {admins.map(admin => (
                        <div key={admin._id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-lg font-bold text-gray-700">
                                {admin.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{admin.username}</h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                                  {admin.role}
                                </span>
                              </div>
                            </div>

                            {/* Actions Dropdown or Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setAdminForm({ username: admin.username, password: '' });
                                  setSelectedAdmin(admin);
                                  setIsAdminFormOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                                title="Edit Admin"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button
                                onClick={() => deleteAdmin(admin._id)}
                                disabled={loadingStates[`del-admin-${admin._id}`]}
                                className={`p-1.5 rounded-lg transition-colors ${loadingStates[`del-admin-${admin._id}`]
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-white'
                                  }`}
                                title="Delete Admin"
                              >
                                {loadingStates[`del-admin-${admin._id}`] ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 mb-4 pl-[52px]">
                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                          </div>

                          <div className="flex justify-end pt-3 border-t border-gray-200/60">
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setIsPermissionModalOpen(true);
                              }}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1 1-2-2-2-2-1-1-1-1-1-1 1 1 2 6 6 0 010-12z" /></svg>
                              Manage Permissions
                            </button>
                          </div>
                        </div>
                      ))}
                      {admins.length === 0 && (
                        <div className="col-span-full py-10 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          No additional admins created yet.
                        </div>
                      )}
                    </div>

                    {/* Permission Management Modal */}
                    {isPermissionModalOpen && selectedAdmin && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 leading-none">Manage Permissions</h3>
                              <p className="text-xs text-gray-500 mt-1">Admin: <span className="font-bold">{selectedAdmin.username}</span></p>
                            </div>
                            <button
                              onClick={() => setIsPermissionModalOpen(false)}
                              className="p-2 hover:bg-white rounded-full transition-colors text-gray-400"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>

                          <div className="p-6 space-y-4">
                            {[
                              { key: 'products', label: 'Product Management', icon: '📦' },
                              { key: 'interests', label: 'User Interests', icon: '👤' },
                              { key: 'traffic', label: 'Analytics', icon: '📊' },
                              { key: 'announcements', label: 'Announcements', icon: '📢' }
                            ].map((perm) => (
                              <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{perm.icon}</span>
                                  <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                                </div>
                                <button
                                  onClick={() => togglePermission(selectedAdmin._id, perm.key)}
                                  className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                ${selectedAdmin.permissions?.[perm.key] ? 'bg-primary-600' : 'bg-gray-200'}
                                ${loadingStates[`perm-${selectedAdmin._id}-${perm.key}`] ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                                  disabled={loadingStates[`perm-${selectedAdmin._id}-${perm.key}`]}
                                >
                                  {loadingStates[`perm-${selectedAdmin._id}-${perm.key}`] ? (
                                    <svg className="animate-spin h-3 w-3 absolute left-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <span
                                      className={`
                                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                      ${selectedAdmin.permissions?.[perm.key] ? 'translate-x-6' : 'translate-x-1'}
                                    `}
                                    />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <button
                              onClick={() => setIsPermissionModalOpen(false)}
                              className="w-full btn-primary py-2.5 rounded-xl font-bold shadow-lg shadow-primary-600/20"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              ) : activeView === 'home' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Home />
                </div>
              ) : (
                <div className="container mx-auto pb-10">
                  <section className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Traffic Analytics
                    </h2>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                        <div>
                          <p className="text-xs md:text-sm text-blue-600 font-semibold uppercase tracking-wider">Visits Today</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                            {trafficData.length > 0 && new Date(trafficData[trafficData.length - 1].date).toDateString() === new Date().toDateString()
                              ? trafficData[trafficData.length - 1].visits
                              : 0}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between shadow-sm">
                        <div>
                          <p className="text-xs md:text-sm text-purple-600 font-semibold uppercase tracking-wider">Total (30 Days)</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                            {trafficData.reduce((acc, curr) => acc + curr.visits, 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-4">Daily Visits (Last 30 Days)</h3>
                    <div className="h-[250px] md:h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trafficData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value) => [value, 'Visits']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}

