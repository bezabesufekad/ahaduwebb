import React from "react";
import { ToastProvider } from "../components/ToastProvider";
import { toast } from "sonner";

export function OrderSuccessMessage({ orderId }: { orderId: string }) {
  // Extract order number from ID (after first dash or underscore)
  const orderNumber = orderId.split('-')[1] || orderId.split('_')[1] || orderId;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full text-center">
        <div className="mb-4 mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-4">Your order #{orderNumber} has been confirmed.</p>
        <p className="text-sm bg-blue-50 p-3 rounded-md mb-4">
          <strong>One of our customer care representatives will contact you within 24 hours</strong> to confirm your order details.
        </p>
        <button 
          onClick={() => window.location.href = `/order-confirmation?orderId=${orderId}`}
          className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md"
        >
          View Order Details
        </button>
      </div>
      <ToastProvider />
    </div>
  );
}
