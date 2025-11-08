import axios from "axios";

export const handleSignup = async (userData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}user/signup`,
      userData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const handleSignin = async (credentials) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}user/signin`,
      credentials
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Signin failed. Please try again.";
    throw new Error(errorMessage);
  }
};
