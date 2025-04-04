import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../utils/cartStore";
import { toast } from "sonner";
import { Store, Heart, Share2, Eye, Calendar, Package, Award, TrendingUp } from "lucide-react";
import { useFavoritesStore } from "../utils/favoritesStore";
import { shareProduct } from "../utils/shareUtils";
import { ProductQuickView } from "./ProductQuickView";


export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  additionalImages?: string[];
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
  shopName?: string;
  supplierName?: string;
  shippingPrice?: number;
  stock?: number;
  soldCount?: number;
  lowStockThreshold?: number;
  lastRestocked?: string;
  featured?: boolean;
  originalPrice?: number;
  discountPercent?: number;
  // Additional supplier details
  brand?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  warranty?: string;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  category, 
  description, 
  colors = [], 
  sizes = [], 
  additionalImages = [], 
  shopName, 
  supplierName, 
  shippingPrice, 
  stock = 0, 
  soldCount = 0,
  lowStockThreshold = 5,
  lastRestocked,
  featured = false,
  originalPrice: providedOriginalPrice,
  discountPercent: providedDiscountPercent,
  // New supplier properties
  brand,
  material,
  dimensions,
  weight,
  warranty
}: Product) {
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(image);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore();
  
  // Lightweight state without expensive animations
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isNew] = useState(Math.random() > 0.7); // Random "new" badge for demo

  const handleMouseEnter = () => {
    // Only enable hover animations on non-mobile devices
    if (window.innerWidth > 768) {
      setIsHovered(true);
    }
  };
  const handleMouseLeave = () => setIsHovered(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ 
      id, 
      name, 
      price, 
      image, 
      category,
      shippingPrice,
      supplierName,
      shopName 
    }, quantity);
    
    toast.success("Added to cart", {
      description: `${name} has been added to your cart`,
      position: "bottom-right",
    });
  };

  // Calculate discount price (mock 10-25% discount)
  const discountPercent = providedDiscountPercent || Math.floor(Math.random() * 16) + 10; // 10-25%
  const originalPrice = providedOriginalPrice || price ? parseFloat((price * (100 / (100 - discountPercent))).toFixed(2)) : 0;
  
  // Format shipping fee display
  const shippingFee = shippingPrice ? `ETB ${shippingPrice.toFixed(2)} Shipping` : "Free Shipping";

  // Handle share product
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const productUrl = `${window.location.origin}/product?id=${id}`;
    
    shareProduct({
      title: name,
      text: `Check out this product: ${name}`,
      url: productUrl,
    }).then((success) => {
      if (success) {
        toast.success("Product link copied!", {
          description: "Share the link with your friends",
          position: "bottom-right",
        });
      }
    });
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const product = {
      id,
      name,
      price,
      image,
      category,
      description: description || "",
      shopName
    };
    
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(product);
    }
  };
  
  // Format last restocked date
  const formattedRestockDate = lastRestocked 
    ? new Date(lastRestocked).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : null;

  return (
    <motion.div 
      ref={cardRef}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 hover:border-primary/30 transition-all duration-300 group cursor-pointer flex flex-col h-full relative max-w-xs mx-auto w-full"
      onClick={() => navigate(`/product?id=${id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isHovered ? 1.03 : 1,
      }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 15,
      }}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        {/* Status badges */}
        <div className="absolute top-0 left-0 right-0 flex justify-between p-2 z-10">
          <div className="flex gap-2">
            {featured && (
              <div className="flex items-center bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-md animate-pulse">
                <Award className="w-3 h-3 mr-1" />
                <span>Featured</span>
              </div>
            )}
            
            {Math.random() > 0.3 && (
              <div className="flex items-center bg-accent text-white text-xs px-2 py-1 rounded-full shadow-md">
                <span className="font-bold">{discountPercent}%</span>
                <span className="ml-1">OFF</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleFavoriteToggle}
              className={`p-1.5 rounded-full ${isFavorite(id) ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:text-primary'} shadow-md transition-all duration-300 hover:scale-110`}
              aria-label={isFavorite(id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className="w-3.5 h-3.5" fill={isFavorite(id) ? "currentColor" : "none"} />
            </button>
            
            <button 
              onClick={handleShare}
              className="p-1.5 bg-white text-gray-500 hover:text-primary rounded-full shadow-md transition-all duration-300 hover:scale-110"
              aria-label="Share product"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {/* Main Image */}
        <img
          ref={imageRef}
          src={currentImage || 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg'}
          alt={name}
          className={`w-full h-44 xs:h-48 sm:h-56 md:h-64 object-cover object-center transition-all duration-300 ease-out ${isHovered ? 'scale-105' : ''}`}
          key={currentImage || 'placeholder'} // Key ensures image change triggers animation
          onError={(e) => {
            // Replace broken images with placeholder
            (e.target as HTMLImageElement).src = 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg';
          }}
        />
        
        {/* Simplified New badge */}
        {isNew && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full shadow-md z-20">
            <span className="font-bold">NEW</span>
          </div>
        )}
        
        {/* Image selection strip */}
        {additionalImages && additionalImages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-1 bg-gradient-to-t from-black/50 to-transparent z-10">
            <button 
              className={`w-8 h-8 rounded-md overflow-hidden border-2 hover:scale-110 transition-all duration-300 ${currentImage === image ? 'border-white ring-1 ring-white' : 'border-white/50'}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImage(image);
              }}
            >
              <img 
                  src={image || 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg'} 
                  alt="main" 
                  className="w-full h-full object-cover cursor-pointer" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg';
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImage(image);
                  }}
                />
            </button>
            
            {additionalImages.slice(0, 4).map((img, index) => (
              <button 
                key={index}
                className={`w-8 h-8 rounded-md overflow-hidden border-2 hover:scale-110 transition-all duration-300 ${currentImage === img ? 'border-white ring-1 ring-white' : 'border-white/50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage(img);
                }}
              >
                <img 
                  src={img || 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg'} 
                  alt={`preview ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg';
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImage(img);
                  }}
                />
              </button>
            ))}
            
            {additionalImages.length > 4 && (
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-black/70 text-white text-xs font-medium border-2 border-white/50">
                +{additionalImages.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Product Info Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Top Info Row - Category and Shop */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-1">
          <div className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full truncate max-w-[130px] sm:max-w-full">
            {category}
          </div>
          <div className="flex items-center text-xs text-gray-500 truncate max-w-[120px] sm:max-w-full">
            <Store className="h-3 w-3 mr-1" />
            <span>{shopName}</span>
          </div>
        </div>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{name}</h3>
        
        {/* Description - if available */}
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Price and Sold Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline">
            <span className="text-accent text-xl font-bold mr-2">
              ETB {price.toFixed(2)}
            </span>
            <span className="text-gray-400 text-xs line-through">ETB {originalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
            <span>{soldCount.toLocaleString()} sold</span>
          </div>
        </div>
        
        {/* Stock Information */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium">Stock Status:</span>
            <span className={`font-bold ${stock > lowStockThreshold ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stock > lowStockThreshold 
                ? `In Stock (${stock})` 
                : stock > 0 
                  ? `Low Stock (${stock})` 
                  : "Out of Stock"}
            </span>
          </div>
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full rounded-full ${stock > lowStockThreshold ? 'bg-green-500' : stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (stock / 100) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Additional Information Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-3 text-sm">
          {/* Shipping Info */}
          <div className="flex items-start">
            <Package className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-700">Shipping</div>
              <div className="text-xs text-gray-600">{shippingFee}</div>
            </div>
          </div>
          
          {/* Restock Info - If available */}
          {formattedRestockDate && (
            <div className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">Last Restock</div>
                <div className="text-xs text-gray-600">{formattedRestockDate}</div>
              </div>
            </div>
          )}
          
          {/* Supplier Info - always show if available */}
          {supplierName && (
            <div className="flex items-start">
              <Store className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">Supplier</div>
                <div className="text-xs text-gray-600">{supplierName}</div>
              </div>
            </div>
          )}
          
          {/* Brand Info - if available */}
          {brand && (
            <div className="flex items-start">
              <Award className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">Brand</div>
                <div className="text-xs text-gray-600">{brand}</div>
              </div>
            </div>
          )}
          
          {/* Material Info - if available */}
          {material && (
            <div className="flex items-start">
              <div className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex items-center justify-center">
                <span className="text-xs font-bold">M</span>
              </div>
              <div>
                <div className="font-medium text-gray-700">Material</div>
                <div className="text-xs text-gray-600">{material}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Options Section - Colors & Sizes */}
        <div className="flex flex-wrap gap-2 xs:gap-3 mb-4">
          {/* Colors */}
          {colors.length > 0 && (
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-700 mb-1">Colors:</div>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-primary ring-1 ring-primary' : 'border-gray-200'} hover:scale-125 transition-all duration-300`}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-700 mb-1">Sizes:</div>
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-2 py-1 text-xs rounded ${selectedSize === size ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all duration-300`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 pt-0 mt-auto">
        <div className="grid grid-cols-2 gap-2">
          <button 
            className="h-8 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md relative overflow-hidden"
            onClick={handleAddToCart}
          >
            <div className="flex items-center justify-center relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </div>
          </button>
          
          <ProductQuickView 
            product={{ 
              id, 
              name, 
              price, 
              image, 
              additionalImages, 
              category, 
              description, 
              colors, 
              sizes, 
              shopName,
              supplierName,
              shippingPrice,
              stock,
              soldCount,
              lowStockThreshold,
              lastRestocked,
              featured
            }}
          >
            <button 
              className="h-8 bg-white text-primary border border-primary rounded-lg text-xs font-medium hover:bg-primary/5 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Inner white background */}
              <span className="absolute inset-0.5 bg-white rounded-lg"></span>
              
              <div className="flex items-center justify-center relative z-10">
                <Eye className="h-3 w-3 mr-1" />
                Quick View
              </div>
            </button>
          </ProductQuickView>
        </div>
      </div>
    </motion.div>
  );
}