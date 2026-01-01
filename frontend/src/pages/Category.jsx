import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import { useState } from 'react';
import { getCategoryInfo } from '../utils/categoryData.jsx';
import { Loader } from '../components/Loader';

/**
 * Category page component that displays products for a specific category
 */
export function Category() {
  const { slug } = useParams();
  const { getProductsByCategory, isLoading } = useProducts();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search')?.toLowerCase().trim() || '';

  // Get products for this category
  const categoryProducts = getProductsByCategory(slug).filter((p) => {
    if (!search) return true;
    return (
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(categoryProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = categoryProducts.slice(startIndex, endIndex);

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
      {/* Category Header */}




      {/* Compact Header */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-xl md:text-4xl shadow-sm border border-gray-100 shrink-0">
            {info.icon}
          </div>
          <div className="flex-grow">
            <h1 className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">{info.title}</h1>
            <p className="text-gray-500 text-xs md:text-base hidden sm:block mt-1">{info.description}</p>
          </div>
          <div className="shrink-0">
            <span className="text-[10px] md:text-sm text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
              {categoryProducts.length} <span className="hidden sm:inline">items</span>
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="pb-12 px-2 md:px-0">
        <div className="container mx-auto px-2 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} onEdit={handleEdit} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
