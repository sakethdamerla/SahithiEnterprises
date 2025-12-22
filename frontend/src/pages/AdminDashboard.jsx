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
    if (!formState.imageUrl.trim()) nextErrors.imageUrl = 'Image URL is required';
    if (!formState.category.trim()) nextErrors.category = 'Category is required';
    if (!formState.price || Number.isNaN(Number(formState.price))) nextErrors.price = 'Valid price is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      imageUrl: formState.imageUrl.trim(),
      category: formState.category.trim(),
      price: Number(formState.price),
    };

    if (formState.id) {
      updateProduct(formState.id, payload);
    } else {
      addProduct(payload);
    }
    setFormState(emptyForm);
  };

  const handleEdit = (product) => {
    setFormState({
      id: product._id,
      title: product.title,
      imageUrl: product.imageUrl,
      price: product.price,
      description: product.description,
      category: product.category,
    });
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    if (formState.id === id) {
      setFormState(emptyForm);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesFilter = filter ? p.category === filter : true;
    return matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-1">
          <p className="text-sm text-gray-500">Admin Dashboard</p>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-600">
            Signed in as {adminUser?.username ?? 'admin'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <section className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Product form</p>
            <h2 className="text-2xl font-bold text-gray-900">{formState.id ? 'Edit product' : 'Add new product'}</h2>
            <p className="text-sm text-gray-600">All fields are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Product form">
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
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                className="input-field mt-1"
                value={formState.imageUrl}
                onChange={(e) => setFormState((prev) => ({ ...prev, imageUrl: e.target.value }))}
                required
              />
              {errors.imageUrl && <p className="text-sm text-red-600 mt-1">{errors.imageUrl}</p>}
            </div>

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

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {formState.id ? 'Update product' : 'Add product'}
              </button>
              {formState.id && (
                <button
                  type="button"
                  onClick={() => setFormState(emptyForm)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

        </section>

        {/* Product list */}
        <section className="lg:col-span-2 space-y-6">
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
                    {/* Category overlay removed primarily because ProductCard has one, but if ProductCard's badge is hidden or different, we can keep. 
                      However, ProductCard DOES have a badge. Doubling it is bad. */}

                    <div className="mt-auto pt-4 flex justify-end gap-2 border-t border-gray-100">
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
      </div >

      {/* Interested Users Table */}
      < div className="container mx-auto px-4 pb-10" >
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interest.mobile}</td>
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
      </div >
    </div >
  );
}

