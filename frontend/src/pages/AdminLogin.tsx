import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { toast } from "sonner";
import { useUserAuth } from "../utils/userAuthStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, currentUser } = useUserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin credentials - In a real app, this would be handled by a proper authentication system
  const ADMIN_EMAIL = "info@ahadumarket.store";
  const ADMIN_PASSWORD = "admin123";
  
  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser?.email === ADMIN_EMAIL) {
      navigate("/admin");
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simple admin authentication check
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin login - use the regular user auth system but check admin status in protected routes
        await signIn({
          id: "admin-user",
          name: "Admin User",
          email: ADMIN_EMAIL,
          createdAt: Date.now()
        });
        
        toast.success("Admin login successful");
        navigate("/admin");
      } else {
        toast.error("Invalid admin credentials");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img 
              src="https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/photo_2024-03-04_22-44-14-removebg-preview.png" 
              alt="Ahadu Market Logo" 
              className="h-16 mx-auto" 
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your credentials to access the admin dashboard
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}
