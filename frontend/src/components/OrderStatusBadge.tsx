import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { variant: 'warning' as const, label: 'Pending' };
      case 'processing':
        return { variant: 'default' as const, label: 'Processing' };
      case 'shipped':
        return { variant: 'secondary' as const, label: 'Shipped' };
      case 'delivered':
        return { variant: 'success' as const, label: 'Delivered' };
      case 'cancelled':
        return { variant: 'destructive' as const, label: 'Cancelled' };
      case 'completed':
        return { variant: 'success' as const, label: 'Completed' };
      default:
        return { variant: 'outline' as const, label: status };
    }
  };

  const { variant, label } = getStatusConfig(status);

  const getClassName = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-500';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-900/30 dark:text-purple-500';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-500';
      default:
        return '';
    }
  };

  return (
    <Badge variant={variant} className={getClassName()}>
      {label}
    </Badge>
  );
}
