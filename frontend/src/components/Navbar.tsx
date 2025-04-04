import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useCartStore } from "../utils/cartStore";
import { useProductsStore } from "../utils/productsStore";
import { useUserAuth, User } from "../utils/userAuthStore";
import { toast } from "sonner";
import { useFavoritesStore } from "../utils/favoritesStore";
import { Heart, Menu, X } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCartStore();
  const [cartCount, setCartCount] = useState(0);
  const { getFavoriteCount } = useFavoritesStore();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { setSearchQuery } = useProductsStore();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { currentUser, isAuthenticated, signOut } = useUserAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Update cart count when it changes
  useEffect(() => {
    setCartCount(getTotalItems());
    setFavoriteCount(getFavoriteCount());
    
    // Set up an interval to check for cart updates - less frequent
    const interval = setInterval(() => {
      setCartCount(getTotalItems());
      setFavoriteCount(getFavoriteCount());
    }, 3000); // Check every 3 seconds instead of every second
    
    return () => clearInterval(interval);
  }, [getTotalItems, getFavoriteCount]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery);
      navigate(`/search?q=${encodeURIComponent(localSearchQuery)}`);
      setShowSearch(false);
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src="https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/photo_2024-03-04_22-44-14-removebg-preview.png" 
                alt="Ahadu Market Logo" 
                className="h-8 sm:h-10 md:h-12" 
              />
              <span className="text-base sm:text-lg md:text-xl font-semibold text-primary">አሐዱ Market</span>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-300 shadow-sm border border-gray-200 relative overflow-hidden group"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <div className="relative z-10 transition-all duration-300 ease-in-out">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-primary animate-spin-once" />
                ) : (
                  <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                )}
              </div>
              <span className="absolute inset-0 bg-primary/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:space-x-1">
            <span 
              className={`inline-flex items-center px-3 pt-1 border-b-2 ${location.pathname === "/" ? "border-primary text-gray-900" : "border-transparent text-gray-600 hover:border-primary/50 hover:text-gray-900"} text-sm font-medium cursor-pointer transition-all duration-200`} 
              onClick={() => navigate("/")}>
              Home
            </span>
            <span 
              className={`inline-flex items-center px-3 pt-1 border-b-2 ${location.pathname === "/shop" ? "border-primary text-gray-900" : "border-transparent text-gray-600 hover:border-primary/50 hover:text-gray-900"} text-sm font-medium cursor-pointer transition-all duration-200`} 
              onClick={() => navigate("/shop")}>
              Shop
            </span>
            <span 
              className={`inline-flex items-center px-3 pt-1 border-b-2 ${location.pathname === "/categories" ? "border-primary text-gray-900" : "border-transparent text-gray-600 hover:border-primary/50 hover:text-gray-900"} text-sm font-medium cursor-pointer transition-all duration-200`} 
              onClick={() => navigate("/categories")}>
              Categories
            </span>
            <span 
              className={`inline-flex items-center px-3 pt-1 border-b-2 ${location.pathname === "/favorites" ? "border-primary text-gray-900" : "border-transparent text-gray-600 hover:border-primary/50 hover:text-gray-900"} text-sm font-medium cursor-pointer transition-all duration-200 relative`} 
              onClick={() => navigate("/favorites")}>
              Favorites
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-accent text-white text-xs rounded-full">
                  {favoriteCount}
                </span>
              )}
            </span>
            {isAuthenticated && currentUser?.email === "info@ahadumarket.store" && (
              <span 
                className={`inline-flex items-center px-3 pt-1 border-b-2 ${location.pathname.startsWith("/admin-panel") ? "border-primary text-gray-900" : "border-transparent text-gray-600 hover:border-primary/50 hover:text-gray-900"} text-sm font-medium cursor-pointer transition-all duration-200`} 
                onClick={() => navigate("/admin-panel")}>
                Admin
              </span>
            )}
            {isAuthenticated && currentUser?.role === "supplier" && (
              <span 
                className={`inline-flex items-center px-3 pt-1 border-b-2 ${location.pathname.startsWith("/supplier") ? "border-primary text-gray-900" : "border-transparent text-gray-600 hover:border-primary/50 hover:text-gray-900"} text-sm font-medium cursor-pointer transition-all duration-200`} 
                onClick={() => navigate("/supplier-dashboard")}>
                Dashboard
              </span>
            )}
          </div>

          {/* Collapsible search form */}
          {showSearch && (
            <div className="absolute left-0 right-0 top-full bg-white/95 shadow-md p-4 border-t border-gray-200 animate-slideDown md:w-1/2 md:mx-auto md:rounded-md md:mt-1 md:border md:top-[calc(100%-10px)]">
              <form onSubmit={handleSearchSubmit} className="flex w-full">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-grow px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary rounded-l-md shadow-sm transition-all duration-200"
                  autoFocus
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
          )}

          {/* Right side icons */}
          <div className="flex items-center">
            <div className="hidden md:flex space-x-2">
              <button 
                className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors duration-200 hidden md:block" 
                onClick={() => setShowSearch(!showSearch)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors duration-200 flex items-center"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-1">
                      {currentUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium">{currentUser?.name.split(' ')[0]}</span>
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-slideDown ring-1 ring-primary/10">
                      <a 
                        href="#" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-200"
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileMenu(false);
                        }}
                      >
                        Your Profile
                      </a>
                      {currentUser?.role === "admin" && (
                        <a 
                          href="#" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-200"
                          onClick={() => {
                            navigate('/admin-panel');
                            setShowProfileMenu(false);
                          }}
                        >
                          Admin Dashboard
                        </a>
                      )}
                      {currentUser?.role === "supplier" && (
                        <a 
                          href="#" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-200"
                          onClick={() => {
                            navigate('/supplier-dashboard');
                            setShowProfileMenu(false);
                          }}
                        >
                          Supplier Dashboard
                        </a>
                      )}
                      <button
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-200 w-full text-left"
                        onClick={() => {
                          navigate('/MyOrders');
                          setShowProfileMenu(false);
                        }}
                      >
                        My Orders
                      </button>
                      <a 
                        href="#" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors duration-200"
                        onClick={() => {
                          signOut();
                          setShowProfileMenu(false);
                          navigate('/');
                        }}
                      >
                        Sign Out
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors duration-200" onClick={() => navigate("/sign-in")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
              
              <button className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors duration-200 relative" onClick={() => {
                if (isAuthenticated) {
                  navigate("/cart");
                } else {
                  toast.error("Please sign in to view your cart");
                  navigate("/sign-in");
                }
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full animate-pulse">{cartCount}</span>
              </button>
            </div>
            {!isAuthenticated && (
              <div className="ml-4">
                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow" onClick={() => navigate("/sign-in")}>
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-40 bg-white shadow-lg border-t border-gray-100 overflow-hidden" ref={mobileMenuRef}>
          <div className="px-2 pt-2 pb-3 space-y-0 animate-fade-in-down">
            <a
              href="#"
              onClick={() => navigate('/')}
              className={`${location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
              style={{animationDelay: '0ms'}}
            >
              <span className="flex-1">Home</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="#"
              onClick={() => navigate('/shop')}
              className={`${location.pathname === '/shop' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
              style={{animationDelay: '50ms'}}
            >
              <span className="flex-1">Shop</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="#"
              onClick={() => navigate('/categories')}
              className={`${location.pathname === '/categories' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
              style={{animationDelay: '100ms'}}
            >
              <span className="flex-1">Categories</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="#"
              onClick={() => navigate('/favorites')}
              className={`${location.pathname === '/favorites' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right relative`}
              style={{animationDelay: '150ms'}}
            >
              <span className="flex-1">Favorites</span>
              {favoriteCount > 0 && (
                <span className="absolute top-2 right-10 flex items-center justify-center w-5 h-5 bg-accent text-white text-xs rounded-full animate-bounce-in">
                  {favoriteCount}
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            
            {isAuthenticated && (
              <a
                href="#"
                onClick={() => navigate('/cart')}
                className={`${location.pathname === '/cart' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right relative`}
                style={{animationDelay: '200ms'}}
              >
                <span className="flex-1">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-2 right-10 flex items-center justify-center w-5 h-5 bg-accent text-white text-xs rounded-full animate-bounce-in">
                    {cartCount}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            
            {isAuthenticated && (
              <>
                <a
                  href="#"
                  onClick={() => navigate('/profile')}
                  className={`${location.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
                  style={{animationDelay: '250ms'}}
                >
                  <span className="flex-1">Your Profile</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  onClick={() => navigate('/MyOrders')}
                  className={`${location.pathname === '/MyOrders' ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
                  style={{animationDelay: '300ms'}}
                >
                  <span className="flex-1">My Orders</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                {currentUser?.email === "info@ahadumarket.store" && (
                  <a
                    href="#"
                    onClick={() => navigate('/admin-panel')}
                    className={`${location.pathname.startsWith('/admin-panel') ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
                    style={{animationDelay: '350ms'}}
                  >
                    <span className="flex-1">Admin Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {currentUser?.role === "supplier" && (
                  <a
                    href="#"
                    onClick={() => navigate('/supplier-dashboard')}
                    className={`${location.pathname.startsWith('/supplier-dashboard') ? 'bg-primary/10 text-primary' : 'text-gray-700'} group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right`}
                    style={{animationDelay: '350ms'}}
                  >
                    <span className="flex-1">Supplier Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="w-full text-left text-gray-700 group flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-primary/5 hover:pl-4 mb-1 animate-slide-in-right"
                  style={{animationDelay: '400ms'}}
                >
                  <span className="flex-1">Sign Out</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V16a3 3 0 01-3 3H3a3 3 0 01-3-3V4a3 3 0 013-3h12a3 3 0 013 3v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V4a1 1 0 00-1-1H3z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M11.5 7a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5V7zM11.5 10a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="pt-2 pb-3 animate-fade-in-down" style={{animationDelay: '450ms'}}>
                <button
                  onClick={() => navigate('/sign-in')}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
                >
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// Add default export to resolve import errors
export default Navbar;
