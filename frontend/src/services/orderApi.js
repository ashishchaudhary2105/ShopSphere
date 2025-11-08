import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const placeOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}order/`, orderData, {
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      return {
        success: false,
        message: error.response.data?.message || "Failed to place order",
        error: error.response.data?.error || error.message,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        message: "No response from server",
        error: error.message,
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        message: "Failed to place order",
        error: error.message,
      };
    }
  }
};

export const getSellerOrders = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}order/seller`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch seller orders",
      error: error.response?.data?.error || error.message,
    };
  }
};

export const getUserOrders = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}order/user`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch seller orders",
      error: error.response?.data?.error || error.message,
    };
  }
};
