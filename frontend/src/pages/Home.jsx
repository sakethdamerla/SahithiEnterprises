import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { OfferCard } from '../components/OfferCard';
import { Link } from 'react-router-dom';
import { CategoryCardSkeleton } from '../components/Skeleton';
import { getCategoryInfo, categoryData as staticCategoryData } from '../utils/categoryData.jsx';

export function Home() {
  const { products, isLoading: productsLoading } = useProducts();
  const { isAdmin } = useAuth();
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl relative">

      {isAdmin && (
        <div className="mb-6"></div>
      )}

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
              Browse Categories
            </h2>
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              Select a category to view products
            </span>
          </div>
          {/* Divider */}
          <div className="h-1 w-24 mt-2 bg-blue-600 rounded-full"></div>
        </div>

        {isLoadingContent || productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : mergedCategories.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {mergedCategories.map((cat) => {
              const productCount = products.filter(p => p.category === cat.name).length;

              // Resolve icon/image: 
              // 1. Dynamic Image
              // 2. Static Icon (mapped)
              // 3. Fallback Icon

              let displayIcon = cat.icon;
              if (!displayIcon && !cat.imageUrl) {
                // Try to find static info if missing
                const info = getCategoryInfo(cat.name);
                displayIcon = info.icon;
              }

              return (
                <CategoryCard
                  key={cat._id || cat.name}
                  category={cat.name}
                  title={cat.title}
                  description={cat.description}
                  image={cat.imageUrl}
                  icon={displayIcon || '📦'}
                  productCount={productCount}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
