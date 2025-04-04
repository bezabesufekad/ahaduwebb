import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useUserAuth } from "../utils/userAuthStore";
import { useOrderStore, Order as OrderType } from "../utils/orderStore";
import { toast } from "sonner";
import brain from "../brain";

// Format address safely for display
const formatShippingAddress = (order: Order) => {
  if (!order.shippingInfo) return 'N/A';
  
  const city = order.shippingInfo.city || 'N/A';
  const country = order.shippingInfo.country || 'N/A';
  
  return `${city}, ${country}`;
};

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useUserAuth();
  const { getAllOrders, fetchUserOrders, loading, error, updateOrderStatus } = useOrderStore();
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // Redirect if not authenticated and fetch orders
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view your orders");
      navigate('/sign-in');
      return;
    }
    
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        // Fetch all orders - should only be allowed for admin users
        // In a real app, this would have proper role-based authorization
        const response = await brain.get_all_orders();
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders. Please try again.");
        
        // Fall back to local data
        if (currentUser?.email) {
          try {
            await fetchUserOrders(currentUser.email);
          } catch (fetchErr) {
            console.error("Error fetching user orders:", fetchErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [isAuthenticated, currentUser, navigate, fetchUserOrders]);
  
  // Display error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  // Get orders
  const orders = getAllOrders();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const getStatusColor = (status: OrderType["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: OrderType["status"]) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <ToastProvider />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Your Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="inline-block p-4 rounded-full mb-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Loading your orders...</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Please wait while we fetch your order history.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't placed any orders yet. Start shopping and your orders will appear here.</p>
            <button 
              onClick={() => navigate('/shop')} 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">Order #{order.id.slice(-8)}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-medium text-gray-900">ETB {order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderType['status'])}
                        disabled={updatingOrderId === order.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === order.id && (
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full ml-2"></div>
                      )}
                      <button
                        onClick={() => navigate(`/order?orderId=${order.id}`)}
                        className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Order items */}
                <div className="px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Items ({order.items.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500 mt-1">ETB {item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center h-16 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order footer */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500">Payment Method: <span className="font-medium">{order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Payment on Delivery'}</span></p>
                    <p className="text-gray-500">
                      Shipping to: <span className="font-medium">{formatShippingAddress(order)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}