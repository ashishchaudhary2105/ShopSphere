import React, { useState, useEffect, useCallback } from "react";
import SellerProductContext from "./SellerProductContext";
import axios from "axios"; // or your preferred HTTP client

const SellerProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual API endpoint
      console.log();
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}products/createdProducts`,{
        headers:{
          Authorization: localStorage.getItem("token")
        }
      });
      console.log(response);
      
      setProducts(response.data.products);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh function that can be called when a new product is added
  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <SellerProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
      }}
    >
      {children}
    </SellerProductContext.Provider>
  );
};

export default SellerProductContextProvider;