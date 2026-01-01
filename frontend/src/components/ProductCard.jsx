import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProductCard component for displaying product information
 * Shows edit button only to admin users
 * @param {Object} props - Component props
 * @param {Object} props.product - Product object
 * @param {Function} props.onEdit - Optional callback for edit action
 */
export function ProductCard({ product, onEdit, onDelete, onToggleStock }) {
  const { isAdmin } = useAuth();
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Persist "submitted" state using localStorage
  const [isInterestSubmitted, setIsInterestSubmitted] = useState(() => {
    return !!localStorage.getItem(`interest_${product._id}`);
  });

  const [userDetails, setUserDetails] = useState({
    username: localStorage.getItem('user_name') || '',
    mobile: localStorage.getItem('user_mobile') || ''
  });

  const [userRating, setUserRating] = useState(() => {
    return Number(localStorage.getItem(`rating_${product._id}`)) || 0;
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate average rating
  const ratings = product.ratings || [];
  const averageRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : 0;

  const handleRate = async (star) => {
    if (ratingLoading) return;
    setRatingLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/products/${product._id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: star }),
      });
      if (response.ok) {
        setUserRating(star);
        localStorage.setItem(`rating_${product._id}`, star);

        // Optimistically update the product's ratings array in the UI
        product.ratings.push(star);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleInterested = async () => {
    if (product.isTemporarilyClosed) return; // Prevent if closed

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
        localStorage.setItem(`interest_${product._id}`, 'true');
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
        className={`card overflow-hidden flex flex-col h-full cursor-pointer group ${product.isTemporarilyClosed ? 'opacity-75 grayscale-[0.5]' : ''}`}
      >
        {/* Product Image */}
        <div className="relative h-32 md:h-48 overflow-hidden bg-gray-200">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">
              <svg className="w-10 h-10 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          <img
            src={product.imageUrl}
            alt={product.title}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              if (e.target.src !== fallback) {
                e.target.src = fallback;
              }
            }}
            className={`w-full h-full object-cover hover:scale-110 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />
          {/* Category Badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[8px] md:text-[10px] font-semibold text-primary-600 capitalize">
            {product.category}
          </div>
          {/* Out of Stock Overlay */}
          {product.isTemporarilyClosed && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] md:text-sm shadow-lg transform -rotate-12 border-2 border-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-2 md:p-4 flex flex-col flex-grow">
          <div className="mb-1 md:mb-2">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 leading-tight line-clamp-2">
              {product.title}
            </h3>
            {/* Rating Stars */}
            <div className="mt-1 md:mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRate(star); }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={isAdmin || ratingLoading}
                    className={`text-base md:text-xl focus:outline-none transition-colors ${(hoverRating || userRating) >= star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                {averageRating > 0 ? `(${averageRating})` : '(No ratings yet)'} • {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-[10px] md:text-xs mb-2 md:mb-4 flex-grow line-clamp-2 md:line-clamp-3">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 mt-auto">
            <span className="text-base md:text-xl font-bold text-primary-600">
              ₹{product.price.toFixed(2)}
            </span>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex flex-wrap gap-1 md:gap-2 justify-end w-full sm:w-auto">
                {onToggleStock && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleStock(product); }}
                    className={`px-2 py-1 rounded-md text-xs font-semibold md:text-xs transition-colors ${product.isTemporarilyClosed
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {product.isTemporarilyClosed ? 'Closed' : 'Open'}
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs font-semibold md:text-xs transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
                    className="px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-xs font-semibold md:text-xs transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}

            {/* Regular User Interaction */}
            {!isAdmin && (
              <div className="flex flex-col items-end w-full sm:w-auto">
                <button
                  onClick={handleInterested}
                  disabled={loading || isInterestSubmitted || product.isTemporarilyClosed}
                  className={`w-full sm:w-auto px-2 py-1.5 md:px-4 md:py-2 text-white rounded-lg font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    ${product.isTemporarilyClosed
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                    }`}
                >
                  {product.isTemporarilyClosed
                    ? 'Out of Stock'
                    : isInterestSubmitted
                      ? 'Interested ✓'
                      : loading
                        ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-3 w-3 md:h-4 md:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        )
                        : 'Interested'}
                </button>

                {/* Interest Popup Modal */}
                {showInput && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
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
                            disabled={loading}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-lg shadow-primary-600/30 disabled:opacity-75 flex justify-center items-center"
                          >
                            {loading ? (
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : 'Submit'}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all scale-100" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Image Area */}
            <div className="w-full h-48 bg-gray-100 relative shrink-0">
              <img
                src={product.imageUrl}
                alt={product.title}
                onError={(e) => { if (e.target.src !== fallback) e.target.src = fallback; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-primary-600 uppercase tracking-wide">
                {product.category}
              </div>
              {product.isTemporarilyClosed && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded font-bold uppercase text-xs shadow-lg transform -rotate-12 border border-white">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col h-auto">
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-400 text-base">★</span>
                <span className="text-xs font-bold text-gray-700">
                  {averageRating > 0 ? averageRating : '0.0'}
                </span>
                <span className="text-[10px] text-gray-400">
                  ({ratings.length} ratings)
                </span>
              </div>

              <div className="text-2xl font-bold text-primary-600 mb-2">
                ₹{product.price.toFixed(2)}
              </div>

              <div className="prose prose-sm text-gray-600 text-xs mb-4 line-clamp-4 leading-relaxed">
                {product.description}
              </div>

              {/* Action Button */}
              {!isAdmin && (
                <div className="mt-auto pt-2">
                  <button
                    onClick={handleInterestedClickFromDetails}
                    disabled={isInterestSubmitted || product.isTemporarilyClosed}
                    className={`w-full py-2.5 rounded-xl transition-all font-semibold text-sm shadow-md active:scale-95 ${product.isTemporarilyClosed
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isInterestSubmitted
                        ? 'bg-green-600 text-white opacity-90'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                  >
                    {product.isTemporarilyClosed ? 'Out of Stock' : (isInterestSubmitted ? 'Response Recorded ✓' : "I'm Interested")}
                  </button>
                  {!product.isTemporarilyClosed && (
                    <p className="text-center text-[10px] text-gray-400 mt-2">
                      Click to share your details with us
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
