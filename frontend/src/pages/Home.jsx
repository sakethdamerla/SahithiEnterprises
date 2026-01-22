import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { Link } from 'react-router-dom';
import { CategoryCardSkeleton } from '../components/Skeleton';
import { getCategoryInfo, categoryData as staticCategoryData } from '../utils/categoryData.jsx';


function OfferBanner() {
  const scrollToCategories = () => {
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-40 overflow-hidden shadow-lg mb-8 group rounded-2xl bg-gradient-to-r from-[#FF9933] via-white to-[#138808]">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] md:hidden"></div>

      {/* Ashoka Chakra Watermark */}
      <div className="absolute -right-20 -top-20 md:right-10 md:-top-10 opacity-10">
        <svg
          viewBox="0 0 24 24"
          className="w-64 h-64 md:w-96 md:h-96 text-[#000080] animate-spin-slow"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v11h-2zm4.24.76l-1.41 1.41 7.78 7.78 1.41-1.41zM6.39 6.39l1.41 1.41 7.78-7.78-1.41-1.41z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      <div className="relative z-10 p-6 md:p-12 flex flex-col justify-center h-48 md:h-80">
        <div className="inline-flex items-center gap-2 mb-">
          <span className="text-[#000080] font-bold uppercase tracking-wider text-xs md:text-sm bg-white/80 mt- px-3 py-2 rounded-full shadow-sm">
            Happy Republic Day 
          </span>
        </div>

        <h2 className="text-xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-4 leading-tight">
          Celebrate <span className="text-[#000080]">26th January</span> <br />
          with Exclusive Savings
        </h2>
{/* 
        <p className="text-gray-800 text-sm md:text-lg max-w-xl mb-6 font-medium">
          Honor the nation with great deals on tires, electronics, and batteries. Limited time Republic Day offers!
        </p> */}
{/* 
        <button
          onClick={scrollToCategories}
          className="w-fit px-6 py-3 bg-[#000080] text-white rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg hover:shadow-[#000080]/30 transform hover:scale-105 flex items-center gap-2"
        >
          Explore Deals
          <span className="text-lg">→</span>
        </button> */}
      </div>

      {/* Decorative Ribbons */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-600/20 to-transparent rounded-tl-full"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-br-full"></div>
    </div>
  );
}

export function Home() {
  const { products, getCategories, isLoading } = useProducts();
  const { isAdmin } = useAuth();

  // Combine static categories with any dynamic ones from the product list
  // This ensures predefined categories are always visible even with 0 products
  const dynamicCategories = getCategories();
  const categories = [...new Set([...Object.keys(staticCategoryData), ...dynamicCategories])];



  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl relative">



      {/* Brand Header for Mobile App Feel */}
      <div className="mb-6 flex justify-between items-center md:hidden">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-800">Sahithi Enterprises</h1>
          <p className="text-gray-500 text-sm">Best products for you</p>
        </div> */}

      </div>

      {isAdmin && (
        <div className="mb-6">
          <Link
            to="/admin"
            className="w-full md:w-auto block md:inline-block text-center px-6 py-3 bg-secondary-600 text-white rounded-xl font-bold shadow-lg hover:bg-secondary-700 transition-transform transform hover:scale-105"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      )}

      <OfferBanner />

      {/* Categories Section */}
      <div id="categories" className="mb-8">
        <div className="flex flex-col mb-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              Browse Categories <span className="text-xl">🇮🇳</span>
            </h2>
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              Select a category to view products
            </span>
          </div>
          {/* Tricolor Divider */}
          <div className="h-1 w-24 mt-2 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {categories.map((category) => {
              const info = getCategoryInfo(category);
              const productCount = products.filter(p => p.category === category).length;

              return (
                <CategoryCard
                  key={category}
                  category={category}
                  title={info.title}
                  description={info.description}
                  icon={info.icon}
                  productCount={productCount}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-500">
              It seems our inventory is empty right now. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
