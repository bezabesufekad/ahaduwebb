import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useOrderStore, Order, useOrderStore as getOrderStore } from "../utils/orderStore";
import { useUserAuth } from "../utils/userAuthStore";
import { toast } from "sonner";
import brain from "../brain";
import { APP_BASE_PATH, API_URL } from "app";
import { NoOrdersFound } from "../components/NoOrdersFound";

export default function MyOrders() {
  const navigate = useNavigate();
  const { getAllOrders, fetchUserOrders, updateOrderStatus, loading, error } = useOrderStore();
  const { isAuthenticated, currentUser } = useUserAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isAnimated, setIsAnimated] = useState(false);
  const [lastUpdatedOrderId, setLastUpdatedOrderId] = useState<string | null>(null);
  const ordersContainerRef = useRef<HTMLDivElement>(null);
  
  // Force status update for testing purposes
  const forceUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setIsRefreshing(true);
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      
      // After updating, fetch fresh data to keep everything in sync
      // This ensures we're showing the most current data
      await refreshOrders(false); // Not an auto-refresh, show notifications
      
      // No need for additional animation triggers as refreshOrders will handle it
      // if the status was actually changed
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Couldn't update order status. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Function to refresh order status
  const refreshOrders = async (isAutoRefresh = false) => {
    if (!currentUser?.email) return;
    
    // Don't start a new refresh if one is already in progress
    if (isRefreshing) {
      console.log("Skipping refresh - already in progress");
      return;
    }
    
    setIsRefreshing(true);
    try {
      // Get current orders first to compare with refreshed data
      const currentOrders = [...useOrderStore.getState().orders];
      console.log("Current orders before refresh:", currentOrders.length);
      const currentOrdersMap = new Map(currentOrders.map(order => [order.id, order]));
      
      // Try to fetch fresh data from our lookup API - this is our primary source
      console.log("Using lookup-orders API for order data");
      try {
        const lookupResponse = await fetch(`${API_URL}/lookup-orders?email=${encodeURIComponent(currentUser.email)}`);
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json();
          if (lookupData.orders && lookupData.orders.length > 0) {
            console.log("Got orders from lookup API:", lookupData.orders.length);
            
            // Find orders with changed status compared to what we have cached
            const changedOrders = lookupData.orders.filter(newOrder => {
              const existingOrder = currentOrdersMap.get(newOrder.id);
              if (!existingOrder) {
                return true; // New order
              }
              if (existingOrder.status !== newOrder.status) {
                return true; // Status changed
              }
              return false;
            });
            
            // Update the store with the orders from the API
            await fetchUserOrders(currentUser.email, lookupData);
            
            // Only show notifications and animations if there are changes
            // and this isn't an auto-refresh
            if (changedOrders.length > 0) {
              if (!isAutoRefresh) {
                toast.success(`${changedOrders.length} order status update${changedOrders.length > 1 ? 's' : ''} detected!`);
              }
              
              // Only animate if not auto-refresh or if important changes happened
              if (!isAutoRefresh || changedOrders.some(order => 
                order.status === 'shipped' || order.status === 'delivered')) {
                // Store changed order IDs for highlighting
                const changedOrderIds = changedOrders.map(order => order.id);
                
                // Only highlight first changed order to reduce animations
                if (changedOrderIds.length > 0) {
                  setLastUpdatedOrderId(changedOrderIds[0]);
                  setIsAnimated(true);
                  
                  // Clear highlighting after a delay
                  setTimeout(() => {
                    setLastUpdatedOrderId(null);
                    setIsAnimated(false);
                  }, 3000);
                }
              }
            } else if (!isAutoRefresh) {
              // Only show this message for manual refreshes
              toast.success("Orders are up to date!");
            }
            
            setIsRefreshing(false);
            return;
          }
        }
      } catch (lookupErr) {
        console.error("Error using lookup API:", lookupErr);
      }
      try {
        const directResponse = await fetch(`${API_URL}/direct-user-orders?email=${encodeURIComponent(currentUser.email)}`);
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData.orders && directData.orders.length > 0) {
            console.log("Got fresh orders from direct API:", directData.orders.length);
            // Process the data from the API response
            
            // Find orders with changed status - compare each order properly
            const changedOrders = directData.orders.filter(newOrder => {
              const existingOrder = currentOrdersMap.get(newOrder.id);
              if (!existingOrder) {
                console.log("New order found:", newOrder.id);
                return true; // New order
              }
              if (existingOrder.status !== newOrder.status) {
                console.log(`Order ${newOrder.id} status changed from ${existingOrder.status} to ${newOrder.status}`);
                return true; // Status changed
              }
              return false;
            });
            
            console.log(`Found ${changedOrders.length} changed orders`);
            
            // Update the store with the orders from direct API
            await fetchUserOrders(currentUser.email, directData);
            
            // After store update, handle visual notifications
            if (changedOrders.length > 0) {
              toast.success(`${changedOrders.length} order status update${changedOrders.length > 1 ? 's' : ''} detected!`);
              
              // Store changed order IDs for highlighting
              const changedOrderIds = changedOrders.map(order => order.id);
              
              // Highlight changed orders one by one with a delay between each
              changedOrderIds.forEach((orderId, index) => {
                setTimeout(() => {
                  setLastUpdatedOrderId(orderId);
                  setIsAnimated(true);
                }, index * 2000); // 2 seconds per order
              });
              
              // Clear highlighting after all orders are shown
              setTimeout(() => {
                setLastUpdatedOrderId(null);
                setIsAnimated(false);
              }, (changedOrderIds.length * 2000) + 1000);
            } else if (!isAutoRefresh) {
              // Only show this message for manual refreshes, not auto-refreshes
              toast.success("Order statuses are up to date!");
            }
            
            setIsRefreshing(false);
            return;
          }
        }
      } catch (directErr) {
        console.error("Error using direct API for refresh:", directErr);
      }
      
      // Fallback to standard API
      console.log("Fetching fresh orders from standard API for", currentUser.email);
      const response = await brain.get_user_orders({ email: currentUser.email });
      if (!response.ok) {
        throw new Error(`Failed to refresh orders: ${response.statusText}`);
      }
      
      // Process the data from the API response
      const data = await response.json();
      console.log("Refreshed orders from API:", data);
      
      // Find orders with changed status - compare each order properly
      const changedOrders = data.orders ? data.orders.filter(newOrder => {
        const existingOrder = currentOrdersMap.get(newOrder.id);
        if (!existingOrder) {
          console.log("New order found:", newOrder.id);
          return true; // New order
        }
        if (existingOrder.status !== newOrder.status) {
          console.log(`Order ${newOrder.id} status changed from ${existingOrder.status} to ${newOrder.status}`);
          return true; // Status changed
        }
        return false;
      }) : [];
      
      console.log(`Found ${changedOrders.length} changed orders`);
      
      // Update the store with the orders from API - merge data properly
      await fetchUserOrders(currentUser.email, data);
      
      // After store update, handle visual notifications
      if (changedOrders.length > 0) {
        toast.success(`${changedOrders.length} order status update${changedOrders.length > 1 ? 's' : ''} detected!`);
        
        // Store changed order IDs for highlighting
        const changedOrderIds = changedOrders.map(order => order.id);
        
        // Highlight changed orders one by one with a delay between each
        changedOrderIds.forEach((orderId, index) => {
          setTimeout(() => {
            setLastUpdatedOrderId(orderId);
            setIsAnimated(true);
          }, index * 2000); // 2 seconds per order
        });
        
        // Clear highlighting after all orders are shown
        setTimeout(() => {
          setLastUpdatedOrderId(null);
          setIsAnimated(false);
        }, (changedOrderIds.length * 2000) + 1000);
      } else if (!isAutoRefresh) {
        // Only show this message for manual refreshes, not auto-refreshes
        toast.success("Order statuses are up to date!");
      }
    } catch (err) {
      console.error("Error refreshing orders:", err);
      // Don't show error toast on auto-refresh to avoid annoying users
      if (!isAutoRefresh) {
        toast.error("Couldn't refresh orders. Please try again.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Set up auto-refresh interval
  useEffect(() => {
    if (currentUser?.email) {
      console.log("Setting up auto-refresh for orders");
      // Initial load - not an auto-refresh
      refreshOrders(false);
      
      // First refresh happens more quickly (30 seconds) after load to catch immediate updates
      const initialTimeoutId = setTimeout(() => {
        console.log("Initial refresh to catch updates");
        refreshOrders(true);
      }, 30000); // 30 seconds (increased from 5 seconds)
      
      // Then set up normal interval for auto-refresh - checking every 2 minutes
      const intervalId = setInterval(() => {
        console.log("Auto-refreshing orders");
        refreshOrders(true); // true indicates this is an auto-refresh
      }, 120000); // 2 minutes instead of 15 seconds - much less frequent to reduce API load
      
      return () => {
        console.log("Clearing auto-refresh timeout and interval");
        clearTimeout(initialTimeoutId);
        clearInterval(intervalId);
      };
    }
  }, [currentUser?.email]);
  
  // Animate orders container when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimated(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ordersContainerRef.current) {
      observer.observe(ordersContainerRef.current);
    }

    return () => {
      if (ordersContainerRef.current) {
        observer.unobserve(ordersContainerRef.current);
      }
    };
  }, []);

  // Effect to redirect if not authenticated and fetch orders
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view your orders");
      navigate("/sign-in");
      return;
    }
    
    // Debug info to track component load and authentication state
    console.log("MyOrders component initialized with authentication state:", {
      isAuthenticated,
      currentUser: currentUser ? {
        email: currentUser.email,
        name: currentUser.name
      } : null
    });
    
    const loadOrders = async () => {
      setIsLoading(true);
      if (currentUser?.email) {
        try {
          // Try our lookup-orders endpoint first (most reliable)
          try {
            console.log("Using lookup-orders endpoint as primary source");
            const lookupResponse = await fetch(`${API_URL}/lookup-orders?email=${encodeURIComponent(currentUser.email)}`);
            if (lookupResponse.ok) {
              const lookupData = await lookupResponse.json();
              console.log("Lookup API returned:", lookupData);
              await fetchUserOrders(currentUser.email, lookupData);
              setIsLoading(false);
              return;
            }
          } catch (lookupError) {
            console.error("Lookup API failed, trying alternatives:", lookupError);
          }
          
          // First try to fetch all orders to ensure we capture everything
          console.log("First checking ALL orders to ensure we get everything for user:", currentUser.email);
          try {
            const allOrdersResponse = await brain.get_all_orders();
            if (allOrdersResponse.ok) {
              const allOrdersData = await allOrdersResponse.json();
              console.log("All orders from admin API:", allOrdersData);
              
              // Check if this user has orders in the complete dataset
              const userOrdersFromAll = allOrdersData.orders ? allOrdersData.orders.filter(order => {
                return order.shippingInfo?.email?.toLowerCase() === currentUser.email.toLowerCase();
              }) : [];
              
              console.log(`Found ${userOrdersFromAll.length} orders for user in admin panel data`);
              
              // Update the store with these admin orders (filtering happens in the store)
              if (userOrdersFromAll.length > 0) {
                await fetchUserOrders(currentUser.email, {orders: userOrdersFromAll});
                console.log("Successfully loaded orders from admin panel");
                setIsLoading(false);
                return;
              }
            }
          } catch (adminError) {
            console.error("Error fetching from admin API:", adminError);
          }
          
          // Then try regular user-specific API as backup
          console.log("Fetching orders for user from user-specific API:", currentUser.email);
          const response = await brain.get_user_orders({ email: currentUser.email });
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
          }
          
          // Process the data from the API response
          const data = await response.json();
          console.log("Orders from user-specific API:", data);
          
          // Update the store with the orders from API
          await fetchUserOrders(currentUser.email, data);

          // Check if we received any orders from API
          if (!data.orders || data.orders.length === 0) {
            console.log("No orders found on API, trying direct API endpoint...");
            
            // Try our direct API endpoint
            try {
              console.log("Using direct orders endpoint as additional source");
              const directResponse = await fetch(`${API_URL}/direct-user-orders?email=${encodeURIComponent(currentUser.email)}`);
              
              if (directResponse.ok) {
                const directData = await directResponse.json();
                if (directData.orders && directData.orders.length > 0) {
                  console.log("Found orders through direct API:", directData.orders.length);
                  await fetchUserOrders(currentUser.email, directData);
                  setIsLoading(false);
                  return;
                }
              }
            } catch (directError) {
              console.error("Direct orders API failed:", directError);
            }
            
            // If direct API also failed, check backup storage
            console.log("No orders found on direct API either, checking backup storage...");
            await checkBackupStorageForOrders();
          }
        } catch (err) {
          console.error("Error fetching orders from API:", err);
          
          // Fall back to local store method
          try {
            await fetchUserOrders(currentUser.email);
          } catch (localErr) {
            console.error("Error fetching local orders:", localErr);
            
            // Try to load from localStorage backup as last resort
            await checkBackupStorageForOrders();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    // Helper to check all backup storage locations for orders
    const checkBackupStorageForOrders = async () => {
      if (!currentUser?.email) {
        console.error('No current user email when checking backup storage');
        return false;
      }
      try {
        // Try all possible backup storage locations
        const backupSources = [
          'userOrders',
          'persistedOrders',
          'lastOrders',
          'ahadu-orders-storage'
        ];

        // Try each source in sequence
        for (const source of backupSources) {
          try {
            const storedOrdersStr = localStorage.getItem(source);
            if (storedOrdersStr) {
              const parsedData = JSON.parse(storedOrdersStr);
              // Handle different storage formats (some might be direct arrays, others might be inside objects)
              const storedOrders = Array.isArray(parsedData) ? parsedData : 
                                  (parsedData.orders ? parsedData.orders : 
                                   (parsedData.state && parsedData.state.orders ? parsedData.state.orders : []));
                                   
              console.log(`Found backup orders in ${source}:`, storedOrders);
              
              if (storedOrders && storedOrders.length > 0) {
                // Filter orders to only show ones for this user
                const userOrders = storedOrders.filter(order => {
                  // If we have a compact order format with just email instead of full shippingInfo
                  if (order.email) {
                    // Case-insensitive comparison for better matching
                    return order.email.toLowerCase() === currentUser.email.toLowerCase();
                  }
                  // Safety check for malformed orders
                  if (!order || (!order.shippingInfo && !order.email)) {
                    console.log('Found malformed order in backup storage:', order);
                    return false;
                  }
                  // Do case-insensitive comparison for better matching
                  return order.shippingInfo?.email?.toLowerCase() === currentUser.email.toLowerCase();
                });
                
                if (userOrders.length > 0) {
                  console.log(`Loading ${userOrders.length} backup orders from ${source} for current user`);
                  // Update the orderStore with these orders
                  await fetchUserOrders(currentUser.email, { orders: userOrders });
                  toast.success(`Loaded ${userOrders.length} order${userOrders.length === 1 ? '' : 's'} from backup storage`, {
                    id: 'backup-orders-loaded'
                  });
                  return true; // Successfully loaded orders
                }
              }
            }
          } catch (sourceError) {
            console.error(`Error reading from ${source}:`, sourceError);
            // Continue to next source on error
          }
        }
        
        // If we get here, we couldn't find any orders in backup storage
        console.log("No orders found in any backup storage for user:", currentUser.email);
        const currentOrders = getAllOrders();
        if (currentOrders.length === 0) {
          toast.info("No orders found for your account.", {
            description: "Please check for typos in your email address or contact customer support if you believe this is an error.",
            duration: 8000,
            id: 'no-orders-found'
          });
        }
        return false;
      } catch (backupErr) {
        console.error("Error loading from any backup storage:", backupErr);
        toast.error("Failed to load your orders. Please try again.");
        return false;
      }
    };
    
    loadOrders();
    
    // Log the orders we have after loading
    setTimeout(() => {
      const currentOrders = getAllOrders();
      console.log("Current orders in store after loading:", currentOrders);

      // If we still don't have any orders, try one more time with all backup sources
      if (currentOrders.length === 0) {
        console.log("No orders found after initial load, trying backup storage one more time...");
        checkBackupStorageForOrders();
      }
    }, 1000);
  }, [isAuthenticated, currentUser, navigate, fetchUserOrders, getAllOrders]);
  
  // Display error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  // Get orders from the store and apply filters
  const allOrders = getAllOrders();
  const filteredOrders = allOrders
    .filter(order => {
      // Apply status filter if selected
      if (filterStatus && order.status !== filterStatus) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const idMatch = order.id.toLowerCase().includes(searchLower);
        const dateMatch = new Date(order.createdAt)
          .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          .toLowerCase()
          .includes(searchLower);
        const statusMatch = order.status.toLowerCase().includes(searchLower);
        const itemMatch = order.items.some(item => 
          item.name.toLowerCase().includes(searchLower) || 
          item.category.toLowerCase().includes(searchLower)
        );
        
        return idMatch || dateMatch || statusMatch || itemMatch;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Download order details as JSON
  const downloadOrderDetails = (order: Order) => {
    try {
      const orderData = JSON.stringify(order, null, 2);
      const blob = new Blob([orderData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `order-${order.id.slice(-8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Order details downloaded");
    } catch (error) {
      console.error("Failed to download order details", error);
      toast.error("Failed to download order details");
    }
  };

  // Handle printing order
  const printOrder = (order: Order) => {
    try {
      // Open order in new window
      const orderWindow = window.open("", "_blank");
      if (!orderWindow) {
        throw new Error("Failed to open print window");
      }
      
      // Generate print-friendly HTML
      const printContent = `
        <html>
          <head>
            <title>Order #${order.id.slice(-8)}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 1px solid #eee;
                padding-bottom: 20px;
              }
              .order-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .order-info > div {
                flex: 1;
              }
              .items {
                margin-bottom: 30px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #eee;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 14px;
              }
              .status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 30px;
                font-size: 12px;
                font-weight: bold;
              }
              .status-pending { background: #FEF3C7; color: #92400E; }
              .status-processing { background: #DBEAFE; color: #1E40AF; }
              .status-completed { background: #D1FAE5; color: #065F46; }
              .status-cancelled { background: #FEE2E2; color: #B91C1C; }
              .important {
                padding: 15px;
                border: 2px solid #FBBF24;
                background-color: #FEF3C7;
                border-radius: 5px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Ahadu Market</h1>
              <h2>Order #${order.id.slice(-8)}</h2>
              <p>Date: ${formatDate(order.createdAt)}</p>
              <span class="status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            
            <div class="important">
              <h3>IMPORTANT: Our customer care team will contact you</h3>
              <p>For all orders: Our customer care team will call you within 24 hours to confirm your order details.</p>
              <p>If you need immediate assistance, please contact us at:<br/>
              Phone: 0940405038<br/>
              Email: info@ahadumarket.store</p>
            </div>
            
            <div class="order-info">
              <div>
                <h3>Shipping Information</h3>
                <p>${order.shippingInfo?.fullName || 'N/A'}<br/>
                ${order.shippingInfo?.address || 'N/A'}<br/>
                ${(order.shippingInfo && order.shippingInfo.city) ? order.shippingInfo.city : 'N/A'}, ${(order.shippingInfo && order.shippingInfo.state) ? order.shippingInfo.state : 'N/A'} ${(order.shippingInfo && order.shippingInfo.zipCode) ? order.shippingInfo.zipCode : 'N/A'}<br/>
                ${order.shippingInfo?.country || 'N/A'}<br/>
                ${order.shippingInfo?.phone || 'N/A'}<br/>
                ${order.shippingInfo?.email || 'N/A'}</p>
              </div>
              
              <div>
                <h3>Order Summary</h3>
                <p>Payment Method: ${order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Payment on Delivery'}</p>
                <p>Total Amount: ETB ${order.totalAmount.toFixed(2)}</p>
                <p>Items: ${order.items.length}</p>
              </div>
            </div>
            
            <div class="items">
              <h3>Ordered Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.category}</td>
                      <td>${item.quantity}</td>
                      <td>ETB ${item.price.toFixed(2)}</td>
                      <td>ETB ${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p>Thank you for shopping with Ahadu Market!</p>
              <p>If you have any questions about your order, please contact our customer service.</p>
              <p>Phone: 0940405038 | Email: info@ahadumarket.store</p>
            </div>
          </body>
        </html>
      `;
      
      orderWindow.document.open();
      orderWindow.document.write(printContent);
      orderWindow.document.close();
      
      // Add delay to ensure content is loaded
      setTimeout(() => {
        orderWindow.print();
      }, 500);
      
    } catch (error) {
      console.error("Failed to print order", error);
      toast.error("Failed to print order");
    }
  };

  const getOrderIconByStatus = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "processing":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case "completed":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cancelled":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Get icons for order status
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "processing":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "shipped":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case "delivered":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cancelled":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Format address safely for display
  const formatShippingAddress = (order: Order) => {
    if (!order.shippingInfo) return 'N/A';
    
    const city = order.shippingInfo.city || 'N/A';
    const state = order.shippingInfo.state || 'N/A';
    const zipCode = order.shippingInfo.zipCode || 'N/A';
    
    return `${city}, ${state} ${zipCode}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const getStatusColor = (status: Order["status"]) => {
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
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <ToastProvider />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">My Orders</h1>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`${APP_BASE_PATH}/shop`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Continue Shopping
              </button>
              <button
                onClick={refreshOrders}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Filter and search tools */}
        <div className="mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search-orders" className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search-orders"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Search by order ID, date, status, or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                id="filter-status"
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        

        
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="inline-block p-4 rounded-full mb-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Loading your orders...</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Please wait while we fetch your order history.</p>
          </div>
        ) : allOrders.length === 0 ? (
          /* Debug log to see if this condition is being hit */
          <>
            {console.log("Rendering NoOrdersFound component with email:", currentUser?.email || "unknown")}
            <NoOrdersFound 
              email={currentUser?.email || ''}
              onContactSupport={() => {
                const subject = encodeURIComponent(`Order Lookup for ${currentUser?.email}`); 
                const body = encodeURIComponent(`I'm trying to find my orders, but none appear in my account.\n\nMy email address: ${currentUser?.email}\n\nI believe I should have orders in the system. Please help.`); 
                window.open(`mailto:info@ahadumarket.store?subject=${subject}&body=${body}`, '_blank');
                toast.success("Support email prepared - send it from your email client");
              }}
            />
          </>
        ) : (
          <div className="space-y-8" ref={ordersContainerRef}>
            <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredOrders.length}</span> {filteredOrders.length === 1 ? 'order' : 'orders'}
                {filterStatus && <span> with status <span className="font-medium capitalize">{filterStatus}</span></span>}
                {searchTerm && <span> matching <span className="font-medium">"{searchTerm}"</span></span>}
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshOrders} 
                  disabled={isRefreshing}
                  className="text-sm text-primary hover:text-primary/80 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? 'Refreshing...' : 'Refresh orders'}
                </button>
                
                {(filterStatus || searchTerm) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("");
                    }}
                    className="text-sm text-primary hover:text-primary/80 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            {filteredOrders.map((order, index) => (
              <div key={order.id} className={`bg-white rounded-lg shadow-sm border ${lastUpdatedOrderId === order.id ? 'border-primary border-2' : 'border-gray-200'} overflow-hidden transition-all duration-300 hover:shadow-md opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] motion-reduce:animate-none ${lastUpdatedOrderId === order.id ? 'animate-pulse' : ''}`} style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards'}} data-testid="order-card">
                {/* Order header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-4 relative">
                  {lastUpdatedOrderId === order.id && (
                    <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/4">
                      <div className="rounded-full bg-primary text-white text-xs px-3 py-1 shadow-md animate-bounce">
                        Updated!
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900">Order #{order.id.slice(-8)}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} ${lastUpdatedOrderId === order.id ? 'animate-pulse ring-2 ring-primary shadow-md transform scale-110' : ''} transition-all duration-300`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-medium text-gray-900">ETB {order.totalAmount.toFixed(2)}</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <div className="flex flex-col">
                        <label htmlFor={`status-${order.id}`} className="text-sm text-gray-500 mb-1">Update Status</label>
                        <select 
                          id={`status-${order.id}`}
                          className="text-sm border border-gray-300 rounded-md p-1"  
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Order["status"];
                            forceUpdateStatus(order.id, newStatus);
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/order?orderId=${order.id}`)}
                      className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                    >
                      View Details
                    </button>
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
                
                {/* Order status tracker */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Order Status</h4>
                  <div className="relative">
                    {/* Status progress bar */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2"></div>
                    
                    {/* Status steps */}
                    <div className="relative flex justify-between">
                      {/* Pending */}
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${order.status !== 'cancelled' ? 'bg-white border-primary' : 'bg-gray-200 border-gray-300'} mb-2`}>
                          {order.status !== 'cancelled' && (
                            <div className={`w-4 h-4 rounded-full ${order.status === 'pending' ? 'bg-primary animate-pulse' : (['processing', 'shipped', 'delivered', 'completed'].includes(order.status) ? 'bg-primary' : 'bg-gray-300')}`}></div>
                          )}
                          {order.status === 'cancelled' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${order.status === 'pending' ? 'text-primary' : (order.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500')}`}>Pending</p>
                      </div>
                      
                      {/* Processing */}
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${order.status !== 'cancelled' ? ((['processing', 'shipped', 'delivered', 'completed'].includes(order.status)) ? 'bg-white border-primary' : 'bg-white border-gray-300') : 'bg-gray-200 border-gray-300'} mb-2`}>
                          {order.status !== 'cancelled' && (
                            <div className={`w-4 h-4 rounded-full ${order.status === 'processing' ? 'bg-primary animate-pulse' : (['shipped', 'delivered', 'completed'].includes(order.status) ? 'bg-primary' : 'bg-gray-300')}`}></div>
                          )}
                          {order.status === 'cancelled' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${order.status === 'processing' ? 'text-primary' : (order.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500')}`}>Processing</p>
                      </div>
                      
                      {/* Shipped */}
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${order.status !== 'cancelled' ? ((['shipped', 'delivered', 'completed'].includes(order.status)) ? 'bg-white border-primary' : 'bg-white border-gray-300') : 'bg-gray-200 border-gray-300'} mb-2`}>
                          {order.status !== 'cancelled' && (
                            <div className={`w-4 h-4 rounded-full ${order.status === 'shipped' ? 'bg-primary animate-pulse' : (['delivered', 'completed'].includes(order.status) ? 'bg-primary' : 'bg-gray-300')}`}></div>
                          )}
                          {order.status === 'cancelled' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${order.status === 'shipped' ? 'text-primary' : (order.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500')}`}>Shipped</p>
                      </div>
                      
                      {/* Delivered */}
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${order.status !== 'cancelled' ? ((['delivered', 'completed'].includes(order.status)) ? 'bg-white border-primary' : 'bg-white border-gray-300') : 'bg-gray-200 border-gray-300'} mb-2`}>
                          {order.status !== 'cancelled' && (
                            <div className={`w-4 h-4 rounded-full ${order.status === 'delivered' ? 'bg-primary animate-pulse' : (order.status === 'completed' ? 'bg-primary' : 'bg-gray-300')}`}></div>
                          )}
                          {order.status === 'cancelled' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${order.status === 'delivered' ? 'text-primary' : (order.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500')}`}>Delivered</p>
                      </div>
                      
                      {/* Completed */}
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${order.status === 'completed' ? 'bg-white border-primary' : 'bg-white border-gray-300'} mb-2`}>
                          {order.status !== 'cancelled' && (
                            <div className={`w-4 h-4 rounded-full ${order.status === 'completed' ? 'bg-primary animate-pulse' : 'bg-gray-300'}`}></div>
                          )}
                          {order.status === 'cancelled' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${order.status === 'completed' ? 'text-primary' : (order.status === 'cancelled' ? 'text-gray-400' : 'text-gray-500')}`}>Completed</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status description */}
                  <div className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-md border border-gray-200">
                    {/* Status update buttons for testing */}
                    {currentUser?.email && currentUser.email.includes('admin') && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-md">
                        <p className="text-xs font-medium text-gray-600 mb-2">Admin: Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => forceUpdateStatus(order.id, 'pending')}
                            className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'}`}
                            disabled={order.status === 'pending' || isRefreshing}
                          >
                            Pending
                          </button>
                          <button 
                            onClick={() => forceUpdateStatus(order.id, 'processing')}
                            className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
                            disabled={order.status === 'processing' || isRefreshing}
                          >
                            Processing
                          </button>
                          <button 
                            onClick={() => forceUpdateStatus(order.id, 'shipped')}
                            className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-600 hover:bg-purple-50'}`}
                            disabled={order.status === 'shipped' || isRefreshing}
                          >
                            Shipped
                          </button>
                          <button 
                            onClick={() => forceUpdateStatus(order.id, 'delivered')}
                            className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}`}
                            disabled={order.status === 'delivered' || isRefreshing}
                          >
                            Delivered
                          </button>
                          <button 
                            onClick={() => forceUpdateStatus(order.id, 'completed')}
                            className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}`}
                            disabled={order.status === 'completed' || isRefreshing}
                          >
                            Completed
                          </button>
                          <button 
                            onClick={() => forceUpdateStatus(order.id, 'cancelled')}
                            className={`px-2 py-1 text-xs font-medium rounded ${order.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-600 hover:bg-red-50'}`}
                            disabled={order.status === 'cancelled' || isRefreshing}
                          >
                            Cancelled
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {order.status === 'pending' && (
                          <p>Your order has been received and is pending processing. Our team will begin working on it shortly.</p>
                        )}
                        {order.status === 'processing' && (
                          <p>Your order is currently being processed. It is being prepared for shipping and will be on its way to you soon.</p>
                        )}
                        {order.status === 'shipped' && (
                          <p>Your order has been shipped and is on its way to you. You'll receive a delivery update when it's out for delivery.</p>
                        )}
                        {order.status === 'delivered' && (
                          <p>Your order has been delivered. If you have any issues with your delivery, please contact our customer support.</p>
                        )}
                        {order.status === 'completed' && (
                          <p>Great news! Your order has been completed and delivered. We hope you enjoy your purchase.</p>
                        )}
                        {order.status === 'cancelled' && (
                          <p>This order has been cancelled. If you have any questions, please contact our customer support.</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          toast.success("Customer service will contact you shortly about your order", {
                            description: `Order #${order.id.slice(-8)}`,
                            duration: 5000,
                          });
                        }}
                        className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ask about order
                      </button>
                    </div>
                    
                    {/* Estimated delivery date and contact information - for all statuses */}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-2 text-gray-500">
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Estimated delivery: <strong>{new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Need help? Call <a href="tel:0940405038" className="text-primary hover:underline">0940405038</a></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order footer */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-2">
                    <div>
                      <p className="text-gray-500">Payment Method: <span className="font-medium">{order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Payment on Delivery'}</span></p>
                      <p className="text-gray-500 mt-1">
                        Shipping to: <span className="font-medium">{formatShippingAddress(order)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => printOrder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                      </button>
                      <button
                        onClick={() => downloadOrderDetails(order)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    </div>
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
