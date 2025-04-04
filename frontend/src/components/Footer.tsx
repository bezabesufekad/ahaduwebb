import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  
  // Handle scroll-based animations
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
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);
  
  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-white pt-10 md:pt-16 pb-8 md:pb-12">
      {/* Animated decorative elements */}
      <div 
        className="absolute -top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl transform transition-all duration-1000"
        style={{ 
          opacity: isVisible ? 0.3 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.8)'
        }}
      ></div>
      <div 
        className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl transform transition-all duration-1000"
        style={{ 
          opacity: isVisible ? 0.3 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.8)'
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div 
            className="col-span-1 transform transition-all duration-700"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
            }}
          >
            <div className="flex items-center space-x-2 mb-5 transform transition hover:scale-105 duration-300">
              <img 
                src="https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/photo_2024-03-04_22-44-14-removebg-preview.png" 
                alt="Ahadu Market Logo" 
                className="h-12 bg-white/80 rounded-lg p-1 transform transition-all duration-1000 hover:rotate-6" 
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'rotate(0deg)' : 'rotate(-180deg)'
                }}
              />
            </div>
            <p className="text-gray-300 text-xs sm:text-sm">
              Your one-stop destination for all your shopping needs. Quality products, excellent service, and fast delivery.
            </p>
            <div 
              className="mt-6 flex space-x-4 transition-all duration-1000"
              style={{ 
                opacity: isVisible ? 1 : 0,
                transitionDelay: '500ms'
              }}
            >
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/ahadumarket?igsh=MTIyNXhra2F6NGMzMg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:scale-110 flex items-center justify-center text-white transition-all duration-300"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              
              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@ahaduumarket?_t=ZM-8uwnsxLin2s&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black hover:scale-110 flex items-center justify-center text-white transition-all duration-300"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              
              {/* Telegram */}
              <a 
                href="https://t.me/ahaduumarket" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-500 hover:scale-110 flex items-center justify-center text-white transition-all duration-300"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div 
            className="col-span-1 transform transition-all duration-700"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '200ms'
            }}
          >
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Shop</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a onClick={() => navigate("/shop")} className="group flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-primary group-hover:scale-150 mr-2.5 transition-all"></span>
                  <span className="text-sm md:text-base group-hover:translate-x-1 transition-transform duration-300">All Products</span>
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/shop")} className="group flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary group-hover:scale-150 mr-2.5 transition-all"></span>
                  <span className="text-sm md:text-base group-hover:translate-x-1 transition-transform duration-300">New Arrivals</span>
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/shop")} className="group flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary group-hover:scale-150 mr-2.5 transition-all"></span>
                  <span className="text-sm md:text-base group-hover:translate-x-1 transition-transform duration-300">Featured</span>
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/shop")} className="group flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary group-hover:scale-150 mr-2.5 transition-all"></span>
                  <span className="text-sm md:text-base group-hover:translate-x-1 transition-transform duration-300">Discounts</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div 
            className="col-span-1 transform transition-all duration-700"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '300ms'
            }}
          >
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Company</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a onClick={() => navigate("/about")} className="group flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary mr-2.5 transition-colors"></span>
                  <span className="text-sm md:text-base">About Us</span>
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/contact")} className="group flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary mr-2.5 transition-colors"></span>
                  <span className="text-sm md:text-base">Contact</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center text-slate-300 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary mr-2.5 transition-colors"></span>
                  <span className="text-sm md:text-base">Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center text-slate-300 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-primary mr-2.5 transition-colors"></span>
                  <span className="text-sm md:text-base">Terms of Service</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div 
            className="col-span-1 transform transition-all duration-700"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '400ms'
            }}
          >
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Contact</h3>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start space-x-3">
                <div className="p-1.5 rounded-full bg-gray-700 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-300 text-xs sm:text-sm">Bole<br/>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-1.5 rounded-full bg-slate-800 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-slate-300 text-xs sm:text-sm">info@ahadumarket.store</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="p-1.5 rounded-full bg-slate-800 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-slate-300 text-xs sm:text-sm">09-40-40-50-38</span>
              </li>
            </ul>
            
            <div 
              className="mt-8 transition-all duration-1000"
              style={{ 
                opacity: isVisible ? 1 : 0,
                transitionDelay: '700ms'
              }}
            >
              <div className="text-white font-medium text-xs sm:text-sm mb-3">Subscribe to our newsletter</div>
              <div className="flex">
                <input type="email" placeholder="Your email" className="py-2 px-3 md:px-4 bg-gray-700 text-white w-full rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary text-xs md:text-sm" />
                <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-3 md:px-4 rounded-r-md transition-colors hover:scale-105 transform shadow-md text-xs md:text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className="mt-12 pt-8 border-t border-gray-700 text-center transform transition-all duration-1000"
          style={{ 
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '800ms'
          }}
        >
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Ahadu Market. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2 text-xs text-gray-500">
            <span 
              onClick={() => navigate("/admin-login")} 
              className="cursor-pointer hover:text-gray-300 transition-colors hover:underline"
            >
              Admin Login
            </span>
            <span className="text-gray-700">|</span>
            <span 
              onClick={() => navigate("/about")} 
              className="cursor-pointer hover:text-slate-300 transition-colors hover:underline"
            >
              About Us
            </span>
            <span className="text-slate-700">|</span>
            <span 
              onClick={() => navigate("/contact")} 
              className="cursor-pointer hover:text-slate-300 transition-colors hover:underline"
            >
              Contact
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
