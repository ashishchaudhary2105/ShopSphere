import { ShoppingBag, ArrowRight } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { addItemToCart } from "@/services/cartApi";
import UserContext from "@/context/UserContext";
import ProductContext from "@/context/ProductContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
const LandingPageCard = ({ product }) => {
  const { loading, refreshCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const user = useContext(UserContext);

  const handleAddToCart = async () => {
    try {
      await addItemToCart({
        productId: product._id,
        quantity: 1,
      });

      if (refreshCart) refreshCart();
      toast.success("Added successfully to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast("Failed to add to cart");
    }
  };

  return (
    <div
      className="relative group overflow-hidden rounded-xl aspect-[3/4] w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        className={`w-full h-full object-cover transition-all duration-500 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
        src={product.images}
        alt={product.name}
        onError={(e) => {
          e.target.src = "/placeholder-product.jpg";
        }}
      />
      <button
        onClick={handleAddToCart}
        className={`absolute top-3 right-3 z-20 p-2 bg-white rounded-full shadow-md transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <ShoppingBag className="w-4 h-4 text-gray-800" />
      </button>
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-300 ${
          isHovered ? "translate-y-0" : "translate-y-10"
        }`}
      >
        <h2 className="text-xl font-bold tracking-tight mb-1 line-clamp-1">
          {product.name}
        </h2>
        <p className="text-lg font-medium">
          ₹{(product.price / 100).toFixed(2)}
        </p>
        <button className="mt-2 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:underline">
          View details <ArrowRight className="ml-1 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8 text-center">
    <h2 className="text-3xl font-bold mb-2">{title}</h2>
    {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="bg-gray-200 text-white py-16 px-4 rounded-xl">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl text-black font-bold mb-2">
          Join Our Newsletter
        </h2>
        <p className="mb-8 text-black ">
          Get 10% off your first order and stay updated with our latest arrivals
          and offers.
        </p>

        {isSubmitted ? (
          <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg">
            <p className="text-green-300">
              Thank you for subscribing! Check your email for confirmation.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow rounded-full px-6 py-3 bg-gray-300 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <button
              type="submit"
              className="bg-white text-black font-medium rounded-full px-6 py-3 hover:bg-gray-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Landing = () => {
  const { products, loading: productsLoading } = useContext(ProductContext);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const navigate = useNavigate();
  // Categorize products
  useEffect(() => {
    if (products && products.length > 0) {
      // Shuffle products and pick random ones for each section
      const shuffled = [...products].sort(() => 0.5 - Math.random());

      // Get 6 products for each section (adjust as needed)
      setTrendingProducts(shuffled.slice(0, 6));
      setNewArrivals(
        [...products]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6)
      );
      setBestSellers(
        [...products]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6)
      );
    }
  }, [products]);

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        {/* Main Image */}
        <div className="md:w-2/3 h-[500px] rounded-2xl overflow-hidden relative group">
          <img
            src="/top-left.jpg"
            alt="Main summer outfit"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center pl-12">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-4">
                Summer Collection 2023
              </h1>
              <p className="text-white/90 mb-6">
                Discover our latest arrivals designed for comfort and style
              </p>
              <button
                onClick={() => {
                  navigate("/products");
                }}
                className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {/* Side Images */}
        <div className="md:w-1/3 flex flex-col gap-6">
          <div className="h-[240px] w-full rounded-2xl overflow-hidden relative group">
            <img
              src="/top-right-up.jpg"
              alt="Summer outfit detail"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
              <h2 className="text-xl font-bold text-white">New Accessories</h2>
            </div>
          </div>
          <div className="h-[240px] w-full rounded-2xl overflow-hidden relative group">
            <img
              src="/top-right-down.jpg"
              alt="Summer outfit accessory"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
              <h2 className="text-xl font-bold text-white">
                Casual Essentials
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Inspiration Section */}
      <div className="flex flex-col md:flex-row gap-8 my-16 items-center">
        <div className="md:w-1/3">
          <h1 className="text-4xl font-bold mb-4">Casual Inspiration</h1>
          <p className="text-gray-600 mb-6">
            Our favorite combinations for casual outfits that can inspire your
            daily looks
          </p>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center text-blue-400 font-medium hover:underline"
          >
            Explore more looks <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
        <div className="md:w-2/3 grid grid-cols-2 gap-4">
          <div className="h-[300px] rounded-2xl overflow-hidden group">
            <img
              src="/middle-right-1.jpg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Casual outfit 1"
            />
          </div>
          <div className="h-[300px] rounded-2xl overflow-hidden group">
            <img
              src="/middle-right-2.jpg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Casual outfit 2"
            />
          </div>
        </div>
      </div>

      <hr className="my-16 border-gray-200" />

      {/* Product Sections */}
      <div className="space-y-20">
        {/* Trending Now */}
        <section className="animate-fade-in">
          <SectionHeader
            title="Trending Now"
            subtitle="Discover what everyone is loving this season"
          />
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {trendingProducts.map((product) => (
                <LandingPageCard
                  key={`trending-${product._id}`}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No trending products found
            </div>
          )}
        </section>

        {/* New Arrivals */}
        <section className="animate-fade-in">
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh styles just added to our collection"
          />
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {newArrivals.map((product) => (
                <LandingPageCard key={`new-${product._id}`} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No new arrivals found
            </div>
          )}
        </section>

        {/* Best Sellers */}
        <section className="animate-fade-in">
          <SectionHeader
            title="Best Sellers"
            subtitle="Our customer favorites that never go out of style"
          />
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {bestSellers.map((product) => (
                <LandingPageCard
                  key={`best-${product._id}`}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No best sellers found
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="my-20">
          <Newsletter />
        </section>
      </div>
    </div>
  );
};

export default Landing;
