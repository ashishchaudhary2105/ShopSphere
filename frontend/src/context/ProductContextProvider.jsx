import React, { useState, useEffect, useCallback } from "react";
import ProductContext from "./ProductContext";
import axios from "axios"; // or your preferred HTTP client

const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}products/`
      );
      console.log(response.data.products);

    setProducts(response.data.products);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Function to refresh products
  const refreshProducts = async () => {
    await fetchProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        loading,
        error,
        refreshProducts, // Expose the refresh function
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContextProvider;
