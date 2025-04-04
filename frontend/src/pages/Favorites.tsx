import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useFavoritesStore } from "../utils/favoritesStore";
import { ToastProvider } from "../components/ToastProvider";
import { Heart, Trash2 } from "lucide-react";

export default function Favorites() {
  const navigate = useNavigate();
  const { getFavorites, removeFromFavorites } = useFavoritesStore();
  const favorites = getFavorites();
  
  // Refresh favorites on mount
  useEffect(() => {
    // This is just to trigger a re-render when the component mounts
    getFavorites();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-500">Products you've saved for later</p>
        </div>
        
        {/* Favorites list */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4 text-gray-400">
              <Heart className="mx-auto h-16 w-16 mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven't added any products to your favorites yet. Browse our products and click the heart icon to add them here.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Product image */}
                <div 
                  className="relative aspect-square overflow-hidden cursor-pointer" 
                  onClick={() => navigate(`/product?id=${product.id}`)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                
                {/* Product details */}
                <div className="p-4">
                  <h3 
                    className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer"
                    onClick={() => navigate(`/product?id=${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-accent font-medium">ETB {product.price.toFixed(2)}</p>
                    <button
                      onClick={() => removeFromFavorites(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Shop name */}
                  <p className="text-xs text-gray-500 mt-1">{product.shopName}</p>
                  
                  {/* Add to cart button */}
                  <button
                    onClick={() => navigate(`/product?id=${product.id}`)}
                    className="mt-3 w-full py-1.5 px-4 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
