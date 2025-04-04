import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ToastProvider } from "../components/ToastProvider";
import { useProductsStore, ProductFilters } from "../utils/productsStore";
import { ETHIOPIAN_CATEGORIES } from "../utils/constants";

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Get products from store
  const { products, refreshProducts, filterProducts, filteredProducts } = useProductsStore();
  
  // Parse URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);
  
  // Apply filters when they change
  useEffect(() => {
    const filters: ProductFilters = {};
    
    if (selectedCategory && selectedCategory !== "all") {
      filters.category = selectedCategory;
    }
    
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    // Apply filters
    filterProducts(filters);
  }, [selectedCategory, searchTerm, filterProducts]);
  
  // Refresh products when shop page loads
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">Shop All Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Browse our wide selection of high-quality products</p>
        </div>
        
        {/* Filter bar - mimicking AliExpress style */}
        <div className="bg-white p-3 rounded-md shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col w-full md:flex-row md:w-auto md:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select 
                className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  // Update URL without refreshing the page
                  const params = new URLSearchParams(location.search);
                  if (e.target.value === "") {
                    params.delete("category");
                  } else {
                    params.set("category", e.target.value);
                  }
                  navigate(`/shop?${params.toString()}`, { replace: true });
                }}
              >
                <option value="">All Categories</option>
                {ETHIOPIAN_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <button className="text-xs md:text-sm px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20">Free Shipping</button>
              <button className="text-xs md:text-sm px-3 py-1 rounded bg-gray-50 text-gray-500 border border-gray-200">On Sale</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden md:inline">View:</span>
            <button className="p-1.5 rounded border border-gray-200 bg-white text-gray-700 hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="p-1.5 rounded border border-primary bg-primary/10 text-primary hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            
            {/* Search input for mobile and desktop */}
            <div className="relative w-full md:w-auto ml-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Update URL without refreshing the page
                  const params = new URLSearchParams(location.search);
                  if (e.target.value === "") {
                    params.delete("search");
                  } else {
                    params.set("search", e.target.value);
                  }
                  navigate(`/shop?${params.toString()}`, { replace: true });
                }}
                className="w-full md:w-auto pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-base text-gray-500">
                {selectedCategory ? `No products found in the ${selectedCategory} category.` : "No products match your search criteria."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    // Clear all filters
                    setSelectedCategory("");
                    setSearchTerm("");
                    navigate("/shop", { replace: true });
                  }}
                  className="text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate("/categories")} 
            className="bg-white border border-primary/30 hover:bg-primary/5 hover:border-primary text-primary font-medium py-2.5 px-6 rounded-full inline-flex items-center space-x-2 transition-all duration-300 shadow-sm"
          >
            <span>Browse Categories</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
