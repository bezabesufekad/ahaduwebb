from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import databutton as db
import json
import re

# Initialize the router - no prefix needed, will be mounted at the root in main.py
router = APIRouter(tags=["direct-orders"])

# Define the response model
class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    image: str
    quantity: int
    category: str

class ShippingInfo(BaseModel):
    fullName: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str

class Order(BaseModel):
    id: str
    userId: Optional[str] = None
    items: List[OrderItem]
    totalAmount: float
    shippingInfo: ShippingInfo
    paymentMethod: str
    paymentProof: Optional[str] = None
    status: str
    createdAt: str
    updatedAt: Optional[str] = None
    notes: Optional[str] = None

class GetOrdersResponse(BaseModel):
    orders: List[Order]
    total: int
    
# Simple sanitize function
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Get orders for a specific user by email
@router.get("/direct-user-orders")
def get_direct_user_orders(email: str) -> GetOrdersResponse:
    """Get orders for a user directly, performing case-insensitive matching and using all available data"""
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    # Normalize email (lowercase)
    normalized_email = email.lower()
    print(f"Looking for orders with normalized email: {normalized_email}")
    
    # Load all orders directly
    try:
        # First try to load from database collection
        orders_json = db.storage.text.get(sanitize_storage_key("orders"), default="[]")
        all_orders = json.loads(orders_json)
        print(f"Loaded {len(all_orders)} orders from primary storage")
    except Exception as e:
        print(f"Error loading from primary storage: {str(e)}")
        all_orders = []
    
    # If primary storage failed or is empty, try additional sources
    if not all_orders:
        try:
            # Try to load from backup location
            orders_json = db.storage.text.get(sanitize_storage_key("orders_backup"), default="[]")
            all_orders = json.loads(orders_json)
            print(f"Loaded {len(all_orders)} orders from backup storage")
        except Exception as e:
            print(f"Error loading from backup storage: {str(e)}")
            all_orders = []
    
    # Filter orders for this user
    user_orders = []
    for order in all_orders:
        # Check if order has shippingInfo with email
        shipping_info = order.get("shippingInfo", {})
        order_email = shipping_info.get("email", "").lower() if shipping_info else ""
        
        # Also check direct email property if it exists
        if not order_email and "email" in order:
            order_email = order.get("email", "").lower()
        
        # Match by email (case-insensitive)
        if order_email and order_email == normalized_email:
            print(f"Found matching order: {order.get('id')}")
            user_orders.append(order)
        
    print(f"Found {len(user_orders)} orders for user {normalized_email}")
    
    # Return the filtered orders
    return GetOrdersResponse(
        orders=user_orders,
        total=len(user_orders)
    )
