import React, { useEffect, useState, useContext } from "react";
import OrderContext from "./OrderContext";
import UserContext from "./UserContext";
import { getSellerOrders } from "@/services/orderApi";

const OrderContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.data?._id) {
        setLoading(false);
        return; // Don't throw error, just return
      }

      const response = await getSellerOrders(user.data._id);

      if (!response) {
        throw new Error("No response from server");
      }

      // Handle different possible response structures
      if (response.success) {
        // Case 1: response.data is the actual data
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } 
        // Case 2: nested response structure
        else if (response.data?.success) {
          setOrders(response.data.data || []);
        } else {
          setOrders([]);
        }
      } else {
        throw new Error(response.message || response.data?.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "An unknown error occurred");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]); // Add user as dependency

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return (
    <OrderContext.Provider
      value={{ orders, setOrders, loading, error, refreshOrders }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;