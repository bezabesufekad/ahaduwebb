from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import databutton as db
import json
import re

# Initialize router without prefix - will be mounted at root path
router = APIRouter(tags=["order-lookup"])

# Simple models for response
class OrderItem(BaseModel):
    id: str
    name: Optional[str] = None
    price: float
    quantity: int
    image: Optional[str] = None

class Order(BaseModel):
    id: str
    userId: Optional[str] = None
    items: List[OrderItem]
    totalAmount: float
    status: str
    createdAt: str
    email: Optional[str] = None
    paymentMethod: Optional[str] = None

class OrdersResponse(BaseModel):
    orders: List[Order]
    total: int

# Utility function to sanitize storage keys
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

@router.get("/lookup-orders")
def lookup_orders(email: str) -> OrdersResponse:
    """Get orders for a user by email - reliable direct DB access"""
    print(f"Looking up orders for: {email}")
    
    if not email:
        print("Error: Email parameter is empty")
        return OrdersResponse(orders=[], total=0)
    
    # Normalize the email for case-insensitive comparison
    normalized_email = email.lower().strip()
    print(f"Looking up orders with normalized email: {normalized_email}")
    
    all_orders = []
    
    try:
        # Try to load orders from primary storage
        orders_json = db.storage.text.get(sanitize_storage_key("orders"), default="[]")
        all_orders = json.loads(orders_json)
        print(f"Loaded {len(all_orders)} orders from primary storage")
    except Exception as e:
        print(f"Error loading from primary storage: {str(e)}")
        all_orders = []
    
    # Also try to load from backup locations if primary is empty
    if not all_orders:
        try:
            # Try backup location
            orders_json = db.storage.text.get(sanitize_storage_key("orders_backup"), default="[]")
            all_orders = json.loads(orders_json)
            print(f"Loaded {len(all_orders)} orders from backup storage")
        except Exception as e:
            print(f"Error loading from backup storage: {str(e)}")
    
    # Log all found orders for debugging
    print(f"Processing {len(all_orders)} total orders")
    
    # Filter orders for this user's email
    user_orders = []
    for order in all_orders:
        try:
            # Check for email in ALL possible locations with thorough logging
            # Direct email property
            order_email = order.get("email", "")
            if order_email:
                order_email = order_email.lower()
                print(f"Order has direct email: {order_email}")
            
            # ShippingInfo email if no direct email found
            if not order_email and "shippingInfo" in order:
                shipping_email = order.get("shippingInfo", {}).get("email", "")
                if shipping_email:
                    order_email = shipping_email.lower()
                    print(f"Order has shipping email: {order_email}")
            
            # Match case-insensitive email
            if order_email and order_email == normalized_email:
                print(f"Found matching order ID: {order.get('id')}")
                # Normalize the order structure to match our schema
                normalized_order = Order(
                    id=order.get("id", ""),
                    userId=order.get("userId"),
                    items=[OrderItem(
                        id=item.get("id"),
                        name=item.get("name", ""),
                        price=item.get("price", 0),
                        quantity=item.get("quantity", 1),
                        image=item.get("image", "")
                    ) for item in order.get("items", [])],
                    totalAmount=order.get("totalAmount", 0),
                    status=order.get("status", "processing"),
                    createdAt=order.get("createdAt", ""),
                    email=order_email,
                    paymentMethod=order.get("paymentMethod", "")
                )
                user_orders.append(normalized_order)
        except Exception as e:
            print(f"Error processing order {order.get('id', 'unknown')}: {str(e)}")
            # Continue processing other orders
            continue
    
    print(f"Found {len(user_orders)} orders for user {email}")
    
    # If no orders were found, log more specific information
    if len(user_orders) == 0:
        print(f"No orders found for {normalized_email} in primary or backup storage")
        print(f"Total number of orders checked: {len(all_orders)}")
        
        # Check if any orders exist for other email addresses
        all_emails = set()
        for order in all_orders:
            if "email" in order and order["email"]:
                all_emails.add(order["email"].lower())
            if "shippingInfo" in order and order["shippingInfo"] and "email" in order["shippingInfo"]:
                all_emails.add(order["shippingInfo"]["email"].lower())
                
        if all_emails:
            print(f"Orders exist for these emails: {', '.join(all_emails)}")
        else:
            print("No orders exist in the system for any email address")
    
    return OrdersResponse(orders=user_orders, total=len(user_orders))
