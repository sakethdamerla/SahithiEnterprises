import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProductCard component for displaying product information
 * Shows edit button only to admin users
 * @param {Object} props - Component props
 * @param {Object} props.product - Product object
 * @param {Function} props.onEdit - Optional callback for edit action
 */
export function ProductCard({ product, onEdit }) {
  const { isAdmin } = useAuth();
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isInterestSubmitted, setIsInterestSubmitted] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: localStorage.getItem('user_name') || '',
    mobile: localStorage.getItem('user_mobile') || ''
  });

  const handleInterested = async () => {
    const mobile = localStorage.getItem('user_mobile');
    const username = localStorage.getItem('user_name');

    if (!mobile || !username) {
      setShowInput(true);
      return;
    }

    submitInterest(mobile, username);
  };

  const submitInterest = async (mobile, username) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          productTitle: product.title,
          mobile,
          username
        }),
      });

      if (response.ok) {
        setMessage('Interest registered!');
        setIsInterestSubmitted(true);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to register.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error occurred.');
    } finally {
      setLoading(false);
      setShowInput(false);
    }
  };

  const handleSubmitInterest = (e) => {
    e.preventDefault();
    localStorage.setItem('user_mobile', userDetails.mobile);
    localStorage.setItem('user_name', userDetails.username);
    submitInterest(userDetails.mobile, userDetails.username);
  };

  // Robust fallback image (Data URI to avoid external fetch errors)
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect fill='%23e2e8f0' width='900' height='600'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EProduct Image%3C/text%3E%3C/svg%3E";

  const handleCardClick = (e) => {
    // Don't open details if clicking buttons or inputs
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('form')) {
      return;
    }
    setShowDetails(true);
  };

  const handleInterestedClickFromDetails = () => {
    setShowDetails(false);
    handleInterested();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="card overflow-hidden flex flex-col h-full cursor-pointer group"
      >
        {/* Product Image */}
        <div className="relative h-48 md:h-64 overflow-hidden bg-gray-200">
          <img
            src={product.imageUrl}
            alt={product.title}
            onError={(e) => {
              if (e.target.src !== fallback) {
                e.target.src = fallback;
              }
            }}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          {/* Category Badge */}
          <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-600 capitalize">
            {product.category}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {product.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 flex-grow">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
            <span className="text-xl md:text-2xl font-bold text-primary-600">
              ₹{product.price.toFixed(2)}
            </span>

            {/* Admin Edit Button */}
            {isAdmin && onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                aria-label={`Edit ${product.title}`}
              >
                Edit
              </button>
            )}

            {/* Regular User Interaction */}
            {!isAdmin && (
              <div className="flex flex-col items-end w-full sm:w-auto">
                <button
                  onClick={handleInterested}
                  disabled={loading || isInterestSubmitted}
                  className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInterestSubmitted ? 'Interested ✓' : loading ? 'Sending...' : 'Interested'}
                </button>

                {/* Interest Popup Modal */}
                {showInput && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 transition-all">
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">One Last Step</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Please provide your details so we can contact you about <strong>{product.title}</strong>
                        </p>
                      </div>

                      <form onSubmit={handleSubmitInterest} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={userDetails.username}
                            onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={userDetails.mobile}
                            onChange={(e) => setUserDetails({ ...userDetails, mobile: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                            required
                            pattern="[0-9]{10}"
                            maxLength={10}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowInput(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-lg shadow-primary-600/30"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
                    <span className="text-green-400">✓</span>
                    {message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Details Popup Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-800 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Large Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
              <img
                src={product.imageUrl}
                alt={product.title}
                onError={(e) => { if (e.target.src !== fallback) e.target.src = fallback; }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Content */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="flex-grow">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
                  {product.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {product.title}
                </h2>
                <div className="text-3xl font-bold text-primary-600 mb-6">
                  ₹{product.price.toFixed(2)}
                </div>
                <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              </div>

              {/* Action Bar in Modal */}
              {!isAdmin && (
                <div className="mt-auto pt-6 border-t">
                  <button
                    onClick={handleInterestedClickFromDetails}
                    disabled={isInterestSubmitted}
                    className={`w-full py-3 rounded-xl transition-all font-semibold text-lg shadow-lg active:scale-95 ${isInterestSubmitted
                        ? 'bg-green-600 text-white shadow-green-600/30 cursor-not-allowed opacity-90'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30'
                      }`}
                  >
                    {isInterestSubmitted ? 'Response Recorded ✓' : "I'm Interested"}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Click to share your details with us
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
