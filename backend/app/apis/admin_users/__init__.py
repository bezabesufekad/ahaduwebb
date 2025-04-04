from fastapi import APIRouter, HTTPException, Path, Query, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import databutton as db
from datetime import datetime
from app.apis.database import users as users_db, generate_id, get_timestamp

# Initialize the router
router = APIRouter()

# Define data models
class UserListItem(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    status: str
    createdAt: str

class UserListResponse(BaseModel):
    users: List[UserListItem]
    total: int

class UpdateUserStatusRequest(BaseModel):
    status: str  # active, inactive, blocked

class UpdateUserStatusResponse(BaseModel):
    user: UserListItem
    message: str

# Endpoints
@router.get("/admin/users", response_model=UserListResponse)
def get_all_users(
    role: Optional[str] = Query(None, description="Filter by user role"),
    status: Optional[str] = Query(None, description="Filter by user status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
) -> UserListResponse:
    """Get all users with optional filtering and pagination"""
    # Get all users
    all_users = users_db.get_all()
    
    # Filter by role if provided
    if role:
        all_users = [user for user in all_users if user.get("role") == role]
    
    # Filter by status if provided
    if status:
        all_users = [user for user in all_users if user.get("status") == status]
    
    # Sort by creation date (newest first)
    all_users.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Calculate pagination
    total = len(all_users)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get paginated users
    paginated_users = all_users[start_idx:end_idx]
    
    # Convert to response format (exclude password hash)
    user_list = []
    for user in paginated_users:
        user_list.append(
            UserListItem(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                phone=user.get("phone"),
                role=user.get("role", "customer"),
                status=user.get("status", "active"),
                createdAt=user["createdAt"]
            )
        )
    
    return UserListResponse(
        users=user_list,
        total=total
    )

@router.put("/admin/users/{user_id}/status", response_model=UpdateUserStatusResponse)
def update_user_status(
    user_id: str,
    update_data: UpdateUserStatusRequest
) -> UpdateUserStatusResponse:
    """Update the status of a user"""
    # Validate status
    valid_statuses = ["active", "inactive", "blocked"]
    if update_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    # Get the user
    user = users_db.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user
    updates = {
        "status": update_data.status,
        "updatedAt": get_timestamp()
    }
    
    if not users_db.update(user_id, updates):
        raise HTTPException(status_code=500, detail="Failed to update user status")
    
    # Get updated user
    updated_user = users_db.get_by_id(user_id)
    
    return UpdateUserStatusResponse(
        user=UserListItem(
            id=updated_user["id"],
            name=updated_user["name"],
            email=updated_user["email"],
            phone=updated_user.get("phone"),
            role=updated_user.get("role", "customer"),
            status=updated_user.get("status", "active"),
            createdAt=updated_user["createdAt"]
        ),
        message=f"User status updated to {update_data.status}"
    )

@router.delete("/admin/users/{user_id}")
def delete_user(user_id: str) -> dict:
    """Delete a user"""
    # Get the user
    user = users_db.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user
    if not users_db.delete(user_id):
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}
