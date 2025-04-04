import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { toast } from "sonner";
import { useUserAuth } from "../utils/userAuthStore";

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, isLoading, error, setError } = useUserAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Show error toast if there is an error
  useEffect(() => {
    if (error) {
      // Display more user-friendly messages based on error content
      if (error.includes("not registered")) {
        toast.error("This email is not registered. Please sign up first.");
      } else if (error.includes("Login failed") || error.includes("Invalid credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error);
      }
      setError(null);
    }
  }, [error, setError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      toast.error("Email field is required");
      return;
    }
    
    if (!password) {
      toast.error("Password field is required");
      return;
    }
    
    try {
      await signIn({ email, password });
      toast.success("Welcome back! You have signed in successfully.");
      navigate('/');
    } catch (error) {
      // Additional error handling for specific cases
      if (error instanceof Error) {
        if (error.message.includes("not registered")) {
          toast.error("This email is not registered. Please sign up first.");
        } else if (error.message.includes("Login failed")) {
          toast.error("Invalid email or password. Please try again.");
        }
        // Other errors are handled by the store effect
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Sign in to your <span className="text-accent font-medium">Ahadu Market</span> account</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" 
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" id="remember-me" name="remember-me" className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-accent hover:text-accent/80">Forgot your password?</a>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.08L19.95 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9554 21.095L16.0854 18.075C15.0054 18.785 13.6204 19.25 12.0004 19.25C8.8704 19.25 6.21537 17.14 5.2654 14.295L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
                </svg>
              </button>
              
              <button type="button" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325v21.351C0 23.407 0.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463 0.099 2.795 0.143v3.24l-1.918 0.001c-1.504 0-1.795 0.715-1.795 1.763v2.313h3.587l-0.467 3.622h-3.12V24h6.116c0.73 0 1.323-0.593 1.323-1.325V1.325C24 0.593 23.407 0 22.675 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? 
              <button 
                onClick={() => navigate('/sign-up')} 
                className="ml-1 font-medium text-accent hover:text-accent/80"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
