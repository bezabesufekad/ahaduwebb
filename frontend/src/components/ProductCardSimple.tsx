import React from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../utils/cartStore";
import { toast } from "sonner";
import { ShoppingCart, Store, TrendingUp } from "lucide-react";
import { getImageWithFallback } from "../utils/imageUtils";

export interface SimpleProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  supplierName?: string;
  soldCount?: number;
  originalPrice?: number;
  discountPercent?: number;
}

/**
 * A lightweight product card for product listings 
 * Designed for better performance in grid views
 */
export function ProductCardSimple({ 
  id, 
  name, 
  price, 
  image, 
  category,
  supplierName,
  soldCount = 0,
  originalPrice,
  discountPercent
}: SimpleProductProps) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  // Use provided discount percent or calculate a default one
  const actualDiscountPercent = discountPercent || 
    (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 15);
  
  // Use provided original price or calculate from current price and discount
  const actualOriginalPrice = originalPrice || 
    parseFloat((price * (100 / (100 - actualDiscountPercent))).toFixed(2));
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    addItem({ 
      id, 
      name, 
      price, 
      image, 
      category
    }, 1);
    
    toast.success("Added to cart", {
      description: `${name} has been added to your cart`,
      position: "bottom-right",
    });
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full relative max-w-xs w-full mx-auto group"
      onClick={() => navigate(`/product?id=${id}`)}
    >
      {/* Product Image with optimized loading */}
      <div className="relative w-full h-32 xs:h-40 sm:h-48 overflow-hidden bg-gray-50">
        {/* Status badges */}
        <div className="absolute top-0 left-0 right-0 flex justify-between p-2 z-10">
          <div className="flex gap-2">
            {/* Category Badge */}
            {category && (
              <div className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full truncate max-w-[130px] sm:max-w-full shadow-sm">
                {category}
              </div>
            )}
          </div>
          
          {/* Discount Badge */}
          <div className="flex items-center bg-accent text-white text-xs px-2 py-1 rounded-full shadow-md">
            <span className="font-bold">{actualDiscountPercent}%</span>
            <span className="ml-1">OFF</span>
          </div>
        </div>
        
        <img
          src={getImageWithFallback(image, name)}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          loading="eager"
          fetchpriority="high"
        />
        
        {/* Quick Add Button - Enhanced with animation */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 bg-primary text-white p-1.5 xs:p-2 rounded-full shadow-md hover:bg-primary/90 transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-3 w-3 xs:h-4 xs:w-4" />
        </button>
      </div>
      
      {/* Product Info */}
      <div className="p-2 xs:p-3 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="font-medium text-xs xs:text-sm text-gray-800 line-clamp-2 min-h-[32px] xs:min-h-[40px] mb-2 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        
        {/* Supplier Name */}
        {supplierName && (
          <span className="text-2xs text-gray-500 mb-2 line-clamp-1 flex items-center">
            <Store className="h-3 w-3 mr-1 text-gray-400" />
            {supplierName}
          </span>
        )}
        
        {/* Price with discount */}
        <div className="mt-auto flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-accent text-xs xs:text-sm font-bold">
              ETB {price.toFixed(2)}
            </span>
            <span className="text-2xs xs:text-xs text-gray-500 line-through">
              ETB {actualOriginalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center text-2xs font-medium text-green-600">
            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
            <span>{soldCount > 0 ? soldCount : '-'} sold</span>
          </div>
        </div>
      </div>
    </div>
  );
}