from fastapi import APIRouter, HTTPException, Query, Path, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import databutton as db
import re
from app.apis.database import products as products_db, generate_id, get_timestamp

# Initialize router
router = APIRouter()

# Models
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    salePrice: Optional[float] = None
    category: str
    stock: int
    images: List[str]
    featured: bool = False
    brand: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    warranty: Optional[str] = None
    shopName: Optional[str] = "Ahadu Market"
    shippingPrice: Optional[float] = None
    supplierName: Optional[str] = None
    supplierId: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    createdAt: str
    updatedAt: Optional[str] = None
    rating: Optional[float] = None
    numReviews: int = 0
    soldCount: int = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    salePrice: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    featured: Optional[bool] = None
    shopName: Optional[str] = None
    brand: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    warranty: Optional[str] = None
    shippingPrice: Optional[float] = None
    supplierName: Optional[str] = None
    supplierId: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None

class ProductsResponse(BaseModel):
    products: List[Product]
    total: int

class ProductResponse(BaseModel):
    product: Product

class CategoryResponse(BaseModel):
    categories: List[str]

# Endpoints
@router.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate) -> ProductResponse:
    """Create a new product"""
    # Generate product ID
    product_id = generate_id("prod")
    
    # Create product object with all fields
    new_product = {
        "id": product_id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "salePrice": product.salePrice,
        "category": product.category,
        "stock": product.stock,
        "images": product.images,
        "featured": product.featured,
        "brand": product.brand,
        "material": product.material,
        "dimensions": product.dimensions,
        "weight": product.weight,
        "warranty": product.warranty,
        "soldCount": 0,
        "rating": 0,
        "numReviews": 0,
        "shopName": product.shopName,
        "supplierName": product.supplierName,
        "supplierId": product.supplierId,
        "shippingPrice": product.shippingPrice,
        "specifications": product.specifications or {},
        "createdAt": get_timestamp(),
        "updatedAt": get_timestamp()
    }
    
    # Save to database
    if not products_db.add(new_product):
        raise HTTPException(status_code=500, detail="Failed to create product")
    
    return ProductResponse(product=Product.parse_obj(new_product))

@router.get("/products", response_model=ProductsResponse)
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    supplier_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "createdAt",
    sort_order: str = "desc"
) -> ProductsResponse:
    """Get all products with filtering, pagination and sorting"""
    # Get all products
    all_products = products_db.get_all()
    
    # Apply filters
    if category:
        all_products = [p for p in all_products if p.get("category") == category]
    
    if search:
        search_lower = search.lower()
        all_products = [p for p in all_products 
                      if search_lower in p.get("name", "").lower() 
                      or search_lower in p.get("description", "").lower()]
    
    if featured is not None:
        all_products = [p for p in all_products if p.get("featured") == featured]
    
    if min_price is not None:
        all_products = [p for p in all_products if p.get("price", 0) >= min_price]
    
    if max_price is not None:
        all_products = [p for p in all_products if p.get("price", 0) <= max_price]
    
    # Filter by supplier if provided
    if supplier_id is not None:
        all_products = [p for p in all_products if p.get("supplierId") == supplier_id]
    
    # Sort products
    if sort_by == "price":
        all_products.sort(key=lambda x: x.get("price", 0), 
                         reverse=sort_order.lower() == "desc")
    elif sort_by == "name":
        all_products.sort(key=lambda x: x.get("name", "").lower(), 
                         reverse=sort_order.lower() == "desc")
    elif sort_by == "rating":
        all_products.sort(key=lambda x: x.get("rating", 0), 
                         reverse=sort_order.lower() == "desc")
    else:  # Default sort by createdAt
        all_products.sort(key=lambda x: x.get("createdAt", ""), 
                         reverse=sort_order.lower() == "desc")
    
    # Calculate pagination
    total = len(all_products)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated products
    paginated_products = all_products[start_idx:end_idx]
    
    return ProductsResponse(
        products=[Product.parse_obj(product) for product in paginated_products],
        total=total
    )

@router.get("/products/categories", response_model=CategoryResponse)
def get_categories() -> CategoryResponse:
    """Get all product categories"""
    all_products = products_db.get_all()
    
    # Extract all categories
    categories = list(set(p.get("category") for p in all_products if p.get("category")))
    categories.sort()  # Sort alphabetically
    
    return CategoryResponse(categories=categories)

@router.get("/products/featured", response_model=ProductsResponse)
def get_featured_products(limit: int = Query(8, ge=1, le=20)) -> ProductsResponse:
    """Get featured products"""
    all_products = products_db.get_all()
    
    # Filter featured products
    featured_products = [p for p in all_products if p.get("featured", False)]
    
    # Sort by createdAt (newest first)
    featured_products.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Limit the number of products
    limited_products = featured_products[:limit]
    
    return ProductsResponse(
        products=[Product.parse_obj(product) for product in limited_products],
        total=len(featured_products)
    )

# Dynamic path parameters like {product_id} should be defined AFTER specific routes
# to avoid conflicts. Otherwise, requests to /products/featured would be caught by this handler.
@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str = Path(..., description="The ID of the product to retrieve")) -> ProductResponse:
    """Get a specific product by ID"""
    product = products_db.get_by_id(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ProductResponse(product=Product.parse_obj(product))

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, update_data: ProductUpdate) -> ProductResponse:
    """Update a product"""
    # Get the product
    product = products_db.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Create update dict with only provided fields
    updates = {k: v for k, v in update_data.dict().items() if v is not None}
    updates["updatedAt"] = get_timestamp()
    
    # Update product
    if not products_db.update(product_id, updates):
        raise HTTPException(status_code=500, detail="Failed to update product")
    
    # Get updated product
    updated_product = products_db.get_by_id(product_id)
    
    return ProductResponse(product=Product.parse_obj(updated_product))

@router.delete("/products/{product_id}")
def delete_product(product_id: str) -> Dict[str, Any]:
    """Delete a product"""
    # Check if product exists
    product = products_db.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Delete product
    if not products_db.delete(product_id):
        raise HTTPException(status_code=500, detail="Failed to delete product")
    
    return {"success": True, "message": "Product deleted successfully"}
