import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Product } from "./ProductCard";
import { useCartStore } from "../utils/cartStore";
import { useFavoritesStore } from "../utils/favoritesStore";
import { toast } from "sonner";
import { X, Heart, Minus, Plus, Share2 } from "lucide-react";
import { shareProduct } from "../utils/shareUtils";
import { cn } from "../utils/cn";
import { ReviewForm } from "./ReviewForm";
import { useUserAuth } from "../utils/userAuthStore";
import { useOrderStore } from "../utils/orderStore";

interface ProductQuickViewProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductQuickView({ product, children }: ProductQuickViewProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(product.image);
  const [open, setOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  
  const { addItem } = useCartStore();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore();
  const { isAuthenticated, currentUser } = useUserAuth();
  const { orders } = useOrderStore();
  
  // Function to check if user has purchased and received this product
  const getDeliverableProducts = async (userId: string): Promise<string[]> => {
    const deliveredOrders = orders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    );
    
    // Extract product IDs from delivered orders
    const productIds = deliveredOrders.flatMap(order => 
      order.items.map(item => item.id)
    );
    
    // Return unique product IDs
    return [...new Set(productIds)];
  };
  
  // Check if user can review this product (have they purchased and received it?)
  useEffect(() => {
    if (isAuthenticated && currentUser?.id && open) {
      // Only check when dialog is open to save API calls
      getDeliverableProducts(currentUser.id).then(productIds => {
        setCanReview(productIds.includes(product.id));
      });
    }
  }, [isAuthenticated, currentUser, open, product.id]);
  
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      shippingPrice: product.shippingPrice,
      supplierName: product.supplierName,
      shopName: product.shopName
    }, quantity);
    
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart`,
    });
    
    // Close dialog after adding to cart
    setOpen(false);
  };
  
  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + value));
    setQuantity(newQuantity);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(product);
      toast.success("Added to favorites");
    }
  };
  
  // Handle share product
  const handleShare = () => {
    const productUrl = `${window.location.origin}/product?id=${product.id}`;
    
    shareProduct({
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: productUrl,
    }).then((success) => {
      if (success) {
        toast.success("Product link copied!", {
          description: "Share the link with your friends",
        });
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white">
        <DialogTitle className="sr-only">{product.name} - Quick View</DialogTitle>
        <div className="relative grid md:grid-cols-2 gap-0">
          {/* Close button */}
          <button 
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Product image */}
          <div className="relative aspect-square bg-gray-50">
            <img 
              src={currentImage} 
              alt={product.name} 
              className="object-cover w-full h-full"
            />
            
            {/* Thumbnails */}
            {product.additionalImages && product.additionalImages.length > 0 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                <button
                  onClick={() => setCurrentImage(product.image)}
                  className={cn(
                    "h-16 w-16 rounded-md border-2 overflow-hidden",
                    currentImage === product.image ? "border-primary" : "border-white/80 hover:border-gray-300"
                  )}
                >
                  <img src={product.image} alt="thumbnail" className="h-full w-full object-cover" />
                </button>
                
                {product.additionalImages.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(img)}
                    className={cn(
                      "h-16 w-16 rounded-md border-2 overflow-hidden",
                      currentImage === img ? "border-primary" : "border-white/80 hover:border-gray-300"
                    )}
                  >
                    <img src={img} alt={`thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product details */}
          <div className="p-6 flex flex-col h-full overflow-y-auto max-h-[600px]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900 mr-2">ETB {product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through">ETB {(product.price * 1.2).toFixed(2)}</span>
                <span className="ml-2 text-sm font-medium text-green-600">Save 20%</span>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">
                {product.description || "No description available for this product."}
              </p>
            </div>
            
            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        selectedColor === color ? "ring-2 ring-primary ring-offset-1" : "ring-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Color: ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm border transition-all",
                        selectedSize === size 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quantity</h4>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="h-8 w-8 flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="h-8 px-4 flex items-center justify-center border-t border-b border-gray-300 bg-white">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="h-8 w-8 flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= 10}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="mt-auto">
              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </button>
                
                <button 
                  onClick={handleFavoriteToggle}
                  className={cn(
                    "p-3 rounded-md border transition-colors",
                    isFavorite(product.id) 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Heart className="h-5 w-5" fill={isFavorite(product.id) ? "currentColor" : "none"} />
                </button>
                
                <button 
                  onClick={handleShare}
                  className="p-3 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              {/* Stock and availability */}
              <div className="flex flex-col gap-2 mb-4">
                {/* Stock level indicator */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Availability:</span>
                    <span className={`text-sm font-medium ${(product.stock ?? 0) > 0 ? (product.stock ?? 0) > 10 ? 'text-green-600' : 'text-yellow-600' : 'text-red-600'}`}>
                      {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full ${(product.stock ?? 0) > 10 ? 'bg-green-500' : (product.stock ?? 0) > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, ((product.stock ?? 0) / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Sold count */}
                {(product.soldCount ?? 0) > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>{(product.soldCount ?? 0).toLocaleString()} sold</span>
                  </div>
                )}
              </div>
              
              {/* Shipping info */}
              <div className="flex flex-col text-sm text-gray-500 space-y-2 mt-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  {product.shippingPrice ? `Shipping: ETB ${product.shippingPrice.toFixed(2)}` : 'Free shipping on orders over ETB 5,000'}
                </div>
                
                {/* Supplier information - always show if available */}
                {product.supplierName && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Supplier: {product.supplierName}
                  </div>
                )}
                
                {/* Brand information - show if available */}
                {product.brand && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Brand: {product.brand}
                  </div>
                )}
                
                {/* Material information - show if available */}
                {product.material && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                    </svg>
                    Material: {product.material}
                  </div>
                )}
                
                {/* Dimensions information - show if available */}
                {product.dimensions && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                    Dimensions: {product.dimensions}
                  </div>
                )}
                
                {/* Weight information - show if available */}
                {product.weight && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    Weight: {product.weight}
                  </div>
                )}
                
                {/* Warranty information - show if available */}
                {product.warranty && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Warranty: {product.warranty}
                  </div>
                )}
              </div>
            </div>
            
            {/* Review section - only if user is logged in and has purchased this product */}
            {canReview && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Write a Review</h4>
                <ReviewForm productId={product.id} onReviewSubmitted={() => setOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
