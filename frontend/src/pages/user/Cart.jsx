import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import CartContext from "@/context/CartContext";
import UserContext from "@/context/UserContext";
import { placeOrder } from "@/services/orderApi";
import { ShoppingBag, X } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CartPage = () => {
  const cart = useContext(CartContext);
  const { user } = useContext(UserContext);

  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0); // Default 0
  const [shipping, setShipping] = useState(0); // Default 0
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CREDIT_CARD);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  // console.log(cart.cartItems[0].product.price);

  const subtotal = cart.cartItems.reduce(
    (sum, item) => sum + item.product?.price * item.quantity,
    0
  );
  const cartTotal = subtotal - discount + shipping;

  const handleRemove = (id) => {
    cart.removeFromCart(id);
  };
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user.data) {
      toast.error("Please login to place an order");
      return navigate("/login");
    }

    if (cart.cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare order data
      const orderData = {
        orderItems: cart.cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          variant: item.variant || "",
        })),
        shippingAddress: {
          address: e.target.street.value,
          city: e.target.city.value,
          postalCode: e.target.zip.value,
          country: e.target.country.value,
          state: e.target.state.value,
        },
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: 0, // You can calculate tax if needed
        shippingPrice: shipping,
      };

      const result = await placeOrder(orderData);

      if (result.success) {
        toast.success("Order placed successfully!");
        cart.clearCart(); // Clear the cart after successful order
        // navigate("/"); // Redirect to orders page
      } else {
        toast.error(result.message || "Failed to place order");
      }
    } catch (error) {
      toast.error("An error occurred while placing your order");
      console.error("Order error:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleQuantityChange = (id, newQty) => {
    if (newQty >= 1) {
      cart.updateCartItemQuantity(id, newQty);
    }
  };

  if (cart.loading) return <p className="p-8 text-center">Loading cart...</p>;
  if (cart.error)
    return <p className="p-8 text-center text-red-500">Error: {cart.error}</p>;

  return (
    <div className="max-w-6xl min-h-screen mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="w-5 h-5" />
        <h1 className="text-xl font-bold">Shopping Bag</h1>
        <span className="text-sm text-gray-500 ml-2">
          {cart.cartItems.length} items in your bag.
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Items */}
        <div className="lg:w-2/3">
          {cart.cartItems.map((item) => (
            <div key={item._id} className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-32 h-40 bg-gray-100 flex-shrink-0">
                  <img
                    src={item.product.images}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Description • {item.product.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product._id)}
                      className="text-gray-400 hover:text-gray-600 h-6"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-lg font-medium">
                      ${(item.product.price / 100).toFixed(2)}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity - 1
                            )
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-lg font-medium">
                        $
                        {((item.product.price * item.quantity) / 100).toFixed(
                          2
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Summary */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-6 rounded">
            <h2 className="text-lg font-bold mb-4">Cart Total</h2>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between py-2">
                <span className="text-sm">Cart Subtotal</span>
                <span className="text-sm">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm">Discount</span>
                <span className="text-sm text-green-600">
                  -${(discount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm">Shipping</span>
                <span className="text-sm">
                  {shipping === 0 ? "Free" : `$${(shipping / 100).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between py-4 border-t border-gray-200 font-bold">
                <span>Total</span>
                <span>${(cartTotal / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* <button onClick={()=>{
            toast.success("Order Placed Sucessfully")
              // navigate('/order')
            }} className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 mt-4">
              Place Order
            </button> */}

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mt-4">Place Order</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex justify-center items-center">
                    Order Summary
                  </DialogTitle>
                  <DialogDescription>
                    <form
                      onSubmit={handlePlaceOrder}
                      className="grid gap-4 py-4"
                    >
                      {/* Shipping Address Section */}
                      <div className="space-y-2">
                        <h3 className="font-medium">Shipping Address</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="street">Street</Label>
                            <Input
                              id="street"
                              name="street"
                              required
                              defaultValue={
                                user.data?.address?.[0]?.street || ""
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              required
                              defaultValue={user.data?.address?.[0]?.city || ""}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              name="state"
                              required
                              defaultValue={
                                user.data?.address?.[0]?.state || ""
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="zip">ZIP/Postal Code</Label>
                            <Input
                              id="zip"
                              name="zip"
                              required
                              defaultValue={user.data?.address?.[0]?.zip || ""}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              required
                              defaultValue={
                                user.data?.address?.[0]?.country || ""
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Section */}
                      <div className="space-y-2">
                        <h3 className="font-medium">Payment Method</h3>
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="Credit Card"
                              id="credit_card"
                            />
                            <Label htmlFor="credit_card">Credit Card</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PayPal" id="paypal" />
                            <Label htmlFor="paypal">PayPal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="Bank Transfer"
                              id="bank_transfer"
                            />
                            <Label htmlFor="bank_transfer">Bank Transfer</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Order Items Summary */}
                      <div className="space-y-2">
                        <h3 className="font-medium">Order Items</h3>
                        <div className="border rounded-lg divide-y">
                          {cart.cartItems.map((item) => (
                            <div
                              key={item.product._id}
                              className="p-4 flex justify-between"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium">
                                ${(item.product.price * item.quantity) / 100}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-medium text-lg pt-2">
                          <span>Total:</span>
                          <span>${(cartTotal / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={isPlacingOrder}
                      >
                        {isPlacingOrder ? "Processing..." : "Confirm Order"}
                      </Button>
                    </form>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;