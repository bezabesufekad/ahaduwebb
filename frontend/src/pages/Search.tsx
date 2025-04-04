import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useProductsStore } from "../utils/productsStore";
import { ProductCard } from "../components/ProductCard";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    searchQuery, 
    setSearchQuery, 
    searchProducts, 
    searchResults 
  } = useProductsStore();
  
  // Initialize search query from URL parameters if present
  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      searchProducts();
    }
  }, [searchParams, setSearchQuery, searchProducts]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts();
    
    // Update URL with search query
    setSearchParams({ q: searchQuery });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Search Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find exactly what you're looking for</p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-grow px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary rounded-l-md shadow-sm"
            />
            <button 
              type="submit"
              className="flex items-center justify-center px-6 py-3 border border-transparent font-medium rounded-r-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>
        
        {searchQuery && (
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-6">Search Results for "{searchQuery}"</h2>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500 max-w-md mx-auto">We couldn't find any products matching your search. Try using different keywords or browse our categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    description={product.description}
                    colors={product.colors}
                    sizes={product.sizes}
                    shopName={product.shopName}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
