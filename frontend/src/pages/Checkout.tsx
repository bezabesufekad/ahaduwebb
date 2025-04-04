import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useCartStore } from "../utils/cartStore";
import { useOrderStore, PaymentMethod, ShippingInfo } from "../utils/orderStore";
import { ToastProvider } from "../components/ToastProvider";
import { toast } from "sonner";
import { OrderSuccessMessage } from "../components/OrderSuccessMessage";
import { useUserAuth } from "../utils/userAuthStore";
import { APP_BASE_PATH } from "app";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, getSubtotalPrice, clearCart } = useCartStore();
  const { addOrder, saveShippingAddress } = useOrderStore();
  const { currentUser } = useUserAuth();
  
  // Check if cart is empty, redirect to cart page if it is
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);
  
  // Get saved addresses if any
  const [savedAddresses, setSavedAddresses] = useState<{id: string, label: string}[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>("");
  
  useEffect(() => {
    if (currentUser?.savedAddresses && currentUser.savedAddresses.length > 0) {
      // Format addresses for dropdown
      const addressOptions = currentUser.savedAddresses.map(addr => ({
        id: addr.id,
        label: `${addr.fullName}, ${addr.address}, ${addr.city}`
      }));
      
      setSavedAddresses(addressOptions);
      
      // Set default address if available
      const defaultAddress = currentUser.savedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedSavedAddress(defaultAddress.id);
        setShippingInfo({
          fullName: defaultAddress.fullName,
          email: defaultAddress.email,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
          country: defaultAddress.country
        });
      }
    }
  }, [currentUser]);
  
  // Handle saved address selection
  const handleSavedAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value;
    setSelectedSavedAddress(addressId);
    
    if (addressId && currentUser?.savedAddresses) {
      const selectedAddress = currentUser.savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setShippingInfo({
          fullName: selectedAddress.fullName,
          email: selectedAddress.email,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country
        });
      }
    }
  };
  
  // Shipping information
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ethiopia",
  });
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payment_on_delivery");
  
  // File upload for payment proof
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  
  // Validation states
  const [formErrors, setFormErrors] = useState<Partial<ShippingInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is being edited
    if (formErrors[name as keyof ShippingInfo]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ShippingInfo];
        return newErrors;
      });
    }
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Partial<ShippingInfo> = {};
    
    if (!shippingInfo.fullName) errors.fullName = "Full name is required";
    if (!shippingInfo.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) errors.email = "Email is invalid";
    if (!shippingInfo.phone) errors.phone = "Phone number is required";
    if (!shippingInfo.address) errors.address = "Address is required";
    if (!shippingInfo.city) errors.city = "City is required";
    
    // For bank transfer, payment proof is required
    if (paymentMethod === "bank_transfer" && !paymentProof) {
      toast.error("Please upload payment proof for bank transfer");
      return false;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Order success message state
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save shipping address for future use if user is authenticated
      if (currentUser) {
        saveShippingAddress(shippingInfo);
      }
      
      // Ensure we have shipping email
      if (!shippingInfo.email && currentUser?.email) {
        console.log('Adding missing email to shipping info', currentUser.email);
        shippingInfo.email = currentUser.email;
      }

      // Create new order
      const totalShipping = items.reduce((total, item) => total + ((item.shippingPrice || 0) * item.quantity), 0);
      const subtotal = getSubtotalPrice();
      const deliveryFee = paymentMethod === 'payment_on_delivery' ? 300 : 0;
      const totalAmount = subtotal + totalShipping + deliveryFee;
      
      const newOrder = await addOrder({
        items: [...items],
        totalAmount: totalAmount,
        shippingInfo,
        paymentMethod,
        paymentProof,
        status: "pending",
      });
      
      // Clear cart
      clearCart();
      
      // Show success toast
      toast.success(`Order placed successfully!`, {
        duration: 5000,
      });
      
      console.log("== ORDER CONFIRMATION: FORCING DIRECT REDIRECT ==");
      console.log("Order ID:", newOrder.id);
      
      // TRIPLE-REDUNDANT STORAGE: Store the order ID in multiple places
      // to ensure it's available in the confirmation page
      try {
        // Store in both sessionStorage and localStorage for maximum reliability
        sessionStorage.setItem('lastOrderId', newOrder.id);
        localStorage.setItem('lastOrderId', newOrder.id);
        console.log("Saved order ID to all storage methods:", newOrder.id);
      } catch (e) {
        console.error("Failed to save to storage", e);
      }
      
      // Log the order ID to confirm it's not undefined
      console.log("New order ID for redirect:", newOrder.id);
      
      // Ensure we have a valid order ID before redirecting
      if (!newOrder.id) {
        console.error("Missing order ID for redirect");
        toast.error("There was a problem with your order. Please contact customer support.");
        setIsSubmitting(false);
        return;
      }
      
      // Create the full absolute URL including origin and base path
      const confirmUrl = `${window.location.origin}${APP_BASE_PATH}/order-confirmation?orderId=${newOrder.id}`;
      console.log("Redirecting to absolute URL:", confirmUrl);
      
      // 3. Force hard navigation by setting window.location directly
      // Using this approach instead of React Router's navigate
      window.location.href = confirmUrl;
      
      // 4. Wait a moment and try again with replace as backup
      setTimeout(() => {
        try {
          console.log("Backup redirect attempt");
          window.location.replace(confirmUrl);
        } catch (err) {
          console.error("Backup redirect failed", err);
        }
      }, 200);
      
      return; // Stop further processing to avoid any React state updates interfering
      
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("There was an error placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Checkout</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Complete your purchase</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping and Payment Form */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="savedAddress" className="block mb-1 text-sm font-medium text-gray-700">
                    Use Saved Address
                  </label>
                  <select
                    id="savedAddress"
                    name="savedAddress"
                    value={selectedSavedAddress}
                    onChange={handleSavedAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">-- Select an address --</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Or fill in a new address below</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label htmlFor="fullName" className="block mb-1 text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
                      Street Address (የሚኖሩበት ሰፈር)
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary`}
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary`}
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="state" className="block mb-1 text-sm font-medium text-gray-700">
                      State/Province (eg. Saris, Bole...)
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block mb-1 text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Bank Transfer Option */}
                <div 
                  className={`border rounded-md p-4 cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handlePaymentMethodChange('bank_transfer')}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="paymentMethod"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => handlePaymentMethodChange('bank_transfer')}
                        className="h-4 w-4 text-primary"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="bank_transfer" className="block text-sm font-medium text-gray-700">
                        Bank Transfer
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Transfer the total amount to one of our bank accounts and upload the payment screenshot or receipt.
                      </p>
                    </div>
                  </div>
                  
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 pl-7">
                      <div className="rounded-md bg-gray-50 p-4 text-sm">
                        <h4 className="font-medium mb-2">Bank Account Details:</h4>
                        <p className="mb-1">Commercial Bank of Ethiopia (CBE)</p>
                        <p>Account Number: <span className="font-medium">1000717019042</span></p>
                        <p>Account Name: <span className="font-medium">Yohannis Aweke</span></p>
                        <div className="border-t border-gray-200 my-3"></div>
                        <p className="mb-1">Telebirr</p>
                        <p>Account Number: <span className="font-medium">0940405038</span></p>
                        <p>Account Name: <span className="font-medium">Helen Aklil</span></p>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Payment Proof
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {paymentProof ? (
                                <img src={paymentProof} alt="Payment proof" className="h-24 object-contain" />
                              ) : (
                                <>
                                  <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="mb-1 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 5MB)</p>
                                </>
                              )}
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/png, image/jpeg, application/pdf"
                              onChange={handleFileChange} 
                            />
                          </label>
                        </div>
                        {paymentFile && (
                          <p className="mt-2 text-xs text-gray-500">
                            {paymentFile.name} ({Math.round(paymentFile.size / 1024)} KB)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Payment on Delivery Option */}
                <div 
                  className={`border rounded-md p-4 cursor-pointer ${paymentMethod === 'payment_on_delivery' ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => handlePaymentMethodChange('payment_on_delivery')}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        id="payment_on_delivery"
                        name="paymentMethod"
                        checked={paymentMethod === 'payment_on_delivery'}
                        onChange={() => handlePaymentMethodChange('payment_on_delivery')}
                        className="h-4 w-4 text-primary"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="payment_on_delivery" className="block text-sm font-medium text-gray-700">
                        Payment on Delivery
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay cash when your order is delivered to your address. Additional 50.00 ETB delivery confirmation fee applies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-5 order-1 lg:order-2 mb-6 lg:mb-0">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="max-h-60 md:max-h-96 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex py-3 border-b border-gray-100 last:border-b-0">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <h3 className="line-clamp-1 w-32 sm:w-auto">{item.name}</h3>
                          <p className="ml-4 text-accent">ETB {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{item.category}</p>
                        {item.shippingPrice ? (
                          <p className="mt-1 text-xs text-gray-500">
                            Shipping: ETB {item.shippingPrice.toFixed(2)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-1 items-end justify-between text-xs">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 py-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-accent">ETB {getSubtotalPrice().toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Product Shipping</p>
                  <p className="font-medium text-accent">
                    {items.some(item => item.shippingPrice && item.shippingPrice > 0) ? 
                      `ETB ${items.reduce((total, item) => total + ((item.shippingPrice || 0) * item.quantity), 0).toFixed(2)}` : 
                      'Free'}
                  </p>
                </div>
                {paymentMethod === 'payment_on_delivery' && (
                  <div className="flex justify-between">
                    <p className="text-gray-600">Delivery Confirmation Fee</p>
                    <p className="font-medium text-accent">ETB 300.00</p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 my-4 pt-4">
                <div className="flex justify-between">
                  <p className="text-gray-900 font-medium">Total</p>
                  <p className="font-medium text-accent">
                    ETB {(getSubtotalPrice() + 
                         items.reduce((total, item) => total + ((item.shippingPrice || 0) * item.quantity), 0) + 
                         (paymentMethod === 'payment_on_delivery' ? 300 : 0)).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </button>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>By placing your order, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
