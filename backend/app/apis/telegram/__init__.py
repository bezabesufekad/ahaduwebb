from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db
import requests
from typing import Dict, Any, Optional, List

# Initialize router
router = APIRouter()

# Telegram Bot API endpoint
TELEGRAM_API_URL = "https://api.telegram.org/bot"

# Models
class TelegramMessage(BaseModel):
    chat_id: str
    text: str
    parse_mode: Optional[str] = "HTML"

class TelegramResponse(BaseModel):
    success: bool
    message: str



# Endpoint to send test message
@router.post("/telegram/test", response_model=TelegramResponse)
def test_telegram_notification() -> TelegramResponse:
    """Send a test notification to Telegram"""
    # First check if credentials exist
    bot_token = db.secrets.get("TELEGRAM_BOT_TOKEN")
    chat_id = db.secrets.get("TELEGRAM_CHAT_ID")
    
    if not bot_token:
        return TelegramResponse(success=False, message="Telegram bot token is missing")
    
    if not chat_id:
        return TelegramResponse(success=False, message="Telegram chat ID is missing")
    
    # Credentials exist, try sending a message
    result = send_telegram_message(
        "🔔 <b>Test Notification</b>\n\n"
        "This is a test message from Ahadu Market.\n"
        "If you see this, your Telegram notification system is working correctly!"
    )
    
    return TelegramResponse(success=result["success"], message=result["message"])

# Helper function to send message to Telegram
def send_telegram_message(message_text: str) -> Dict[str, Any]:
    """Send a message to Telegram using the bot API"""
    try:
        bot_token = db.secrets.get("TELEGRAM_BOT_TOKEN")
        chat_id = db.secrets.get("TELEGRAM_CHAT_ID")
        
        if not bot_token or not chat_id:
            print("Missing Telegram credentials")
            return {"success": False, "message": "Missing Telegram credentials"}
        
        print(f"Sending Telegram message to chat ID: {chat_id}")
        
        # Create the URL
        url = f"{TELEGRAM_API_URL}{bot_token}/sendMessage"
        
        # Create request payload
        payload = {
            "chat_id": chat_id,
            "text": message_text,
            "parse_mode": "HTML"
        }
        
        # Send the message
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        print(f"Telegram API response: {response_data}")
        
        if response.status_code == 200 and response_data.get("ok"):
            return {"success": True, "message": "Message sent successfully"}
        else:
            print(f"Failed to send Telegram message: {response_data}")
            return {"success": False, "message": f"Failed to send message: {response_data.get('description', 'Unknown error')}"}
    
    except Exception as e:
        print(f"Error sending Telegram message: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}"}

# Helper function to send image to Telegram
def send_telegram_photo(photo_url: str, caption: str) -> Dict[str, Any]:
    """Send a photo to Telegram using the bot API"""
    try:
        bot_token = db.secrets.get("TELEGRAM_BOT_TOKEN")
        chat_id = db.secrets.get("TELEGRAM_CHAT_ID")
        
        if not bot_token or not chat_id:
            print("Missing Telegram credentials")
            return {"success": False, "message": "Missing Telegram credentials"}
        
        # Create the URL
        url = f"{TELEGRAM_API_URL}{bot_token}/sendPhoto"
        
        # Create request payload
        payload = {
            "chat_id": chat_id,
            "photo": photo_url,
            "caption": caption,
            "parse_mode": "HTML"
        }
        
        # Send the photo
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get("ok"):
            return {"success": True, "message": "Photo sent successfully"}
        else:
            print(f"Failed to send Telegram photo: {response_data}")
            return {"success": False, "message": f"Failed to send photo: {response_data.get('description', 'Unknown error')}"}
    
    except Exception as e:
        print(f"Error sending Telegram photo: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}"}

# Helper function to send media group to Telegram
def send_telegram_media_group(items: List[Dict[str, Any]], order_info: str) -> Dict[str, Any]:
    """Send a media group (multiple photos) to Telegram"""
    try:
        bot_token = db.secrets.get("TELEGRAM_BOT_TOKEN")
        chat_id = db.secrets.get("TELEGRAM_CHAT_ID")
        
        if not bot_token or not chat_id:
            print("Missing Telegram credentials")
            return {"success": False, "message": "Missing Telegram credentials"}
        
        # First, send the text message with order details
        text_message_result = send_telegram_message(order_info)
        if not text_message_result["success"]:
            print("Failed to send the order details message")
        
        # If there are no items with images, we've already sent the text message
        if not items:
            return text_message_result
        
        # Create the URL for media group
        url = f"{TELEGRAM_API_URL}{bot_token}/sendMediaGroup"
        
        # Prepare media array (max 10 items)
        media = []
        for i, item in enumerate(items[:10]):  # Telegram allows max 10 media items
            # For media group, we use much shorter captions
            caption = f"{item['name']} - ETB {item['price']} x {item['quantity']}"
            
            # Make sure image URL is valid
            if not item.get("image") or not isinstance(item["image"], str) or not item["image"].startswith("http"):
                print(f"Skipping item with invalid image URL: {item.get('name')}")
                continue
                
            media.append({
                "type": "photo",
                "media": item["image"],
                "caption": caption
            })
        
        # If no valid media items, return the text message result
        if not media:
            print("No valid media items found, only sent text message")
            return text_message_result
        
        # Create request payload
        payload = {
            "chat_id": chat_id,
            "media": media
        }
        
        # Send the media group
        print(f"Sending media group with {len(media)} items")
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get("ok"):
            return {"success": True, "message": "Media group sent successfully"}
        else:
            print(f"Failed to send Telegram media group: {response_data}")
            # Still return success if we at least sent the text message
            if text_message_result["success"]:
                return {"success": True, "message": "Text message sent, but media failed"}
            return {"success": False, "message": f"Failed to send media group: {response_data.get('description', 'Unknown error')}"}
    
    except Exception as e:
        print(f"Error sending Telegram media group: {str(e)}")
        # If we at least sent the text message, consider it a partial success
        return {"success": False, "message": f"Error: {str(e)}"}

# Function to format order details for Telegram
def format_order_notification(order: Dict[str, Any]) -> str:
    """Format the order details for Telegram notification"""
    # Calculate total items
    total_items = sum(item["quantity"] for item in order["items"])
    
    # Format items as a list
    items_text = ""
    for i, item in enumerate(order["items"], 1):
        items_text += (f"   {i}. {item['name']} - "
                     f"ETB {item['price']} x {item['quantity']} = ETB {item['price'] * item['quantity']}\n")
    
    # Format shipping address
    shipping = order["shippingInfo"]
    shipping_text = (f"{shipping['fullName']}\n"
                    f"{shipping['address']}\n"
                    f"{shipping['city']}, {shipping['state']} {shipping['zipCode']}\n"
                    f"{shipping['country']}\n"
                    f"📱 {shipping['phone']}\n"
                    f"📧 {shipping['email']}")
    
    # Format payment method
    payment_method = "Bank Transfer" if order["paymentMethod"] == "bank_transfer" else "Payment on Delivery"
    
    # Create the message
    message = (
        f"🛒 <b>NEW ORDER - #{order['id'].split('-')[1]}</b>\n\n"
        f"📅 <b>Date:</b> {order['createdAt'].split('T')[0]} {order['createdAt'].split('T')[1].split('.')[0]}\n"
        f"💰 <b>Total Amount:</b> ETB {order['totalAmount']}\n"
        f"🏷 <b>Status:</b> {order['status'].capitalize()}\n"
        f"💳 <b>Payment Method:</b> {payment_method}\n\n"
        
        f"📦 <b>ORDER ITEMS ({total_items}):</b>\n{items_text}\n"
        
        f"🚚 <b>SHIPPING INFORMATION:</b>\n{shipping_text}\n\n"
        
        f"📝 <b>Order ID:</b> {order['id']}"
    )
    
    return message

# Function to notify about new orders
def notify_new_order(order: Dict[str, Any]) -> Dict[str, Any]:
    """Send a notification to Telegram about a new order with images"""
    try:
        print(f"Notifying about new order: {order['id']}")
        
        # Format the order summary
        order_summary = format_order_notification(order)
        
        # Always send the media group approach which sends text first
        # This ensures the order details are always sent even if images fail
        items_with_images = []
        
        # Validate images before sending
        for item in order["items"]:
            if item.get("image") and isinstance(item["image"], str) and item["image"].startswith("http"):
                items_with_images.append(item)
            else:
                print(f"Item has invalid image URL: {item.get('name')}")
        
        print(f"Order has {len(items_with_images)} items with valid images")
        
        # Always use media group approach (which first sends text then images)
        result = send_telegram_media_group(items_with_images, order_summary)
        
        # Log the result
        print(f"Telegram notification result: {result}")
        return result
        
    except Exception as e:
        print(f"Error sending order notification: {str(e)}")
        # Try to send at least a text message as fallback
        try:
            return send_telegram_message(f"🛒 NEW ORDER - #{order['id']}\n\nError sending full notification: {str(e)}")
        except:
            return {"success": False, "message": f"Error: {str(e)}"}
