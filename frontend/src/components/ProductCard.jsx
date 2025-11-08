import React from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useCart } from "../context/CartContext"; // Custom cart context
import { addItemToCart } from "@/services/cartApi";
import { toast } from "sonner";

const ProductCard = ({
  id,
  title,
  image,
  description,
  price,
  discountPrice,
  stock,
  rating,
}) => {
  const { loading, refreshCart } = useCart(); // If context provides these

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const discountPercentage = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const truncatedDescription =
    description.length > 80
      ? `${description.substring(0, 80)}...`
      : description;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }

    return stars;
  };

  const handleAddToCart = async () => {
    try {
      console.log("Sending to cart:", {
        productId: id,
        quantity: 1,
      });

      await addItemToCart({
        productId: id,
        quantity: 1,
      });

      if (refreshCart) refreshCart(); // Optional: refresh context state
      toast.success("Product Added to Cart");
      console.log("Product added to cart!");
    } catch (error) {
      toast("Product Failed to Add Cart");
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <Card className="w-full max-w-[300px] rounded-lg overflow-hidden dark:bg-gray-800 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          src={image}
          alt={title}
        />

        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
            {discountPercentage}% OFF
          </Badge>
        )}

        {stock <= 5 && stock > 0 && (
          <Badge className="absolute bottom-2 left-2 bg-amber-500 hover:bg-amber-600 text-white">
            Only {stock} left!
          </Badge>
        )}

        {stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3 flex flex-col">
        <h1 className="font-bold text-lg line-clamp-2 hover:underline cursor-pointer">
          {title}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {truncatedDescription}
        </p>

        <div className="flex items-center gap-1">{renderStars()}</div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            {discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-full flex justify-center items-center ${
              stock === 0
                ? "bg-gray-300 cursor-not-allowed"
                : loading
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors duration-200`}
            disabled={stock === 0 || loading}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
