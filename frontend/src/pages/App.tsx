import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { CategorySection } from "../components/CategorySection";
import { NewsletterCTA } from "../components/NewsletterCTA";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useUserAuth } from "../utils/userAuthStore";
import { useNavigate } from "react-router-dom";
import { NewArrivalsSection } from "../components/NewArrivalsSection";
import { initAnalytics } from "../utils/firebase";
import { Favicon } from "../components/Favicon";
import { ProductBenefitsSection } from "../components/ProductBenefitsSection";

export default function App() {
  const { currentUser, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  
  
  // Show welcome message only on initial load
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const timeoutId = setTimeout(() => {
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
          welcomeMessage.classList.add('fade-out');
          setTimeout(() => {
            welcomeMessage.style.display = 'none';
          }, 500); // Match this to your CSS transition time
        }
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, currentUser]);
  
  return (
    <div className="flex flex-col min-h-screen bg-white scroll-smooth">
      <Favicon url="https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/photo_2024-03-04_22-44-14-removebg-preview.png" />
      <Navbar />
      <main className="flex-grow">
        {isAuthenticated && (
          <div id="welcome-message" className="bg-gradient-to-r from-primary/80 to-secondary/80 text-white py-2 px-4 text-center transition-opacity duration-500">
            <p className="animate-in fade-in slide-in-from-top-4 duration-700">
              Welcome back, <span className="font-semibold">{currentUser?.name}</span>! 
              <span className="ml-2 text-sm opacity-90">Enjoy exploring our latest products.</span>
            </p>
          </div>
        )}
        
        {/* Special Promotion Banner */}
        <div className="bg-gradient-to-r from-accent/90 to-accent/80 text-white py-3 px-4 relative overflow-hidden shadow-md">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full animate-shimmer" 
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                backgroundSize: '200% 100%',
              }}></div>
          </div>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-3 animate-fadeSlideUp duration-700 px-3 sm:px-0">
            <div className="flex items-center">
              <span className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white text-accent text-lg font-bold mr-3 animate-pulse">%</span>
              <div>
                <p className="font-semibold text-center sm:text-left text-sm md:text-base">Special Offer: Up to 50% off on selected items!</p>
                <p className="text-xs opacity-90 text-center sm:text-left">Limited time offer, shop now before it's gone.</p>
              </div>
            </div>
            <motion.button 
              onClick={() => navigate('/shop')} 
              className="px-5 py-2 bg-white text-accent text-sm font-medium rounded-full shadow hover:shadow-lg transition-all duration-300 hover:scale-105 group flex items-center overflow-hidden relative"
              whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" }}
            >
              {/* Animated background effect */}
              <motion.span 
                className="absolute inset-0 w-full h-full"
                animate={{
                  background: [
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(var(--accent-rgb), 0.1) 50%, rgba(255,255,255,0) 100%)',
                    'linear-gradient(90deg, rgba(255,255,255,0) 100%, rgba(var(--accent-rgb), 0.1) 150%, rgba(255,255,255,0) 200%)'
                  ],
                  x: ['-100%', '100%']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Simplified animated particles - fewer particles for better performance */}
              <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-accent/30"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `-5%`,
                    }}
                    animate={{ 
                      x: ['0%', '110%'],
                      y: [0, Math.random() * 10 - 5],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 2 + Math.random(), 
                      repeat: Infinity, 
                      delay: Math.random() * 2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Border gradient animation */}
              <motion.span 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                style={{ 
                  background: 'linear-gradient(90deg, var(--accent) 0%, var(--primary) 50%, var(--accent) 100%)',
                  padding: '1.5px'
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 3, 
                  ease: "linear", 
                  repeat: Infinity
                }}
              />
              
              {/* Inner white background to create border effect */}
              <span className="absolute inset-0.5 bg-white rounded-full"></span>
              
              {/* Button text with arrow */}
              <span className="relative z-10 flex items-center font-medium">
                Shop Now
                <motion.span 
                  className="inline-block ml-1.5 relative"
                  animate={{
                    x: [0, 5, 0],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  {/* Glow effect on hover */}
                  <motion.span 
                    className="absolute inset-0 rounded-full bg-accent/0 group-hover:bg-accent/20 filter blur-md"
                    animate={{
                      scale: [1, 1.5, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.span>
              </span>
            </motion.button>
          </div>
        </div>
        <HeroSection />
        

        <div className="bg-white bg-no-repeat bg-cover max-w-full overflow-hidden">
          <div className="w-full">
            <FeaturedProducts />
          </div>
        </div>
        <CategorySection />
        
        {/* Product Benefits Section */}
        <ProductBenefitsSection />
        
        <NewArrivalsSection />
        
        <NewsletterCTA />
        
        
        {/* Back to top button */}
        <div className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-50">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-xl"
            aria-label="Back to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
