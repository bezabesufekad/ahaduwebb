import React, { useState, useEffect, useRef } from "react";

// Testimonial data structure
interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

// Sample testimonials data
const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Regular Customer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
    content: "I've been shopping at Ahadu Market for six months now, and I'm consistently impressed by the quality of their products and the exceptional customer service. The website is so easy to navigate and the checkout process is seamless!",
    rating: 5
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Tech Enthusiast",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
    content: "The electronics section at Ahadu Market is outstanding! I bought a wireless headphone set last month and the quality exceeded my expectations. The detailed product descriptions and customer reviews helped me make an informed decision.",
    rating: 4
  },
  {
    id: "3",
    name: "Aisha Mohamed",
    role: "Fashion Blogger",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    content: "As someone who's particular about style and quality, I can confidently say that Ahadu Market offers the best selection of fashion items. The clothes are trendy, affordable, and the shipping is always fast and reliable.",
    rating: 5
  }
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for initial
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Handle automatic testimonial cycling
  useEffect(() => {
    if (!autoplay || isPaused) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change testimonial every 5 seconds
    
    return () => clearInterval(interval);
  }, [autoplay, isPaused]);
  
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
  
  // Navigation handlers
  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
    
  return (
    <section 
      ref={sectionRef}
      className="py-16 relative overflow-hidden bg-gradient-to-b from-white to-white"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2129&q=80')] bg-cover bg-fixed opacity-5"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 
            className={`text-3xl font-bold tracking-tight text-gray-800 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Customer <span className="text-primary relative inline-block">
              Testimonials
              <span 
                className="absolute -bottom-1 left-0 w-full h-1 bg-primary/60 rounded-full transition-all duration-1000"
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}
              ></span>
            </span>
          </h2>
          <p 
            className={`mt-4 text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Hear what our satisfied customers have to say about their shopping experience
          </p>
        </div>
        
        {/* Testimonials carousel */}
        <div 
          className={`relative overflow-hidden transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-10 border border-primary/10 max-w-4xl mx-auto overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -inset-[10px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-xl blur-xl opacity-30"></div>
            </div>
            
            {/* Content container */}
            <div className="relative z-10">
              {/* Large quote mark */}
              <div className="absolute top-0 left-0 text-6xl text-primary/20 font-serif leading-none z-0">"</div>
              <div className="absolute bottom-0 right-4 text-6xl text-primary/20 font-serif leading-none z-0">"</div>
              
              {/* Testimonials */}
              <div 
                className="relative overflow-hidden h-[280px] sm:h-[220px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id}
                    className={`absolute inset-0 transition-all duration-500 flex flex-col items-center ${activeIndex === index ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-40 -z-10'}`}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* Avatar */}
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 p-1 bg-white shadow-md group-hover:border-primary transition-colors duration-300">
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="absolute -inset-1.5 border border-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Testimonial content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-1 justify-center md:justify-start mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 stroke-current'}`} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-700 text-center md:text-left italic mb-4 leading-relaxed">{testimonial.content}</p>
                        <div className="text-center md:text-left">
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Navigation arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-30 px-2">
                  <button
                    className="p-2 rounded-full bg-white/80 border border-primary/10 text-primary shadow-md hover:bg-primary/5 transition-all duration-300 hover:scale-110 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                      setAutoplay(false);
                      setTimeout(() => setAutoplay(true), 10000);
                    }}
                    aria-label="Previous testimonial"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    className="p-2 rounded-full bg-white/80 border border-primary/10 text-primary shadow-md hover:bg-primary/5 transition-all duration-300 hover:scale-110 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                      setAutoplay(false);
                      setTimeout(() => setAutoplay(true), 10000);
                    }}
                    aria-label="Next testimonial"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Navigation dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > activeIndex ? 1 : -1);
                    setActiveIndex(index);
                    setAutoplay(false);
                    // Resume autoplay after 10 seconds of inactivity
                    setTimeout(() => setAutoplay(true), 10000);
                  }}
                  className={`relative w-8 h-2 rounded-full transition-all duration-300 overflow-hidden hover:scale-110 ${activeIndex === index ? 'bg-primary scale-110' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  {activeIndex === index && (
                    <div 
                      className="absolute inset-0 bg-primary transition-transform duration-5000 origin-left"
                      style={{ 
                        transform: isPaused ? 'scaleX(0)' : 'scaleX(1)',
                        transitionTimingFunction: 'linear',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}