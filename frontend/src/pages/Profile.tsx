import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { useUserAuth, ShippingAddress } from "../utils/userAuthStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, signOut, deleteAddress, setDefaultAddress } = useUserAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in');
      return;
    }
    
    // Set initial values
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would update the user profile in the database
    toast.success("Profile updated successfully!");
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h1>
                  <p className="text-gray-600">Member since {currentUser ? new Date(currentUser.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                  />
                </div>
                
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
            
            {/* Tab Navigation */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex border-b border-gray-200 mb-6">
                <button 
                  className={`py-3 px-4 font-medium text-sm ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button 
                  className={`py-3 px-4 font-medium text-sm ${activeTab === 'addresses' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  Saved Addresses
                </button>
              </div>
              
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Your Shipping Addresses</h2>
                  
                  {currentUser?.savedAddresses && currentUser.savedAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentUser.savedAddresses.map((address) => (
                        <div key={address.id} className={`border rounded-md p-4 ${address.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{address.fullName}</h3>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.address}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                          
                          <div className="mt-3 flex justify-end space-x-2">
                            {!address.isDefault && (
                              <button
                                onClick={() => {
                                  setDefaultAddress(address.id);
                                  toast.success("Default address updated");
                                }}
                                className="text-xs text-primary hover:text-primary/80"
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              onClick={() => {
                                deleteAddress(address.id);
                                toast.success("Address removed");
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md">
                      <p className="text-gray-500">You don't have any saved addresses yet</p>
                      <p className="text-sm text-gray-400 mt-1">Addresses will be saved automatically when you place orders</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
              
              <div className="space-y-3">
                <button 
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  onClick={() => {
                    signOut();
                    navigate('/');
                    toast.success("You have been signed out");
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastProvider />
    </div>
  );
}