import { useState, useEffect, useRef } from "react";
import { Award, Truck, Package, ShieldCheck, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function ProductBenefitsSection() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle scroll-based visibility
  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);
  
  // Benefits data
  const benefits = [
    {
      title: "Premium Quality",
      description: "Carefully selected products meeting our high standards for quality and craftsmanship",
      icon: <Award className="w-6 h-6" />,
      color: "bg-blue-50",
      textColor: "text-blue-600",
      animation: { delay: 0.1 }
    },
    {
      title: "Fast Delivery",
      description: "Quick and reliable shipping services to get your products to you as soon as possible",
      icon: <Truck className="w-6 h-6" />,
      color: "bg-green-50",
      textColor: "text-green-600",
      animation: { delay: 0.2 }
    },
    {
      title: "Secure Shopping",
      description: "Encrypted payments and secure transactions to protect your personal information",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "bg-purple-50",
      textColor: "text-purple-600",
      animation: { delay: 0.3 }
    },
    {
      title: "Customer Support",
      description: "Dedicated support team available to assist you with any questions or concerns",
      icon: <Users className="w-6 h-6" />,
      color: "bg-amber-50",
      textColor: "text-amber-600",
      animation: { delay: 0.4 }
    },
    {
      title: "Easy Returns",
      description: "Hassle-free 30-day return policy if you're not completely satisfied with your purchase",
      icon: <Package className="w-6 h-6" />,
      color: "bg-red-50",
      textColor: "text-red-600",
      animation: { delay: 0.5 }
    },
    {
      title: "24/7 Shopping",
      description: "Shop anytime, anywhere with our user-friendly online store that never closes",
      icon: <Clock className="w-6 h-6" />,
      color: "bg-teal-50",
      textColor: "text-teal-600",
      animation: { delay: 0.6 }
    }
  ];
  
  return (
    <section id="benefits" className="py-12 md:py-20 bg-gradient-to-b from-white via-white to-gray-50 overflow-hidden">
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Simple decorative elements */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/5 to-transparent opacity-20"></div>
        
        <div className={`text-center mb-16 relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Section heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            <span className="relative inline-block">
              Why Shop With <span className="text-primary">Ahadu Market</span>
              <span 
                className="absolute -bottom-1 left-0 h-1 bg-primary rounded-full transition-all duration-1000"
                style={{ width: isVisible ? '100%' : '0%' }}
              ></span>
            </span>
          </h2>
          <p className={`text-gray-600 max-w-2xl mx-auto mt-4 text-base md:text-lg px-4 md:px-0 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            Discover the advantages of shopping with us for all your needs
          </p>
        </div>
        
        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 mb-10 md:mb-16 relative z-10 px-4 md:px-0">
          {benefits.map((benefit, index) => {
            const delay = index * 100; // 100ms delay per item
            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-2"
                style={{
                  transitionDelay: isVisible ? `${delay}ms` : '0ms',
                  transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                  opacity: isVisible ? 1 : 0,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background color on hover */}
                <div 
                  className={`absolute inset-0 ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  style={{ transformOrigin: 'bottom', zIndex: 0 }}
                ></div>
                
                <div className="relative z-10">
                  <div 
                    className={`${benefit.color} ${benefit.textColor} p-4 rounded-full inline-flex items-center justify-center mb-5 group-hover:bg-white/40 transition-colors duration-300 shadow-md relative overflow-hidden group-hover:scale-110`}
                  >
                    {/* Shimmer effect on hover */}
                    {hoveredIndex === index && (
                      <div 
                        className="absolute inset-0 w-[20%] h-full bg-white/50 skew-x-[-45deg] animate-shimmer"
                      />
                    )}
                    {benefit.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">{benefit.title}</h3>
                  <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{benefit.description}</p>
                  
                  {/* Read more indicator that shows on hover */}
                  <div 
                    className="mt-4 text-primary font-medium flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-2"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
                
                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>
        
        {/* Call to action */}
        <div 
          className={`text-center relative z-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        >
          <button 
            onClick={() => navigate("/shop")}
            className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-3 md:py-4 px-8 md:px-10 rounded-full inline-flex items-center group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden hover:scale-105 active:scale-95"
          >
            {/* Button shimmer effect */}
            <span 
              className="absolute inset-0 w-[20%] h-full bg-white bg-opacity-30 skew-x-[-45deg] animate-shimmer"
            />

            {/* Button text and icon */}
            <span className="relative z-10 text-lg">
              Explore Our Products
            </span>
            <span className="ml-2 relative transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </span>
          </button>
          
          {/* Optional tagline */}
          <p className="mt-6 text-gray-500 transition-opacity duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}">
            Join thousands of satisfied customers shopping at Ahadu Market
          </p>
        </div>
      </div>
    </section>
  );
}