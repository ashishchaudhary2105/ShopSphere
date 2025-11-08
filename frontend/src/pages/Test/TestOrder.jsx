import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import UserContext from "@/context/UserContext";
import { getSellerOrders } from "@/services/orderApi";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-red-500 text-xl mb-4">Something went wrong</h2>
          <div className="mb-2 text-gray-600">{this.state.error.message}</div>
          <div className="flex gap-2">
            <Button onClick={this.handleRetry}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// OrderTable Component
const OrderTable = ({ orders = [], loading, error }) => {
  // Safe calculation of total revenue
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (order?.totalPrice || 0);
  }, 0);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return "destructive";
    switch (status.toLowerCase()) {
      case "delivered": return "default";
      case "shipped": return "secondary";
      case "processing": return "outline";
      default: return "destructive";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg mb-4">Error loading orders</div>
        <div className="mb-4 text-gray-600">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 text-lg">No orders found</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-full">
        <TableCaption>Recent customer orders</TableCaption>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead className="min-w-[150px]">Customer</TableHead>
            <TableHead className="min-w-[200px] hidden md:table-cell">
              Products
            </TableHead>
            <TableHead className="w-[120px] hidden sm:table-cell">
              Order Date
            </TableHead>
            <TableHead className="min-w-[200px] hidden lg:table-cell">
              Delivery Address
            </TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[120px] hidden md:table-cell">
              Payment
            </TableHead>
            <TableHead className="w-[100px] text-right">Amount</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id || Math.random().toString(36).substring(2, 9)}>
              <TableCell className="font-medium">
                {order.orderNumber ||
                  `ORD-${(order._id || "").toString().substring(0, 8).toUpperCase()}`}
              </TableCell>
              <TableCell>
                <div className="font-medium">{order.user?.username || "N/A"}</div>
                {order.user?.email && (
                  <div className="text-sm text-gray-500 hidden sm:block">
                    {order.user.email}
                  </div>
                )}
                <Badge variant="outline" className="mt-1 hidden sm:inline-flex">
                  {order.user?.role || "Customer"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1">
                  {(order.orderItems || []).map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {item.quantity || 0} × {item.name || "Unknown Product"}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="text-sm line-clamp-2">
                  {order.shippingAddress?.street || ""}
                  {order.shippingAddress?.street && <br />}
                  {order.shippingAddress?.city || "N/A"},{" "}
                  {order.shippingAddress?.state || "N/A"},{" "}
                  {order.shippingAddress?.zip || "N/A"},{" "}
                  {order.shippingAddress?.country || "N/A"}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getStatusBadgeVariant(order.status)}
                  className="whitespace-nowrap"
                >
                  {order.status || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">
                  {order.paymentMethod || "Unknown"}
                </Badge>
                {order.isPaid && (
                  <div className="text-xs text-green-500 mt-1">Paid</div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Order Details - {order.orderNumber || `ORD-${order._id.substring(0, 8).toUpperCase()}`}
                      </DialogTitle>
                      <DialogDescription>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h3 className="font-medium">Customer Information</h3>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p>{order.user?.username || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{order.user?.email || "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium">Order Summary</h3>
                            <div className="overflow-x-auto">
                              <Table className="mt-2 min-w-full">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.orderItems?.map((item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          {item.name}
                                          {order.productDetails?.[idx]?.images && (
                                            <img 
                                              src={order.productDetails[idx].images} 
                                              alt={item.name}
                                              className="w-10 h-10 object-cover rounded"
                                            />
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">{item.quantity}</TableCell>
                                      <TableCell className="text-right">₹{item.price?.toLocaleString('en-IN')}</TableCell>
                                      <TableCell className="text-right">
                                        ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableFooter>
                                  <TableRow>
                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                    <TableCell className="text-right">₹{order.itemsPrice?.toLocaleString('en-IN')}</TableCell>
                                  </TableRow>
                                  {order.shippingPrice && (
                                    <TableRow>
                                      <TableCell colSpan={3}>Shipping</TableCell>
                                      <TableCell className="text-right">₹{order.shippingPrice?.toLocaleString('en-IN')}</TableCell>
                                    </TableRow>
                                  )}
                                  {order.taxPrice && (
                                    <TableRow>
                                      <TableCell colSpan={3}>Tax</TableCell>
                                      <TableCell className="text-right">₹{order.taxPrice?.toLocaleString('en-IN')}</TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow className="font-bold">
                                    <TableCell colSpan={3}>Total</TableCell>
                                    <TableCell className="text-right">₹{order.totalPrice?.toLocaleString('en-IN')}</TableCell>
                                  </TableRow>
                                </TableFooter>
                              </Table>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium">Shipping Information</h3>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p>
                                  {order.shippingAddress?.street && (
                                    <>
                                      {order.shippingAddress.street}
                                      <br />
                                    </>
                                  )}
                                  {order.shippingAddress?.city || "N/A"},{" "}
                                  {order.shippingAddress?.state || "N/A"}
                                  <br />
                                  {order.shippingAddress?.zip || "N/A"},{" "}
                                  {order.shippingAddress?.country || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {order.status || "Unknown"}
                                </Badge>
                                {order.isDelivered && order.deliveredAt && (
                                  <div className="mt-1 text-xs">
                                    Delivered on: {formatDate(order.deliveredAt)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Payment Method</p>
                                <Badge variant="outline">
                                  {order.paymentMethod || "Unknown"}
                                </Badge>
                                {order.isPaid && order.paidAt && (
                                  <div className="mt-1 text-xs">
                                    Paid on: {formatDate(order.paidAt)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="sm:hidden">
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Order Details - {order.orderNumber || `ORD-${order._id.substring(0, 8).toUpperCase()}`}
                      </DialogTitle>
                      <DialogDescription>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h3 className="font-medium">Customer Information</h3>
                            <div className="mt-2 grid grid-cols-1 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p>{order.user?.username || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{order.user?.email || "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium">Order Summary</h3>
                            <div className="overflow-x-auto">
                              <Table className="mt-2 min-w-full">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.orderItems?.map((item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          {item.name}
                                          {order.productDetails?.[idx]?.images && (
                                            <img 
                                              src={order.productDetails[idx].images} 
                                              alt={item.name}
                                              className="w-10 h-10 object-cover rounded"
                                            />
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">{item.quantity}</TableCell>
                                      <TableCell className="text-right">₹{item.price?.toLocaleString('en-IN')}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableFooter>
                                  <TableRow>
                                    <TableCell colSpan={2}>Total</TableCell>
                                    <TableCell className="text-right">₹{order.totalPrice?.toLocaleString('en-IN')}</TableCell>
                                  </TableRow>
                                </TableFooter>
                              </Table>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium">Shipping Information</h3>
                            <div className="mt-2 grid grid-cols-1 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p>
                                  {order.shippingAddress?.street && (
                                    <>
                                      {order.shippingAddress.street}
                                      <br />
                                    </>
                                  )}
                                  {order.shippingAddress?.city || "N/A"},{" "}
                                  {order.shippingAddress?.state || "N/A"}
                                  <br />
                                  {order.shippingAddress?.zip || "N/A"},{" "}
                                  {order.shippingAddress?.country || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {order.status || "Unknown"}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Payment</p>
                                <Badge variant="outline">
                                  {order.paymentMethod || "Unknown"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-gray-100">
          <TableRow>
            <TableCell colSpan={5} className="hidden sm:table-cell">
              Total Revenue
            </TableCell>
            <TableCell colSpan={3} className="sm:hidden">
              Total
            </TableCell>
            <TableCell className="text-right font-medium">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </TableCell>
               <TableCell className="text-right font-medium">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </TableCell>
            <TableCell className="text-right">{orders.length} orders</TableCell>
             <TableCell colSpan={3} className="sm:hidden">
              Total
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

// SellerTestOrders Component
const SellerTestOrders = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.data?._id) {
          throw new Error("User not authenticated");
        }

        const response = await getSellerOrders(user.data._id);
        
        if (!response) {
          throw new Error("No response from server");
        }

        // Handle the nested response structure
        if (response.success && response.data?.success) {
          setOrders(response.data.data || []);
        } else {
          throw new Error(response.data?.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "An unknown error occurred");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.data?._id]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <Sidebar className="w-full md:w-64" />
        <div className="flex-1 md:p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 md:p-0">
            <h1 className="text-2xl font-bold">Customer Orders</h1>
          </div>
          <OrderTable orders={orders} loading={loading} error={error} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SellerTestOrders;