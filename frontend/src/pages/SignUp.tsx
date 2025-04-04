import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { toast } from "sonner";
import { useUserAuth } from "../utils/userAuthStore";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated, isLoading, error, setError } = useUserAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
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
      if (error.includes("already exists")) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else if (error.includes("Registration failed")) {
        toast.error("Unable to create your account. Please try again later.");
      } else {
        toast.error(error);
      }
      setError(null);
    }
  }, [error, setError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detailed field-by-field validation with specific messages
    if (!firstName) {
      toast.error("First name is required");
      return;
    }
    
    if (!lastName) {
      toast.error("Last name is required");
      return;
    }
    
    if (!email) {
      toast.error("Email address is required");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!password) {
      toast.error("Password is required");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match. Please try again.");
      return;
    }
    
    if (!agreeToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    try {
      const fullName = `${firstName} ${lastName}`;
      await signUp(email, password, fullName);
      toast.success("Your account has been created successfully! Welcome to Ahadu Market.");
      navigate('/');
    } catch (error) {
      // Additional error handling for specific cases
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          toast.error("An account with this email already exists. Please sign in instead.");
        }
        // Other errors are handled by the store effect
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">Create an Account</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join Ahadu Market to start shopping, track orders, and more</p>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-8 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  id="first-name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  id="last-name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
              />
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters with at least one uppercase letter, number, and special character</p>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input 
                type="password" 
                id="confirm-password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a> and <a href="#" className="text-primary hover:text-primary/80">Privacy Policy</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                type="button" 
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325v21.351C0 23.407 0.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463 0.099 2.795 0.143v3.24l-1.918 0.001c-1.504 0-1.795 0.715-1.795 1.763v2.313h3.587l-0.467 3.622h-3.12V24h6.116c0.73 0 1.323-0.593 1.323-1.325V1.325C24 0.593 23.407 0 22.675 0z" />
                </svg>
                Facebook
              </button>
              <button 
                type="button" 
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/sign-in')} 
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </main>
      <Footer />
      <ToastProvider />
    </div>
  );
}