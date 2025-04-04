import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";

import { useEffect, useState } from "react";
import brain from "brain";
import { ETHIOPIAN_CATEGORIES } from "utils/constants";

// Category data with images
const categories = [
  {
    id: "1",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    count: 324,
    color: "from-blue-500/80 to-blue-700/80",
    description: "The latest gadgets and technology for work and play"
  },
  {
    id: "2",
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    count: 156,
    color: "from-pink-500/80 to-rose-700/80",
    description: "Stylish clothing, shoes, and accessories for every occasion"
  },
  {
    id: "3",
    name: "Home & Garden",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    count: 208,
    color: "from-green-500/80 to-emerald-700/80",
    description: "Beautiful furnishings and decor for indoor and outdoor spaces"
  },
  {
    id: "4",
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80",
    count: 147,
    color: "from-purple-500/80 to-violet-700/80",
    description: "Makeup, skincare, and personal care products for your wellbeing"
  },
  {
    id: "5",
    name: "Sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    count: 183,
    color: "from-orange-500/80 to-amber-700/80",
    description: "Equipment and apparel for all your favorite sports and activities"
  },
  {
    id: "6",
    name: "Toys & Kids",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    count: 112,
    color: "from-red-500/80 to-rose-700/80",
    description: "Fun and educational toys and products for children of all ages"
  },
  {
    id: "7",
    name: "Books & Media",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2098&q=80",
    count: 298,
    color: "from-sky-500/80 to-cyan-700/80",
    description: "Books, music, movies and more for entertainment and education"
  },
  {
    id: "8",
    name: "Food & Beverages",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
    count: 173,
    color: "from-lime-500/80 to-green-700/80",
    description: "Gourmet foods, snacks, and beverages from around the world"
  },
  {
    id: "9",
    name: "Hand Made",
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    count: 89,
    color: "from-amber-500/80 to-amber-700/80",
    description: "Unique handcrafted items made with care and creativity"
  },
  {
    id: "10",
    name: "Preorder",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    count: 45,
    color: "from-indigo-500/80 to-indigo-700/80",
    description: "Products available for preordering before they're officially released"
  },
  {
    id: "11",
    name: "Others",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc2NlbGxhbmVvdXMlMjBpdGVtc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    count: 134,
    color: "from-gray-500/80 to-gray-700/80",
    description: "Miscellaneous items that don't fit in other categories"
  }
];

export default function Categories() {
  const navigate = useNavigate();
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await brain.get_categories({});
        const data = await response.json();
        if (data && data.categories) {
          setApiCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setApiCategories(ETHIOPIAN_CATEGORIES);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Product Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Browse products by category</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="group cursor-pointer" 
              onClick={() => navigate(`/shop?category=${category.name}`)}
            >
              <div className="relative aspect-video overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                      <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-white/90 mb-3">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/90">{category.count} items</p>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                          Browse Products →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
