import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, useProductsStore } from './productsStore';
import { Order, useOrderStore } from './orderStore';
import { User as AuthUser, useUserAuth } from './userAuthStore';
import brain from '../brain';

// Simple user interface for admin purposes
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'blocked';
  role?: 'admin' | 'customer';
}

// Convert auth user to admin user format
const convertAuthUserToAdminUser = (authUser: AuthUser): User => {
  return {
    id: authUser.id,
    fullName: authUser.name,
    email: authUser.email,
    phone: '',  // Default values for fields not in auth user
    address: '',
    registeredAt: new Date(authUser.createdAt).toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
    role: authUser.role || 'customer'
  };
};

interface AdminState {
  // Products management
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  bulkUpdateProducts: (products: Product[]) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  
  // Orders management
  updateOrderStatus: (orderId: string, status: Order['status']) => boolean;
  deleteOrder: (id: string) => void;
  bulkUpdateOrderStatus: (orderIds: string[], status: Order['status']) => Promise<boolean>;
  
  // Users management
  users: User[];
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'registeredAt'>) => Promise<User>;
  updateUserStatus: (userId: string, status: User['status']) => Promise<boolean>;
  deleteUser: (id: string) => Promise<void>;
  bulkUpdateUserStatus: (userIds: string[], status: User['status']) => Promise<boolean>;
}

// Default users if API fails
const defaultUsers: User[] = [];

// Export set function for testing and direct state updates
export const { getState, setState: set } = create<AdminState>(
  persist(
    (set, get) => ({
      // Rest of the store implementation
    }),
    {
      name: 'ahadu-admin-storage'
    }
  )
);

export const useAdminStore = create<AdminState>(
  persist(
    (set, get) => ({
      // Products management
      updateProduct: async (id: string, productData: Omit<Product, 'id'>) => {
        try {
          // Let the product store handle the API call directly
          // This ensures both stores stay synchronized
          const productsStore = useProductsStore.getState();
          const updatedProduct = await productsStore.updateProduct(id, productData);
          
          if (updatedProduct) {
            console.log('Product updated successfully:', updatedProduct);
            return updatedProduct;
          }
          return null;
        } catch (error) {
          console.error('Error updating product:', error);
          return null;
        }
      },
      
      deleteProduct: async (id) => {
        try {
          // Call backend API to delete product (would be added in the future)
          // For now we're updating state directly
          
          // Method 1: Update through direct state access
          const productsStore = useProductsStore.getState();
          const products = productsStore.products.filter(p => p.id !== id);
          useProductsStore.setState({ products });
          
          // Method 2: Also use the store's own delete method as a backup
          productsStore.deleteProduct(id);
          
          console.log('Product deleted successfully:', id);
          return true;
        } catch (error) {
          console.error('Error deleting product:', error);
          return false;
        }
      },
      
      addProduct: async (productData) => {
        try {
          // Create a new product with ID
          const id = 'product_' + Date.now();
          const newProduct: Product = {
            ...productData,
            id,
            colors: productData.colors || [],
            sizes: productData.sizes || []
          };
          
          // Method 1: Update through direct state access
          const productsStore = useProductsStore.getState();
          const products = [...productsStore.products, newProduct];
          useProductsStore.setState({ products });
          
          // Method 2: Also use the store's own add method as a backup
          productsStore.addProduct(productData);
          
          console.log('Product added successfully:', newProduct);
          return newProduct;
        } catch (error) {
          console.error('Error adding product:', error);
          throw error;
        }
      },
      
      bulkUpdateProducts: async (updatedProducts) => {
        try {
          const productsStore = useProductsStore.getState();
          const products = [...productsStore.products];
          
          // Create a map of IDs to new product data for easier lookup
          const updateMap = new Map(updatedProducts.map(p => [p.id, p]));
          
          // Update each product that exists in the map
          const updatedList = products.map(product => {
            const update = updateMap.get(product.id);
            return update ? { ...product, ...update } : product;
          });
          
          // Method 1: Update through direct state access
          useProductsStore.setState({ products: updatedList });
          
          // Method 2: Also use each product's individual update
          for (const product of updatedProducts) {
            productsStore.updateProduct(product.id, {
              name: product.name,
              price: product.price,
              description: product.description,
              image: product.image,
              additionalImages: product.additionalImages,
              category: product.category,
              stock: product.stock,
              featured: product.featured,
              shopName: product.shopName,
              shippingPrice: product.shippingPrice,
              supplierName: product.supplierName
            });
          }
          
          console.log('Bulk product update successful:', updatedProducts.length, 'products');
          return true;
        } catch (error) {
          console.error('Error bulk updating products:', error);
          return false;
        }
      },
      
      bulkDeleteProducts: async (ids) => {
        try {
          // Method 1: Update through direct state access
          const productsStore = useProductsStore.getState();
          const products = productsStore.products.filter(p => !ids.includes(p.id));
          useProductsStore.setState({ products });
          
          // Method 2: Also use the store's bulk delete method (if available) or delete individually
          productsStore.bulkDeleteProducts(ids);
          
          console.log('Bulk product deletion successful:', ids.length, 'products');
          return true;
        } catch (error) {
          console.error('Error bulk deleting products:', error);
          return false;
        }
      },
      
      // Orders management
      updateOrderStatus: async (orderId, status) => {
        try {
          // Call the API to update the order status
          const response = await brain.update_order_status(
            { orderId: orderId },
            { status }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to update order status: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Update the local store
          const orderStore = useOrderStore.getState();
          const orders = orderStore.orders.map(order => 
            order.id === orderId ? { ...order, status } : order
          );
          
          // Update using both methods for redundancy
          useOrderStore.setState({ orders });
          orderStore.updateOrderStatus(orderId, status);
          
          console.log(`Order ${orderId} status updated to ${status}`);
          return true;
        } catch (error) {
          console.error('Error updating order status:', error);
          return false;
        }
      },
      
      deleteOrder: async (id) => {
        try {
          // There's no API endpoint for deleting orders, so we'll just remove it from the store
          // In a real app, you would call an API endpoint to delete the order
          
          // Update the local store
          const orderStore = useOrderStore.getState();
          const orders = orderStore.orders.filter(o => o.id !== id);
          
          // Update using both methods for redundancy
          useOrderStore.setState({ orders });
          
          // Check if orderStore has a deleteOrder method and use it
          if (typeof orderStore.deleteOrder === 'function') {
            orderStore.deleteOrder(id);
          }
          
          console.log(`Order ${id} deleted successfully`);
          return true;
        } catch (error) {
          console.error('Error deleting order:', error);
          return false;
        }
      },
      
      bulkUpdateOrderStatus: async (orderIds, status) => {
        try {
          // In a real implementation, we would use a batch update API
          // For now, we'll just update each order individually
          let success = true;
          let updatedCount = 0;
          
          for (const orderId of orderIds) {
            const result = await get().updateOrderStatus(orderId, status);
            if (result) updatedCount++;
            else success = false;
          }
          
          console.log(`Bulk updated ${updatedCount}/${orderIds.length} orders to status: ${status}`);
          return success;
        } catch (error) {
          console.error('Error bulk updating order status:', error);
          return false;
        }
      },
      
      // Users management
      users: defaultUsers,
      
      fetchUsers: async () => {
        try {
          const response = await brain.get_all_users({});
          if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Transform API data into our User interface format
          const apiUsers = data.users.map(apiUser => ({
            id: apiUser.id,
            fullName: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone || '',
            address: '', // API doesn't provide address directly
            registeredAt: apiUser.createdAt,
            lastLogin: apiUser.lastLogin || apiUser.createdAt,
            status: apiUser.status as User['status']
          }));
          
          set({ users: apiUsers });
        } catch (error) {
          console.error('Error fetching users:', error);
          // Fallback to existing users in store - don't reset to empty
        }
      },
      
      addUser: async (userData) => {
        try {
          // This would call the API to add a user
          // For now, we'll just add it to the store
          const id = 'user_' + Date.now();
          const newUser: User = {
            ...userData,
            id,
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            status: 'active'
          };
          
          set((state) => ({
            users: [...state.users, newUser]
          }));
          
          return newUser;
        } catch (error) {
          console.error('Error adding user:', error);
          throw error;
        }
      },
      
      updateUserStatus: async (userId, status) => {
        try {
          // Call the API to update the user status
          const response = await brain.update_user_status(
            { userId: userId },
            { status }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to update user status: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Update the local store
          set((state) => {
            const users = [...state.users];
            const index = users.findIndex(u => u.id === userId);
            
            if (index !== -1) {
              users[index] = {
                ...users[index],
                status
              };
              return { users };
            }
            
            return { users };
          });
          
          // Also update the user in userAuth store if it exists
          const userAuth = useUserAuth.getState();
          if (userAuth.currentUser && userAuth.currentUser.id === userId) {
            userAuth.updateUserProfile({
              ...userAuth.currentUser,
              status
            });
          }
          
          console.log(`User ${userId} status updated to ${status}`);
          return true;
        } catch (error) {
          console.error('Error updating user status:', error);
          return false;
        }
      },
      
      deleteUser: async (id) => {
        try {
          // Call the API to delete the user
          const response = await brain.delete_user({ userId: id });
          
          if (!response.ok) {
            throw new Error(`Failed to delete user: ${response.statusText}`);
          }
          
          // Update the local store
          set((state) => ({
            users: state.users.filter(u => u.id !== id)
          }));
          
          // If there's a logged in user with this ID, log them out
          const userAuth = useUserAuth.getState();
          if (userAuth.currentUser && userAuth.currentUser.id === id) {
            userAuth.signOut();
          }
          
          console.log(`User ${id} deleted successfully`);
        } catch (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
      },
      
      bulkUpdateUserStatus: async (userIds, status) => {
        try {
          // In a real implementation, we would use a batch update API
          // For now, we'll just update each user individually
          let success = true;
          let updatedCount = 0;
          
          for (const userId of userIds) {
            const result = await get().updateUserStatus(userId, status);
            if (result) updatedCount++;
            else success = false;
          }
          
          console.log(`Bulk updated ${updatedCount}/${userIds.length} users to status: ${status}`);
          return success;
        } catch (error) {
          console.error('Error bulk updating user status:', error);
          return false;
        }
      }
    }),
    {
      name: 'ahadu-admin-storage'
    }
  )
);
