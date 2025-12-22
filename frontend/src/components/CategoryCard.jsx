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
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-4xl group-hover:bg-primary-200 transition-colors">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm">
          {description}
        </p>

        {/* Product Count Badge */}
        <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </div>

        {/* View Button */}
        <button className="mt-4 btn-primary w-full">
          Browse {title}
        </button>
      </div>
    </Link>
  );
}
