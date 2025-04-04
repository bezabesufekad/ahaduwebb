import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/Button";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      setEmail("");
      // In a real app, we would submit this to a backend API
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    }
  };
  
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
      className="py-10 md:py-16 relative overflow-hidden bg-gradient-to-br from-primary/10 to-white"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2129&q=80')] bg-cover bg-fixed opacity-5"></div>
      
      {/* Animated Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div 
          className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all duration-1000 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="relative overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-secondary to-accent opacity-50 blur-sm animate-[spin_8s_linear_infinite]"></div>
            
            <div className="relative p-8 sm:p-10 md:p-12 bg-white/95">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center">
                {/* Left content */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
                      Join Our <span className="text-primary relative inline-block">
                        Newsletter
                        <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary/60 rounded-full transform scale-x-0 transition-transform duration-500 animate-[growWidth_1.5s_ease-in-out_forwards_0.5s]"></span>
                      </span>
                    </h2>
                    <p className="mt-4 text-gray-600 max-w-md text-sm md:text-base">
                      Subscribe to our newsletter and be the first to know about new product arrivals, special promotions, and exclusive offers.
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3 md:space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/20 text-primary animate-[pulse_3s_ease-in-out_infinite] mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm md:text-base">Weekly product updates</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full bg-secondary/20 text-secondary animate-[pulse_3s_ease-in-out_infinite_0.5s] mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm md:text-base">Exclusive deals and promotions</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full bg-accent/20 text-accent animate-[pulse_3s_ease-in-out_infinite_1s] mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm md:text-base">Early access to sales</span>
                    </div>
                  </div>
                </div>
                
                {/* Right content - Newsletter Form */}
                <div className="relative">
                  {/* Subscription form */}
                  <form 
                    onSubmit={handleSubmit}
                    className={`bg-white shadow-lg rounded-xl p-6 border border-primary/20 transition-all duration-300 ${isSubscribed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Subscribe Now</h3>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 px-4 rounded-md hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20"></span>
                        <span className="relative z-10 flex items-center">
                          Subscribe
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        We respect your privacy and will never share your information.
                      </p>
                    </div>
                  </form>
                  
                  {/* Success message */}
                  <div 
                    className={`absolute inset-0 bg-white shadow-lg rounded-xl p-6 border border-green-500 flex flex-col items-center justify-center transition-all duration-500 ${isSubscribed ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-[pulse_2s_ease-in-out_infinite]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-center text-gray-600 mb-4">
                      You've been successfully subscribed to our newsletter. Get ready for amazing offers!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-xl -mr-12 -mt-12 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-xl -ml-16 -mb-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
