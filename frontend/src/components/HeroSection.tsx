import React, { useEffect, useState, useRef } from "react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingBag, Clock } from "lucide-react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [scrollIndicator, setScrollIndicator] = useState(true);
  const [heroImage, setHeroImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // Timer for carousel
  const [isPaused, setIsPaused] = useState(false); // To pause the carousel
  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Hero carousel images
  const heroImages = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  ];
  
  useEffect(() => {
    setIsVisible(true);
    
    // Add logo animation after a short delay
    const logoTimer = setTimeout(() => {
      setLogoAnimated(true);
    }, 800);
    
    // Auto-rotate hero images with countdown timer
    let carouselTimer: NodeJS.Timeout | null = null;
    
    if (!isPaused) {
      carouselTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next image when timer reaches zero
            setHeroImage(prevImg => (prevImg + 1) % heroImages.length);
            return 5; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Hide scroll indicator when user scrolls
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrollIndicator(false);
      } else {
        setScrollIndicator(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(logoTimer);
      if (carouselTimer) clearInterval(carouselTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [heroImages.length, isPaused]);

  const scrollToProducts = () => {
    const featuredProducts = document.querySelector('#featured-products');
    if (featuredProducts) {
      featuredProducts.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Interactive product spotlight
  const [spotlight, setSpotlight] = useState({
    x: 0,
    y: 0,
    active: false
  });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({
      ...spotlight,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const activateSpotlight = () => {
    setSpotlight({ ...spotlight, active: true });
  };
  
  const deactivateSpotlight = () => {
    setSpotlight({ ...spotlight, active: false });
  };
  
  return (
    <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-b from-white via-white to-white min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center" id="hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2129&q=80')] bg-cover bg-fixed opacity-5"></div>
      
      {/* Logo Display - prominently featured (hidden on mobile) */}
      <div 
        ref={logoRef}
        className={`absolute z-10 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center transition-all duration-1000 ${logoAnimated ? 'opacity-100 translate-y-[20px]' : 'opacity-0 -translate-y-[100px]'}`}
      >
        <div 
          className="relative bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-xl border border-primary/20 overflow-hidden group hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img 
            src="https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/photo_2024-03-04_22-44-14-removebg-preview.png" 
            alt="Ahadu Market Logo" 
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain relative z-10" 
          />
          <div 
            className="absolute inset-0 border-2 border-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"
          ></div>
        </div>
        <div 
          className={`mt-2 text-center bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full shadow-md border border-primary/10 transition-all duration-500 ${logoAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          <span className="font-bold text-primary text-xl">አሐዱ Market</span>
        </div>
      </div>
      
      {/* Static decorative elements for better performance */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Left content */}
          <div className={`space-y-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800 leading-tight animate-in fade-in slide-in-from-left-8 duration-1000">
                Discover <span className="text-primary relative inline-block group">
                  Excellence 
                  {/* Animated underline */}
                  <span className="absolute -bottom-2 left-0 w-0 h-3 bg-primary/30 rounded-full animate-[growWidth_1.5s_ease-in-out_forwards_0.5s]"></span>
                  <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary rounded-full animate-[growWidth_1.2s_ease-in-out_forwards_0.7s]"></span>
                </span> <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-in fade-in duration-1000 delay-200">Shop with Ahadu</span>
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 max-w-xl opacity-0 animate-[fadeSlideUp_0.7s_ease-out_forwards_0.7s] animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards delay-300">
                Experience the perfect blend of quality, style, and convenience at Ahadu Market - where exceptional products meet unparalleled service and seamless shopping experience.
              </p>
              
              <div className="mt-4 md:mt-6 bg-white/50 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-primary/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <h3 className="font-semibold text-primary mb-2">ለምን ከኛ ይገበያሉ?</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </span>
                    <span>ደረጃቸውን የጠበቁ እቃዎችን እና ምርቶችን </span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="h-5 w-5 flex-shrink-0 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    </span>
                    <span>ፈጣን እና አስተማማኝ የ Delivery አገልግሎት</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="h-5 w-5 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-accent"></span>
                    </span>
                    <span>ፈጣን እና ምቹ የደንበኞች አገልግሎት</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-4 opacity-0 animate-[fadeSlideUp_0.7s_ease-out_forwards_1.3s]">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative" // Added for the animation badge
              >
                {/* Simplified static badge */}
                <div 
                  className="absolute -right-2 -top-2 z-10 bg-accent text-white text-xs px-2 py-1 rounded-full shadow-md"
                >
                  <span className="relative inline-block">New Arrivals!</span>
                </div>
                
                <motion.div
                  className="relative overflow-hidden rounded-full"
                  whileHover={{
                    boxShadow: ['0px 0px 0px rgba(124, 58, 237, 0)', '0px 0px 20px rgba(124, 58, 237, 0.5)'],
                    transition: { duration: 0.3 }
                  }}
                >
                {/* Static decorative particles for better performance */}
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div 
                      className="absolute w-4 h-4 rounded-full bg-white opacity-20"
                      style={{
                        top: "20%",
                        left: "30%"
                      }}
                    />
                    <div 
                      className="absolute w-4 h-4 rounded-full bg-white opacity-20"
                      style={{
                        top: "50%",
                        left: "70%"
                      }}
                    />
                    <div 
                      className="absolute w-4 h-4 rounded-full bg-white opacity-20"
                      style={{
                        top: "70%",
                        left: "40%"
                      }}
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="font-medium rounded-full px-8 relative overflow-hidden group shadow-md hover:shadow-xl transform transition-all duration-500 hover:scale-105 active:scale-95 border border-white/30"
                    onClick={() => navigate("/shop")}
                  >
                    {/* Simplified hover effect background */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90 rounded-full"
                    />
                    
                    {/* Simplified gradient - static */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90"
                    />
                    
                    {/* Static decorative elements instead of animated particles */}
                    <div className="absolute inset-0 overflow-hidden hidden md:block">
                      <div className="absolute w-2 h-2 rounded-full bg-white/50" 
                           style={{
                             top: "20%",
                             left: "30%",
                             filter: "blur(1px)",
                             boxShadow: "0 0 6px 1px rgba(255, 255, 255, 0.2)"
                           }}
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-white/50" 
                           style={{
                             top: "60%",
                             left: "70%",
                             filter: "blur(1px)",
                             boxShadow: "0 0 6px 1px rgba(255, 255, 255, 0.2)"
                           }}
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-white/50" 
                           style={{
                             top: "40%",
                             left: "50%",
                             filter: "blur(1px)",
                             boxShadow: "0 0 6px 1px rgba(255, 255, 255, 0.2)"
                           }}
                      />
                      <div className="absolute w-2 h-2 rounded-full bg-white/50" 
                           style={{
                             top: "80%",
                             left: "20%",
                             filter: "blur(1px)",
                             boxShadow: "0 0 6px 1px rgba(255, 255, 255, 0.2)"
                           }}
                      />
                    </div>
                    
                    {/* Button content with enhanced animations */}
                    <span className="relative z-10 flex items-center">
                      <div className="mr-2">
                        <ShoppingBag className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                      </div>
                      
                      {/* Simplified text with hover effect */}
                      <div className="relative overflow-hidden h-6">
                        <span className="inline-block font-medium transition-transform duration-300 group-hover:opacity-0">Shop Now</span>
                        <span className="absolute top-0 left-0 right-0 font-bold text-base opacity-0 transition-opacity duration-300 group-hover:opacity-100">Shop Now!</span>
                      </div>
                      
                      {/* Simplified arrow with hover transition */}
                      <div className="ml-2 relative">
                        <div>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </span>
                    
                    {/* Static sparkles instead of animated ones */}
                    <div className="absolute inset-0 overflow-hidden hidden md:block">
                      <div 
                        className="absolute w-1.5 h-1.5 bg-white rounded-full"
                        style={{
                          top: "15%",
                          left: "10%",
                          filter: "blur(0.5px)",
                          boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.6)"
                        }}
                      />
                      <div 
                        className="absolute w-1.5 h-1.5 bg-white rounded-full"
                        style={{
                          top: "35%",
                          left: "85%",
                          filter: "blur(0.5px)",
                          boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.6)"
                        }}
                      />
                    </div>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-medium rounded-full px-8 border-primary/60 hover:border-primary overflow-hidden group shadow-md hover:shadow-lg"
                  onClick={() => navigate("/categories")}
                >
                  <motion.span 
                    className="absolute inset-0 w-0 h-full bg-primary/10 transition-all duration-500 group-hover:w-full"
                    initial={{ width: '0%' }}
                    whileHover={{ width: '100%' }}
                  ></motion.span>
                  <span className="relative z-10 group-hover:text-primary transition-colors duration-300 flex items-center">
                    <span>Explore Categories</span>
                    <motion.span
                      className="inline-block ml-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </motion.span>
                  </span>
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start space-x-4 md:space-x-8 pt-4">
              {['Products', 'Customers', 'Categories'].map((label, index) => (
                <div 
                  key={label}
                  className="flex flex-col items-center bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-primary/10 hover:shadow-md hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 opacity-0 group"
                  style={{
                    animation: `fadeIn 0.5s ease-out forwards ${1.2 + (index * 0.2)}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <span className="text-2xl font-bold text-primary group-hover:scale-110 transform transition-all duration-300">
                    {index === 0 ? '5K+' : index === 1 ? '10K+' : '15+'}
                  </span>
                  <span className="text-sm text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right content - Interactive product showcase */}
          <div className={`relative transition-all duration-1000 delay-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto border border-white/50 p-1.5 bg-white/30 backdrop-blur-sm mt-6 md:mt-0"
              whileHover={{ scale: 1.02, transition: { duration: 0.7 } }}
              whileTap={{ scale: 0.98 }}
              onMouseMove={handleMouseMove}
              onMouseEnter={activateSpotlight}
              onMouseLeave={deactivateSpotlight}
            >
              <div className="relative w-full h-full overflow-hidden">
                {heroImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Featured product ${index + 1}`} 
                    className={`absolute w-full h-full object-cover rounded-xl transition-opacity duration-700 ${heroImage === index ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
                
                {/* Image navigation indicators */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      className={`relative h-3 transition-all duration-300 rounded-full overflow-hidden ${heroImage === index ? 'w-12 bg-white/20' : 'w-3 bg-white/30'} group`}
                      onClick={() => {
                        setHeroImage(index);
                        setTimeLeft(5); // Reset timer on manual change
                      }}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      {/* Progress bar filling for active slide */}
                      {heroImage === index && (
                        <div 
                          className="absolute inset-0 bg-white transition-all duration-1000 ease-linear"
                          style={{ width: isPaused ? '100%' : `${(5 - timeLeft) * 20}%` }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Timer indicator */}
                <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-medium py-1 px-2 rounded-full flex items-center space-x-1.5">
                  <Clock className="h-3 w-3" />
                  <span>{timeLeft}s</span>
                </div>
              </div>
              
              {/* Interactive spotlight effect */}
              {spotlight.active && (
                <div 
                  className="absolute pointer-events-none w-[150px] h-[150px] rounded-full bg-white/10 backdrop-blur-sm mix-blend-overlay transition-all duration-75"
                  style={{
                    left: spotlight.x - 75,
                    top: spotlight.y - 75,
                    boxShadow: "0 0 40px 10px rgba(255, 255, 255, 0.3), 0 0 20px 5px rgba(255, 255, 255, 0.5) inset",
                    opacity: 0.7
                  }}
                />
              )}
              
              {/* Static floating elements for better performance */}
              <div 
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/40 rounded-full blur-2xl opacity-70"
              ></div>
              <div 
                className="absolute -top-6 -right-6 w-40 h-40 bg-primary/40 rounded-full blur-3xl opacity-70"
              ></div>
              
              {/* Static product hotspots with simple hover effects */}
              <div 
                className="absolute top-[20%] left-[30%] w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer z-20 group hover:scale-110 transition-transform duration-300"
                onClick={() => navigate('/shop?category=fashion')}
              >
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 whitespace-nowrap bg-white/95 backdrop-blur-sm text-primary text-xs font-medium py-1 px-2 rounded shadow-md border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 -translate-y-1/2 top-1/2">
                  Premium Fabric
                </div>
              </div>
              
              <div 
                className="absolute bottom-[30%] right-[20%] w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer z-20 group hover:scale-110 transition-transform duration-300"
                onClick={() => navigate('/shop?trending=true')}
              >
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                
                {/* Tooltip */}
                <div className="absolute right-full mr-2 whitespace-nowrap bg-white/95 backdrop-blur-sm text-accent text-xs font-medium py-1 px-2 rounded shadow-md border border-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 -translate-y-1/2 top-1/2">
                  Latest Design
                </div>
              </div>
              
              {/* Subtle Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 rounded-xl"></div>
            </motion.div>
            
            {/* Animated decorative shopping tags */}
            <motion.div 
              className="absolute -top-6 -right-6 bg-white rounded-lg p-3 shadow-lg z-10 hidden lg:block cursor-pointer"
              initial={{ opacity: 0, x: 20, y: 20, rotate: 12 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 12 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop?premium=true')}
            >
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-accent rounded-full shadow-[0_0_10px_rgba(236,72,153,0.7)]"></div>
                <span className="text-sm font-medium text-primary">Premium Quality</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-6 -left-6 bg-white rounded-lg p-3 shadow-lg z-10 hidden lg:block cursor-pointer"
              initial={{ opacity: 0, x: -20, y: -20, rotate: -12 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: -12 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop?free_shipping=true')}
            >
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-secondary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.7)]"></div>
                <span className="text-sm font-medium text-primary">Free Shipping</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      {scrollIndicator && (
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer z-10 animate-bounce-slow"
          onClick={scrollToProducts}
        >
          <span className="text-sm text-primary/70 font-medium mb-2">Scroll to discover</span>
          <ChevronDown className="h-6 w-6 text-primary/70" />
        </div>
      )}
    </div>
  );
}
