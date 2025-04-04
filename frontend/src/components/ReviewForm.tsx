import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, StarHalf } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useUserAuth } from "../utils/userAuthStore";
import { useOrderStore } from "utils/orderStore";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<{id: string, date: string}[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const { isAuthenticated, currentUser } = useUserAuth();
  const { orders, getUserOrders } = useOrderStore();
  // toast is imported directly from sonner
  
  useEffect(() => {
    // Only load orders if user is authenticated
    if (isAuthenticated && currentUser?.id) {
      getUserOrders(currentUser.id);
    }
  }, [isAuthenticated, currentUser]);
  
  useEffect(() => {
    // Find delivered orders that contain this product
    if (orders.length > 0) {
      const delivered = orders.filter(order => 
        order.status === "delivered" && 
        order.items.some(item => item.id === productId)
      );
      
      if (delivered.length > 0) {
        setEligibleOrders(delivered.map(order => ({
          id: order.id,
          date: new Date(order.createdAt).toLocaleDateString()
        })));
        setShowForm(true);
      }
    }
  }, [orders, productId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("You must be logged in to submit a review");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (comment.trim() === "") {
      toast.error("Please enter a review comment");
      return;
    }
    
    if (eligibleOrders.length > 0 && !selectedOrder) {
      toast.error("Please select which order this review is for");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await brain.create_review({
        productId,
        userId: currentUser?.id as string,
        rating,
        title: title.trim() || undefined,
        comment,
        orderId: selectedOrder
      });
      
      const data = await response.json();
      
      toast.success("Review submitted successfully", {
        description: "Thank you for your feedback!"
      });
      
      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setSelectedOrder("");
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", {
        description: "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!showForm) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Your Rating</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none"
              >
                <Star 
                  className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
            </span>
          </div>
        </div>
        
        {/* Select Order */}
        {eligibleOrders.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
              Select Your Order
            </label>
            <select
              id="order"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select an order</option>
              {eligibleOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order #{order.id} - {order.date}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Review Title (optional) */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Review Title (optional)
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
          />
        </div>
        
        {/* Review Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Your Review
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product"
            rows={4}
            required
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        
        <p className="text-xs text-gray-500 mt-2">
          Your review will help other customers make better purchase decisions. Thank you!
        </p>
      </form>
    </div>
  );
}
