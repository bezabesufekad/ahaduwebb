import React, { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../utils/cartStore";
import { useUserAuth } from "../utils/userAuthStore";
import { toast } from "sonner";
import { ToastProvider } from "../components/ToastProvider";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, getSubtotalPrice, getTotalShipping, clearCart } = useCartStore();
  const { isAuthenticated, currentUser } = useUserAuth();
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view your cart");
      navigate('/sign-in');
    }
  }, [isAuthenticated, navigate]);
  
  // Update cart totals
  useEffect(() => {
    const subtotalAmount = getTotalPrice();
    setSubtotal(subtotalAmount);
    setTotal(subtotalAmount + shippingCost);
  }, [items, getTotalPrice, shippingCost]);
  
  // Check if cart is empty
  const emptyCart = items.length === 0;
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Your Shopping Cart</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Review your items and proceed to checkout</p>
        </div>
        
        {emptyCart ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg shadow-sm">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Browse our products and find something you'll love!</p>
            <button 
              onClick={() => navigate('/shop')} 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                    <table className="min-w-full divide-y divide-gray-300 md:table hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Remove</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900 hover:text-primary cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>{item.name}</div>
                                  <div className="text-gray-500">{item.category}</div>
                                  {item.shopName && (
                                    <div className="text-gray-500 text-xs mt-1">
                                      Seller: {item.shopName}
                                    </div>
                                  )}
                                  {item.supplierName && (
                                    <div className="text-gray-500 text-xs">
                                      Supplier: {item.supplierName}
                                    </div>
                                  )}
                                  {item.shippingPrice !== undefined && (
                                    <div className="text-gray-500 text-xs font-medium">
                                      {item.shippingPrice === 0 ? 'Free Shipping' : `Shipping: ETB ${item.shippingPrice.toFixed(2)}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="text-gray-900">ETB {item.price ? item.price.toFixed(2) : '0.00'}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="mx-2 w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="text-accent font-medium">ETB {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</div>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => {
                                  removeItem(item.id);
                                  toast.info(`${item.name} removed from cart`, { position: "bottom-right" });
                                }}
                                className="text-primary hover:text-primary/90"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Mobile Cart View */}
                    <div className="md:hidden divide-y divide-gray-200 bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {items.map((item) => (
                        <div key={item.id} className="p-4">
                          <div className="flex">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="font-medium text-gray-900 hover:text-primary cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                              <div className="flex justify-between mt-1">
                                <div className="text-gray-900 font-medium">ETB {item.price ? item.price.toFixed(2) : '0.00'}</div>
                                <button
                                  onClick={() => {
                                    removeItem(item.id);
                                    toast.info(`${item.name} removed from cart`, { position: "bottom-right" });
                                  }}
                                  className="text-primary hover:text-primary/90"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="mx-2 w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-accent font-medium">Total: ETB {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</div>
                          </div>
                          
                          {(item.shippingPrice !== undefined || item.shopName || item.supplierName) && (
                            <div className="mt-2 text-xs text-gray-500">
                              {item.shopName && <div>Seller: {item.shopName}</div>}
                              {item.supplierName && <div>Supplier: {item.supplierName}</div>}
                              {item.shippingPrice !== undefined && 
                                <div className="font-medium">
                                  {item.shippingPrice === 0 ? 'Free Shipping' : `Shipping: ETB ${item.shippingPrice.toFixed(2)}`}
                                </div>
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cart Summary */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <button
                    onClick={() => navigate('/Shop')}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </button>
                  
                  <button
                    onClick={() => {
                      clearCart();
                      toast.info("Cart cleared", { position: "bottom-right" });
                    }}
                    className="text-primary hover:text-primary/90 inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cart
                  </button>
                </div>
              </div>
              
              <div className="lg:col-span-5">
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                  
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium text-accent">ETB {getSubtotalPrice() ? getSubtotalPrice().toFixed(2) : '0.00'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-medium">
                          {getTotalShipping() > 0 
                            ? `ETB ${getTotalShipping().toFixed(2)}` 
                            : 'Free'}
                        </p>
                      </div>
                    </div>
                  
                  <div className="border-t border-gray-200 my-4 pt-4">
                    <div className="flex justify-between">
                      <p className="text-gray-900 font-medium">Total</p>
                      <p className="text-xl font-semibold text-accent">ETB {getTotalPrice() ? getTotalPrice().toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate('/Checkout')}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
