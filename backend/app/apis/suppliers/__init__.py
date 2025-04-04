from fastapi import APIRouter, HTTPException, Path, Query, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import databutton as db
import bcrypt
from datetime import datetime
from app.apis.database import users as users_db, generate_id, get_timestamp

# Initialize the router
router = APIRouter()

# Define data models
class SupplierBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None

class SupplierCreate(SupplierBase):
    password: str

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # active, inactive, suspended

class SupplierResponse(SupplierBase):
    id: str
    status: str
    createdAt: str
    updatedAt: Optional[str] = None

class SuppliersListResponse(BaseModel):
    suppliers: List[SupplierResponse]
    total: int

# Endpoints
@router.post("/admin/suppliers", response_model=SupplierResponse)
def create_supplier(supplier_data: SupplierCreate) -> SupplierResponse:
    """Create a new supplier account (admin only)"""
    # Check if user already exists
    existing_user = users_db.get_by_email(supplier_data.email.lower())
    if existing_user:
        # If user exists but is not a supplier, update their role
        if existing_user.get("role") != "supplier":
            updates = {
                "role": "supplier",
                "company": supplier_data.company,
                "description": supplier_data.description,
                "updatedAt": get_timestamp()
            }
            if not users_db.update(existing_user["id"], updates):
                raise HTTPException(status_code=500, detail="Failed to update user to supplier")
            
            # Get updated user
            updated_user = users_db.get_by_id(existing_user["id"])
            
            return SupplierResponse(
                id=updated_user["id"],
                name=updated_user["name"],
                email=updated_user["email"],
                phone=updated_user.get("phone"),
                company=updated_user.get("company"),
                description=updated_user.get("description"),
                status=updated_user.get("status", "active"),
                createdAt=updated_user["createdAt"],
                updatedAt=updated_user.get("updatedAt")
            )
        else:
            raise HTTPException(status_code=400, detail="User is already a supplier")
    
    # Hash the password
    hashed_password = bcrypt.hashpw(supplier_data.password.encode(), bcrypt.gensalt())
    
    # Create supplier object
    new_supplier = {
        "id": generate_id("supplier"),
        "name": supplier_data.name,
        "email": supplier_data.email.lower(),
        "phone": supplier_data.phone,
        "company": supplier_data.company,
        "description": supplier_data.description,
        "password_hash": hashed_password.decode(),
        "createdAt": get_timestamp(),
        "updatedAt": get_timestamp(),
        "role": "supplier",  # Fixed supplier role
        "status": "active"  # Default status
    }
    
    # Store in database
    if not users_db.add(new_supplier):
        raise HTTPException(status_code=500, detail="Failed to create supplier account")
    
    # Return supplier without password
    return SupplierResponse(
        id=new_supplier["id"],
        name=new_supplier["name"],
        email=new_supplier["email"],
        phone=new_supplier.get("phone"),
        company=new_supplier.get("company"),
        description=new_supplier.get("description"),
        status=new_supplier["status"],
        createdAt=new_supplier["createdAt"],
        updatedAt=new_supplier.get("updatedAt")
    )

@router.get("/admin/suppliers", response_model=SuppliersListResponse)
def get_suppliers(
    status: Optional[str] = Query(None, description="Filter by supplier status"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
) -> SuppliersListResponse:
    """Get all suppliers with filtering and pagination (admin only)"""
    # Get all users
    all_users = users_db.get_all()
    
    # Filter suppliers only
    suppliers = [user for user in all_users if user.get("role") == "supplier"]
    
    # Filter by status if provided
    if status:
        suppliers = [s for s in suppliers if s.get("status") == status]
    
    # Filter by search term if provided
    if search:
        search_lower = search.lower()
        suppliers = [s for s in suppliers if 
                    search_lower in s.get("name", "").lower() or 
                    search_lower in s.get("email", "").lower() or
                    search_lower in s.get("company", "").lower()]
    
    # Sort by creation date (newest first)
    suppliers.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Calculate pagination
    total = len(suppliers)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated suppliers
    paginated_suppliers = suppliers[start_idx:end_idx]
    
    # Convert to response format
    supplier_list = []
    for supplier in paginated_suppliers:
        supplier_list.append(
            SupplierResponse(
                id=supplier["id"],
                name=supplier["name"],
                email=supplier["email"],
                phone=supplier.get("phone"),
                company=supplier.get("company"),
                description=supplier.get("description"),
                status=supplier.get("status", "active"),
                createdAt=supplier["createdAt"],
                updatedAt=supplier.get("updatedAt")
            )
        )
    
    return SuppliersListResponse(
        suppliers=supplier_list,
        total=total
    )

@router.get("/admin/suppliers/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: str = Path(..., description="The ID of the supplier to retrieve")
) -> SupplierResponse:
    """Get a specific supplier by ID (admin only)"""
    supplier = users_db.get_by_id(supplier_id)
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    if supplier.get("role") != "supplier":
        raise HTTPException(status_code=404, detail="User is not a supplier")
    
    return SupplierResponse(
        id=supplier["id"],
        name=supplier["name"],
        email=supplier["email"],
        phone=supplier.get("phone"),
        company=supplier.get("company"),
        description=supplier.get("description"),
        status=supplier.get("status", "active"),
        createdAt=supplier["createdAt"],
        updatedAt=supplier.get("updatedAt")
    )

@router.put("/admin/suppliers/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: str,
    update_data: SupplierUpdate
) -> SupplierResponse:
    """Update a supplier (admin only)"""
    # Get the supplier
    supplier = users_db.get_by_id(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    if supplier.get("role") != "supplier":
        raise HTTPException(status_code=404, detail="User is not a supplier")
    
    # Create update dict with only provided fields
    updates = {k: v for k, v in update_data.dict().items() if v is not None}
    updates["updatedAt"] = get_timestamp()
    
    # Update supplier
    if not users_db.update(supplier_id, updates):
        raise HTTPException(status_code=500, detail="Failed to update supplier")
    
    # Get updated supplier
    updated_supplier = users_db.get_by_id(supplier_id)
    
    return SupplierResponse(
        id=updated_supplier["id"],
        name=updated_supplier["name"],
        email=updated_supplier["email"],
        phone=updated_supplier.get("phone"),
        company=updated_supplier.get("company"),
        description=updated_supplier.get("description"),
        status=updated_supplier.get("status", "active"),
        createdAt=updated_supplier["createdAt"],
        updatedAt=updated_supplier.get("updatedAt")
    )

@router.delete("/admin/suppliers/{supplier_id}")
def delete_supplier(supplier_id: str) -> dict:
    """Delete a supplier (admin only)"""
    # Get the supplier
    supplier = users_db.get_by_id(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    if supplier.get("role") != "supplier":
        raise HTTPException(status_code=404, detail="User is not a supplier")
    
    # Update user to a regular customer instead of deleting to preserve orders and products
    updates = {
        "role": "customer",
        "updatedAt": get_timestamp()
    }
    
    if not users_db.update(supplier_id, updates):
        raise HTTPException(status_code=500, detail="Failed to remove supplier role")
    
    return {"message": "Supplier role revoked successfully"}

@router.get("/suppliers/products", response_model=dict)
def get_supplier_products(supplier_id: str) -> dict:
    """Get products for a specific supplier (supplier dashboard)"""
    # This endpoint can be used by suppliers to view their own products
    # and by admins to view products for a specific supplier
    from app.apis.database import products as products_db
    
    # Get all products
    all_products = products_db.get_all()
    
    # Filter by supplier ID
    supplier_products = [p for p in all_products if p.get("supplierId") == supplier_id]
    
    # Sort by creation date (newest first)
    supplier_products.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Convert to response format with simplified data
    products_list = []
    for product in supplier_products:
        products_list.append({
            "id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "stock": product["stock"],
            "category": product["category"],
            "featured": product.get("featured", False),
            "createdAt": product["createdAt"],
        })
    
    return {
        "products": products_list,
        "total": len(products_list)
    }

@router.get("/suppliers/orders", response_model=dict)
def get_supplier_orders(supplier_id: str) -> dict:
    """Get orders containing products from a specific supplier (supplier dashboard)"""
    # This endpoint can be used by suppliers to view orders for their products
    # and by admins to view orders for a specific supplier
    from app.apis.database import orders as orders_db, products as products_db
    
    # Get all products for this supplier
    all_products = products_db.get_all()
    supplier_products = [p for p in all_products if p.get("supplierId") == supplier_id]
    
    # Get all orders
    all_orders = orders_db.get_all()
    
    # Filter orders that contain products from this supplier
    supplier_product_ids = [p["id"] for p in supplier_products]
    supplier_orders = []
    
    for order in all_orders:
        # Check if any item in the order is from this supplier
        order_items = order.get("items", [])
        supplier_items = [item for item in order_items if item.get("productId") in supplier_product_ids]
        
        if supplier_items:
            # Calculate supplier subtotal for this order
            supplier_subtotal = sum(item.get("price", 0) * item.get("quantity", 0) for item in supplier_items)
            
            # Add relevant order information for the supplier
            supplier_orders.append({
                "id": order["id"],
                "supplierItems": supplier_items,
                "supplierSubtotal": supplier_subtotal,
                "orderStatus": order.get("status"),
                "shippingInfo": order.get("shippingInfo", {}),
                "createdAt": order.get("createdAt"),
            })
    
    # Sort by creation date (newest first)
    supplier_orders.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    return {
        "orders": supplier_orders,
        "total": len(supplier_orders)
    }
