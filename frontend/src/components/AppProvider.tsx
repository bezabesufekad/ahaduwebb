import { ReactNode, useEffect } from "react";
import { useProductsStore } from "../utils/productsStore";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  const { init, refreshProducts } = useProductsStore();

  // Eagerly load products as soon as the app mounts
  useEffect(() => {
    console.log('AppProvider: Initializing product data');
    
    // Clear local storage cache for products to force fresh data load
    try {
      const storeKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('products-store') || 
        key.includes('zustand') ||
        key.includes('persist'))
      
      if (storeKeys.length > 0) {
        console.log('AppProvider: Clearing product cache to ensure fresh data');
        storeKeys.forEach(key => localStorage.removeItem(key));
      }
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    
    // Initialize products immediately
    const loadProducts = async () => {
      try {
        // Initialize the store with fresh data
        await init();
        
        // Then immediately refresh to ensure we have latest data
        await refreshProducts();
        console.log('AppProvider: Products loaded successfully');
      } catch (error) {
        console.error('AppProvider: Failed to load products', error);
      }
    };
    
    loadProducts();
  }, [init, refreshProducts]);

  return <>{children}</>;
};