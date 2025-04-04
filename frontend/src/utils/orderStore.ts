import { create } from 'zustand';
import { API_URL } from 'app';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';
import { useUserAuth, ShippingAddress } from './userAuthStore';
import brain from '../brain';

// Helper function to create a smaller representation of order data for storage
const createCompactOrder = (order: Order) => {
  // Only store essential fields to reduce storage size
  return {
    id: order.id,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
    // Only store essential shipping info
    email: order.shippingInfo.email,
    // Store minimal item info - just id, quantity and price
    items: order.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    paymentMethod: order.paymentMethod
  };
};

// Helper function to compress multiple orders 
const compactOrders = (orders: Order[], limit = 5) => {
  return orders.slice(-limit).map(createCompactOrder);
};

export type PaymentMethod = 'bank_transfer' | 'payment_on_delivery';

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  paymentProof?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  getAllOrders: () => Order[];
  fetchUserOrders: (email: string, apiData?: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  saveShippingAddress: (shippingInfo: ShippingInfo) => void;
}

export const useOrderStore = create<OrderState>(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,
      
      addOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
          // Try to use the API first
          const response = await brain.create_order(orderData);
          const data = await response.json();
          
          const newOrder: Order = {
            ...orderData,
            id: data.order.id,
            createdAt: data.order.createdAt,
            status: data.order.status,
          };
          
          set((state) => ({
            orders: [...state.orders, newOrder],
            loading: false
          }));
          
          // Send order confirmation email
          try {
            console.log("Sending order confirmation email...");
            const emailResponse = await brain.send_order_confirmation_email({
              order_id: newOrder.id,
              customer_email: newOrder.shippingInfo.email,
              customer_name: newOrder.shippingInfo.fullName,
              order_items: newOrder.items,
              shipping_info: newOrder.shippingInfo,
              payment_method: newOrder.paymentMethod,
              order_total: newOrder.totalAmount,
              created_at: newOrder.createdAt
            });
            
            if (emailResponse.ok) {
              console.log("Order confirmation email sent successfully");
            } else {
              console.error("Failed to send order confirmation email", await emailResponse.text());
            }
          } catch (emailError) {
            console.error("Error sending order confirmation email:", emailError);
            // Don't block the order process if email fails
          }
          
          // Also store in multiple backup locations for redundancy
          try {
            // Add to persistedOrders
            const persistedOrdersStr = localStorage.getItem('persistedOrders');
            const persistedOrders = persistedOrdersStr ? JSON.parse(persistedOrdersStr) : [];
            
            // Create compact version of the order
            const compactOrder = createCompactOrder(newOrder);
            persistedOrders.push(compactOrder);
            
            // Limit to 5 most recent orders to avoid quota issues
            const limitedPersisted = persistedOrders.slice(-5);
            localStorage.setItem('persistedOrders', JSON.stringify(limitedPersisted));
            
            // Only store order ID in other storage locations to avoid duplication
            localStorage.setItem(`order_${newOrder.id}`, JSON.stringify(compactOrder));
            localStorage.setItem('lastOrderId', newOrder.id);
            sessionStorage.setItem('lastOrderId', newOrder.id);
            
            console.log("Order saved to all backup storage locations", newOrder.id);
          } catch (storageError) {
            console.error("Failed to save order to backup storage", storageError);
          }
          
          return newOrder;
        } catch (error) {
          // Fallback to local storage if API fails
          console.log('Failed to create order via API, using local storage instead', error);
          set({ error: 'Failed to create order. Please try again.' });
          
          // Create a local ID that will be recognizable
          const orderNumber = Date.now().toString().slice(-6);
          const id = `local-${orderNumber}`;
          
          const newOrder: Order = {
            ...orderData,
            id,
            createdAt: new Date().toISOString(),
            status: 'pending',
          }
          
          set((state) => ({
            orders: [...state.orders, newOrder],
            loading: false
          }));
          
          // Save to all storage locations even in case of API failure
          try {
            // Add to persistedOrders
            const persistedOrdersStr = localStorage.getItem('persistedOrders');
            const persistedOrders = persistedOrdersStr ? JSON.parse(persistedOrdersStr) : [];
            
            // Create compact version of the order
            const compactOrder = createCompactOrder(newOrder);
            persistedOrders.push(compactOrder);
            
            // Limit to 5 most recent orders to avoid quota issues
            const limitedPersisted = persistedOrders.slice(-5);
            localStorage.setItem('persistedOrders', JSON.stringify(limitedPersisted));
            
            // Only store order ID in other storage locations to avoid duplication
            localStorage.setItem(`order_${newOrder.id}`, JSON.stringify(compactOrder));
            localStorage.setItem('lastOrderId', newOrder.id);
            sessionStorage.setItem('lastOrderId', newOrder.id);
            
            console.log("Order saved to all fallback storage locations with fallback ID", newOrder.id);
          } catch (storageError) {
            console.error("Failed to save fallback order to backup storage", storageError);
          }
          
          return newOrder;
        }
      },

      fetchUserOrders: async (email, apiData = null) => {
        if (!email) {
          console.error('No email provided to fetchUserOrders');
          set({ loading: false, error: 'User email not provided' });
          return;
        }
        console.log('Fetching user orders for:', email, 'with apiData:', apiData);
        set({ loading: true, error: null });
        try {
          // If we already have apiData, prioritize using it directly
          if (apiData) {
            // If API data was passed in, use it directly
            // Check if apiData is an array or has an orders property
            const userOrders = Array.isArray(apiData) ? apiData : (apiData.orders || []);
            console.log("Setting orders from provided API data:", userOrders);
            
            if (userOrders.length > 0) {
              set({ 
                orders: userOrders, 
                loading: false 
              });
              
              // Store orders in localStorage for added persistence
              try {
                // Create a compact version of the orders to reduce storage size
                // Limit to just 3 orders for even more aggressive storage saving
                const compactOrdersData = compactOrders(userOrders, 3);
                console.log(`Storing ${compactOrdersData.length} compact orders to avoid storage quota issues`);
                localStorage.setItem('persistedOrders', JSON.stringify(compactOrdersData));
                localStorage.setItem('userOrders', JSON.stringify(compactOrdersData));
                console.log("Saved compact orders to localStorage");
              } catch (e) {
                console.error("Failed to save orders to localStorage", e);
              }
              return;
            }
          }
          
          // Try one reliable method first, the direct lookup API
          try {
            console.log("Using direct-lookup-orders endpoint for reliable order lookup");
            const directLookupResponse = await fetch(`${API_URL}/direct-lookup-orders?email=${encodeURIComponent(email)}`);
            if (directLookupResponse.ok) {
              const directLookupData = await directLookupResponse.json();
              console.log("Direct Lookup API returned:", directLookupData);
              if (directLookupData.orders && directLookupData.orders.length > 0) {
                // Update the store with fetched orders
                set({ 
                  orders: directLookupData.orders, 
                  loading: false 
                });
                
                // Store orders in localStorage for added persistence
                try {
                  // Create a compact version with minimal data for maximum storage efficiency
                  const compactOrdersData = compactOrders(directLookupData.orders, 3);
                  console.log(`Storing ${compactOrdersData.length} compact orders from direct lookup API`);
                  localStorage.setItem('persistedOrders', JSON.stringify(compactOrdersData));
                  console.log("Saved compact orders to localStorage");
                } catch (e) {
                  console.error("Failed to save orders to localStorage", e);
                }
                
                return;
              }
            }
          } catch (directLookupError) {
            console.error("Direct lookup API failed, falling back to standard API:", directLookupError);
          }
          
          // Otherwise try to fetch from standard API
          const response = await brain.get_user_orders({ email });
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
          }
          
          const data = await response.json();
          const userOrders = data.orders || [];
          console.log("Fetched user orders from standard API:", userOrders);
          
          // Update the store with fetched orders
          set({ 
            orders: userOrders, 
            loading: false 
          });
          
          // Store orders in localStorage for added persistence
          try {
            // Create a compact version with minimal data for maximum storage efficiency
            const compactOrdersData = compactOrders(userOrders, 3);
            console.log(`Storing ${compactOrdersData.length} compact orders to avoid storage quota issues`);
            localStorage.setItem('persistedOrders', JSON.stringify(compactOrdersData));
            console.log("Saved compact orders to localStorage");
          } catch (e) {
            console.error("Failed to save orders to localStorage", e);
          }
        } catch (error) {
          console.error('Failed to fetch orders', error);
          
          // First try to get orders from localStorage
          try {
            // Try to handle any corrupted storage errors by wrapping localStorage operations
            let persistedOrdersStr;
            try {
              persistedOrdersStr = localStorage.getItem('persistedOrders');
            } catch (storageError) {
              console.error("Storage access error, clearing localStorage", storageError);
              localStorage.clear(); // Clear localStorage in case of corruption
              persistedOrdersStr = null;
            }
            
            if (persistedOrdersStr) {
              const parsedOrders = JSON.parse(persistedOrdersStr);
              console.log("Loaded orders from localStorage:", parsedOrders);
              
              // Filter orders to only show ones for this user
              const filteredOrders = parsedOrders.filter(order => {
                // Safety check for malformed orders
                if (!order || !order.shippingInfo) {
                  console.log('Found malformed order in persistence:', order);
                  return false;
                }
                return order.shippingInfo?.email?.toLowerCase() === email.toLowerCase();
              });
              
              if (filteredOrders.length > 0) {
                console.log("Using filtered orders from persistence:", filteredOrders);
                set({ 
                  orders: filteredOrders,
                  loading: false,
                  error: "Using cached orders - connectivity issues detected."
                });
                return;
              }
            }
          } catch (localError) {
            console.error('Failed to load persisted orders:', localError);
          }
          
          // If no persisted orders, try the backup userOrders in localStorage
          try {
            const userOrdersBackup = localStorage.getItem('userOrders');
            if (userOrdersBackup) {
              const parsedBackup = JSON.parse(userOrdersBackup);
              console.log("Loaded backup orders from userOrders:", parsedBackup);
              
              // Filter orders to only show ones for this user
              const filteredBackup = parsedBackup.filter(order => {
                // Safety check for malformed orders
                if (!order || !order.shippingInfo) {
                  console.log('Found malformed order in backup storage:', order);
                  return false;
                }
                return order.shippingInfo?.email?.toLowerCase() === email.toLowerCase();
              });
              
              if (filteredBackup.length > 0) {
                console.log("Using filtered backup orders:", filteredBackup);
                set({ 
                  orders: filteredBackup,
                  loading: false,
                  error: "Using backup orders - connectivity issues detected."
                });
                return;
              }
            }
          } catch (backupError) {
            console.error('Failed to load backup orders:', backupError);
          }
          
          // For new users, they might not have any orders yet in the local store
          // So we should keep an empty array instead of filtering
          if (email) {
            // Check if this is a new user (no orders exist for this email)
            const currentOrders = get().orders;
            console.log('Current orders before filtering:', currentOrders);
            
            const userOrders = currentOrders.filter(order => {
              // Safely access email property with optional chaining
              const orderEmail = order.shippingInfo?.email?.toLowerCase();
              return orderEmail === email.toLowerCase();
            });
            
            console.log('Filtered user orders:', userOrders);
            
            set({ 
              // Set the orders specific to this user
              orders: userOrders,
              error: 'Failed to load orders from server. Showing locally stored orders.', 
              loading: false 
            });
          } else {
            // If no email, just show empty orders
            set({
              orders: [],
              error: 'Failed to load orders. Please try again later.',
              loading: false
            });
          }
          // Don't throw here - let the component handle the error state
        }
      },
      
      refreshOrders: async (email) => {
        set({ loading: true, error: null });
        try {
          const response = await brain.get_user_orders({ email });
          if (!response.ok) {
            throw new Error(`Failed to refresh orders: ${response.statusText}`);
          }
          
          const data = await response.json();
          const userOrders = data.orders || [];
          console.log("Refreshed user orders from API:", userOrders);
          
          // Update the store with fetched orders
          set({ 
            orders: userOrders, 
            loading: false 
          });
        } catch (error) {
          console.error('Failed to refresh orders', error);
          set({ 
            error: 'Failed to refresh orders from server.', 
            loading: false 
          });
        }
      },
      
      getOrderById: (id) => {
        // Safety check to prevent looking up undefined or invalid IDs
        if (!id || id === 'undefined' || id === undefined) {
          console.error('Attempted to get order with invalid ID:', id);
          return undefined;
        }
        return get().orders.find((order) => order.id === id);
      },
      
      getAllOrders: () => {
        return get().orders;
      },
      
      updateOrderStatus: async (orderId, status) => {
        set({ loading: true, error: null });
        try {
          // Call the API to update the order status
          console.log(`Updating order ${orderId} status to ${status}`);
          const response = await brain.update_order_status(
            { orderId: orderId },  // Use orderId to match TypeScript client
            { status: status }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to update order status: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Order status updated via API:', data);
          
          // Update the order in the store with all data from API response
          // This ensures we get all updated fields from the backend
          set((state) => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { ...order, ...data.order, status } 
                : order
            ),
            loading: false
          }));
          
          return data.order;
        } catch (error) {
          console.error('Failed to update order status', error);
          set({ 
            error: 'Failed to update order status. Please try again.', 
            loading: false 
          });
          
          // Fallback to local update if API fails
          const updatedOrder = get().orders.find(order => order.id === orderId);
          
          if (updatedOrder) {
            const orderWithUpdatedStatus = { ...updatedOrder, status };
            
            set((state) => ({
              orders: state.orders.map(order => 
                order.id === orderId ? orderWithUpdatedStatus : order
              )
            }));
            
            return orderWithUpdatedStatus;
          }
          
          throw error;
        }
      },
      
      forceUpdateStatus: async (orderId, status, isAutoRefresh = false) => {
        set({ loading: !isAutoRefresh, error: null });
        try {
          // Call the API to update the order status
          console.log(`Force updating order ${orderId} status to ${status}`);
          const response = await brain.update_order_status(
            { orderId: orderId },  // Use orderId to match TypeScript client
            { status: status }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to update order status: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Order status force updated via API:', data);
          
          // Update the order in the store with all data from API response
          set((state) => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { ...order, ...data.order, status } 
                : order
            ),
            loading: false
          }));
          
          return data.order;
        } catch (error) {
          console.error('Failed to force update order status', error);
          if (!isAutoRefresh) {
            set({ 
              error: 'Failed to update order status. Please try again.', 
              loading: false 
            });
          } else {
            set({ loading: false });
          }
          throw error;
        }
      },
      
      saveShippingAddress: (shippingInfo) => {
        const { currentUser, saveAddress } = useUserAuth.getState();
        
        if (currentUser) {
          // Check if this address already exists to avoid duplicates
          const existingAddress = currentUser.savedAddresses?.find(addr => 
            addr.fullName === shippingInfo.fullName &&
            addr.address === shippingInfo.address &&
            addr.city === shippingInfo.city
          );
          
          if (!existingAddress) {
            saveAddress({
              fullName: shippingInfo.fullName,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              zipCode: shippingInfo.zipCode,
              country: shippingInfo.country
            });
          }
        }
      },
      
      // Function to get user orders by userId instead of email
      getUserOrders: async (userId) => {
        set({ loading: true, error: null });
        try {
          const response = await brain.get_user_orders({ user_id: userId });
          const data = await response.json();
          set({ orders: data.orders, loading: false });
          return data.orders;
        } catch (error) {
          console.error('Error fetching user orders:', error);
          set({ error: 'Failed to fetch orders', loading: false });
          return [];
        }
      },
      
      // Get only delivered orders
      getDeliveredOrders: () => {
        return get().orders.filter(order => order.status === 'delivered');
      },
      
      // Get list of product IDs that the user has purchased and received
      getDeliverableProducts: async (userId) => {
        // First make sure we have the latest orders
        await get().getUserOrders(userId);
        
        // Get all delivered orders
        const deliveredOrders = get().getDeliveredOrders();
        
        // Extract all product IDs from delivered orders
        const productIds = new Set<string>();
        deliveredOrders.forEach(order => {
          order.items.forEach(item => {
            productIds.add(item.id);
          });
        });
        
        return Array.from(productIds);
      }
    }),
    {
      name: 'ahadu-orders-storage',
      // Add storage processing to limit the number of stored orders
      partialize: (state) => {
        // Only keep minimal data for persistence to avoid quota issues
        const minimalOrders = state.orders.slice(-3).map(order => ({
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          // Only include email from shipping info
          email: order.shippingInfo?.email || ''
        }));
        
        return {
          ...state,
          // Replace full orders with minimal representation
          orders: minimalOrders,
          // Don't persist loading or error states
          loading: false,
          error: null
        };
      },
    }
  )
);
