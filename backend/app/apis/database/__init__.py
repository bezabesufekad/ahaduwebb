import databutton as db
import json
import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, TypeVar, Generic
from fastapi import APIRouter

# Create an empty router with tags to make it clear this is a utility module, not an API
router = APIRouter(tags=["database-utils"])

# Type variable for database operations
T = TypeVar('T')

# Sanitize storage key to only allow alphanumeric and ._- symbols
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Database collections
class Collection(Generic[T]):
    """Base class for database collections"""
    def __init__(self, collection_name: str):
        self.collection_name = sanitize_storage_key(collection_name)
    
    def get_all(self) -> List[Dict[str, Any]]:
        """Get all documents in the collection"""
        try:
            data_json = db.storage.text.get(self.collection_name, default="[]")
            data = json.loads(data_json)
            # Validate image URLs to ensure they're not undefined or empty
            if self.collection_name == 'products':
                for product in data:
                    if 'images' in product and not product['images']:
                        product['images'] = []
                    elif 'images' in product and not isinstance(product['images'], list):
                        product['images'] = []
                    # Make sure we never return None values for images
                    if 'images' in product:
                        product['images'] = [img for img in product['images'] if img]
            return data
        except Exception as e:
            print(f"Error getting {self.collection_name}: {e}")
            return []
    
    def save_all(self, data: List[Dict[str, Any]]) -> bool:
        """Save all documents to the collection"""
        try:
            data_json = json.dumps(data)
            db.storage.text.put(self.collection_name, data_json)
            return True
        except Exception as e:
            print(f"Error saving {self.collection_name}: {e}")
            return False
    
    def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID"""
        data = self.get_all()
        for item in data:
            if item.get('id') == id:
                return item
        return None
    
    def add(self, item: Dict[str, Any]) -> bool:
        """Add a new document to the collection"""
        data = self.get_all()
        data.append(item)
        return self.save_all(data)
    
    def update(self, id: str, updates: Dict[str, Any]) -> bool:
        """Update a document by ID"""
        data = self.get_all()
        for i, item in enumerate(data):
            if item.get('id') == id:
                data[i] = {**item, **updates}
                return self.save_all(data)
        return False
    
    def delete(self, id: str) -> bool:
        """Delete a document by ID"""
        data = self.get_all()
        filtered_data = [item for item in data if item.get('id') != id]
        if len(filtered_data) < len(data):
            return self.save_all(filtered_data)
        return False
    
    def query(self, query_fn) -> List[Dict[str, Any]]:
        """Query documents using a filter function"""
        data = self.get_all()
        return [item for item in data if query_fn(item)]
    
    def get_by_field(self, field: str, value: Any) -> Optional[Dict[str, Any]]:
        """Get the first document matching a field value"""
        matching = self.query(lambda item: item.get(field) == value)
        return matching[0] if matching else None
    
    def query_by_field(self, field: str, value: Any) -> List[Dict[str, Any]]:
        """Get all documents matching a field value"""
        return self.query(lambda item: item.get(field) == value)

# Enhanced collections that follow better eCommerce structure
class UserCollection(Collection):
    """Collection for user management with enhanced methods"""
    
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email (case insensitive)"""
        matching = self.query(lambda user: user.get('email', '').lower() == email.lower())
        return matching[0] if matching else None

class AddressCollection(Collection):
    """Collection for address management"""
    
    def get_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all addresses for a user"""
        return self.query(lambda address: address.get('user_id') == user_id)
    
    def get_default_for_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the default address for a user"""
        addresses = self.query(lambda address: 
                              address.get('user_id') == user_id and 
                              address.get('is_default') == True)
        return addresses[0] if addresses else None

class OrderCollection(Collection):
    """Collection for order management"""
    
    def get_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all orders for a user"""
        return self.query(lambda order: order.get('user_id') == user_id)
    
    def get_by_email(self, email: str) -> List[Dict[str, Any]]:
        """Get all orders for a user by email"""
        return self.query(lambda order: 
                         order.get('shippingInfo', {}).get('email', '').lower() == email.lower())
    
    def get_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get all orders with a specific status"""
        return self.query(lambda order: order.get('status') == status)

class ProductCollection(Collection):
    """Collection for product management"""
    
    def get_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all products in a category"""
        return self.query(lambda product: product.get('category') == category)
    
    def search(self, query: str) -> List[Dict[str, Any]]:
        """Search products by name or description"""
        query = query.lower()
        return self.query(lambda product: 
                         query in product.get('name', '').lower() or 
                         query in product.get('description', '').lower())

# Initialize enhanced database collections
users = UserCollection('users')
addresses = AddressCollection('addresses')
orders = OrderCollection('orders')
products = ProductCollection('products')

# Shopping cart collection - primarily for future use with saved carts
carts = Collection('carts')

# Helper function to generate a timestamp for sorting
def get_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.now().isoformat()

# Helper function to generate a new ID for different entity types
def generate_id(prefix: str = '') -> str:
    """Generate a unique ID with optional prefix"""
    uid = str(uuid.uuid4())
    return f"{prefix}_{uid}" if prefix else uid