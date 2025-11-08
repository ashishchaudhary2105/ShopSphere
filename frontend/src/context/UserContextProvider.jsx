import React, { useState, useEffect } from "react";
import axios from "axios";
import UserContext from "./UserContext";

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Optional: Add loading state

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/profile`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If unauthorized (401), remove invalid token
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
