import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";  

const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/signin"  />;
  }

  try {
    const decodedToken = jwtDecode(token);  
    
    // Check if the user is an admin
    if (decodedToken.role === 'seller') {
      return <Navigate to="/restricted/user"  />;
    }

    return children;
  } catch (error) {
    console.error("Token decoding failed:", error);
    return <Navigate to="/signin"  />;
  }
};

export default UserProtectedRoute;