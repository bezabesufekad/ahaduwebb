import React from "react";
import { Card } from "../components/Card";
import { useNavigate } from "react-router-dom";

// Categories data
const categories = [
  {
    id: "1",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    itemCount: 324,
    color: "from-primary/70 to-primary/90"
  },
  {
    id: "2",
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    itemCount: 156,
    color: "from-secondary/70 to-secondary/90"
  },
  {
    id: "3",
    name: "Home & Garden",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    itemCount: 208,
    color: "from-accent/70 to-accent/90"
  },
  {
    id: "4",
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80",
    itemCount: 147,
    color: "from-primary/60 to-secondary/80"
  },
  {
    id: "5",
    name: "Sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    itemCount: 183,
    color: "from-secondary/60 to-accent/80"
  },
  {
    id: "6",
    name: "Toys & Kids",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    itemCount: 112,
    color: "from-accent/60 to-primary/80"
  },
  {
    id: "7",
    name: "Books & Media",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2090&q=80",
    itemCount: 219,
    color: "from-indigo-500/70 to-indigo-700/80"
  },
  {
    id: "8",
    name: "Food & Beverages",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    itemCount: 175,
    color: "from-red-500/70 to-red-700/80"
  },
  {
    id: "9",
    name: "Hand Made",
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    itemCount: 89,
    color: "from-amber-500/70 to-amber-700/80"
  },
  {
    id: "10",
    name: "Preorder",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    itemCount: 45,
    color: "from-violet-500/70 to-violet-700/80"
  },
  {
    id: "11",
    name: "Others",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc2NlbGxhbmVvdXMlMjBpdGVtc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    itemCount: 134,
    color: "from-gray-500/70 to-gray-700/80"
  }
];

export function CategorySection() {
  const navigate = useNavigate();
  
  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-gradient-to-b from-white to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614851099511-773084f6911d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-fixed opacity-5"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 animation-delay-200 animate-in fade-in duration-700">Shop by <span className="text-primary relative inline-block">
            Category
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary/60 rounded-full transform scale-x-0 transition-transform duration-500 animate-[growWidth_1.5s_ease-in-out_forwards_0.5s]"></span>
          </span></h2>
          <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto animation-delay-300 animate-in fade-in duration-700">
            Browse our wide range of products across popular categories
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className={`animation-delay-${(index + 1) * 100} animate-in fade-in slide-in-from-bottom-4 duration-700`}
            >
              <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl border-0 rounded-xl bg-white" onClick={() => navigate(`/shop?category=${category.name}`)}>
              
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-85 transition-opacity duration-300`}>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                        <h3 className="text-lg md:text-xl font-semibold mb-1 drop-shadow-sm">{category.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white/90 drop-shadow-sm">{category.itemCount} items</p>
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm group-hover:bg-white/30 transition-all duration-300">
                            Explore →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
        
        <div className="mt-10 md:mt-16 text-center">
          <button 
            onClick={() => navigate("/categories")} 
            className="bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/40 text-primary font-medium py-2 md:py-3 px-6 md:px-8 rounded-full inline-flex items-center space-x-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
          >
            <span>View All Categories</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
