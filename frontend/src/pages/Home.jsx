import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { Link } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { getCategoryInfo, categoryData as staticCategoryData } from '../utils/categoryData.jsx';
import { PongalToran } from '../components/PongalToran';
import { PongalPot } from '../components/PongalPot';

function OfferBanner() {
  // Configurable banner image (could be dynamic later)
  const bannerImage = "https://media.istockphoto.com/id/1194418188/vector/new-year-sale-discount-banner-template-promotion-design-for-business.jpg?s=612x612&w=0&k=20&c=e-ON2GPZASKqQgzSH53N0MYuaVtE0SYk6LldcX8B_zw=";

  const scrollToCategories = () => {
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-40 md:h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg mb-8 group">
      <img
        src={bannerImage}
        alt="Special Offer"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-12">
        <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm md:text-base">Limited Time</span>
        <h2 className="text-1xl md:text-4xl font-bold text-white mt-10">New Year and Pongal offers 2026</h2>
        <div className="mt-4">

        </div>
      </div>
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl relative">
      {/* Pongal Decorations for Mobile */}
      <div className="md:hidden">
        {/* Hanging Toran */}
        <PongalToran />

        {/* Pot at bottom right */}
        <div className="fixed bottom-4 right-0 z-40 pointer-events-none translate-x- animate-fade-in">
          <PongalPot />
        </div>

        {/* Pot at bottom left */}
        <div className="fixed bottom-4 left-0 z-40 pointer-events-none translate-x- animate-fade-in">
          <PongalPot />
        </div>
      </div>

      
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
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Browse Categories
          </h2>
          <span className="text-sm text-gray-500 hidden sm:inline-block">
            Select a category to view products
          </span>
        </div>

        {categories.length > 0 ? (
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
