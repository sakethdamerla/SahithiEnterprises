import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { OfferCard } from '../components/OfferCard';
import { Link, useNavigate } from 'react-router-dom';
import { CategoryCardSkeleton, ProductCardSkeleton } from '../components/Skeleton';
import { getCategoryInfo, categoryData as staticCategoryData } from '../utils/categoryData.jsx';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const { products, isLoading: productsLoading } = useProducts();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('trending'); // 'trending', 'price_asc', 'price_desc'

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchData = async () => {
      try {
        const [catRes, offRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/offers`)
        ]);

        if (catRes.ok) setDynamicCategories(await catRes.json());
        if (offRes.ok) setOffers(await offRes.json());
      } catch (err) {
        console.error("Failed to fetch content", err);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchData();
  }, []);

  // Merge categories: dynamic first, then static ones that aren't covered
  const mergedCategories = [...dynamicCategories];
  const dynamicSlugs = new Set(dynamicCategories.map(c => c.name));

  // Add static ones that don't exist in dynamic list
  Object.keys(staticCategoryData).forEach(slug => {
    if (!dynamicSlugs.has(slug)) {
      const info = staticCategoryData[slug];
      mergedCategories.push({
        _id: slug,
        name: slug,
        title: info.title,
        description: info.description,
        icon: info.icon, // Static icon fallback
        isStatic: true
      });
    }
  });

  // Filter products by search query
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'trending') {
    filteredProducts.sort((a, b) => {
      const ratingA = a.ratings?.length > 0 ? a.ratings.reduce((acc, r) => acc + (typeof r === 'number' ? r : r.rating), 0) / a.ratings.length : 0;
      const ratingB = b.ratings?.length > 0 ? b.ratings.reduce((acc, r) => acc + (typeof r === 'number' ? r : r.rating), 0) / b.ratings.length : 0;
      return ratingB - ratingA;
    });
  }

  const handleEdit = (product) => {
    navigate(`/admin?edit=${product._id}`);
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 pb-24 max-w-7xl relative">

      {isAdmin && (
        <div className="mb-6"></div>
      )}

      {/* Global Search and Filter */}
      <div className="mb-6 flex flex-row items-center gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-gray-200 rounded-xl bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
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
        <div className="shrink-0 h-full">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 block p-2.5 md:p-3 outline-none shadow-sm transition-all cursor-pointer h-full appearance-none min-w-[44px] md:min-w-[120px]"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolygon points=\'22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'center right 0.5rem', backgroundSize: '1rem', paddingRight: '2rem' }}
          >
            <option value="trending">🔥 Trending</option>
            <option value="price_asc">💰 Price Low</option>
            <option value="price_desc">💎 Price High</option>
          </select>
        </div>
      </div>

      {/* Offers Section */}
      {offers.filter(o => !o.category || o.category === 'home').length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-6">
          {offers.filter(o => !o.category || o.category === 'home').map(offer => (
            <OfferCard key={offer._id} offer={offer} />
          ))}
        </div>
      )}

      {/* Categories Section */}
      <div id="categories" className="mb-8">
        <div className="flex flex-col mb-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
             
            </h2>
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              Select a category to view products
            </span>
          </div>
          {/* Divider */}
          {/* <div className="h-1 w-24 mt-2 bg-primary-600 rounded-full"></div> */}
        </div>

        {isLoadingContent || productsLoading ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[80px] snap-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : mergedCategories.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {mergedCategories.map((cat) => {
              const productCount = products.filter(p => p.category === cat.name).length;

              // Resolve icon/image
              let displayIcon = cat.icon;
              if (!displayIcon && !cat.imageUrl) {
                // Try to find static info if missing
                const info = getCategoryInfo(cat.name);
                displayIcon = info.icon;
              }

              return (
                <Link
                  key={cat._id || cat.name}
                  to={`/category/${cat.name}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] snap-center group"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-3xl md:text-4xl group-hover:bg-primary-50 group-hover:border-primary-200 group-hover:scale-105 group-hover:shadow-md transition-all overflow-hidden shrink-0">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                    ) : (
                      <span>{displayIcon || '📦'}</span>
                    )}
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-700 text-center line-clamp-1 group-hover:text-primary-600 transition-colors px-1">
                    {cat.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-primary-50 rounded-2xl border border-gray-100 border-dashed">
            <div className="text-4xl mb-2">📭</div>
            <h3 className="text-sm font-bold text-gray-900">No Categories Found</h3>
          </div>
        )}
      </div>

      {/* Trending Products Section */}
      <div id="trending-products" className="mb-8 pt-6">
        <div className="flex flex-col mb-6">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              {searchQuery ? 'Search Results' : '🔥 Trending Products'}
            </h2>
          </div>

          {/* Divider */}
          <div className="h-1 w-24 bg-red-500 rounded-full"></div>
        </div>

        {isLoadingContent || productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-full">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="relative">
                {/* Trending Badge Overlay */}
                {sortBy === 'trending' && product.ratings && product.ratings.length > 0 && (
                  <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg transform rotate-3 flex items-center gap-1 border-2 border-white">
                    <span>🔥</span> Hot
                  </div>
                )}
                <ProductCard
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
                      window.location.reload();
                    } catch (e) {
                      alert("Failed to delete");
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
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
    </div>
  );
}
