import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProductsStore } from "../utils/productsStore";
import { ProductCardSimple } from "./ProductCardSimple";
import { preloadImages, getImageWithFallback } from "../utils/imageUtils";
import brain from "brain";
import { ArrowRight, AlertCircle } from "lucide-react";

/**
 * NewArrivalsSection component displays the latest products added to the store
 * Optimized for performance with simplified animations and mobile responsiveness
 */
export function NewArrivalsSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products } = useProductsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [newArrivals, setNewArrivals] = useState<Array<any>>([]);
  
  // Initialize products and optimize API calls
  useEffect(() => {
    const loadNewArrivals = async () => {
      setIsLoading(true);
      
      try {
        // Fetch products directly from API first - prioritize fresh data
        console.log('NewArrivals: Fetching fresh data from API');
        const response = await brain.get_products({ limit: 8 });
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          const sortedProducts = data.products
            .map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.images && p.images.length > 0 ? p.images[0] : '',
              category: p.category,
              description: p.description || '',
              supplierName: p.supplierName || 'Ahadu Market'
            }))
            .sort((a, b) => parseInt(b.id.replace('product_', '')) - parseInt(a.id.replace('product_', '')))
            .slice(0, 6);
            
          console.log('NewArrivals: Loaded', sortedProducts.length, 'products from API');
          setNewArrivals(sortedProducts);
          
          // Preload images after receiving API response
          const apiImagesToPreload = sortedProducts
            .map(p => p.image)
            .filter(img => img && img.trim() !== '');
          if (apiImagesToPreload.length > 0) {
            preloadImages(apiImagesToPreload);
          }
        } else if (products.length > 0) {
          // Fallback to store data if API returns no products
          const initialProducts = [...products]
            .sort((a, b) => parseInt(b.id.replace('product_', '')) - parseInt(a.id.replace('product_', '')))
            .slice(0, 6);
          
          console.log('NewArrivals: Using', initialProducts.length, 'products from store');
          setNewArrivals(initialProducts);
          
          // Preload images from store data
          const imagesToPreload = initialProducts
            .map(p => p.image)
            .filter(img => img && img.trim() !== '');
          if (imagesToPreload.length > 0) {
            preloadImages(imagesToPreload);
          }
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        
        // Fallback to store data on error
        if (products.length > 0) {
          const fallbackProducts = [...products]
            .sort((a, b) => parseInt(b.id.replace('product_', '')) - parseInt(a.id.replace('product_', '')))
            .slice(0, 6);
          
          console.log('NewArrivals: Using fallback products from store due to error');
          setNewArrivals(fallbackProducts);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNewArrivals();
  }, []); // Only run once on mount
  
  // Handle scroll-based animations with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section 
      ref={sectionRef} 
      className="py-6 sm:py-10 md:py-16 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-white relative"
    >
      {/* Section header - simplified for better performance */}
      <div className="max-w-7xl mx-auto relative">
        <div 
          className="text-center mb-4 sm:mb-8 transition-all duration-700 transform"
          style={{ 
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out'
          }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            New Arrivals
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Discover our latest products and stay ahead of the trends
          </p>
        </div>
        
        {/* Product grid with optimized performance */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="bg-white rounded-lg shadow-md p-2 sm:p-4 animate-pulse"
              >
                <div className="w-full h-28 sm:h-36 md:h-48 bg-gray-200 rounded-md mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded-md mt-3 sm:mt-4"></div>
              </div>
            ))
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product, index) => (
              <div 
                key={product.id}
                className="transform transition-all duration-500 hover:translate-y-[-5px]"
                style={{ 
                  transform: `translateY(${20 - index * 5}px)`,
                  opacity: 0,
                  animation: `fadeSlideUp 0.5s ease-out ${index * 120}ms forwards`
                }}
              >
                <ProductCardSimple 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image || ''}
                  category={product.category}
                  supplierName={product.supplierName || 'Ahadu Market'}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full py-6 sm:py-8 text-center text-gray-500 flex flex-col items-center justify-center">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-gray-400" />
              <p className="text-sm sm:text-base">No new products available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
        
        {/* View All button - simplified for performance */}
        <div 
          className="mt-6 sm:mt-8 md:mt-12 text-center"
          style={{ 
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-out 0.8s'
          }}
        >
          <button 
            onClick={() => navigate("/shop")} 
            className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 md:py-3 px-4 sm:px-5 md:px-8 rounded-full inline-flex items-center space-x-1 sm:space-x-2 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm md:text-base"
          >
            <span>View All Products</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}