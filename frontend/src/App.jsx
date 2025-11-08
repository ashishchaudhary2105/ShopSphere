import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Landing from "./pages/user/Landing";
import Products from "./pages/user/Products";
import CartPage from "./pages/user/Cart";
import Profile from "./pages/user/Porfile";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import ProductContextProvider from "./context/ProductContextProvider";
import SellerProducts from "./pages/seller/SellerProducts";
import Dashboard from "./pages/seller/Dashbaord";
import SellerOrders from "./pages/seller/Orders";
import Sidebar from "./components/Sidebar";
import UserPageWarning from "./pages/user/UserPageWarning";
import SellerPageWarning from "./pages/seller/SellerPageWarning";
import SellerProductContextProvider from "./context/SellerProductContextProvider";
import UserProtectedRoute from "./pages/auth/UserProtectedRoute";
import CartContextProvider from "./context/CartContextProvider";
import Order from "./pages/user/UserOrder";
import UserContextProvider from "./context/UserContextProvider";
import SellerTestOrders from "./pages/Test/TestOrder";
import UserOrder from "./pages/user/UserOrder";
import SellerProductContext from "./context/SellerProductContext";
import SellerProtectedRoute from "./pages/auth/SellerProtectedRoute";

function App() {
  return (
    <UserContextProvider>
      <CartContextProvider>
        <ProductContextProvider>
          <BrowserRouter>
            <Routes>
              {/* User Routes */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <Routes>
                      <Route
                        path="cart"
                        element={
                          <UserProtectedRoute>
                            <CartPage />
                          </UserProtectedRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <UserProtectedRoute>
                            <Profile />
                          </UserProtectedRoute>
                        }
                      />
                      <Route
                        path="products"
                        element={
                          // <UserProtectedRoute>
                            <Products />
                          // </UserProtectedRoute>
                        }
                      />
                      <Route
                        path="orders"
                        element={
                          <UserProtectedRoute>
                            <UserOrder />
                          </UserProtectedRoute>
                        }
                      />
                      <Route path="/" element={<Landing />} />
                    </Routes>
                    <Footer />
                  </>
                }
              />

              {/* Seller Routes */}
              <Route
                path="/seller/*"
                element={
                  <SellerProductContextProvider>
                    <Routes>
                      <Route
                        path="products"
                        element={
                          <SellerProtectedRoute>
                            <SellerProducts />
                          </SellerProtectedRoute>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <SellerProtectedRoute>
                            <Dashboard />
                          </SellerProtectedRoute>
                        }
                      />
                      <Route
                        path="orders"
                        element={
                          <SellerProtectedRoute>
                            <SellerOrders />
                          </SellerProtectedRoute>
                        }
                      />
                    </Routes>
                  </SellerProductContextProvider>
                }
              />
              <Route path="sidebar" element={<Sidebar />} />

              {/* Auth & Restriction Routes */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/restricted/user" element={<UserPageWarning />} />
              <Route
                path="/restricted/seller"
                element={<SellerPageWarning />}
              />
            </Routes>
          </BrowserRouter>
        </ProductContextProvider>
      </CartContextProvider>
    </UserContextProvider>
  );
}

export default App;