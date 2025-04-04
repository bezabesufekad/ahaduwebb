import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCardSimple } from "../components/ProductCardSimple";
import { useProductsStore } from "../utils/productsStore";
import brain from "brain";
import { preloadImages, getImageWithFallback } from "../utils/imageUtils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, ShoppingCart } from "lucide-react";

/**
 * FeaturedProducts component displays a curated selection of featured products
 * Optimized for performance with simplified animations and mobile responsiveness
 */
export function FeaturedProducts() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { products, refreshProducts } = useProductsStore();
  const [featuredProducts, setFeaturedProducts] = useState(products.filter(p => p.featured).slice(0, 4));
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize products and optimize API calls
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setIsLoading(true);
      
      try {
        // Fetch featured products directly - do this first to get fresh data
        console.log('FeaturedProducts: Fetching fresh data from API');
        const response = await brain.get_featured_products({ limit: 4 });
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          const apiProducts = data.products.map(apiProduct => {
            const mainImage = apiProduct.images && apiProduct.images.length > 0 ? 
              apiProduct.images[0] : '';
            
            return {
              id: apiProduct.id,
              name: apiProduct.name,
              price: apiProduct.price,
              image: mainImage,
              category: apiProduct.category,
              description: apiProduct.description || '',
              supplierName: apiProduct.supplierName || 'Ahadu Market'
            };
          });
          
          console.log('FeaturedProducts: Loaded', apiProducts.length, 'products from API');
          setFeaturedProducts(apiProducts);
          
          // Preload images after receiving API response
          const apiImagesToPreload = apiProducts
            .map(p => p.image)
            .filter(img => img && img.trim() !== '');
          if (apiImagesToPreload.length > 0) {
            preloadImages(apiImagesToPreload);
          }
        } else if (products.filter(p => p.featured).length > 0) {
          // Fallback to store data if API returns no products
          const storeProducts = products.filter(p => p.featured).slice(0, 4);
          console.log('FeaturedProducts: Using', storeProducts.length, 'products from store');
          setFeaturedProducts(storeProducts);
          
          // Preload store product images
          const imagesToPreload = storeProducts
            .map(p => p.image)
            .filter(img => img && img.trim() !== '');
          if (imagesToPreload.length > 0) {
            preloadImages(imagesToPreload);
          }
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        
        // Fallback to store data on error
        if (products.filter(p => p.featured).length > 0) {
          const fallbackProducts = products.filter(p => p.featured).slice(0, 4);
          console.log('FeaturedProducts: Using fallback products from store due to error');
          setFeaturedProducts(fallbackProducts);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedProducts();
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
  
  // Countdown timer animation - simplified for performance
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1;
        if (newSeconds >= 0) return { ...prev, seconds: newSeconds };
        
        const newMinutes = prev.minutes - 1;
        if (newMinutes >= 0) return { ...prev, minutes: newMinutes, seconds: 59 };
        
        const newHours = prev.hours - 1;
        if (newHours >= 0) return { hours: newHours, minutes: 59, seconds: 59 };
        
        clearInterval(timer);
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-white to-primary/5 relative" ref={sectionRef}>
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
            Featured Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Browse our handpicked selection of top-rated products
          </p>
        </div>
        
        {/* Flash Sale banner - simplified animations */}
        <div 
          className="bg-gradient-to-r from-primary via-secondary to-accent rounded-xl mb-4 md:mb-8 p-3 md:p-5 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-2 sm:gap-3"
          style={{ 
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
          }}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 justify-center sm:justify-start w-full sm:w-auto">
            <div 
              className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-md flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-full w-full" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white text-base sm:text-xl font-bold drop-shadow-sm">
                Flash Sale!
              </h3>
              <p className="text-white/90 text-xs sm:text-sm">
                Limited time offers
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 justify-center sm:justify-end w-full sm:w-auto">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs sm:text-sm text-red-500 font-bold shadow-md">
              Ends in: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <button 
              onClick={() => navigate("/shop")} 
              className="bg-white text-primary text-xs sm:text-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium hover:bg-primary/5 transition-all duration-300 hover:shadow-lg border border-white/20 flex items-center"
            >
              Shop Now
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
        
        {/* Product grid with optimized performance */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
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
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
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
              <p className="text-sm sm:text-base">No featured products available at the moment. Check back soon!</p>
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