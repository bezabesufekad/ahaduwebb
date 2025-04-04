from fastapi import APIRouter, HTTPException, Path, Query, Body, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import databutton as db
import re
import statistics
from app.apis.database import generate_id, get_timestamp, products as products_db, users as users_db, orders as orders_db

# Initialize router
router = APIRouter()

# Create a reviews collection directly here since it's specific to this API
from app.apis.database import Collection
reviews = Collection('reviews')

# Models
class ReviewCreate(BaseModel):
    productId: str
    userId: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: str
    orderId: Optional[str] = None

class Review(BaseModel):
    id: str
    productId: str
    userId: str
    rating: int
    title: Optional[str] = None
    comment: str
    userName: str
    createdAt: str
    updatedAt: Optional[str] = None
    orderId: Optional[str] = None

class ReviewsResponse(BaseModel):
    reviews: List[Review]
    total: int
    averageRating: Optional[float] = None

class ReviewResponse(BaseModel):
    review: Review

# Endpoints
@router.post("/reviews", response_model=ReviewResponse)
def create_review(review_data: ReviewCreate) -> ReviewResponse:
    """Create a new review for a product"""
    # Verify product exists
    product = products_db.get_by_id(review_data.productId)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify user exists
    user = users_db.get_by_id(review_data.userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has already reviewed this product
    existing_reviews = reviews.query(lambda r: 
                                   r.get("productId") == review_data.productId and 
                                   r.get("userId") == review_data.userId)
    
    if existing_reviews:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    # If orderId is provided, verify order exists and is delivered
    if review_data.orderId:
        order = orders_db.get_by_id(review_data.orderId)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check if order is delivered
        if order.get("status") != "delivered":
            raise HTTPException(status_code=400, detail="Order must be delivered before you can review the product")
        
        # Check if order belongs to user
        if order.get("userId") != review_data.userId:
            raise HTTPException(status_code=403, detail="You can only review products from your own orders")
        
        # Check if product is in order
        product_in_order = False
        for item in order.get("items", []):
            if item.get("id") == review_data.productId:
                product_in_order = True
                break
        
        if not product_in_order:
            raise HTTPException(status_code=400, detail="You can only review products you've purchased")
    
    # Create review
    new_review = {
        "id": generate_id("rev"),
        "productId": review_data.productId,
        "userId": review_data.userId,
        "rating": review_data.rating,
        "title": review_data.title,
        "comment": review_data.comment,
        "userName": user.get("name", "Anonymous"),
        "createdAt": get_timestamp(),
        "updatedAt": get_timestamp(),
        "orderId": review_data.orderId
    }
    
    # Save review
    if not reviews.add(new_review):
        raise HTTPException(status_code=500, detail="Failed to save review")
    
    # Update product rating
    update_product_rating(review_data.productId)
    
    return ReviewResponse(review=Review.parse_obj(new_review))

@router.get("/reviews/product/{product_id}", response_model=ReviewsResponse)
def get_product_reviews(
    product_id: str = Path(..., description="The ID of the product to get reviews for"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
) -> ReviewsResponse:
    """Get all reviews for a product"""
    # Verify product exists
    product = products_db.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get reviews for product
    product_reviews = reviews.query(lambda r: r.get("productId") == product_id)
    
    # Sort by creation date (newest first)
    product_reviews.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Calculate pagination
    total = len(product_reviews)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated reviews
    paginated_reviews = product_reviews[start_idx:end_idx]
    
    # Calculate average rating
    average_rating = None
    if product_reviews:
        ratings = [r.get("rating", 0) for r in product_reviews]
        try:
            average_rating = round(statistics.mean(ratings), 1)
        except Exception:
            pass
    
    return ReviewsResponse(
        reviews=[Review.parse_obj(review) for review in paginated_reviews],
        total=total,
        averageRating=average_rating
    )

@router.get("/reviews/user/{user_id}", response_model=ReviewsResponse)
def get_user_reviews(
    user_id: str = Path(..., description="The ID of the user to get reviews for"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
) -> ReviewsResponse:
    """Get all reviews by a user"""
    # Verify user exists
    user = users_db.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get reviews by user
    user_reviews = reviews.query(lambda r: r.get("userId") == user_id)
    
    # Sort by creation date (newest first)
    user_reviews.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Calculate pagination
    total = len(user_reviews)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated reviews
    paginated_reviews = user_reviews[start_idx:end_idx]
    
    return ReviewsResponse(
        reviews=[Review.parse_obj(review) for review in paginated_reviews],
        total=total
    )

@router.delete("/reviews/{review_id}")
def delete_review(review_id: str) -> Dict[str, Any]:
    """Delete a review"""
    # Get the review
    review = reviews.get_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Save product ID before deletion
    product_id = review.get("productId")
    
    # Delete review
    if not reviews.delete(review_id):
        raise HTTPException(status_code=500, detail="Failed to delete review")
    
    # Update product rating
    if product_id:
        update_product_rating(product_id)
    
    return {"success": True, "message": "Review deleted successfully"}

# Helper function to update product rating
def update_product_rating(product_id: str) -> None:
    """Update product rating based on all reviews"""
    # Get all reviews for product
    product_reviews = reviews.query(lambda r: r.get("productId") == product_id)
    
    # Calculate average rating
    rating = 0
    if product_reviews:
        ratings = [r.get("rating", 0) for r in product_reviews]
        try:
            rating = round(statistics.mean(ratings), 1)
        except Exception:
            rating = 0
    
    # Update product
    try:
        products_db.update(product_id, {
            "rating": rating,
            "numReviews": len(product_reviews),
            "updatedAt": get_timestamp()
        })
    except Exception as e:
        print(f"Error updating product rating: {e}")
