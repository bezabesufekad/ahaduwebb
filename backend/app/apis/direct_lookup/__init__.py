from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import databutton as db
import json
import re

# Initialize router without prefix - will be mounted at root path
router = APIRouter(tags=["direct-lookup"])

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

@router.get("/direct-lookup-orders")
def direct_lookup_orders(email: str) -> OrdersResponse:
    """Get orders for a user by email - most direct DB access with exhaustive matching"""
    print(f"Direct lookup for orders with email: {email}")
    
    if not email:
        print("Error: Email parameter is empty")
        return OrdersResponse(orders=[], total=0)
    
    # Normalize the email for case-insensitive comparison
    normalized_email = email.lower().strip()
    print(f"Normalized email for lookup: {normalized_email}")
    
    # Load orders from all possible storage locations
    all_orders = []
    storage_keys = ["orders", "orders_backup", "all_orders", "user_orders"]
    
    # Try all possible storage locations
    for key in storage_keys:
        try:
            orders_json = db.storage.text.get(sanitize_storage_key(key), default="[]")
            orders_data = json.loads(orders_json)
            if isinstance(orders_data, list):
                all_orders.extend(orders_data)
                print(f"Loaded {len(orders_data)} orders from {key}")
            elif isinstance(orders_data, dict) and "orders" in orders_data:
                all_orders.extend(orders_data["orders"])
                print(f"Loaded {len(orders_data['orders'])} orders from {key}.orders")
        except Exception as e:
            print(f"Error loading from {key}: {str(e)}")
    
    print(f"Processing {len(all_orders)} total orders from all storage locations")
    
    # Direct debug check to see if we have orders matching this user
    emails_in_system = set()
    for order in all_orders:
        if "shippingInfo" in order and order["shippingInfo"] and "email" in order["shippingInfo"]:
            emails_in_system.add(order["shippingInfo"]["email"])
        if "email" in order:
            emails_in_system.add(order["email"])
    
    # Check if any emails in the system are similar to the provided email
    email_domain = normalized_email.split('@')[-1] if '@' in normalized_email else ''
    similar_emails = [e for e in emails_in_system if e.lower().strip() == normalized_email or 
                     (email_domain and e.lower().strip().endswith(email_domain))]
    
    print(f"System has orders with these emails: {', '.join(emails_in_system)}")
    if similar_emails:
        print(f"Found similar emails in the system: {', '.join(similar_emails)}")
    else:
        print(f"No similar emails found in the system for {normalized_email}")
    
    # Filter orders for this user's email with thorough checking
    user_orders = []
    for order in all_orders:
        try:
            # Skip orders without proper structure
            if not isinstance(order, dict):
                continue
                
            # Find email in all possible locations
            order_email = None
            
            # Try direct email property
            if "email" in order and order["email"]:
                order_email = str(order["email"]).lower().strip()
                
            # Try email in shippingInfo
            if not order_email and "shippingInfo" in order and order["shippingInfo"]:
                shipping_info = order["shippingInfo"]
                if isinstance(shipping_info, dict) and "email" in shipping_info and shipping_info["email"]:
                    order_email = str(shipping_info["email"]).lower().strip()
                    
            # Try other possible email locations that might exist
            if not order_email and "customer" in order and order["customer"]:
                customer = order["customer"]
                if isinstance(customer, dict) and "email" in customer and customer["email"]:
                    order_email = str(customer["email"]).lower().strip()
                    
            # Try user object if present
            if not order_email and "user" in order and order["user"]:
                user = order["user"]
                if isinstance(user, dict) and "email" in user and user["email"]:
                    order_email = str(user["email"]).lower().strip()
            
            # Check for match (case-insensitive)
            if order_email and order_email == normalized_email:
                print(f"Found matching order with ID: {order.get('id')}")
                
                # Build normalized order structure
                order_items = []
                for item in order.get("items", []):
                    if isinstance(item, dict):
                        order_items.append(OrderItem(
                            id=item.get("id", "unknown"),
                            name=item.get("name", ""),
                            price=float(item.get("price", 0)),
                            quantity=int(item.get("quantity", 1)),
                            image=item.get("image", "")
                        ))
                
                normalized_order = Order(
                    id=order.get("id", "unknown"),
                    userId=order.get("userId"),
                    items=order_items,
                    totalAmount=float(order.get("totalAmount", 0)),
                    status=order.get("status", "processing"),
                    createdAt=order.get("createdAt", ""),
                    email=order_email,
                    paymentMethod=order.get("paymentMethod", "")
                )
                
                user_orders.append(normalized_order)
        except Exception as e:
            order_id = order.get("id", "unknown") if isinstance(order, dict) else "invalid-order"
            print(f"Error processing order {order_id}: {str(e)}")
            continue
    
    print(f"Found {len(user_orders)} orders for user {normalized_email}")
    
    # If no orders were found, log more specific information
    if len(user_orders) == 0:
        print(f"No orders found for {normalized_email} after checking all possible storage locations")
        print(f"Checked storage keys: {storage_keys}")
        print(f"Total number of orders checked: {len(all_orders)}")
        if emails_in_system:
            print(f"Orders exist for these emails: {', '.join(emails_in_system)}")
        else:
            print("No orders exist in the system for any email address")
    
    return OrdersResponse(orders=user_orders, total=len(user_orders))
