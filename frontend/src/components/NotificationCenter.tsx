import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Package,
  Trash2,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNotificationStore, Notification, NotificationType } from '../utils/notificationStore';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onDelete }) => {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'order_status':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'low_stock':
        return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      case 'system':
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={`p-3 ${notification.read ? 'bg-background' : 'bg-muted/30'} rounded-md hover:bg-muted/50 transition-colors`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium">{notification.title}</p>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRead(notification.id)}>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(notification.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationList: React.FC<{
  notifications: Notification[];
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  type?: NotificationType;
}> = ({ notifications, onRead, onDelete, type }) => {
  const filteredNotifications = type
    ? notifications.filter(notification => notification.type === type)
    : notifications;

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredNotifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export function NotificationCenter() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount
  } = useNotificationStore();
  
  const [open, setOpen] = useState(false);
  const unreadCount = getUnreadCount();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium">Notifications</h4>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
            <Button variant="ghost" size="sm" onClick={deleteAllNotifications} disabled={notifications.length === 0}>
              Clear all
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 px-3 pt-3">
            <TabsTrigger value="all">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">
              Orders
              {notifications.filter(n => n.type === 'order_status').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notifications.filter(n => n.type === 'order_status').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inventory">
              Inventory
              {notifications.filter(n => n.type === 'low_stock').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notifications.filter(n => n.type === 'low_stock').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="p-3 max-h-[400px] overflow-y-auto">
            <TabsContent value="all" className="m-0">
              <NotificationList
                notifications={notifications}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            </TabsContent>
            <TabsContent value="orders" className="m-0">
              <NotificationList
                notifications={notifications}
                onRead={markAsRead}
                onDelete={deleteNotification}
                type="order_status"
              />
            </TabsContent>
            <TabsContent value="inventory" className="m-0">
              <NotificationList
                notifications={notifications}
                onRead={markAsRead}
                onDelete={deleteNotification}
                type="low_stock"
              />
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
