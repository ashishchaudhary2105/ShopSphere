import { getUserOrders } from "@/services/orderApi";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const UserOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserOrders();
      if (!response) {
        throw new Error("No response from server");
      }

      if (response.success) {
        const ordersData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setOrders(ordersData);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="gap-1" variant="success">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="gap-1" variant="warning">
            <Clock className="h-4 w-4" /> Pending
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="gap-1" variant="info">
            <Truck className="h-4 w-4" /> Shipped
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="gap-1" variant="destructive">
            <XCircle className="h-4 w-4" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount / 100); // Assuming prices are in paise
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Error loading orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive mb-4">{error}</div>
          <Button onClick={fetchOrders}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>You haven't placed any orders yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="container mx-auto min-h-screen
     px-4 py-8 space-y-6"
    >
      <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>

      {orders.map((order) => (
        <Card key={order._id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 p-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  Order #{order._id.substring(0, 8).toUpperCase()}
                </CardTitle>
                <CardDescription className="text-sm">
                  Placed on {formatDate(order.createdAt)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  {expandedOrder === order._id
                    ? "Hide Details"
                    : "View Details"}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedOrder === order._id && (
            <CardContent className="p-0">
              <div className="grid gap-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-4">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <img
                            src={item.product.images}
                            alt={item.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-medium">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Shipping Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}
                          </p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Payment Method</h3>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>{order.paymentMethod}</span>
                        {order.isPaid && (
                          <Badge variant="success" className="ml-2">
                            Paid
                          </Badge>
                        )}
                      </div>
                      {order.paidAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Paid on {formatDate(order.paidAt)}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.itemsPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>FREE</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default UserOrder;
