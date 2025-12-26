import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

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
    if (!formState.title.trim()) nextErrors.title = 'Title is required';
    if (!formState.description.trim()) nextErrors.description = 'Description is required';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let imageUrl = formState.imageUrl;

    if (selectedFile) {
      try {
        imageUrl = await uploadFile(selectedFile);
      } catch (error) {
        console.error('Upload failed:', error);
        setErrors((prev) => ({ ...prev, imageUrl: 'Failed to upload image' }));
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

    if (formState.id) {
      await updateProduct(formState.id, payload);
    } else {
      await addProduct(payload);
    }
    setFormState(emptyForm);
    setSelectedFile(null);
    setIsFormOpen(false);
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
    deleteProduct(id);
    if (formState.id === id) {
      setFormState(emptyForm);
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-1 mb-6">
            <p className="text-sm text-gray-500">Admin Dashboard</p>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="text-sm text-gray-600">
              Signed in as {adminUser?.username ?? 'admin'}
            </p>
          </div>

          <div className="flex gap-4 border-b border-gray-100">
            <button
              onClick={() => setActiveView('products')}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeView === 'products'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Product Management
            </button>
            <button
              onClick={() => setActiveView('interests')}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeView === 'interests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Interested Users
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeView === 'products' ? (
          <div>
            {/* Form Modal */}
            {isFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                  <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{formState.id ? 'Edit Product' : 'Add New Product'}</h2>
                      <p className="text-sm text-gray-500">Enter product details below</p>
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

                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          className="input-field mt-1"
                          value={formState.title}
                          onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                          required
                        />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product Image</label>
                        <div className="mt-1 space-y-2">
                          {formState.imageUrl && !selectedFile && (
                            <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
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
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{selectedFile ? selectedFile.name : 'Click to upload'}</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
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
                        {errors.imageUrl && <p className="text-sm text-red-600 mt-1">{errors.imageUrl}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <input
                            className="input-field mt-1"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formState.price}
                            onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                            required
                          />
                          {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <select
                            className="input-field mt-1"
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
                          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          className="input-field mt-1"
                          rows="3"
                          value={formState.description}
                          onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                          required
                        />
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                      </div>

                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          id="isTemporarilyClosed"
                          checked={formState.isTemporarilyClosed}
                          onChange={(e) => setFormState((prev) => ({ ...prev, isTemporarilyClosed: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isTemporarilyClosed" className="text-sm font-medium text-gray-700">
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
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                          {formState.id ? 'Save Changes' : 'Create Product'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Product list */}
            <section className="space-y-6">
              <button
                onClick={() => {
                  setFormState(emptyForm);
                  setSelectedFile(null);
                  setIsFormOpen(true);
                }}
                className="w-full sm:w-auto py-2 px-6 btn-primary flex items-center justify-center gap-2 mb-4 shadow-lg shadow-primary-600/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Product
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Products</h3>
                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} item(s) • Stored in Database
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700" htmlFor="filter">Filter by category:</label>
                  <select
                    id="filter"
                    className="input-field"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="flex flex-col h-full bg-white rounded-lg border shadow-sm p-4 relative">
                        <ProductCard product={product} />

                        <div className="mt-auto pt-4 flex justify-end gap-2 border-t border-gray-100">
                          <button
                            onClick={() => handleStockToggle(product)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${product.isTemporarilyClosed
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                          >
                            {product.isTemporarilyClosed ? 'Closed' : 'Open'}
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn-secondary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </section >
          </div>
        ) : (
          <div className="container mx-auto pb-10">
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Interested Users</h2>
                <div className="flex items-center gap-2">
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
              <div className="md:hidden space-y-4">
                {filteredInterests.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">No interests found for this date range.</p>
                ) : (
                  filteredInterests.map((interest) => (
                    <div key={interest._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{interest.username}</span>
                          <div className="text-xs text-gray-500">{new Date(interest.date).toLocaleDateString()}</div>
                        </div>
                        <a href={`tel:${interest.mobile}`} className="text-primary-600 bg-primary-50 px-2 py-1 rounded text-xs font-medium">
                          {interest.mobile}
                        </a>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Interested in:</span>
                        <br />
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
                    {filteredInterests.map((interest) => (
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
                    {filteredInterests.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No interests found for this date range.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div >
  );
}

