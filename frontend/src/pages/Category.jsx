import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import { useState } from 'react';

/**
 * Category page component that displays products for a specific category
 * Includes pagination support for large product lists
 */
export function Category() {
  const { slug } = useParams();
  const { getProductsByCategory } = useProducts();
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

  // Category metadata
  const categoryInfo = {
    electronics: {
      title: 'Electronics',
      description: 'Smart home appliances and climate comfort tech',
      icon: '🏠',
    },
    tyres: {
      title: 'Tyres',
      description: 'Performance and all-season tyres for every vehicle type',
      icon: '🛞',
    },
    power: {
      title: 'Inverters & Batteries',
      description: 'Reliable backup power solutions for homes and offices',
      icon: '🔋',
    },
  };

  const info = categoryInfo[slug] || {
    title: slug,
    description: `Browse our ${slug} collection`,
    icon: '📦',
  };

  if (categoryProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6">
            There are no products in the "{slug}" category yet.
          </p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl mr-4">{info.icon}</span>
            <h1 className="text-5xl font-bold">{info.title}</h1>
          </div>
          <p className="text-xl text-center text-gray-100 max-w-2xl mx-auto">
            {info.description}
          </p>
          <div className="text-center mt-4">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'} Available
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-primary-600 hover:text-primary-700 transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium capitalize">{slug}</span>
          </nav>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
