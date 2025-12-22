import { useState } from 'react';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';

function OfferBanner() {
  // Configurable banner image (could be dynamic later)
  const bannerImage = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg mb-8 group">
      <img
        src={bannerImage}
        alt="Special Offer"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-12">
        <span className="text-yellow-400 font-bold uppercase tracking-wider mb-2 text-sm md:text-base">Limited Time</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">New Year and Pongal offers 2026</h2>
      </div>
    </div>
  );
}

export function Home() {
  const { products, getCategories } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...getCategories()];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Brand Header for Mobile App Feel */}
      <div className="mb-6 flex justify-between items-center md:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
          <p className="text-gray-500 text-sm">Best products for you</p>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">U</div>
        </div>
      </div>

      <OfferBanner />

      {/* Interactive Category Pills */}
      <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex space-x-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeCategory === category
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {activeCategory === 'All' ? 'Recommended for You' : `${activeCategory} Products`}
        </h2>
        <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
