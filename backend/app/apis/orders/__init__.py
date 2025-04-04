from fastapi import APIRouter, HTTPException, Path, Query, Body, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import databutton as db
from datetime import datetime
from app.apis.database import orders as orders_db, users as users_db, products as products_db, generate_id, get_timestamp
from app.apis.telegram import send_telegram_message, format_order_notification, notify_new_order

# Initialize the router
router = APIRouter()

# Function to update sold count for products based on orders
def update_product_sold_counts(order_id: str) -> None:
    """Update product sold counts when an order is delivered"""
    try:
        # Get the order
        order = orders_db.get_by_id(order_id)
        if not order:
            print(f"Order {order_id} not found for sold count update")
            return
            
        # Only update sold counts for delivered or completed orders
        if order.get('status') not in ['delivered', 'completed']:
            return
            
        # Get the items from the order
        order_items = order.get('items', [])
        
        # Process each product in the order
        for item in order_items:
            product_id = item.get('id')
            quantity = item.get('quantity', 0)
            
            if not product_id or quantity <= 0:
                continue
                
            try:
                # Get the product
                product = products_db.get_by_id(product_id)
                if not product:
                    print(f"Product {product_id} not found for sold count update")
                    continue
                    
                # Update the sold count
                current_sold = product.get('soldCount', 0)
                product['soldCount'] = current_sold + quantity
                product['updatedAt'] = get_timestamp()
                
                # Save the updated product
                products_db.update(product_id, {
                    'soldCount': current_sold + quantity,
                    'updatedAt': get_timestamp()
                })
                print(f"Updated sold count for product {product_id} to {product['soldCount']}")
                
            except Exception as e:
                print(f"Error updating sold count for product {product_id}: {str(e)}")
    
    except Exception as e:
        print(f"Error in update_product_sold_counts: {str(e)}")

# Function to notify suppliers about orders containing their products
def notify_suppliers_about_order(order: Dict[str, Any]) -> None:
    """Notify suppliers when products in their inventory are ordered"""
    try:
        from app.apis.database import products as products_db
        
        # Get order items
        order_items = order.get('items', [])
        if not order_items:
            return
            
        # Group items by supplier
        supplier_items = {}
        
        # Process each item in the order
        for item in order_items:
            product_id = item.get('id')
            if not product_id:
                continue
                
            # Get full product details to find supplier
            product = products_db.get_by_id(product_id)
            if not product:
                continue
                
            # If product has a supplier ID, add to that supplier's items
            supplier_id = product.get('supplierId')
            if supplier_id:
                if supplier_id not in supplier_items:
                    supplier_items[supplier_id] = {
                        'items': [],
                        'total': 0.0
                    }
                
                # Add item to supplier's list
                item_price = float(item.get('price', 0))
                item_quantity = int(item.get('quantity', 0))
                item_total = item_price * item_quantity
                
                supplier_items[supplier_id]['items'].append({
                    'id': product_id,
                    'name': item.get('name', product.get('name', 'Unknown Product')),
                    'price': item_price,
                    'quantity': item_quantity,
                    'total': item_total
                })
                
                supplier_items[supplier_id]['total'] += item_total
        
        # Notify each supplier about their products being ordered
        for supplier_id, data in supplier_items.items():
            # Get supplier details
            supplier = users_db.get_by_id(supplier_id)
            if not supplier:
                continue
                
            # Format notification message for telegram (for demonstration)
            supplier_name = supplier.get('name', 'Unknown Supplier')
            supplier_email = supplier.get('email', 'no-email')
            
            items_text = "\n".join([f"- {item['name']} x {item['quantity']} @ ETB {item['price']} = ETB {item['total']}" 
                               for item in data['items']])
            
            message = f"""🔔 NEW ORDER FOR SUPPLIER: {supplier_name}

Order ID: {order['id']}
Customer: {order['shippingInfo'].get('fullName', 'Unknown Customer')}
Order Items:\n{items_text}

Supplier Subtotal: ETB {data['total']:.2f}

Please check your supplier dashboard for more details."""
            
            # Send notification via Telegram (as a demonstration)
            send_telegram_message(message)
            
    except Exception as e:
        print(f"Error in notify_suppliers_about_order: {str(e)}")
# Define data models
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
    status: str  # pending, processing, shipped, delivered, cancelled
    createdAt: str
    updatedAt: Optional[str] = None
    notes: Optional[str] = None

class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    totalAmount: float
    shippingInfo: ShippingInfo
    paymentMethod: str
    paymentProof: Optional[str] = None
    userId: Optional[str] = None

class CreateOrderResponse(BaseModel):
    order: Order
    message: str = "Order created successfully"

class GetOrderResponse(BaseModel):
    order: Order

class GetOrdersResponse(BaseModel):
    orders: List[Order]
    total: int

class OrderStatus(BaseModel):
    status: str

class UpdateOrderStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None

class UpdateOrderStatusResponse(BaseModel):
    order: Order
    message: str

class OrderSummary(BaseModel):
    total: int
    pending: int
    processing: int
    shipped: int
    delivered: int
    cancelled: int

# Helper function to validate request with user verification
def get_user_by_email_or_id(user_email: Optional[str] = None, user_id: Optional[str] = None):
    """Verify user exists and return user data"""
    user = None
    
    if user_email:
        user = users_db.get_by_email(user_email.lower())
    elif user_id:
        user = users_db.get_by_id(user_id)
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

# Define the summary endpoint first to avoid it being masked by dynamic routes
@router.get("/orders/summary", response_model=OrderSummary)
def get_order_summary() -> OrderSummary:
    """Get a summary of orders by status"""
    all_orders = orders_db.get_all()
    
    # Count by status
    pending_count = len([o for o in all_orders if o.get("status") == "pending"])
    processing_count = len([o for o in all_orders if o.get("status") == "processing"])
    shipped_count = len([o for o in all_orders if o.get("status") == "shipped"])
    delivered_count = len([o for o in all_orders if o.get("status") == "delivered"])
    cancelled_count = len([o for o in all_orders if o.get("status") == "cancelled"])
    
    return OrderSummary(
        total=len(all_orders),
        pending=pending_count,
        processing=processing_count,
        shipped=shipped_count,
        delivered=delivered_count,
        cancelled=cancelled_count
    )# Endpoints
@router.post("/orders/create", response_model=CreateOrderResponse)
def create_order(order: CreateOrderRequest) -> CreateOrderResponse:
    """Create a new order"""
    # If user ID is provided, verify user exists
    user_id = order.userId
    if not user_id and order.shippingInfo.email:
        # Try to find user by email
        user = users_db.get_by_email(order.shippingInfo.email.lower())
        if user:
            user_id = user["id"]
    
    # Create new order ID with better readability
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    order_id = f"ord-{timestamp}"
    
    # Create order
    new_order = {
        "id": order_id,
        "userId": user_id,
        "items": [item.dict() for item in order.items],
        "totalAmount": order.totalAmount,
        "shippingInfo": order.shippingInfo.dict(),
        "paymentMethod": order.paymentMethod,
        "paymentProof": order.paymentProof,
        "status": "pending",
        "createdAt": get_timestamp(),
        "updatedAt": get_timestamp(),
        "notes": ""
    }
    
    # Save to database
    if not orders_db.add(new_order):
        raise HTTPException(status_code=500, detail="Failed to save order")
    
    # Send Telegram notification to admin
    try:
        telegram_result = notify_new_order(new_order)
        if not telegram_result["success"]:
            print(f"Failed to send Telegram notification: {telegram_result['message']}")
    except Exception as e:
        print(f"Error sending Telegram notification: {str(e)}")
    
    # Notify suppliers about products in their order
    try:
        notify_suppliers_about_order(new_order)
    except Exception as e:
        print(f"Error notifying suppliers: {str(e)}")
    
    return CreateOrderResponse(
        order=Order.parse_obj(new_order)
    )

# Endpoints
@router.get("/orders/all", response_model=GetOrdersResponse)
def get_all_orders(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
) -> GetOrdersResponse:
    """Get all orders with optional filtering and pagination"""
    # Get all orders
    all_orders = orders_db.get_all()
    
    # Filter by status if provided
    if status:
        all_orders = [order for order in all_orders if order.get("status") == status]
    
    # Sort by creation date (newest first)
    all_orders.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Calculate pagination
    total = len(all_orders)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated orders
    paginated_orders = all_orders[start_idx:end_idx]
    
    return GetOrdersResponse(
        orders=[Order.parse_obj(order) for order in paginated_orders],
        total=total
    )

@router.get("/orders/user", response_model=GetOrdersResponse)
def get_user_orders(
    email: Optional[str] = Query(None, description="Email of the user to get orders for"),
    user_id: Optional[str] = Query(None, description="ID of the user to get orders for"),
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
) -> GetOrdersResponse:
    """Get all orders for a specific user"""
    if not email and not user_id:
        raise HTTPException(status_code=400, detail="Either email or user_id must be provided")
    
    # Get all orders
    all_orders = []
    
    if email:
        all_orders = orders_db.get_by_email(email.lower())
    elif user_id:
        all_orders = orders_db.get_by_user_id(user_id)
    
    # Filter by status if provided
    if status:
        all_orders = [order for order in all_orders if order.get("status") == status]
    
    # Sort by creation date (newest first)
    all_orders.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Calculate pagination
    total = len(all_orders)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated orders
    paginated_orders = all_orders[start_idx:end_idx]
    
    return GetOrdersResponse(
        orders=[Order.parse_obj(order) for order in paginated_orders],
        total=total
    )

@router.get("/orders/{order_id}", response_model=GetOrderResponse)
def get_order(order_id: str = Path(..., description="The ID of the order to retrieve")) -> GetOrderResponse:
    """Get a specific order by ID"""
    order = orders_db.get_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return GetOrderResponse(order=Order.parse_obj(order))

@router.put("/orders/{order_id}/status", response_model=UpdateOrderStatusResponse)
def update_order_status(
    order_id: str, 
    update_data: UpdateOrderStatusRequest
) -> UpdateOrderStatusResponse:
    """Update the status of an order"""
    # Validate status
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if update_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    # Get the order
    order = orders_db.get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order
    updates = {
        "status": update_data.status,
        "updatedAt": get_timestamp()
    }
    
    # Add notes if provided
    if update_data.notes:
        updates["notes"] = update_data.notes
        
    # Update order status in database
    if not orders_db.update(order_id, updates):
        raise HTTPException(status_code=500, detail="Failed to update order status")
    
    # If status is delivered or completed, update product sold counts
    if update_data.status in ["delivered", "completed"]:
        update_product_sold_counts(order_id)
        
    # Send notification about status update
    try:
        from app.apis.notification import send_order_status_update
        send_order_status_update(order_id, update_data.status)
    except Exception as e:
        print(f"Error sending order status notification: {str(e)}")
    
    if not orders_db.update(order_id, updates):
        raise HTTPException(status_code=500, detail="Failed to update order status")
    
    # Get updated order
    updated_order = orders_db.get_by_id(order_id)
    
    # Try to send notification about order status change
    try:
        # Format a simple message for status change
        message = (
            f"🔄 <b>ORDER STATUS UPDATED</b> 🔄\n\n"
            f"Order: #{order_id}\n"
            f"Status: {update_data.status.upper()}\n"
            f"Customer: {order['shippingInfo']['fullName']}\n"
            f"Email: {order['shippingInfo']['email']}\n"
        )
        
        if update_data.notes:
            message += f"\nNotes: {update_data.notes}\n"
            
        # Send notification
        send_telegram_message(message)
    except Exception as e:
        print(f"Failed to send status update notification: {str(e)}")
    
    return UpdateOrderStatusResponse(
        order=Order.parse_obj(updated_order),
        message=f"Order status updated to {update_data.status}"
    )



