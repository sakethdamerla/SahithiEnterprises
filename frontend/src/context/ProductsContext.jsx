import { createContext, useContext, useState, useEffect } from 'react';

// Create Products Context
const ProductsContext = createContext(undefined);

/**
 * ProductsProvider component that wraps the app and provides products state
 * Uses localStorage to persist product data across page refreshes
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add a new product
   * @param {Object} product - Product object without id
   * @returns {Object} - The newly created product with id
   */
  const addProduct = async (product) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    }
    return null;
  };

  /**
   * Update an existing product
   * @param {string} id - Product id
   * @param {Object} updatedData - Updated product data
   * @returns {boolean} - True if update successful
   */
  const updateProduct = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map((p) => (p._id === id ? updatedProduct : p)));
        return true;
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
    return false;
  };

  /**
   * Delete a product
   * @param {string} id - Product id to delete
   * @returns {boolean} - True if deletion successful
   */
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter((p) => p._id !== id));
        return true;
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
    return false;
  };

  /**
   * Get products by category
   * @param {string} category - Category slug
   * @returns {Array} - Array of products in the category
   */
  const getProductsByCategory = (category) => {
    return products.filter((p) => p.category === category);
  };

  /**
   * Get all unique categories from products
   * @returns {Array} - Array of unique category names
   */
  const getCategories = () => {
    const categories = [...new Set(products.map((p) => p.category))];
    return categories;
  };

  const value = {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getCategories,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

/**
 * Custom hook to use the products context
 * @returns {Object} Products context value
 * @throws {Error} If used outside of ProductsProvider
 */
export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
