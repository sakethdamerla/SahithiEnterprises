import { useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';

import { getCategoryInfo } from '../utils/categoryData.jsx';
import { Loader } from '../components/Loader';

/**
 * Category page component that displays products for a specific category
 */
export function Category() {
  const { slug } = useParams();
  const { getProductsByCategory, isLoading } = useProducts();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const search = searchParams.get('search')?.toLowerCase().trim() || '';
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc'

  // Get products for this category
  let categoryProducts = getProductsByCategory(slug).filter((p) => {
    if (!search) return true;
    return (
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  });

  // Sort products
  if (sortBy === 'price_asc') {
    categoryProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    categoryProducts.sort((a, b) => b.price - a.price);
  }
  // 'newest' assumed default order or no sort

  const handleEdit = (product) => {
    navigate(`/admin?edit=${product._id}`);
  };

  const info = getCategoryInfo(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
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

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 hidden sm:block">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 outline-none shadow-sm transition-shadow"
            >
              <option value="newest">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Promotional Banners Section */}
      {info.promotions && info.promotions.length > 0 && (
        <section className="container mx-auto px-4 py-2 md:py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.promotions.map((promo) => (
              <div key={promo.id} className="relative h-40 md:h-48 rounded-2xl overflow-hidden shadow-lg group cursor-pointer group">
                <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/30 transition-colors z-10" />
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="relative z-20 p-6 flex flex-col justify-center h-full text-white">
                  <span className="bg-primary-600/90 w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-sm mb-2 shadow-sm">
                    {promo.subtitle}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold mb-1 shadow-black/50 drop-shadow-lg">{promo.title}</h3>
                  {/* <p className="text-gray-100 text-xs md:text-sm mb-3 shadow-black/50 drop-shadow-md">On all {info.title} products this week!</p> */}
                  <button className="bg-white text-primary-700 px-4 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-gray-100 transition-colors w-fit shadow-lg mt-2">
                    {promo.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="pb-12 px-2 md:px-0">
        <div className="container mx-auto px-2 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product._id} product={product} onEdit={handleEdit} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
