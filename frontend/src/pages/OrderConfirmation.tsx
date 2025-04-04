import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useOrderStore, Order } from "../utils/orderStore";
import { toast } from "sonner";
import brain from "../brain";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get('orderId');
  // Fall back to order_id if orderId is not present (for backwards compatibility)
  const fallbackOrderId = new URLSearchParams(location.search).get('order_id');
  // Try to get from session storage as a last resort
  const sessionOrderId = sessionStorage.getItem('lastOrderId') || localStorage.getItem('lastOrderId');
  
  // Use the first available order ID
  const orderIdToUse = orderId || fallbackOrderId || sessionOrderId;
  
  // Add safety checks for order ID to handle different formats
  const { getOrderById } = useOrderStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // TEST MODE FUNCTION - Add a test order if none provided
  const createTestOrder = () => {
    const testOrderId = "test-" + Math.floor(Math.random() * 10000);
    // Redirect to this same page but with the test order ID
    navigate(`/order-confirmation?orderId=${testOrderId}`);
    // Don't force reload as it can cause issues
  };
  
  // Remove duplicate orderIdToUse declaration from useEffect and use the one defined at the top level
  useEffect(() => {
    // Check if we have an order ID from any source
    if (!orderIdToUse) {
      console.log("No orderId available from any source");
      setLoading(false);
      toast.error("Could not find your order. Please check your email for order details.", {
        duration: 8000,
      });
      return;
    }
    
    // If we have an orderId from storage but not in URL, update the URL
    if (!orderId && !fallbackOrderId && sessionOrderId) {
      console.log("Found orderId in storage but not in URL, updating URL:", sessionOrderId);
      // Update URL to include the orderId (for better UX and to prevent duplicate checks)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('orderId', sessionOrderId);
      window.history.replaceState({}, '', newUrl.toString());
    }
    
    // Additional safety check - if orderIdToUse is undefined, empty, or "undefined" string
    if (!orderIdToUse || orderIdToUse === "undefined" || orderIdToUse === undefined) {
      console.error("Invalid order ID detected:", orderIdToUse);
      setLoading(false);
      toast.error("Could not load order details. Please contact customer support.");
      return;
    }
    
    const fetchOrder = async () => {
      setLoading(true);
      
      if (!orderIdToUse) {
        console.error("No order ID available after all checks");
        setLoading(false);
        return;
      }
      
      // For test orders starting with "test-", create a mock order
      if (orderIdToUse && orderIdToUse.startsWith('test-')) {
        const mockOrder: Order = {
          id: orderIdToUse,
          items: [
            {
              id: "test-item-1",
              name: "Test Product 1",
              price: 1200,
              quantity: 2,
              image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
              category: "Shoes"
            },
            {
              id: "test-item-2",
              name: "Test Product 2",
              price: 650,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
              category: "Electronics"
            }
          ],
          totalAmount: 3050,
          shippingInfo: {
            fullName: "Test Customer",
            email: "test@example.com",
            phone: "0940405038",
            address: "Test Address, 123",
            city: "Addis Ababa",
            state: "Addis Ababa",
            zipCode: "1000",
            country: "Ethiopia"
          },
          paymentMethod: "bank_transfer",
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        
        setOrder(mockOrder);
        setLoading(false);
        
        // No popup alerts for test orders - confirmation page is sufficient
        
        return;
      }
      
      try {
        // Show loading toast to keep user informed
        toast.loading("Looking up your order details...", { id: "order-fetch" });
        
        // Try to fetch from API first
        console.log(`Fetching order ${orderIdToUse} from API...`);
        // Double-check that we're not sending undefined to the API
        if (!orderIdToUse || orderIdToUse === "undefined" || orderIdToUse === undefined) {
          throw new Error("Cannot fetch order with undefined ID");
        }
        
        // First try to get from all orders (admin API) as it's the most comprehensive source
        try {
          console.log("Trying to find order in admin orders first...");
          const allOrdersResponse = await brain.get_all_orders();
          if (allOrdersResponse.ok) {
            const allOrdersData = await allOrdersResponse.json();
            const allOrders = allOrdersData.orders || [];
            
            // Look for the order in the complete dataset
            const foundOrder = allOrders.find(o => o.id === orderIdToUse);
            if (foundOrder) {
              console.log("Found order in admin data:", foundOrder);
              setOrder(foundOrder);
              
              // Dismiss loading toast and show success
              toast.dismiss("order-fetch");
              toast.success("Order found! Displaying your details.");
              
              // Also update the order store to ensure consistency
              try {
                // Get user email from the found order
                const userEmail = foundOrder.shippingInfo?.email;
                if (userEmail) {
                  // Update the order store with this order to ensure it's available everywhere
                  console.log("Updating order store with admin data for order:", foundOrder.id);
                  useOrderStore.getState().fetchUserOrders(userEmail, {orders: [foundOrder]});
                }
              } catch (storeError) {
                console.error("Error updating order store:", storeError);
              }
              
              setLoading(false);
              return;
            }
          }
        } catch (adminError) {
          console.error("Error fetching from admin API:", adminError);
          // Continue with regular flow if this fails
        }
        
        // Debug the exact request parameters
        console.log("Request params for individual order API:", { orderId: orderIdToUse });
        // Use orderId parameter to match the TypeScript client
        const response = await brain.get_order({ orderId: orderIdToUse });
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }
        
        const orderData = await response.json();
        console.log("Order data from API:", orderData);
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order from API, falling back to local storage', error);
        
        // Fallback to local storage
        console.log(`Falling back to local storage for order ${orderIdToUse}`);
        const foundOrder = getOrderById(orderIdToUse);
        if (foundOrder) {
          console.log("Found order in local storage:", foundOrder);
          setOrder(foundOrder);
        } else {
          // Check if we have any orders at all - if not, we might not be authenticated or there's an issue
          console.log("No order found with ID: " + orderIdToUse + ". Showing error state.");
          
          // Instead of redirecting immediately, allow user to see the error and potentially try again
          toast.error("We couldn't find your order. Please check your order email for details or contact customer support.", {
            duration: 10000,  // Show for 10 seconds
          });
          
          // Don't redirect, just show a message that order wasn't found
          setLoading(false);
          return;
        }
      } finally {
        setLoading(false);
        // Dismiss any loading toasts
        toast.dismiss("order-fetch");
      }
    };
    
    fetchOrder();
  }, [orderIdToUse, getOrderById, navigate]);
  
  // Show confirmation message when page loads
  useEffect(() => {
    if (order) {
      // Store a copy of the order in localStorage for added reliability
      try {
        // First, try to update the user's orders through the proper store mechanism
        try {
          const userEmail = order.shippingInfo?.email;
          if (userEmail) {
            // Update the order store to ensure this order is available in MyOrders
            console.log("Updating order store with order confirmation data:", order.id);
            useOrderStore.getState().fetchUserOrders(userEmail, {orders: [order]});
          }
        } catch (storeError) {
          console.error("Error updating order store from confirmation page:", storeError);
        }
        
        // Also get existing orders array or create a new one as backup
        const storedOrdersStr = localStorage.getItem('userOrders');
        const storedOrders = storedOrdersStr ? JSON.parse(storedOrdersStr) : [];
        
        // Check if this order is already in the array to avoid duplicates
        const orderExists = storedOrders.some(o => o.id === order.id);
        
        if (!orderExists) {
          // Add the new order to the array
          storedOrders.push(order);
          // Save back to localStorage
          localStorage.setItem('userOrders', JSON.stringify(storedOrders));
          console.log("Added order to localStorage userOrders cache for additional reliability");
        }
      } catch (err) {
        console.error("Failed to update localStorage userOrders cache", err);
      }
      const orderNumber = order.id.split('-')[1] || order.id.split('_')[1] || order.id;
      
      // Show a single toast notification - no popup alerts
      toast.success(`Order #${orderNumber} confirmed!`, {
        id: "order-confirmation-page",
        duration: 10000,
      });
    }
  }, [order]);
  
  // Test mode function - handle direct navigation to /order-confirmation
  if (!orderId) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Test Order Confirmation</h2>
            <p className="mb-6 text-gray-600">Click the button below to view a test order confirmation page.</p>
            <button
              onClick={createTestOrder}
              className="px-6 py-3 bg-primary text-white rounded-md shadow-md hover:bg-primary/90 transition-colors"
            >
              View Test Order Confirmation
            </button>
          </div>
        </main>
        <Footer />
        <ToastProvider />
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900">Loading order details...</h2>
          </div>
        </main>
        <Footer />
        <ToastProvider />
      </div>
    );
  }
  
  // If no order found after loading, show emergency fallback confirmation
  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Emergency Order Confirmation Fallback - show this when order details not available */}
          <div className="text-center mb-8 bg-green-50 p-8 rounded-lg border-2 border-green-200 shadow-md">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Thank You For Your Order!</h1>
            <p className="text-lg text-gray-600 mb-4">Your order has been received and is being processed.</p>
            
            <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300 shadow-md max-w-lg mx-auto mb-8">
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Important Customer Care Information</h3>
              <p className="text-md text-yellow-800 mb-3">
                <strong>A customer care representative will call you within ahours to confirm your order details.</strong>
              </p>
              <p className="text-md text-yellow-800">
                If you need immediate assistance, please contact our customer care team:
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:0940405038" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  0940405038
                </a>
                <a 
                  href="mailto:info@ahadumarket.store" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@ahadumarket.store
                </a>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
        <ToastProvider />
      </div>
    );
  }
  
  // Extract order number from ID (after first dash or underscore)
  const orderNumber = order.id.split('-')[1] || order.id.split('_')[1] || order.id;
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Customer Care Banner - VERY PROMINENT */}
        <div className="mb-6 p-5 bg-blue-600 text-white rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">IMPORTANT: Customer Care Follow-up</h2>
              <p className="text-white/90 mt-1">One of our customer care representatives will contact you within 24 hours at <span className="font-bold">{order.shippingInfo?.phone || 'N/A'}</span> to confirm your order.</p>
              <p className="text-white/90 mt-1 font-bold">Contact: 0940405038 or info@ahadumarket.store if needed</p>
            </div>
          </div>
        </div>
        <div className="text-center mb-8 bg-green-50 p-8 rounded-lg border-2 border-green-200 shadow-md animate-fadeIn">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 animate-slideUp">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 animate-slideUp animation-delay-100">Thank you for your purchase.</p>
          <p className="text-md text-primary mt-2 font-medium animate-slideUp animation-delay-200">Order #{orderNumber}</p>
          
          <div className="mt-4 p-3 bg-green-100 rounded-md inline-block animate-slideUp animation-delay-300">
            <p className="font-medium text-green-800">Your order has been received and is now being processed</p>
          </div>
        </div>
        
        {/* SECOND CUSTOMER CARE REMINDER - MAKE IT SUPER OBVIOUS */}
        <div className="mb-10 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300 shadow-md">
          <h3 className="text-xl font-bold text-yellow-800 mb-2">Customer Care Contact Reminder</h3>
          <p className="text-md text-yellow-800">
            <strong>A customer care representative will call you at {order.shippingInfo.phone} within 24 hours.</strong>
          </p>
          <p className="text-md text-yellow-800 mt-2">
            If you need immediate assistance, please contact our customer care team:
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-4">
            <a 
              href="tel:0940405038" 
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              0940405038
            </a>
            <a 
              href="mailto:care.ahadumarket@gmail.com" 
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              care.ahadumarket@gmail.com
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold">Order Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Info */}
              <div>
                <h3 className="text-md font-medium mb-3">Shipping Information</h3>
                <div className="bg-gray-50 rounded-md p-4 text-sm">
                  <p className="font-medium">{order.shippingInfo.fullName}</p>
                  <p>{order.shippingInfo.address}</p>
                  <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                  <p>{order.shippingInfo.country}</p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p>Email: {order.shippingInfo.email}</p>
                    <p>Phone: {order.shippingInfo.phone}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div>
                <h3 className="text-md font-medium mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-md p-4 text-sm">
                  <p>
                    <span className="font-medium">Payment Method:</span>{" "}
                    {order.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Payment on Delivery"}
                  </p>
                  <p>
                    <span className="font-medium">Order Status:</span>{" "}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Order Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Order Items</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">ETB {item.price.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">ETB {(item.price * item.quantity).toFixed(2)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="mt-6 bg-gray-50 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">ETB {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              {order.paymentMethod === 'payment_on_delivery' && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery Confirmation Fee</span>
                  <span className="font-medium">ETB 50.00</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="font-medium">Total</span>
                <span className="text-lg font-semibold">
                  ETB {(order.totalAmount + (order.paymentMethod === 'payment_on_delivery' ? 50 : 0)).toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="bg-blue-50 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">What's Next?</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p><strong>One of our customer care representatives will contact you within 24 hours</strong> to confirm your order details.</p>
                      <p className="mt-1">Please make sure your phone is available. You'll be contacted at: <strong>{order.shippingInfo.phone}</strong></p>
                      <p className="mt-1">For any questions, call our customer support at <strong>0940405038</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow"
          >
            Continue Shopping
          </button>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
