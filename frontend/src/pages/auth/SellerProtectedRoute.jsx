import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Updated import

const SellerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  try {
    const decodedToken = jwtDecode(token); // Updated function name
    console.log(decodedToken);

    if (decodedToken.role === "user") {
      return <Navigate to="/restricted/seller" />;
    }

    return children;
  } catch (error) {
    console.error("Token decoding failed:", error);
    return <Navigate to="/signin" />;
  }
};

export default SellerProtectedRoute;
