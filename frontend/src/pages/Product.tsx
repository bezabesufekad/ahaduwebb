import React, { useState, useEffect } from "react";
import { ImageGallery } from "../components/ImageGallery";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useCartStore } from "../utils/cartStore";
import { toast } from "sonner";
import { ToastProvider } from "../components/ToastProvider";
import { useProductsStore } from "../utils/productsStore";
import { Store, Heart, Share2, ShoppingCart, ArrowRight, Package, Shield, Truck, RotateCcw, Award, Star, ChevronRight, Check, Info } from "lucide-react";
import { useFavoritesStore } from "../utils/favoritesStore";
import { shareProduct } from "../utils/shareUtils";
import { useUserAuth } from "../utils/userAuthStore";
import { ADMIN_EMAIL } from "../utils/constants";

// Get product data from central store
export default function Product() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { currentUser } = useUserAuth();
  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };
  
  // Handle share product
  const handleShare = () => {
    const productUrl = window.location.href;
    
    shareProduct({
      title: product.name,
      text: `Check out this product: ${product.name}`,
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
  const { addItem } = useCartStore();
  const { products } = useProductsStore();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore();
  
  // Get product ID from query parameters
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "1"; // Default to first product if no ID
  
  // Find the product based on the ID from the URL
  const product = products.find(p => p.id === id) || products[0]; // Fallback to first product if not found
  
  // Ensure we have supplier information for all products
  const supplierName = product.supplierName || product.shopName || "Ahadu Market";
  const shippingPrice = product.shippingPrice !== undefined ? product.shippingPrice : 0;
  
  // Create a formatted supplier display for product details
  const displaySupplierBadge = () => {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium gap-1 max-w-full overflow-hidden">
        <Store className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{supplierName}</span>
      </div>
    );
  };
  
  // Handle increasing/decreasing quantity
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // State for selected color and size
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : "");
  const [selectedSize, setSelectedSize] = useState(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
  
  // State for image gallery
  const [selectedImage, setSelectedImage] = useState(product.image);
  const allProductImages = [
    product.image,
    ...(product.additionalImages || [])
  ];
  
  useEffect(() => {
    // Set the first image as the selected image when product changes
    setSelectedImage(product.image);
  }, [product.image]);
  
  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <motion.main 
        className="flex-grow py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <button onClick={() => navigate('/Shop')} className="hover:text-primary">Shop</button>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <button onClick={() => navigate(`/Shop?category=${product.category}`)} className="hover:text-primary">{product.category}</button>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-700 font-medium">{product.name}</li>
          </ol>
        </nav>
        
        {/* Product details */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10 mb-8 sm:mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Product images */}
          <div>
            <ImageGallery 
              images={allProductImages} 
              productName={product.name} 
            />
          </div>
          
          {/* Product info */}
          <div>
            <div className="bg-white p-3 xs:p-4 sm:p-6 rounded-md shadow-sm mb-4">
              <h1 className="text-lg xs:text-xl font-semibold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                {displaySupplierBadge()}
                <span className="text-xs sm:text-sm text-muted-foreground">Category: {product.category}</span>
              </div>
              
              <div className="mb-4 bg-primary/5 p-3 rounded-md">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-accent text-white text-xs px-2 py-0.5 rounded">SALE</span>
                  <span className="text-accent font-semibold text-lg">ETB {product.price ? product.price.toFixed(2) : '0.00'}</span>
                  <span className="text-gray-400 text-xs line-through">ETB {product.price ? (product.price * 1.25).toFixed(2) : '0.00'}</span>
                  <span className="text-accent text-xs font-medium">-25%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-700">Sale ends in: </span>
                  <div className="flex space-x-1">
                    <span className="bg-gray-700 text-white text-xs px-1 rounded">12</span>
                    <span className="text-xs">:</span>
                    <span className="bg-gray-700 text-white text-xs px-1 rounded">45</span>
                    <span className="text-xs">:</span>
                    <span className="bg-gray-700 text-white text-xs px-1 rounded">30</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-3 rounded-md mb-4 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1H3V5a1 1 0 00-1-1H1V3a1 1 0 011-1h16a1 1 0 011 1v1h-8a1 1 0 00-1 1v7h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-8a1 1 0 00-1-1H3z" />
                </svg>
                <div>
                  <p className="text-xs text-primary font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">2-5 day delivery</p>
                </div>
              </div>
            </div>
              
            <div className="bg-white p-6 rounded-md shadow-sm mb-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-700">In stock and ready to ship</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Ships within 24 hours</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">30-day money-back guarantee</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Brand</span>
                        <span className="text-sm font-medium">{product.brand || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Material</span>
                        <span className="text-sm font-medium">{product.material || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Dimensions</span>
                        <span className="text-sm font-medium">{product.dimensions || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Weight</span>
                        <span className="text-sm font-medium">{product.weight || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Warranty</span>
                        <span className="text-sm font-medium">{product.warranty || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Supplier</span>
                        <span className="text-sm font-medium">{supplierName}</span>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Shipping Price</span>
                        <span className="text-sm font-medium">
                          {shippingPrice > 0 ? `ETB ${shippingPrice.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center">
                        <div className="text-yellow-400 mr-1">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">4.8 out of 5</span>
                        <span className="text-xs text-gray-500 ml-2">(Based on {product.reviews?.length || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key features section */}
            <div className="bg-white p-6 rounded-md shadow-sm mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features && product.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-sm text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className="bg-white p-6 rounded-md shadow-sm mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`relative w-12 h-12 rounded-md border overflow-hidden ${selectedColor === color ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-200'}`}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color} color`}
                    >
                      <span 
                        className="absolute inset-0" 
                        style={{ backgroundColor: color }}
                      />
                      {selectedColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Size options */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-white p-6 rounded-md shadow-sm mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${selectedSize === size 
                        ? 'bg-primary/10 text-primary border-primary' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity selector */}
            <div className="bg-white p-6 rounded-md shadow-sm mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quantity</h3>
              <div className="flex items-center">
                <button 
                  onClick={decreaseQuantity}
                  className="p-2 border border-gray-200 rounded-l-md bg-gray-50 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="py-2 px-4 w-14 text-center border-t border-b border-gray-200 text-sm">
                  {quantity}
                </div>
                <button 
                  onClick={increaseQuantity}
                  className="p-2 border border-gray-200 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <span className="ml-3 text-xs text-gray-500">{product.stock} available</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="bg-white p-6 rounded-md shadow-sm mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category
                      },
                      quantity
                    );
                    toast.success("Added to cart", {
                      description: `${quantity} ${quantity > 1 ? 'items' : 'item'} of ${product.name} added to your cart`,
                      position: "bottom-right",
                    });
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-md font-medium transition-colors relative overflow-hidden group"
                >
                  <motion.span 
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--primary) 100%)',
                        'linear-gradient(90deg, var(--primary) 100%, var(--secondary) 150%, var(--primary) 200%)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // First add to cart
                    addItem(
                      {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category
                      },
                      quantity
                    );
                    // Then navigate to checkout
                    navigate('/checkout');
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md font-medium transition-colors relative overflow-hidden group"
                >
                  <motion.span 
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        'linear-gradient(90deg, #f97316 0%, #fb923c 50%, #f97316 100%)',
                        'linear-gradient(90deg, #f97316 100%, #fb923c 150%, #f97316 200%)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Shop now
                  </span>
                </motion.button>
              </div>
              <div className="flex justify-center mt-4 space-x-6 text-sm text-gray-500">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavoriteToggle}
                  className={`flex items-center ${isFavorite(product.id) ? 'text-primary' : 'hover:text-primary'}`}
                >
                  <Heart className="h-5 w-5 mr-1" fill={isFavorite(product.id) ? "currentColor" : "none"} />
                  {isFavorite(product.id) ? 'Favorited' : 'Favorite'}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center hover:text-primary"
                >
                  <Share2 className="h-5 w-5 mr-1" />
                  Share
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center hover:text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Report
                </motion.button>
              </div>
            </div>
            
            {/* Product details tabs */}
            <div className="bg-white p-6 rounded-md shadow-sm mb-4">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-3 px-4 text-sm font-medium ${activeTab === "description" ? 'text-accent border-b-2 border-accent' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`pb-3 px-4 text-sm font-medium ${activeTab === "features" ? 'text-accent border-b-2 border-accent' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 px-4 text-sm font-medium ${activeTab === "specs" ? 'text-accent border-b-2 border-accent' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Specifications
                </button>
              </div>
              
              <div>
                {activeTab === "description" && (
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}
                
                {activeTab === "features" && (
                  <div>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                      {product.features?.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      )) || <li>No features available</li>}
                    </ul>
                  </div>
                )}
                
                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {Object.entries(product.specs || {}).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-3">
                        <p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                        <p className="font-medium text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Customer reviews section */}
        <motion.div 
          className="mb-8 bg-white rounded-md shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pl-2 border-l-4 border-primary">Customer Reviews</h2>
          
          {/* Reviews summary */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-gray-200 sm:pr-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(4.8) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500">{product.reviews?.length || 0} reviews</div>
            </div>
            
            <div className="flex-1">
              {/* Rating breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = product.reviews?.filter(r => r.rating === rating).length || 0;
                  const percentage = product.reviews?.length ? (count / product.reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <div className="w-10">{rating} star</div>
                      <div className="flex-1 mx-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-9 text-gray-500">{percentage.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Write review button */}
              <button className="mt-4 text-sm font-medium text-primary hover:text-primary/90 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </button>
            </div>
          </div>
          
          {/* Individual reviews */}
          <div className="space-y-4">
            {product.reviews?.map((review) => (
              <div key={review.id} className="pb-4 border-b border-gray-200 last:border-0">
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-sm text-gray-900">{review.user}</div>
                  <div className="text-xs text-gray-500">{review.date}</div>
                </div>
                
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-sm text-gray-700">{review.comment}</p>
                
                <div className="flex mt-3 space-x-4">
                  <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful (3)
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show more reviews button */}
          <div className="mt-6 text-center">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Show More Reviews
            </button>
          </div>
        </motion.div>
        
        {/* Related products */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pl-2 border-l-4 border-primary">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {product.related?.map(relatedId => {
              const relatedProduct = products.find(p => p.id === relatedId);
              if (!relatedProduct) return null;
              
              return (
                <div 
                  key={relatedId} 
                  className="bg-white rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product?id=${relatedId}`)}
                >
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs text-gray-700 line-clamp-2 mb-1">{relatedProduct.name}</h3>
                    <p className="text-sm font-semibold text-accent">ETB {relatedProduct.price ? relatedProduct.price.toFixed(2) : '0.00'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.main>
      <Footer />
      <ToastProvider />
    </motion.div>
  );
}