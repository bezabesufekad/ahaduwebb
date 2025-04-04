import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './productsStore';
import { toast } from 'sonner';

interface FavoritesState {
  favorites: Record<string, Omit<Product, 'additionalImages' | 'sizes' | 'colors'>>;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavorites: () => Array<Omit<Product, 'additionalImages' | 'sizes' | 'colors'>>;
  getFavoriteCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>(
  persist(
    (set, get) => ({
      favorites: {},
      
      addToFavorites: (product) => {
        set((state) => {
          // Add product to favorites
          const simplifiedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description || '',
            shopName: product.shopName,
          };
          
          return {
            favorites: {
              ...state.favorites,
              [product.id]: simplifiedProduct
            }
          };
        });
        
        toast.success("Added to favorites", {
          description: `${product.name} has been added to your favorites`,
          position: "bottom-right",
        });
      },
      
      removeFromFavorites: (productId) => {
        const productName = get().favorites[productId]?.name || "Product";
        
        set((state) => {
          const newFavorites = { ...state.favorites };
          delete newFavorites[productId];
          
          return { favorites: newFavorites };
        });
        
        toast.success("Removed from favorites", {
          description: `${productName} has been removed from your favorites`,
          position: "bottom-right",
        });
      },
      
      isFavorite: (productId) => {
        return !!get().favorites[productId];
      },
      
      getFavorites: () => {
        return Object.values(get().favorites);
      },
      
      getFavoriteCount: () => {
        return Object.keys(get().favorites).length;
      }
    }),
    {
      name: 'favorites-storage'
    }
  )
);
