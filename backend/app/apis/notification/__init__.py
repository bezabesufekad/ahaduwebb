from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db
from typing import Optional, Dict, Any, List
from app.apis.telegram import send_telegram_message
import json
from datetime import datetime

# Initialize router
router = APIRouter()

# Models
class CustomerNotification(BaseModel):
    email: str
    subject: str
    message: str
    order_id: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    message: str

class OrderConfirmationEmail(BaseModel):
    order_id: str
    customer_email: str
    customer_name: str
    order_items: List[Dict[str, Any]]
    shipping_info: Dict[str, Any]
    payment_method: str
    order_total: float
    created_at: str

class InventoryAlert(BaseModel):
    product_id: str
    product_name: str
    current_stock: int
    threshold: int
    supplier_info: Optional[str] = None

class OrderUpdate(BaseModel):
    order_id: str
    customer_email: str
    customer_name: str
    old_status: str
    new_status: str
    order_total: Optional[float] = None
    items_count: Optional[int] = None

@router.post("/send-customer-notification", response_model=NotificationResponse)
def send_customer_notification(notification: CustomerNotification) -> NotificationResponse:
    """Send a notification to a customer via telegram (as a demonstration)"""
    try:
        # In a real app, this would send an email using a service like SendGrid, Mailgun, etc.
        # For this demonstration, we'll use Telegram to show the notification
        telegram_message = f"""📧 CUSTOMER NOTIFICATION

To: {notification.email}
Subject: {notification.subject}

Message:
{notification.message}"""
        
        result = send_telegram_message(telegram_message)
        
        if result["success"]:
            return NotificationResponse(success=True, message="Notification sent successfully")
        else:
            return NotificationResponse(success=False, message=f"Failed to send notification: {result['message']}")
    
    except Exception as e:
        return NotificationResponse(success=False, message=f"Error sending notification: {str(e)}")

@router.post("/send-inventory-alert", response_model=NotificationResponse)
def send_inventory_alert(alert: InventoryAlert) -> NotificationResponse:
    """Send an inventory alert to administrators"""
    try:
        telegram_message = f"""🚨 LOW STOCK ALERT

Product: {alert.product_name}
ID: {alert.product_id}
Current Stock: {alert.current_stock}
Threshold: {alert.threshold}
"""
        
        if alert.supplier_info:
            telegram_message += f"\nSupplier Info: {alert.supplier_info}"
        
        result = send_telegram_message(telegram_message)
        
        if result["success"]:
            return NotificationResponse(success=True, message="Inventory alert sent successfully")
        else:
            return NotificationResponse(success=False, message=f"Failed to send inventory alert: {result['message']}")
    
    except Exception as e:
        return NotificationResponse(success=False, message=f"Error sending inventory alert: {str(e)}")

@router.post("/send-order-status-update", response_model=NotificationResponse)
def send_order_status_update(update: OrderUpdate) -> NotificationResponse:
    """Send an order status update notification to both customer and admin"""
    try:
        # Admin notification via Telegram
        admin_message = f"""🔄 ORDER STATUS UPDATE

Order ID: {update.order_id}
Customer: {update.customer_name} ({update.customer_email})
Status Change: {update.old_status} → {update.new_status}"""
        
        if update.order_total:
            admin_message += f"\nOrder Total: ETB {update.order_total}"
        
        if update.items_count:
            admin_message += f"\nItems: {update.items_count}"
        
        admin_result = send_telegram_message(admin_message)
        
        # In a real app, we would also send an email to the customer
        # For now, we'll just simulate this
        customer_message = ""
        
        match update.new_status:
            case "processing":
                customer_message = f"Your order #{update.order_id[-8:]} is now being processed. Our team is preparing your items for shipment!"
            case "shipped":
                customer_message = f"Great news! Your order #{update.order_id[-8:]} has been shipped and is on its way to you."
            case "delivered":
                customer_message = f"Your order #{update.order_id[-8:]} has been delivered. We hope you enjoy your purchase!"
            case "cancelled":
                customer_message = f"Your order #{update.order_id[-8:]} has been cancelled. If you have any questions, please contact our support team."
            case _:
                customer_message = f"Your order #{update.order_id[-8:]} status has been updated to: {update.new_status}"
        
        # Log the customer notification that would be sent
        print(f"Would send email to {update.customer_email}: {customer_message}")
        
        return NotificationResponse(
            success=admin_result["success"], 
            message="Order status notification sent successfully"
        )
    
    except Exception as e:
        return NotificationResponse(success=False, message=f"Error sending order status notification: {str(e)}")

@router.post("/send-order-confirmation-email", response_model=NotificationResponse)
def send_order_confirmation_email(data: OrderConfirmationEmail) -> NotificationResponse:
    """Send an order confirmation email to the customer"""
    try:
        # Format items for email
        items_html = ""
        for item in data.order_items:
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.get('name', 'Product')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.get('quantity', 0)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">ETB {item.get('price', 0)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">ETB {item.get('price', 0) * item.get('quantity', 0)}</td>
            </tr>
            """
            
        # Format shipping info
        shipping_info = data.shipping_info
        shipping_address = f"{shipping_info.get('address', '')}, {shipping_info.get('city', '')}, {shipping_info.get('state', '')} {shipping_info.get('zipCode', '')}, {shipping_info.get('country', '')}"
        
        # Format date
        order_date = "Today"
        try:
            dt = datetime.fromisoformat(data.created_at.replace('Z', '+00:00'))
            order_date = dt.strftime("%B %d, %Y at %I:%M %p")
        except:
            pass
            
        # Format payment method
        payment_method = "Bank Transfer" if data.payment_method == "bank_transfer" else "Payment on Delivery"
        
        # Build the email content
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1a3a8f; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .order-details {{ margin-top: 20px; }}
                table {{ width: 100%; border-collapse: collapse; }}
                th {{ background-color: #f2f2f2; text-align: left; padding: 10px; }}
                .footer {{ margin-top: 30px; text-align: center; font-size: 12px; color: #777; }}
                .contact-info {{ margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }}
                .status-badge {{ display: inline-block; padding: 5px 10px; background-color: #ffd700; color: #333; border-radius: 3px; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Confirmation</h1>
                    <p>Thank you for your purchase!</p>
                </div>
                
                <div class="content">
                    <p>Dear {data.customer_name},</p>
                    
                    <p>Your order has been received and is now being processed. Here's a summary of your order:</p>
                    
                    <div class="order-details">
                        <p><strong>Order Number:</strong> #{data.order_id[-8:]}</p>
                        <p><strong>Order Date:</strong> {order_date}</p>
                        <p><strong>Payment Method:</strong> {payment_method}</p>
                        <p><strong>Order Status:</strong> <span class="status-badge">Pending</span></p>
                    </div>
                    
                    <h3>Order Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Order Total:</td>
                                <td style="padding: 10px; font-weight: bold;">ETB {data.order_total}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>Shipping Information</h3>
                    <p><strong>Name:</strong> {shipping_info.get('fullName', '')}</p>
                    <p><strong>Address:</strong> {shipping_address}</p>
                    <p><strong>Phone:</strong> {shipping_info.get('phone', '')}</p>
                    
                    <div class="contact-info">
                        <p><strong>Next Steps:</strong></p>
                        <p>One of our customer care representatives will contact you within 24 hours at {shipping_info.get('phone', '')} to confirm your order.</p>
                        <p>If you have any questions about your order, please contact us at:</p>
                        <p>Phone: 0940405038</p>
                        <p>Email: care.ahadumarket@gmail.com</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for shopping with Ahadu Market!</p>
                    <p>&copy; 2025 Ahadu Market. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Simple text version as fallback
        email_text = f"""Order Confirmation - Ahadu Market

Dear {data.customer_name},

Your order has been received and is now being processed. Here's a summary of your order:

Order Number: #{data.order_id[-8:]}
Order Date: {order_date}
Payment Method: {payment_method}
Order Status: Pending

Order Total: ETB {data.order_total}

Shipping Information:
Name: {shipping_info.get('fullName', '')}
Address: {shipping_address}
Phone: {shipping_info.get('phone', '')}

One of our customer care representatives will contact you within 24 hours to confirm your order.

If you have any questions, please contact us:
Phone: 0940405038
Email: info@ahadumarket.store

Thank you for shopping with Ahadu Market!
"""
        
        # Send the email using databutton SDK
        # Note: We can't set from_email directly, but we can add a Reply-To header to show admin email
        db.notify.email(
            to=data.customer_email,
            subject=f"Ahadu Market - Order Confirmation #{data.order_id[-8:]}",
            content_html=email_html.replace('care@ahadumarket.tech', 'info@ahadumarket.store'),  # Replace contact email in content
            content_text=email_text.replace('care@ahadumarket.tech', 'info@ahadumarket.store')   # Replace contact email in text
        )
        
        # Also send notification to admin through Telegram
        try:
            admin_message = f"📧 Order confirmation email sent to {data.customer_email} for order #{data.order_id[-8:]}"
            send_telegram_message(admin_message)
        except Exception as e:
            print(f"Error sending Telegram notification: {str(e)}")
        
        return NotificationResponse(success=True, message="Order confirmation email sent successfully")
    
    except Exception as e:
        print(f"Error sending order confirmation email: {str(e)}")
        return NotificationResponse(success=False, message=f"Error sending email: {str(e)}")
