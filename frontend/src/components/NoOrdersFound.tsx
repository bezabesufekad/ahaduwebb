import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserAuth } from "../utils/userAuthStore";

interface Props {
  email: string;
  onContactSupport: () => void;
}

export function NoOrdersFound({ email, onContactSupport }: Props) {
  const navigate = useNavigate();
  const { currentUser } = useUserAuth();

  // Normalize email for display (handle undefined/null cases)
  const displayEmail = email || currentUser?.email || "your account";

  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Orders Found</h2>
      <p className="text-gray-500 mb-4 max-w-md mx-auto">
        We couldn't find any orders associated with <span className="font-semibold">{displayEmail}</span>.
      </p>
      <div className="space-y-4 mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-md mx-auto text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Have you recently placed an order?</strong> It might take a few minutes to appear in your order history.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 max-w-md mx-auto text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Check your email address:</strong> Make sure you're signed in with the same email you used when placing your order.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={() => navigate('/shop')} 
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow"
        >
          Browse Products
        </button>
        <button 
          onClick={() => {
            toast.info("Refreshing order history...", { 
              description: "We're checking all our systems for your orders."
            });
            window.location.reload();
          }} 
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button 
          onClick={onContactSupport} 
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Contact Support
        </button>
      </div>
    </div>
  );
}
