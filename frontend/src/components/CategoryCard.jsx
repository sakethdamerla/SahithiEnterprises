import { Link } from 'react-router-dom';

/**
 * CategoryCard component for displaying category information
 * @param {Object} props - Component props
 * @param {string} props.category - Category slug/name
 * @param {string} props.title - Display title for category
 * @param {string} props.description - Category description
 * @param {string} props.icon - Icon character or emoji
 * @param {number} props.productCount - Number of products in category
 */
export function CategoryCard({ category, title, description, icon, productCount }) {
  return (
    <Link
      to={`/category/${category}`}
      className="card p-6 hover:scale-105 transition-transform duration-300 group"
    >
      <div className="flex flex-col items-center text-center space-y-2 md:space-y-4">
        {/* Icon */}
        <div className="w-12 h-12 md:w-20 md:h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl md:text-4xl group-hover:bg-primary-200 transition-colors">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-base md:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-xs md:text-sm line-clamp-2">
            {description}
          </p>
        )}

        {/* Product Count Badge */}
        <div className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 bg-gray-100 rounded-full text-xs md:text-sm text-gray-700">
          {productCount} {productCount === 1 ? 'Item' : 'Items'}
        </div>

        {/* View Button */}
        <button className="mt-2 md:mt-4 btn-primary w-full text-xs md:text-base py-1.5 md:py-2">
          Browse
        </button>
      </div>
    </Link>
  );
}
