from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime
import bcrypt
import databutton as db
from app.apis.database import users, addresses, generate_id, get_timestamp

router = APIRouter()

# Models
class UserRegistration(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AddressCreate(BaseModel):
    fullName: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str
    phone: str
    isDefault: bool = False

class AddressResponse(BaseModel):
    id: str
    userId: str
    fullName: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str
    phone: str
    isDefault: bool
    createdAt: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    createdAt: str
    role: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None

class UserLoginResponse(BaseModel):
    user: UserResponse
    token: str

class GetUserRequest(BaseModel):
    email: EmailStr

class AddressesResponse(BaseModel):
    addresses: List[AddressResponse]

# Endpoints
@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserRegistration) -> UserResponse:
    """ 
    Register a new user
    """
    # Check if user already exists
    existing_user = users.get_by_email(user_data.email.lower())
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_password = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt())
    
    # Create user object
    new_user = {
        "id": generate_id("user"),
        "name": user_data.name,
        "email": user_data.email.lower(),
        "phone": user_data.phone,
        "password_hash": hashed_password.decode(),
        "createdAt": get_timestamp(),
        "updatedAt": get_timestamp(),
        "role": user_data.role,  # Use provided role or default to customer
        "status": "active"  # Default status
    }
    
    # Store in database
    users.add(new_user)
    
    # Return user without password
    return UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        phone=new_user["phone"],
        createdAt=new_user["createdAt"]
    )

@router.post("/login", response_model=UserLoginResponse)
def login_user(login_data: UserLogin) -> UserLoginResponse:
    """
    Login a user
    """
    # Find user by email
    user = users.get_by_email(login_data.email.lower())
    
    # Check if user exists and password matches
    if not user or not bcrypt.checkpw(login_data.password.encode(), user['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token (in a real app, use JWT)
    token = str(uuid.uuid4())
    
    return UserLoginResponse(
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            phone=user.get("phone"),
            createdAt=user["createdAt"],
            role=user.get("role"),
            company=user.get("company"),
            description=user.get("description")
        ),
        token=token
    )

@router.post("/get-user", response_model=UserResponse)
def get_user(request: GetUserRequest) -> UserResponse:
    """
    Get user by email
    """
    user = users.get_by_email(request.email.lower())
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        createdAt=user["createdAt"],
        role=user.get("role"),
        company=user.get("company"),
        description=user.get("description")
    )

@router.post("/addresses/create", response_model=AddressResponse)
def create_address(address_data: AddressCreate, user_id: str) -> AddressResponse:
    """
    Create a new address for a user
    """
    # Check if user exists
    user = users.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If marked as default, update any existing default address
    if address_data.isDefault:
        user_addresses = addresses.get_by_user_id(user_id)
        for addr in user_addresses:
            if addr.get("isDefault"):
                addresses.update(addr["id"], {"isDefault": False})
    
    # Create new address
    new_address = {
        "id": generate_id("addr"),
        "userId": user_id,
        "fullName": address_data.fullName,
        "address": address_data.address,
        "city": address_data.city,
        "state": address_data.state,
        "zipCode": address_data.zipCode,
        "country": address_data.country,
        "phone": address_data.phone,
        "isDefault": address_data.isDefault,
        "createdAt": datetime.now().isoformat()
    }
    
    # Store in database
    addresses.add(new_address)
    
    return AddressResponse(**new_address)

@router.get("/addresses/{user_id}", response_model=AddressesResponse)
def get_user_addresses(user_id: str) -> AddressesResponse:
    """
    Get all addresses for a user
    """
    user_addresses = addresses.get_by_user_id(user_id)
    
    return AddressesResponse(
        addresses=[AddressResponse(**addr) for addr in user_addresses]
    )

@router.post("/migrate-users")
def migrate_local_users(user_list: List[dict]) -> dict:
    """
    Migrate users from localStorage to backend storage
    """
    existing_users = users.get_all()
    existing_emails = {user['email'].lower() for user in existing_users}
    
    migrated_count = 0
    for user_data in user_list:
        # Skip users that already exist
        if user_data.get('email', '').lower() in existing_emails:
            continue
            
        # Hash password if it's in plain text
        if 'password' in user_data and 'password_hash' not in user_data:
            hashed_password = bcrypt.hashpw(user_data['password'].encode(), bcrypt.gensalt())
            user_data['password_hash'] = hashed_password.decode()
            del user_data['password']
            
        # Ensure user has ID, created_at, role, and status
        if 'id' not in user_data:
            user_data['id'] = generate_id("user")
        if 'createdAt' not in user_data:
            user_data['createdAt'] = datetime.now().isoformat()
        if 'role' not in user_data:
            user_data['role'] = "customer"
        if 'status' not in user_data:
            user_data['status'] = "active"
            
        # Add to database
        users.add(user_data)
        existing_emails.add(user_data.get('email', '').lower())
        migrated_count += 1
    
    return {"migrated": migrated_count, "total": len(existing_users) + migrated_count}
