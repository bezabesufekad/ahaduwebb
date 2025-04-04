import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { useUserAuth } from './userAuthStore';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  shippingPrice?: number;
  supplierName?: string;
  shopName?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotalPrice: () => number;
  getTotalShipping: () => number;
}

export const useCartStore = create<CartState>(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item, quantity) => {
        // Enable users to add items without signing in first
        // const { isAuthenticated } = useUserAuth.getState();
        
        // if (!isAuthenticated) {
        //   toast.error("Please sign in to add items to your cart");
        //   return false;
        // }
        
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          
          if (existingItem) {
            // If the item already exists, update its quantity
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          } else {
            // Otherwise, add a new item
            return {
              items: [...state.items, { ...item, quantity }],
            };
          }
        });
        
        return true;
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => {
            const itemTotal = item.price * item.quantity;
            const shippingCost = item.shippingPrice || 0;
            return total + itemTotal + shippingCost;
          },
          0
        );
      },
      
      getSubtotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      getTotalShipping: () => {
        return get().items.reduce(
          (total, item) => total + (item.shippingPrice || 0),
          0
        );
      },
    }),
    {
      name: 'ahadu-cart-storage',
    }
  )
);
