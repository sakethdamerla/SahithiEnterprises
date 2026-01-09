import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const { products, addProduct, updateProduct, deleteProduct, getCategories } = useProducts();
  const { adminUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [formState, setFormState] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('');
  const [activeView, setActiveView] = useState('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    if (activeView === 'traffic') {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${API_URL}/traffic`)
        .then(res => res.json())
        .then(data => setTrafficData(data))
        .catch(err => console.error("Error fetching traffic:", err));
    }
  }, [activeView]);

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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return interests.filter(interest => {
      const interestDate = new Date(interest.date).getTime();

      switch (dateFilter) {
        case 'today':
          return interestDate >= today;
        case '7days':
          const sevenDaysAgo = today - (7 * 24 * 60 * 60 * 1000);
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      if (formState.id === id) {
        setFormState(emptyForm);
      }
    }
  };

  const handleStockToggle = (product) => {
    updateProduct(product._id, {
      ...product,
      isTemporarilyClosed: !product.isTemporarilyClosed
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter = filter ? p.category === filter : true;
    return matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-1 mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-gray-500">Admin Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Overview</h1>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
            <button
              onClick={() => setActiveView('products')}
              className={`flex-1 px-2 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeView === 'products'
                ? 'bg-white text-primary-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveView('interests')}
              className={`flex-1 px-2 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeView === 'interests'
                ? 'bg-white text-primary-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              Interested Users
            </button>
            <button
              onClick={() => setActiveView('traffic')}
              className={`flex-1 px-2 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeView === 'traffic'
                ? 'bg-white text-primary-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {activeView === 'products' ? (
          <div>
            {/* ... (Product Management Code - mostly unchanged, just ensured responsive wrappers) */}
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
              <button
                onClick={() => {
                  setFormState(emptyForm);
                  setSelectedFile(null);
                  setIsFormOpen(true);
                }}
                className="w-full sm:w-auto py-2 px-6 btn-primary flex items-center justify-center gap-2 mb-4 shadow-lg shadow-primary-600/20 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Product
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">Products</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {filteredProducts.length} item(s) • Stored in Database
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700" htmlFor="filter">Filter by category:</label>
                  <select
                    id="filter"
                    className="input-field py-1 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {getCategories().map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {
                filteredProducts.length === 0 ? (
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
        ) : activeView === 'interests' ? (
          <div className="container mx-auto pb-10">
            {/* ... (Existing Interests Code) ... */}
            <section className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
              {/* ... */}
              {/* (I'm preserving the existing structure by referencing it, but replacing the whole block if needed or just appending the else if) */}

              {/* To make this safe, I will just append the traffic view logic */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-lg md:text-xl font-bold">Interested Users</h2>
                {/* ... */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <label htmlFor="interest-filter" className="text-sm text-gray-600 font-medium">Date:</label>
                  <select
                    id="interest-filter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="input-field py-1 px-3 text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="all">All Time</option>
                  </select>
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
    </div >
  );
}

