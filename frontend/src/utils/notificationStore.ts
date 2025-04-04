import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import brain from '../brain';

export type NotificationType = 'order_status' | 'low_stock' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string; // Related order ID or product ID
}

type EmailTemplate = {
  subject: string;
  body: string;
};

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  getUnreadCount: () => number;
  sendOrderStatusEmail: (orderId: string, email: string, status: string) => Promise<boolean>;
}

// Email templates for different order statuses
const orderStatusTemplates: Record<string, EmailTemplate> = {
  processing: {
    subject: 'Your Ahadu Market Order is Being Processed',
    body: 'Dear {customerName},\n\nGreat news! Your order #{orderId} is now being processed. Our team is preparing your items for shipment. You will receive another notification when your order ships.\n\nThank you for shopping with Ahadu Market!\n\nBest regards,\nThe Ahadu Market Team'
  },
  shipped: {
    subject: 'Your Ahadu Market Order Has Shipped',
    body: 'Dear {customerName},\n\nExcellent news! Your order #{orderId} has been shipped and is on its way to you. You can track your delivery using the following tracking information:\n\n{trackingInfo}\n\nEstimated delivery: {estimatedDelivery}\n\nThank you for shopping with Ahadu Market!\n\nBest regards,\nThe Ahadu Market Team'
  },
  delivered: {
    subject: 'Your Ahadu Market Order Has Been Delivered',
    body: 'Dear {customerName},\n\nYour order #{orderId} has been delivered! We hope you love your new items.\n\nIf you have any questions or need assistance, please don\'t hesitate to contact our customer service team.\n\nWe would love to hear about your shopping experience. Please take a moment to leave a review!\n\nThank you for choosing Ahadu Market!\n\nBest regards,\nThe Ahadu Market Team'
  },
  cancelled: {
    subject: 'Your Ahadu Market Order Has Been Cancelled',
    body: 'Dear {customerName},\n\nYour order #{orderId} has been cancelled as requested. If you did not request this cancellation or have any questions, please contact our customer service team.\n\nWe hope to see you shopping with us again soon!\n\nBest regards,\nThe Ahadu Market Team'
  }
};

export const useNotificationStore = create<NotificationState>(
  persist(
    (set, get) => ({
      notifications: [],
      
      addNotification: (notification) => {
        const id = `notification_${Date.now()}`;
        const newNotification: Notification = {
          ...notification,
          id,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({ ...notification, read: true }))
        }));
      },
      
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        }));
      },
      
      deleteAllNotifications: () => {
        set({ notifications: [] });
      },
      
      getUnreadCount: () => {
        return get().notifications.filter(notification => !notification.read).length;
      },
      
      sendOrderStatusEmail: async (orderId, email, status) => {
        try {
          // In a real implementation, you would call your backend API to send an email
          // For now, we'll simulate a successful email send and log to console
          console.log(`Sending ${status} email notification to ${email} for order ${orderId}`);
          
          // Here you would make an API call like:
          // await brain.send_order_notification({ orderId, email, status });
          
          // Add to local notifications
          const statusText = status.charAt(0).toUpperCase() + status.slice(1);
          get().addNotification({
            type: 'order_status',
            title: `Order ${statusText}`,
            message: `Email notification sent to customer for order ${orderId}`,
            relatedId: orderId
          });
          
          return true;
        } catch (error) {
          console.error('Failed to send order status email:', error);
          return false;
        }
      }
    }),
    {
      name: 'ahadu-notifications-storage'
    }
  )
);
