from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Ethiopian categories for the e-commerce platform
ETHIOPIAN_CATEGORIES = [
    "Traditional Clothing",
    "Coffee & Tea",
    "Cultural Artifacts",
    "Spices & Teff",
    "Handmade Jewelry",
    "Ethiopian Art",
    "Leather Goods",
    "Home Decor",
    "Beauty & Skincare",
    "Electronics",
    "Fashion",
    "Books & Media",
    "Handicrafts",
    "Furniture",
    "Food & Beverages",
    "Health Products",
    "Religious Items",
    "Musical Instruments",
    "Textiles",
    "Preorder"
]

class CategoryResponse(BaseModel):
    categories: List[str]

@router.get("/categories")
def get_ethiopian_categories() -> CategoryResponse:
    """Get list of Ethiopian product categories"""
    return CategoryResponse(categories=ETHIOPIAN_CATEGORIES)