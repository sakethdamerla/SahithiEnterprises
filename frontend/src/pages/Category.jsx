import { OfferCard } from '../components/OfferCard';
import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';

import { getCategoryInfo } from '../utils/categoryData.jsx';
import { ProductCardSkeleton } from '../components/Skeleton';

/**
 * Category page component that displays products for a specific category
 */
export function Category() {
  const { slug } = useParams();
  const { getProductsByCategory, isLoading } = useProducts();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc'
  const [offers, setOffers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/offers`)
      .then(res => res.json())
      .then(data => setOffers(data))
      .catch(err => console.error("Failed to fetch offers", err));
  }, []);

  // Get products for this category
  let categoryProducts = getProductsByCategory(slug);

  // Filter products by search query
  const filteredProducts = categoryProducts.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }
  // 'newest' assumed default order or no sort

  const handleEdit = (product) => {
    navigate(`/admin?edit=${product._id}`);
  };

  const info = getCategoryInfo(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-full">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categoryProducts.length === 0) {
    return (
      <div className="mt-40 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6 text-sm">
            There are no products in the "{slug}" category yet.
          </p>
          <Link to="/" className="btn-primary text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-xl md:text-4xl shadow-sm border border-gray-100 shrink-0">
              {info.icon}
            </div>
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">{info.title}</h1>
              <p className="text-gray-500 text-xs md:text-base hidden sm:block mt-1">{info.description}</p>
            </div>
            <div className="shrink-0 flex items-center">
              <span className="text-[10px] md:text-sm text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
                {categoryProducts.length} <span className="hidden sm:inline">items</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-grow min-w-[200px] md:min-w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 hidden sm:block">Sort:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 outline-none shadow-sm transition-shadow w-full sm:w-auto"
              >
                <option value="newest">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>



      {/* Category Specific Offers */}
      {offers.filter(o => o.category === slug).length > 0 && (
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="grid grid-cols-1 gap-6">
            {offers.filter(o => o.category === slug).map(offer => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="pb-12 px-2 md:px-0">
        <div className="container mx-auto px-2 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleEdit}
                onDelete={async (id) => {
                  if (!window.confirm("Are you sure you want to delete this product?")) return;
                  try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const token = localStorage.getItem('admin_token');
                    await fetch(`${API_URL}/products/${id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Refresh products
                    window.location.reload();
                  } catch (e) {
                    alert("Failed to delete");
                  }
                }}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
              <p className="text-gray-500">We couldn't find any products matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary-600 font-medium hover:text-primary-700"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
