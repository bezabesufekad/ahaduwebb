import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import brain from '../brain';

// Product interface defines the structure of a product in our store
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string; // Main product image
  additionalImages?: string[]; // Additional product images
  category: string;
  description: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
  lowStockThreshold?: number;
  featured?: boolean;
  lastRestocked?: string; // ISO date when the product was last restocked
  supplierName?: string; // Information about the supplier
  shippingPrice?: number; // Product-specific shipping price
  shopName?: string; // Name of the shop/supplier selling the product
}

interface ProductsState {
  products: Product[];
  searchResults: Product[];
  searchQuery: string;
  filteredProducts: Product[]; // Add filteredProducts state
  setSearchQuery: (query: string) => void;
  searchProducts: () => void;
  getProductById: (id: string) => Product | undefined;
  getAllProducts: () => Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Product | Promise<Product>;
  deleteProduct: (id: string) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  bulkUpdateStock: (ids: string[], stockChange: number) => void;
  bulkToggleFeatured: (ids: string[], featured: boolean) => void;
  filterProducts: (filters: ProductFilters) => Product[];
  init: () => Promise<void>;
  refreshProducts: () => Promise<Product[]>;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Modern Leather Sofa",
    price: 799.99,
    image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1550226891-ef816aed4a98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ],
    category: "Furniture",
    description: "Luxurious modern leather sofa with premium comfort and durability. Perfect for your living room.",
    colors: ["#8B4513", "#000000", "#F5F5DC"],
    sizes: ["2-Seater", "3-Seater", "L-Shaped"]
  },
  {
    id: "2",
    name: "Wireless Noise Cancelling Headphones",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    ],
    category: "Electronics",
    description: "Premium wireless headphones with advanced noise cancellation technology for immersive audio experience.",
    colors: ["#FF0000", "#000000", "#FFFFFF"],
    sizes: []
  },
  {
    id: "3",
    name: "Minimalist Desk Lamp",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1534291228191-3e97d90c383b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ],
    category: "Home Decor",
    description: "Sleek, adjustable desk lamp with modern design. Features touch controls and multiple brightness settings.",
    colors: ["#FFFFFF", "#000000", "#808080"],
    sizes: []
  },
  {
    id: "4",
    name: "Organic Cotton T-shirt",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80"
    ],
    category: "Clothing",
    description: "Soft, breathable organic cotton t-shirt. Eco-friendly and sustainably sourced materials.",
    colors: ["#FFFFFF", "#000000", "#0000FF", "#FF0000"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "5",
    name: "Smartphone Stand",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ],
    category: "Electronics",
    description: "Adjustable aluminum smartphone stand, compatible with all devices. Sleek design with non-slip base.",
    colors: ["#C0C0C0", "#000000", "#FFD700"],
    sizes: []
  },
  {
    id: "6",
    name: "Ceramic Coffee Mug Set",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80"
    ],
    category: "Kitchen",
    description: "Set of 4 handcrafted ceramic coffee mugs. Elegant design with comfortable handle and durable finish.",
    colors: ["#FFFFFF", "#000000", "#0000FF", "#FF0000"],
    sizes: []
  },
  {
    id: "7",
    name: "Fitness Smartwatch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80"
    ],
    category: "Electronics",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, and week-long battery life. Water-resistant up to 50m.",
    colors: ["#000000", "#C0C0C0", "#FF0000"],
    sizes: []
  },
  {
    id: "8",
    name: "Premium Yoga Mat",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1599447292180-45fd84092ef4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ],
    category: "Fitness",
    description: "Professional-grade yoga mat with excellent grip and cushioning. Eco-friendly materials and easy to clean.",
    colors: ["#800080", "#008000", "#0000FF"],
    sizes: []
  }
];

export interface ProductFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  searchTerm?: string;
  inStock?: boolean;
  featured?: boolean;
}

export const useProductsStore = create<ProductsState>(
  persist(
    (set, get) => ({
      init: async () => {
        try {
          // Initialize products from API when store is created
          const response = await brain.get_products({});
          const data = await response.json();
          
          // Map API products to our Product interface
          const apiProducts = data.products.map(apiProduct => ({
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            image: apiProduct.images[0] || '',
            additionalImages: apiProduct.images.slice(1),
            category: apiProduct.category,
            description: apiProduct.description,
            stock: apiProduct.stock,
            featured: apiProduct.featured || false,
            shopName: apiProduct.shopName || 'Ahadu Market',
            lowStockThreshold: 10 // Default value
          }));
          
          // If we have products from API, use them, otherwise keep mock products
          if (apiProducts.length > 0) {
            try {
              set({ 
                products: apiProducts,
                filteredProducts: apiProducts // Also update filtered products
              });
            } catch (storageError) {
              console.error('Storage quota exceeded during initialization, using memory-only mode', storageError);
              // Apply the update without persistence to keep the app working
              set({ 
                products: apiProducts,
                filteredProducts: apiProducts 
              }, false);
            }
          }
        } catch (error) {
          console.error('Failed to initialize products from API, using mock data:', error);
          // Keep using mock products
        }
      },
      
      // Refresh products from API
  refreshProducts: async () => {
        try {
          console.log('Refreshing products from API');
          const response = await brain.get_products({});
          const data = await response.json();
          
          // Map API products to our Product interface
          const apiProducts = data.products.map(apiProduct => {
            // Ensure we have valid image URLs
            let mainImage = '';
            let additionalImages: string[] = [];
            
            if (apiProduct.images && Array.isArray(apiProduct.images)) {
              // Filter out any invalid/empty image URLs
              const validImages = apiProduct.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
              mainImage = validImages[0] || '';
              additionalImages = validImages.slice(1);
            }
            
            return {
              id: apiProduct.id,
              name: apiProduct.name,
              price: apiProduct.price,
              image: mainImage,
              additionalImages: additionalImages,
              category: apiProduct.category,
              description: apiProduct.description,
              stock: apiProduct.stock || 0,
              featured: apiProduct.featured || false,
              shopName: apiProduct.shopName || 'Ahadu Market',
              supplierName: apiProduct.supplierName || '',
              shippingPrice: apiProduct.shippingPrice || 0,
              lowStockThreshold: 10 // Default value
            };
          });
          
          console.log('Received products from API:', apiProducts.length);
          
          if (apiProducts.length > 0) {
            // Apply any current filters to the new product list
            const currentFilters = get().filteredProducts;
            const isFiltered = currentFilters.length !== get().products.length;
            
            // Update both product lists to ensure synchronization
            try {
              set({ 
                products: apiProducts,
                filteredProducts: isFiltered ? 
                  // If there are active filters, reapply them
                  apiProducts.filter(p => {
                    // Match based on current filter criteria (simplified for now)
                    return currentFilters.some(fp => {
                      if (fp.id === p.id) return true;
                      if (fp.category === p.category) return true;
                      return false;
                    });
                  }) : 
                  // Otherwise, use all products
                  apiProducts
              });
            } catch (storageError) {
              console.error('Storage quota exceeded during refresh, using memory-only mode', storageError);
              // Apply the update without persistence to keep the app working
              set({ 
                products: apiProducts,
                filteredProducts: isFiltered ? 
                  apiProducts.filter(p => {
                    return currentFilters.some(fp => {
                      if (fp.id === p.id) return true;
                      if (fp.category === p.category) return true;
                      return false;
                    });
                  }) : 
                  apiProducts
              }, false);
            }
          }
          return apiProducts;
        } catch (error) {
          console.error('Failed to refresh products from API:', error);
          return get().products;
        }
      },

      products: mockProducts,
      searchResults: [],
      searchQuery: '',
      filteredProducts: mockProducts, // Initialize filteredProducts with all products
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      searchProducts: () => {
        const { products, searchQuery } = get();
        
        if (!searchQuery.trim()) {
          set({ searchResults: [] });
          return;
        }
        
        const query = searchQuery.toLowerCase().trim();
        const results = products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        
        set({ searchResults: results });
      },
      
      getProductById: (id) => {
        return get().products.find(p => p.id === id);
      },

      getAllProducts: () => {
        return get().products;
      },

      addProduct: async (productData) => {
        try {
          // First try to create the product via API
          const response = await brain.create_product({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            stock: productData.stock || 100,
            images: [productData.image, ...(productData.additionalImages || [])],
            featured: productData.featured || false,
            shopName: productData.shopName || 'Ahadu Market',
            specifications: {}
          });

          const data = await response.json();
          
          // Create a new product object from the API response
          const newProduct: Product = {
            id: data.product.id,
            name: data.product.name,
            price: data.product.price,
            image: data.product.images[0] || '',
            additionalImages: data.product.images.slice(1),
            category: data.product.category,
            description: data.product.description,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            stock: data.product.stock,
            lowStockThreshold: productData.lowStockThreshold || 10,
            featured: data.product.featured
          };
          
          // Update local store
          set(state => ({
            products: [...state.products, newProduct],
            filteredProducts: [...state.products, newProduct] // Update filtered products as well
          }));
          
          return newProduct;
        } catch (error) {
          console.error('Error creating product via API, falling back to local store:', error);
          
          // Fallback to local store for development/testing
          const newProduct: Product = {
            ...productData,
            id: `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          };
          
          set(state => ({
            products: [...state.products, newProduct]
          }));
          
          return newProduct;
        }
      },

      updateProduct: async (id: string, productData: Omit<Product, 'id'>) => {
        try {
          // Ensure we never send null/undefined images to the API
          const mainImage = productData.image || '';
          const additionalImages = productData.additionalImages?.filter(img => img) || [];
          
          // First try to update the product via API
          const response = await brain.update_product(
            { productId: id },
            {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              category: productData.category,
              stock: productData.stock,
              images: [mainImage, ...additionalImages],
              featured: productData.featured,
              shopName: productData.shopName || 'Ahadu Market',
              supplierName: productData.supplierName,
              shippingPrice: productData.shippingPrice
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Extract updated product data from response
            const updatedProduct = {
              id,
              ...productData,
              name: data.product?.name || productData.name,
              description: data.product?.description || productData.description,
              price: data.product?.price || productData.price,
              category: data.product?.category || productData.category,
              stock: data.product?.stock || productData.stock,
              featured: data.product?.featured ?? productData.featured,
              // If images were updated, sync them with our format
              image: data.product?.images?.[0] || mainImage,
              additionalImages: data.product?.images?.slice(1) || additionalImages
            };

            // Update both products and filteredProducts lists
            try {
              set(state => ({
                products: state.products.map(p => 
                  p.id === id ? updatedProduct : p
                ),
                filteredProducts: state.filteredProducts.map(p => 
                  p.id === id ? updatedProduct : p
                )
              }));
            } catch (storageError) {
              console.error('Storage quota exceeded during update, using memory-only mode', storageError);
              // Apply the update without persistence
              set(state => ({
                products: state.products.map(p => 
                  p.id === id ? updatedProduct : p
                ),
                filteredProducts: state.filteredProducts.map(p => 
                  p.id === id ? updatedProduct : p
                )
              }), false);
            }

            return updatedProduct;
          } else {
            throw new Error('API update failed');
          }
        } catch (error) {
          console.error('Error updating product via API, falling back to local update:', error);
          
          try {
            // Fallback to local store update but only update the specific product
            // without replacing the entire array to reduce storage usage
            set(state => {
              const updatedProducts = state.products.map(p => 
                p.id === id ? { ...p, ...productData, id } : p
              );
              return { products: updatedProducts };
            });
          } catch (storageError) {
            console.error('Local storage error:', storageError);
            // If local storage fails, at least update the in-memory state
            // without persisting to avoid quota errors
            set(state => {
              const productIndex = state.products.findIndex(p => p.id === id);
              if (productIndex >= 0) {
                const newProducts = [...state.products];
                newProducts[productIndex] = { ...productData, id };
                return { products: newProducts };
              }
              return state;
            }, false); // false = don't persist this update
          }

          return { ...productData, id };
        }
      },

      deleteProduct: async (id) => {
        try {
          // First try to delete the product via API
          const response = await brain.delete_product({ productId: id });

          // If API delete successful, update local store
          set(state => ({
            products: state.products.filter(p => p.id !== id),
            filteredProducts: state.filteredProducts.filter(p => p.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting product via API, falling back to local delete:', error);
          
          // Fallback to local store delete
          set(state => ({
            products: state.products.filter(p => p.id !== id),
            filteredProducts: state.filteredProducts.filter(p => p.id !== id)
          }));
        }
      },

      bulkDeleteProducts: (ids) => {
        set(state => ({
          products: state.products.filter(p => !ids.includes(p.id)),
          filteredProducts: state.filteredProducts.filter(p => !ids.includes(p.id))
        }));
      },

      bulkUpdateStock: (ids, stockChange) => {
        set(state => {
          const updatedProducts = state.products.map(p => {
            if (ids.includes(p.id)) {
              const currentStock = p.stock || 0;
              return {
                ...p,
                stock: Math.max(0, currentStock + stockChange) // Prevent negative stock
              };
            }
            return p;
          });
          
          return {
            products: updatedProducts,
            filteredProducts: state.filteredProducts.map(p => {
              if (ids.includes(p.id)) {
                const currentStock = p.stock || 0;
                return {
                  ...p,
                  stock: Math.max(0, currentStock + stockChange) // Prevent negative stock
                };
              }
              return p;
            })
          };
        });
      },

      bulkToggleFeatured: async (ids, featured) => {
        // First update local state for immediate UI feedback
        set(state => {
          const updatedProducts = state.products.map(p => {
            if (ids.includes(p.id)) {
              return {
                ...p,
                featured
              };
            }
            return p;
          });
          
          return {
            products: updatedProducts,
            filteredProducts: state.filteredProducts.map(p => {
              if (ids.includes(p.id)) {
                return {
                  ...p,
                  featured
                };
              }
              return p;
            })
          };
        });
        
        // Then update each product in the backend
        try {
          const { products } = get();
          
          // Make API calls for each product to update featured status
          for (const id of ids) {
            const product = products.find(p => p.id === id);
            if (product) {
              await brain.update_product(
                { product_id: id },
                {
                  featured: featured
                }
              );
            }
          }
          
          // Refresh products to ensure consistency with server
          await get().refreshProducts();
        } catch (error) {
          console.error('Error updating featured status via API:', error);
        }
      },

      filterProducts: (filters) => {
        const { products } = get();
        const filtered = products.filter(product => {
          // Filter by category
          if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
            return false;
          }
          
          // Filter by price range
          if (filters.priceRange) {
            if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
              return false;
            }
          }
          
          // Filter by search term
          if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            const nameMatch = product.name.toLowerCase().includes(term);
            const descMatch = product.description.toLowerCase().includes(term);
            const catMatch = product.category.toLowerCase().includes(term);
            
            if (!nameMatch && !descMatch && !catMatch) {
              return false;
            }
          }
          
          // Filter by stock
          if (filters.inStock !== undefined) {
            const hasStock = (product.stock ?? 0) > 0;
            if (filters.inStock && !hasStock) {
              return false;
            }
          }
          
          // Filter by featured
          if (filters.featured !== undefined && product.featured !== filters.featured) {
            return false;
          }
          
          return true;
        });
        
        // Update the filtered products in the store
        set({ filteredProducts: filtered });
        
        return filtered;
      }
    }),
    {
      name: 'ahadu-products-storage',
      // Only store essential product data to prevent localStorage quota errors
      partialize: (state) => ({
        // Avoid storing the full products array with images
        // Instead only store product IDs and essential metadata
        products: state.products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          featured: product.featured,
          // Skip storing large image URLs
        })),
        // Don't persist filteredProducts or searchResults at all
        // as they can be regenerated from the products array
      }),
    }
  )
);
