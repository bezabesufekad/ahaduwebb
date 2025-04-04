import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">We'd love to hear from you</p>
        </div>
        
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <p className="text-xl text-gray-500">Contact page coming soon...</p>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
