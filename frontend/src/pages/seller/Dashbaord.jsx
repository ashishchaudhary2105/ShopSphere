import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Chart,
  DoughnutController,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Filter,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SellerProductContext from "@/context/SellerProductContext";
import ProductContext from "@/context/ProductContext";
import UserContext from "@/context/UserContext";
import { getSellerOrders } from "@/services/orderApi";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
);

function Dashboard() {
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { products } = useContext(SellerProductContext);
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
          console.log(orders);
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
  console.log(products);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate stats from context data
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const totalProducts = products?.length || 0;
  const uniqueCustomers = new Set(orders.map((order) => order.user?._id)).size;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <div>
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                Welcome back, {user?.data?.username}
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Here's what's happening with your store today
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <SaleReport
                description="Total Sales"
                amount={totalSales.toFixed(2)}
                percent={14}
                icon={<DollarSign size={20} className="md:size-[22px]" />}
                color="indigo"
              />
              <SaleReport
                description="Total Orders"
                amount={totalOrders}
                percent={17}
                icon={<ShoppingCart size={20} className="md:size-[22px]" />}
                color="blue"
              />
              <SaleReport
                description="Total Revenue"
                amount={totalSales.toFixed(2)}
                percent={14}
                icon={<TrendingUp size={20} className="md:size-[22px]" />}
                color="emerald"
              />
              <SaleReport
                description="Total Customers"
                amount={uniqueCustomers}
                percent={-11}
                icon={<Users size={20} className="md:size-[22px]" />}
                color="rose"
              />
            </div>

            {/* Charts Row */}
            <div className=" md:gap-6 mb-6 md:mb-8">
              {/* Main Graph */}
              <div className="lg:col-span-4 bg-white rounded-lg md:rounded-xl shadow-sm p-4 md:p-5 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">
                    Revenue Overview
                  </h3>
                  <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 py-1 px-3 rounded-md text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Last 3 Months</option>
                  </select>
                </div>
                <div className="h-48 sm:h-56 md:h-64">
                  <Graph />
                </div>
              </div>

              {/* Sales Location */}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Products Table */}
              <div className="lg:col-span-3 bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100">
                <TopSellingProducts products={products} orders={orders} />
              </div>

              {/* Monthly Target */}
              <div className="lg:col-span-1">
                <MonthlyTarget totalSales={totalSales} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const MonthlyTarget = ({ totalSales }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const target = 25000;
  const percentage = Math.min((totalSales / target) * 100, 100);
  const todayEarnings = totalSales * 0.1; // Example: 10% of total sales
  const revenue = totalSales * 0.8; // Example: 80% of total sales
  const today = totalSales * 0.1; // Example: 10% of total sales

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new ChartJS(ctx, {
          type: "doughnut",
          data: {
            datasets: [
              {
                data: [percentage, 100 - percentage],
                backgroundColor: ["#6366F1", "#E5E7EB"],
                borderWidth: 0,
                borderRadius: 5,
                circumference: 360,
                cutout: "80%",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            plugins: {
              tooltip: {
                enabled: false,
              },
            },
            animation: {
              animateRotate: true,
              animateScale: false,
            },
            elements: {
              arc: {
                roundedCornersFor: 0,
              },
            },
          },
        });
      }
    }

    // Clean up chart instance on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [percentage]);

  return (
    <div className="p-4 md:p-5 bg-white shadow-sm rounded-lg md:rounded-xl border border-gray-100 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <h4 className="text-base md:text-lg font-semibold text-gray-800">
          Monthly Target
        </h4>
        <MoreHorizontal
          size={16}
          className="cursor-pointer text-gray-400 hover:text-gray-600 md:size-[18px]"
        />
      </div>

      {/* Progress Chart using Chart.js */}
      <div className="flex justify-center items-center mb-4 md:mb-5 relative">
        <div className="w-28 h-28 md:w-36 md:h-36 relative">
          <canvas ref={chartRef} width="144" height="144"></canvas>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg md:text-xl font-bold text-gray-800">
              {percentage.toFixed(2)}%
            </div>
            <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md mt-1 font-medium">
              +12%
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Text */}
      <p className="text-center text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-1 md:px-2">
        You earned{" "}
        <span className="font-semibold text-gray-800">
          {formatCurrency(todayEarnings)}
        </span>{" "}
        today.
        <span className="block mt-1">
          It's higher than last month. Keep up your good work!
        </span>
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 md:pt-4">
        <div className="flex flex-col items-center">
          <span className="text-sm md:text-base font-bold text-gray-800">
            {formatCurrency(target)}
          </span>
          <span className="text-red-500 text-xs font-medium">↓ 8.3%</span>
          <span className="text-gray-500 text-xs mt-1">Target</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm md:text-base font-bold text-gray-800">
            {formatCurrency(revenue)}
          </span>
          <span className="text-green-500 text-xs font-medium">↑ 11.2%</span>
          <span className="text-gray-500 text-xs mt-1">Revenue</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm md:text-base font-bold text-gray-800">
            {formatCurrency(today)}
          </span>
          <span className="text-green-500 text-xs font-medium">↑ 9.7%</span>
          <span className="text-gray-500 text-xs mt-1">Today</span>
        </div>
      </div>
    </div>
  );
};

const TopSellingProducts = ({ products, orders }) => {
  // Calculate top selling products from orders
  const productSales = {};

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (!productSales[item.product]) {
        productSales[item.product] = {
          quantity: 0,
          amount: 0,
          product: products.find((p) => p._id === item.product) || {
            name: item.name,
            images: item.image,
            price: item.price,
          },
        };
      }
      productSales[item.product].quantity += item.quantity;
      productSales[item.product].amount += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="p-4 md:p-5">
      <div className="flex flex-col sm:flex-row justify-center items-center sm:items-center mb-4 md:mb-6 gap-3">
        <h4 className="text-base md:text-lg font-semibold text-gray-800">
          Top Selling Products
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-2 md:py-4 md:px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="py-3 px-2 md:py-4 md:px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="py-3 px-2 md:py-4 md:px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="py-3 px-2 md:py-4 md:px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Category
              </th>
              <th className="py-3 px-2 md:py-4 md:px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="py-3 px-2 md:py-4 md:px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-2 px-2 md:py-3 md:px-3">
                  <input
                    type="checkbox"
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="py-2 px-2 md:py-3 md:px-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <img
                        src={
                          product.product.images || "/placeholder-product.png"
                        }
                        alt={product.product.name}
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />
                    </div>
                    <span className="font-medium text-gray-800 text-sm md:text-base">
                      {product.product.name}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 md:py-3 md:px-3 font-medium text-gray-700 text-sm md:text-base">
                  ${product.product.price.toFixed(2)}
                </td>
                <td className="py-2 px-2 md:py-3 md:px-3 text-gray-600 text-sm hidden sm:table-cell">
                  N/A
                </td>
                <td className="py-2 px-2 md:py-3 md:px-3">
                  <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                    {product.quantity}
                  </span>
                </td>
                <td className="py-2 px-2 md:py-3 md:px-3 font-medium text-gray-700 text-sm hidden xs:table-cell">
                  ${product.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Graph = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "This Year",
        data: [5000, 10000, 7000, 15000, 13000, 17000],
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#6366F1",
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 3,
      },
      {
        label: "Last Year",
        data: [1000, 20000, 4000, 7000, 8000, 12000],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3B82F6",
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          color: "#6B7280",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `$${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

const SaleReport = ({ description, amount, percent, icon, color }) => {
  const isPositive = percent >= 0;
  const amountFormatted = amount;

  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  const iconColorClass = colorMap[color] || "bg-indigo-50 text-indigo-600";

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="space-y-2 md:space-y-3">
          <div className="text-gray-500 font-medium text-sm md:text-base">
            {description}
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            {description.toLowerCase().includes("sales") ||
            description.toLowerCase().includes("revenue")
              ? `$${amountFormatted}`
              : amountFormatted}
          </div>

          <div
            className={`flex items-center gap-1 text-xs md:text-sm font-medium ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isPositive ? (
              <ArrowUp size={12} className="md:size-[14px]" />
            ) : (
              <ArrowDown size={12} className="md:size-[14px]" />
            )}
            <span>{Math.abs(percent)}% vs last month</span>
          </div>
        </div>
        <div className={`p-2 md:p-3 rounded-lg ${iconColorClass}`}>{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;
