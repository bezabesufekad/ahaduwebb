import React, { useEffect, useRef, useState } from "react";

// Mock data for testimonials
const testimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    content: "Ahadu Market has completely transformed my shopping experience. The quality of products and attention to detail is unmatched.",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    rating: 5
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Tech Lover",
    content: "I've purchased several electronics from Ahadu Market and I'm consistently impressed with the quality and the exceptional customer service.",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    rating: 5
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Home Decorator",
    content: "The home decor selection at Ahadu Market is simply stunning. I've found unique pieces that have transformed my living space.",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 5
  }
];

export function TestimonialSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
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
    <section ref={sectionRef} className="py-20 relative overflow-hidden bg-card/30">
      {/* Background Pattern with parallax effect */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560732488-7b5f5269661f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-fixed opacity-5 transform transition-transform duration-1000" 
           style={{ transform: isVisible ? 'scale(1.05)' : 'scale(1)' }}></div>
      
      {/* Animated decorative elements */}
      <div className="absolute -top-20 left-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 overflow-hidden">
          <span 
            className={`inline-block px-4 py-1 rounded-full bg-primary/10 text-primary-foreground text-sm font-medium mb-4 transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
          >
            Customer Reviews
          </span>
          <h2 
            className={`text-3xl font-bold tracking-tight transform transition-all duration-700 delay-[200ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
          >
            What Our <span className="text-primary relative inline-block">
              Customers
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary/30 rounded-full transform scale-x-0 transition-transform duration-700 delay-[600ms]"
                style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></span>
            </span> Say
          </h2>
          <p 
            className={`mt-4 text-lg text-gray-600 max-w-2xl mx-auto transform transition-all duration-700 delay-[400ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
          >
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary/10 hover:shadow-xl hover:border-primary/20 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ 
                transitionDelay: `${400 + (index * 200)}ms`,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'
              }}
            >
              <div className="relative">
                <div 
                  className="absolute -left-5 -top-5 text-6xl text-primary/10 font-serif transform transition-all duration-700"
                  style={{ 
                    transitionDelay: `${600 + (index * 200)}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scale(1)' : 'scale(0.5)'
                  }}
                >
                  ❝
                </div>
                <p 
                  className="text-gray-600 relative z-10 mb-6 italic transform transition-all duration-700"
                  style={{ 
                    transitionDelay: `${700 + (index * 200)}ms`,
                    opacity: isVisible ? 1 : 0
                  }}
                >
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="mt-6 flex items-center">
                <div 
                  className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/20 p-0.5 transform transition-all duration-700 hover:ring-primary hover:scale-110"
                  style={{ 
                    transitionDelay: `${900 + (index * 200)}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'rotate(0deg)' : 'rotate(-90deg)'
                  }}
                >
                  <img 
                    className="h-full w-full rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                </div>
                <div 
                  className="ml-4 transform transition-all duration-700"
                  style={{ 
                    transitionDelay: `${1000 + (index * 200)}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(20px)'
                  }}
                >
                  <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                </div>
              </div>
              
              <div 
                className="mt-4 flex text-accent transition-all duration-700"
                style={{ 
                  transitionDelay: `${1100 + (index * 200)}ms`,
                  opacity: isVisible ? 1 : 0
                }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg 
                    key={i} 
                    className="h-5 w-5 transform transition-all" 
                    style={{ 
                      transitionDelay: `${1200 + (i * 100)}ms`,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0.5)'
                    }}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div 
          className="mt-16 text-center transform transition-all duration-1000"
          style={{ 
            transitionDelay: '1300ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
          }}
        >
          <button className="bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/40 text-primary font-medium py-3 px-8 rounded-full inline-flex items-center space-x-2 transition-all duration-300 shadow-md hover:shadow-lg group relative overflow-hidden">
            <span className="absolute inset-0 w-0 h-full bg-primary/10 transition-all duration-300 group-hover:w-full"></span>
            <span className="relative z-10 flex items-center">
              <span>View All Reviews</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
