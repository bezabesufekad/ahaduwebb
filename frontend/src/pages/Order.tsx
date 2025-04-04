import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useOrderStore, Order as OrderType } from "../utils/orderStore";
import { useUserAuth } from "../utils/userAuthStore";
import { toast } from "sonner";
import brain from "../brain";

// Format address safely for display
const formatShippingAddress = (order: Order) => {
  if (!order.shippingInfo) return 'N/A';
  
  const city = order.shippingInfo.city || 'N/A';
  const state = order.shippingInfo.state || 'N/A';
  const zipCode = order.shippingInfo.zipCode || 'N/A';
  
  return `${city}, ${state} ${zipCode}`;
};

export default function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getOrderById } = useOrderStore();
  const { isAuthenticated, currentUser } = useUserAuth();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get order ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  // Support both parameter naming conventions (orderId and id)
  const orderId = queryParams.get("orderId") || queryParams.get("id");
  
  // Effect to load order data
  useEffect(() => {
    setLoading(true);
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast.error("Please sign in to view order details");
      navigate("/sign-in");
      return;
    }
    
    // Safety check for missing order ID
    if (!orderId || orderId === 'undefined' || orderId === undefined) {
      toast.error("Missing order ID");
      navigate("/my-orders");
      return;
    }
    
    console.log("Attempting to fetch order with ID:", orderId);
    
    const fetchOrder = async () => {
      try {
        // Try to fetch from API first
        console.log("Calling API with order ID:", orderId);
        const response = await brain.get_order({ orderId: orderId });
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }
        
        const orderData = await response.json();
        
        // Check if order belongs to current user
        if (currentUser && orderData.shippingInfo.email.toLowerCase() !== currentUser.email.toLowerCase()) {
          toast.error("You don't have permission to view this order");
          navigate("/my-orders");
          return;
        }
        
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order from API, falling back to local storage', error);
        
        // Fallback to local storage
        const orderData = getOrderById(orderId);
        
        // Check if order exists
        if (!orderData) {
          toast.error("Order not found");
          navigate("/my-orders");
          return;
        }
        
        // Check if order belongs to current user
        if (currentUser && orderData.shippingInfo.email.toLowerCase() !== currentUser.email.toLowerCase()) {
          toast.error("You don't have permission to view this order");
          navigate("/my-orders");
          return;
        }
        
        setOrder(orderData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, isAuthenticated, currentUser, getOrderById, navigate]);
  
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
  
  const getStatusDescription = (status: OrderType["status"]) => {
    switch (status) {
      case "pending":
        return "Your order has been received and is pending processing.";
      case "processing":
        return "Your order is being processed and prepared for shipping.";
      case "shipped":
        return "Your order has been shipped and is on its way to you.";
      case "delivered":
        return "Your order has been delivered to the destination address.";
      case "cancelled":
        return "Your order has been cancelled.";
      default:
        return "";
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
        <ToastProvider />
      </div>
    );
  }
  
  if (!order) return null;
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <ToastProvider />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/my-orders')} 
            className="inline-flex items-center text-primary hover:text-primary/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to My Orders
          </button>
        </div>
        
        {/* ULTRA PROMINENT Customer Care Information Banner */}
        <div className="mb-8 p-5 bg-yellow-100 rounded-lg border-2 border-yellow-300 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800 mb-1">IMPORTANT: Our customer care team will contact you</h3>
              <p className="text-gray-700 mb-3">
                <strong className="text-red-600">For all orders:</strong> Our customer care team will call you within 24 hours to confirm your order details. Please ensure your phone is available.
              </p>
              <p className="text-gray-700 mb-3">
                If you need immediate assistance, please contact us using the options below:
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="tel:0940405038" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  0940405038
                </a>
                <a 
                  href="mailto:info@ahadumarket.store" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@ahadumarket.store
                </a>
                <button 
                  onClick={() => {
                    toast.success("Customer care will contact you shortly", {
                      description: "We'll get back to you within 24 hours",
                      duration: 5000,
                    });
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary bg-white rounded font-medium hover:bg-primary/5 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Request Callback
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Order header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">ETB {order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Order status */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${order.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${order.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Order Status</h3>
                <p className="text-gray-600">{getStatusDescription(order.status)}</p>
              </div>
            </div>
          </div>
          
          {/* Order items */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b border-gray-200 last:border-b-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                      <p className="text-base font-medium text-gray-900">ETB {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Category: {item.category}</p>
                    <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity} × ETB {item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping information */}
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="font-medium">{order.shippingInfo?.fullName || 'N/A'}</p>
                  <p className="text-gray-600 mt-1">{order.shippingInfo?.address || 'N/A'}</p>
                  <p className="text-gray-600">
                    {formatShippingAddress(order)}
                  </p>
                  <p className="text-gray-600">{order.shippingInfo?.country || 'N/A'}</p>
                  <div className="border-t border-gray-200 my-3"></div>
                  <p className="text-gray-600">{order.shippingInfo?.phone || 'N/A'}</p>
                  <p className="text-gray-600">{order.shippingInfo?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="font-medium">
                    Payment Method: {order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Payment on Delivery'}
                  </p>
                  
                  {order.paymentProof && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Payment Proof</p>
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <img src={order.paymentProof} alt="Payment proof" className="w-full h-auto" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal:</p>
                <p className="text-gray-900">ETB {order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping:</p>
                <p className="text-gray-900">ETB 0.00</p>
              </div>
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="flex justify-between font-medium">
                  <p className="text-gray-900">Total:</p>
                  <p className="text-primary text-xl">ETB {order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
