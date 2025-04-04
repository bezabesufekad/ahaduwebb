import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSupplierManagement from '../components/AdminSupplierManagement';
import { Toaster, toast } from 'sonner';
import { APP_BASE_PATH } from 'app';
import brain from '../brain';
import { useUserAuth } from '../utils/userAuthStore';
import { useProductsStore, ProductFilters } from '../utils/productsStore';
import { useOrderStore } from '../utils/orderStore';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';

// Recharts components for analytics
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
} from 'recharts';

// Shadcn components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Icons
import { 
  Search, 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Clock,
  Truck,
  ArrowDown,
  ArrowUp,
  Filter,
  Download,
  Check,
  ChevronDown,
  Loader2,
  Inbox,
  LayoutDashboard,
  ShoppingBasket,
  Tag,
  RefreshCw,
  HelpCircle,
  Upload
} from 'lucide-react';

// Types
import type { Order } from '../utils/orderStore';
import type { Product } from '../utils/productsStore';
import type { User } from '../utils/userAuthStore';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

interface ProductFormState {
  id?: string;
  name: string;
  price: number;
  image: string;
  imageFile: File | null;
  additionalImages: string[];
  additionalImageFiles: File[];
  category: string;
  description: string;
  colors: string[];
  sizes: string[];
  stock: number;
  featured: boolean;
  shopName: string;
  shippingPrice: number;
  supplierName: string;
}

const DEFAULT_PRODUCT_FORM: ProductFormState = {
  name: '',
  price: 0,
  image: '',
  imageFile: null,
  additionalImages: [],
  additionalImageFiles: [],
  category: '',
  description: '',
  colors: [],
  sizes: [],
  stock: 0,
  featured: false,
  shopName: 'Ahadu Market',
  shippingPrice: 0,
  supplierName: ''
};

// Format address safely for display
const formatShippingAddress = (order: OrderWithItems) => {
  if (!order.shippingInfo) return 'N/A';
  
  const city = order.shippingInfo.city || 'N/A';
  const state = order.shippingInfo.state || 'N/A';
  const zipCode = order.shippingInfo.zipCode || 'N/A';
  
  return `${city}, ${state} ${zipCode}`;
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated, currentUser } = useUserAuth();
  
  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to access the admin panel');
      navigate('/sign-in');
      return;
    }
    
    // For development, allow all authenticated users to access admin
    // In production, this would check role: if (currentUser?.role !== 'admin')
    // Commented out for now to allow testing
    /*
    if (currentUser?.role !== 'admin') {
      toast.error('You do not have permission to access the admin panel');
      navigate('/');
    }
    */
  }, [isAuthenticated, currentUser, navigate]);
  
  // Return loading state if not authenticated or checking
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold">Checking permissions...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Admin Panel Layout */}
      <div className="flex h-screen overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto w-full">
          <main className="p-6">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-6 h-12 overflow-x-auto sm:grid-cols-6 flex-nowrap md:flex-wrap">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customers
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Suppliers
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6">
                <DashboardTab />
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-6">
                <OrdersTab />
              </TabsContent>
              
              <TabsContent value="products" className="space-y-6">
                <ProductsTab />
              </TabsContent>
              
              <TabsContent value="customers" className="space-y-6">
                <CustomersTab />
              </TabsContent>
              
              <TabsContent value="suppliers" className="space-y-6">
                <AdminSupplierManagement />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function AdminSidebar() {
  const navigate = useNavigate();
  
  return (
    <div className="w-64 bg-card h-full border-r border-border flex flex-col hidden md:flex">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <ShoppingBasket className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-bold text-xl">Ahadu Market</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => navigate(`${APP_BASE_PATH}/`)}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>View Store Front</span>
        </button>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const { getAllOrders } = useOrderStore();
  const { getAllProducts } = useProductsStore();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch order summary
        const response = await brain.get_order_summary();
        const data = await response.json();
        setOrderSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
        // Set default summary data to prevent UI breaking
        setOrderSummary({
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          recentOrders: [],
          popularProducts: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  const stats: DashboardStat[] = useMemo(() => {
    const orders = getAllOrders();
    const products = getAllProducts();
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Count completed orders
    const completedOrders = orders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    ).length;
    
    return [
      {
        title: 'Total Revenue',
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(totalRevenue),
        icon: <DollarSign className="h-4 w-4" />,
        change: '+12.5%',
        changeType: 'increase'
      },
      {
        title: 'Total Orders',
        value: orderSummary?.total || orders.length,
        icon: <ShoppingBag className="h-4 w-4" />,
        change: '+5.2%',
        changeType: 'increase'
      },
      {
        title: 'Completed Orders',
        value: completedOrders,
        icon: <CheckCircle className="h-4 w-4" />,
        change: '+8.1%',
        changeType: 'increase'
      },
      {
        title: 'Products in Stock',
        value: products.length,
        icon: <Package className="h-4 w-4" />,
        change: '-2.3%',
        changeType: 'decrease'
      }
    ];
  }, [getAllOrders, getAllProducts, orderSummary]);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
      
      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Overview of orders by status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Orders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-sm font-medium">Pending Orders</span>
                  </div>
                  <span className="text-sm font-medium">{orderSummary?.pending || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-yellow-400 rounded-full" 
                    style={{ width: `${orderSummary?.pending ? (orderSummary.pending / orderSummary.total * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Processing Orders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Processing Orders</span>
                  </div>
                  <span className="text-sm font-medium">{orderSummary?.processing || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${orderSummary?.processing ? (orderSummary.processing / orderSummary.total * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Shipped Orders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium">Shipped Orders</span>
                  </div>
                  <span className="text-sm font-medium">{orderSummary?.shipped || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-purple-500 rounded-full" 
                    style={{ width: `${orderSummary?.shipped ? (orderSummary.shipped / orderSummary.total * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Delivered Orders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Delivered Orders</span>
                  </div>
                  <span className="text-sm font-medium">{orderSummary?.delivered || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${orderSummary?.delivered ? (orderSummary.delivered / orderSummary.total * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Cancelled Orders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Cancelled Orders</span>
                  </div>
                  <span className="text-sm font-medium">{orderSummary?.cancelled || 0}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-red-500 rounded-full" 
                    style={{ width: `${orderSummary?.cancelled ? (orderSummary.cancelled / orderSummary.total * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders across the store</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => document.querySelector('[data-value="orders"]')?.click()}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable />
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {stat.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        {stat.change && (
          <p className={`text-xs flex items-center mt-1 ${
            stat.changeType === 'increase' ? 'text-green-500' : 
            stat.changeType === 'decrease' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {stat.changeType === 'increase' ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : stat.changeType === 'decrease' ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : null}
            {stat.change} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Recent Orders Table
function RecentOrdersTable() {
  const { getAllOrders } = useOrderStore();
  const navigate = useNavigate();
  
  const recentOrders = useMemo(() => {
    const orders = getAllOrders();
    // Ensure we have valid orders before sorting
    if (!orders || orders.length === 0) return [];
    
    // Make sure we have valid createdAt dates
    return orders
      .filter(order => order && order.id && order.createdAt)
      .sort((a, b) => {
        // Safely handle date comparison
        try {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } catch(e) {
          return 0;
        }
      })
      .slice(0, 5);
  }, [getAllOrders]);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentOrders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders found</TableCell>
          </TableRow>
        ) : recentOrders.map((order) => (
          <TableRow key={order.id} className="cursor-pointer" onClick={() => navigate(`${APP_BASE_PATH}/admin-panel?tab=orders&orderId=${order.id}`)}>
            <TableCell className="font-medium">#{(order.id && order.id.slice(-8)) || 'N/A'}</TableCell>
            <TableCell>{order.shippingInfo?.fullName || 'Unknown'}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status || 'pending'} />
            </TableCell>
            <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'Unknown'}</TableCell>
            <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(order.totalAmount || 0)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Orders Tab
function OrdersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  const itemsPerPage = 10;

  const navigate = useNavigate();
  
  // Initial load of orders
  useEffect(() => {
    loadOrders();
    loadOrderSummary();
  }, []);
  
  // Check for order ID in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    const tab = params.get('tab');
    
    if (orderId && tab === 'orders') {
      // Make sure we have orders loaded and a valid orderId
      if (orders && orders.length > 0) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          setSelectedOrder(order);
        } else {
          console.log(`Order with ID ${orderId} not found in loaded orders`);
        }
      }
    }
  }, [orders]);
  
  // Load orders from API
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // Get all orders (for admin)
      const response = await brain.get_all_orders({});
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && Array.isArray(data.orders)) {
        console.log('Orders loaded:', data.orders.length);
        setOrders(data.orders);
      } else {
        console.error('Invalid orders data format:', data);
        toast.error('Failed to load orders: Invalid data format');
        // Set empty orders array to prevent UI breaking
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders. Please try again.');
      // Set empty orders array to prevent UI breaking
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load order summary for stats
  const loadOrderSummary = async () => {
    try {
      const response = await brain.get_order_summary();
      if (!response.ok) {
        throw new Error(`Failed to fetch order summary: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrderSummary(data);
    } catch (error) {
      console.error('Error loading order summary:', error);
      // Continue with the app even if order summary fails to load
      // Set default summary to prevent UI breaking
      setOrderSummary({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      });
    }
  };
  
  // Refresh orders
  const refreshOrders = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadOrders(),
        loadOrderSummary()
      ]);
      toast.success('Orders refreshed successfully');
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Update order status
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      // Call API to update order status
      const response = await brain.update_order_status(
        { orderId: orderId },
        { status: status }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Order status updated:', data);
      
      // Update order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      // Update selected order if it's the one being edited
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status});
      }
      
      // Also refresh the order summary
      loadOrderSummary();
      
      toast.success(`Order status updated to ${status}`);
      
      // Send notifications for status changes
      if (['processing', 'shipped', 'delivered'].includes(status)) {
        try {
          const selectedOrderData = orders.find(o => o.id === orderId);
          if (selectedOrderData && selectedOrderData.shippingInfo) {
            await brain.send_order_status_update({
              order_id: orderId,
              customer_email: selectedOrderData.shippingInfo.email,
              customer_name: selectedOrderData.shippingInfo.fullName,
              old_status: selectedOrderData.status || 'pending',
              new_status: status,
              order_total: selectedOrderData.totalAmount,
              items_count: selectedOrderData.items ? selectedOrderData.items.length : 0
            });
            console.log('Order status notification sent');
          } else {
            console.warn('Unable to send notification: order data or shipping info is incomplete');
          }
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
          // Don't show error toast for notification failure
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Error updating order status: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }
        
        // Search term filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            order.id.toLowerCase().includes(search) ||
            (order.shippingInfo?.fullName || '').toLowerCase().includes(search) ||
            (order.shippingInfo?.email || '').toLowerCase().includes(search) ||
            (order.shippingInfo?.phone && order.shippingInfo.phone.toLowerCase().includes(search))
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by date or amount
        if (sortBy === 'date') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          return sortOrder === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        }
      });
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);
  
  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  // Generate page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  // Order detail dialog
  const OrderDetailDialog = () => (
    <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {selectedOrder && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Order #{selectedOrder.id.slice(-8)}</span>
                <OrderStatusBadge status={selectedOrder.status} />
              </DialogTitle>
              <DialogDescription>
                Created on {format(new Date(selectedOrder.createdAt), 'PPP')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Customer Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedOrder.shippingInfo?.fullName || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.shippingInfo?.email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.shippingInfo?.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Shipping Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Address:</span> {selectedOrder.shippingInfo?.address || 'N/A'}</p>
                  <p><span className="font-medium">Location:</span> {formatShippingAddress(selectedOrder)}</p>
                  <p><span className="font-medium">Country:</span> {selectedOrder.shippingInfo?.country || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Order Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-secondary overflow-hidden">
                            {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(item.price)}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">Total</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(selectedOrder.totalAmount)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-6 border-t pt-4">
              <div className="flex-1">
                <Select 
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    if (!isUpdatingStatus) {
                      handleUpdateStatus(selectedOrder.id, value as OrderStatus);
                    }
                  }}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
        <Button onClick={refreshOrders} disabled={isRefreshing} variant="outline" className="h-10">
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Orders
            </>
          )}
        </Button>
      </div>
      
      {/* Order Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{orderSummary.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{orderSummary.pending || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-blue-700 dark:text-blue-400 text-sm">Processing</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{orderSummary.processing || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-purple-700 dark:text-purple-400 text-sm">Shipped</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">{orderSummary.shipped || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-green-700 dark:text-green-400 text-sm">Delivered</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">{orderSummary.delivered || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-red-700 dark:text-red-400 text-sm">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-500">{orderSummary.cancelled || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value as OrderStatus | 'all');
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Sort: {sortBy === 'date' ? 'Date' : 'Amount'} ({sortOrder === 'asc' ? 'Asc' : 'Desc'})</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('date')} className={sortBy === 'date' ? 'bg-accent' : ''}>
                <Check className={`mr-2 h-4 w-4 ${sortBy === 'date' ? 'opacity-100' : 'opacity-0'}`} />
                Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('amount')} className={sortBy === 'amount' ? 'bg-accent' : ''}>
                <Check className={`mr-2 h-4 w-4 ${sortBy === 'amount' ? 'opacity-100' : 'opacity-0'}`} />
                Amount
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('asc')} className={sortOrder === 'asc' ? 'bg-accent' : ''}>
                <Check className={`mr-2 h-4 w-4 ${sortOrder === 'asc' ? 'opacity-100' : 'opacity-0'}`} />
                Ascending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('desc')} className={sortOrder === 'desc' ? 'bg-accent' : ''}>
                <Check className={`mr-2 h-4 w-4 ${sortOrder === 'desc' ? 'opacity-100' : 'opacity-0'}`} />
                Descending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.shippingInfo?.fullName || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.shippingInfo?.email || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem 
                          disabled={order.status === 'pending' || isLoading}
                          onClick={() => handleUpdateStatus(order.id, 'pending')}
                        >
                          <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                          Set Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'processing' || isLoading}
                          onClick={() => handleUpdateStatus(order.id, 'processing')}
                        >
                          <Package className="mr-2 h-4 w-4 text-blue-500" />
                          Set Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'shipped' || isLoading}
                          onClick={() => handleUpdateStatus(order.id, 'shipped')}
                        >
                          <Truck className="mr-2 h-4 w-4 text-purple-500" />
                          Set Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'delivered' || isLoading}
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Set Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'cancelled' || isLoading}
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          Set Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-center py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {pageNumbers.map((number, index) => (
                  <PaginationItem key={index}>
                    {number < 0 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink 
                        onClick={() => setCurrentPage(number)}
                        isActive={currentPage === number}
                      >
                        {number}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
      

      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.id.slice(-8)}</DialogTitle>
              <DialogDescription>
                Placed on {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy')} at {format(new Date(selectedOrder.createdAt), 'h:mm a')}
              </DialogDescription>
            </DialogHeader>
            
            {/* Order Details Content */}
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2 px-1">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <div className="mt-1">
                    <OrderStatusBadge status={selectedOrder.status} size="lg" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value as OrderStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => window.open(getOrderPrintUrl(selectedOrder), '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    Print Order
                  </Button>
                </div>
              </div>
              
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{selectedOrder.shippingInfo?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{selectedOrder.shippingInfo?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{selectedOrder.shippingInfo?.phone || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Shipping Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedOrder.shippingInfo?.address || 'N/A'}</p>
                    <p>{formatShippingAddress(selectedOrder)}</p>
                    <p>{selectedOrder.shippingInfo?.country || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Order Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded overflow-hidden">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(item.price)}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Order Summary */}
                  <div className="border-t mt-6 pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Subtotal</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(
                            selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Shipping</p>
                        <p className="font-medium">ETB 0.00</p>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <p className="font-medium">Total</p>
                        <p className="font-bold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(selectedOrder.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="capitalize">
                      {selectedOrder.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Payment on Delivery'}
                    </p>
                  </div>
                  
                  {selectedOrder.paymentMethod === 'bank_transfer' && selectedOrder.paymentProof && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Payment Proof</p>
                      <div className="border rounded-md overflow-hidden max-w-sm">
                        <img src={selectedOrder.paymentProof} alt="Payment proof" className="w-full" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button onClick={() => window.open(getOrderPrintUrl(selectedOrder), '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Print Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Helper function to get the print URL for an order
function getOrderPrintUrl(order: Order): string {
  return `${APP_BASE_PATH}/order-print?orderId=${order.id}`;
}

// Order Status Badge Component
function OrderStatusBadge({ status, size = 'md' }: { status: OrderStatus, size?: 'sm' | 'md' | 'lg' }) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} /> };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Package className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} /> };
      case 'shipped':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Truck className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} /> };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} /> };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} /> };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null };
    }
  };
  
  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses[size]} font-medium`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </span>
  );
}

// Helper functions for generating chart data
function generateSalesData(timeRange: TimeRange) {
  if (timeRange === 'week') {
    return [
      { name: 'Mon', revenue: 4000 },
      { name: 'Tue', revenue: 3000 },
      { name: 'Wed', revenue: 2000 },
      { name: 'Thu', revenue: 2780 },
      { name: 'Fri', revenue: 1890 },
      { name: 'Sat', revenue: 2390 },
      { name: 'Sun', revenue: 3490 },
    ];
  } else if (timeRange === 'month') {
    // Generate data for all days in a month (just showing 10 days as example)
    return Array.from({ length: 30 }, (_, i) => ({
      name: `${i + 1}`,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }));
  } else if (timeRange === 'year') {
    return [
      { name: 'Jan', revenue: 4000 },
      { name: 'Feb', revenue: 3000 },
      { name: 'Mar', revenue: 2000 },
      { name: 'Apr', revenue: 2780 },
      { name: 'May', revenue: 1890 },
      { name: 'Jun', revenue: 2390 },
      { name: 'Jul', revenue: 3490 },
      { name: 'Aug', revenue: 3000 },
      { name: 'Sep', revenue: 2500 },
      { name: 'Oct', revenue: 2800 },
      { name: 'Nov', revenue: 3300 },
      { name: 'Dec', revenue: 4100 },
    ];
  } else if (timeRange === 'today') {
    // Hours in a day
    return Array.from({ length: 24 }, (_, i) => ({
      name: `${i}:00`,
      revenue: Math.floor(Math.random() * 1000) + 100,
    }));
  } else {
    // All time (simplified to the last 12 months)
    return [
      { name: 'Jan', revenue: 4000 },
      { name: 'Feb', revenue: 3000 },
      { name: 'Mar', revenue: 2000 },
      { name: 'Apr', revenue: 2780 },
      { name: 'May', revenue: 1890 },
      { name: 'Jun', revenue: 2390 },
      { name: 'Jul', revenue: 3490 },
      { name: 'Aug', revenue: 3000 },
      { name: 'Sep', revenue: 2500 },
      { name: 'Oct', revenue: 2800 },
      { name: 'Nov', revenue: 3300 },
      { name: 'Dec', revenue: 4100 },
    ];
  }
}

function generateOrderStatusData() {
  return [
    { name: 'Pending', value: 20 },
    { name: 'Processing', value: 30 },
    { name: 'Shipped', value: 25 },
    { name: 'Delivered', value: 20 },
    { name: 'Cancelled', value: 5 },
  ];
}

function getOrderStatusColor(status: string) {
  switch (status) {
    case 'Pending': return '#FFA500'; // orange
    case 'Processing': return '#1E90FF'; // blue
    case 'Shipped': return '#9370DB'; // purple
    case 'Delivered': return '#32CD32'; // green
    case 'Cancelled': return '#FF6347'; // red
    default: return '#CCCCCC'; // gray
  }
}

function generatePopularProductsData() {
  return [
    { name: 'Modern Leather Sofa', sales: 400 },
    { name: 'Wireless Headphones', sales: 300 },
    { name: 'Ceramic Coffee Set', sales: 200 },
    { name: 'Premium Yoga Mat', sales: 278 },
    { name: 'Smart Watch Pro', sales: 189 },
  ];
}

function generateCustomerGrowthData() {
  return [
    { name: 'Jan', customers: 40 },
    { name: 'Feb', customers: 30 },
    { name: 'Mar', customers: 20 },
    { name: 'Apr', customers: 27 },
    { name: 'May', customers: 18 },
    { name: 'Jun', customers: 23 },
    { name: 'Jul', customers: 34 },
  ];
}

function generateLowInventoryData() {
  return [
    { name: 'Modern Leather Sofa', category: 'Furniture', stock: 2 },
    { name: 'Wireless Headphones', category: 'Electronics', stock: 3 },
    { name: 'Ceramic Coffee Set', category: 'Kitchen', stock: 0 },
    { name: 'Premium Yoga Mat', category: 'Fitness', stock: 1 },
  ];
}
function ProductsTab() {
  const { getAllProducts, addProduct, updateProduct, deleteProduct, filterProducts, bulkDeleteProducts, bulkUpdateStock, bulkToggleFeatured } = useProductsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [showInStock, setShowInStock] = useState<boolean | undefined>(undefined);
  const [showFeatured, setShowFeatured] = useState<boolean | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(DEFAULT_PRODUCT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const itemsPerPage = 10;
  
  // Fetch categories from API
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await brain.get_categories({});
        const data = await response.json();
        console.log('Categories from API:', data.categories);
        
        if (data && data.categories) {
          // Always include these standard categories, then add from API
          const standardCategories = [
            "Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", 
            "Toys & Kids", "Books & Media", "Food & Beverages", "Hand Made", 
            "Accessories", "Health", "Furniture", "Kitchen", "Automotive", 
            "Art", "Office", "Clothing", "Preorder", "Others"
          ];
          
          // Combine API categories with standard ones, remove duplicates
          const combinedCategories = [...new Set([...standardCategories, ...data.categories])];
          combinedCategories.sort(); // Sort alphabetically
          
          console.log('Combined categories:', combinedCategories);
          setApiCategories(combinedCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to local categories if API fails
        const allProducts = getAllProducts();
        const uniqueCategories = new Set(allProducts.map(product => product.category));
        
        // Always include these standard categories
        const standardCategories = [
          "Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", 
          "Toys & Kids", "Books & Media", "Food & Beverages", "Hand Made", 
          "Accessories", "Health", "Furniture", "Kitchen", "Automotive", 
          "Art", "Office", "Clothing", "Preorder", "Others"
        ];
        
        // Combine local categories with standard ones
        const combinedCategories = [...new Set([...standardCategories, ...Array.from(uniqueCategories)])];
        combinedCategories.sort(); // Sort alphabetically
        
        setApiCategories(combinedCategories.filter(Boolean));
      }
    };
    
    fetchCategories();
  }, [getAllProducts]);
  
  // Combine 'all' with API categories for filtering
  const categories = useMemo(() => {
    return ['all', ...apiCategories];
  }, [apiCategories]);
  
  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'price' || name === 'stock' || name === 'shippingPrice') {
      // Parse numeric values
      setProductForm(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (type === 'checkbox') {
      // Handle checkbox
      const checked = (e.target as HTMLInputElement).checked;
      setProductForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle other inputs
      setProductForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle array inputs (colors, sizes, images)
  const handleArrayChange = (name: 'colors' | 'sizes', value: string) => {
    const array = value ? value.split(',').map(item => item.trim()).filter(Boolean) : [];
    setProductForm(prev => ({
      ...prev,
      [name]: array
    }));
  };
  
  // Add or remove additional image url
  const handleAdditionalImageChange = (index: number, value: string) => {
    const newImages = [...productForm.additionalImages];
    newImages[index] = value.trim();
    setProductForm(prev => ({
      ...prev,
      additionalImages: newImages
    }));
  };
  
  const addImageField = () => {
    setProductForm(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, '']
    }));
  };
  
  const removeImageField = (index: number) => {
    const newImages = [...productForm.additionalImages];
    newImages.splice(index, 1);
    setProductForm(prev => ({
      ...prev,
      additionalImages: newImages
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!productForm.image.trim() && !productForm.imageFile) {
        toast.error('Main product image is required');
        setIsLoading(false);
        return;
      }
      
      // Filter out empty additional images to save localStorage space
      const validatedAdditionalImages = productForm.additionalImages.filter(img => img.trim());
      
      // Prepare validated form data
      const validatedForm = {
        ...productForm,
        image: productForm.image.trim(),
        additionalImages: validatedAdditionalImages
      };
      
      // Check if we have uploaded files to handle
      if (productForm.imageFile || (productForm.additionalImageFiles?.length ?? 0) > 0) {
        // Process files into data URLs before sending to API
        const processImages = async () => {
          let mainImageUrl = validatedForm.image;
          
          // If we have a main image file, convert it to data URL
          if (productForm.imageFile) {
            mainImageUrl = await readFileAsDataURL(productForm.imageFile);
          }
          
          // Process any additional image files
          const existingImageUrls = [...validatedForm.additionalImages];
          const newImageUrls: string[] = [];
          
          if (productForm.additionalImageFiles?.length) {
            for (const file of productForm.additionalImageFiles) {
              const dataUrl = await readFileAsDataURL(file);
              newImageUrls.push(dataUrl);
            }
          }
          
          // Return the form with processed images
          return {
            ...validatedForm,
            image: mainImageUrl,
            additionalImages: [...existingImageUrls, ...newImageUrls]
          };
        };
        
        const preparedForm = await processImages();
        
        if (productForm.id) {
          // Update existing product
          await updateProduct(productForm.id, preparedForm);
          toast.success('Product updated successfully');
        } else {
          // Add new product
          await addProduct(preparedForm);
          toast.success('Product added successfully');
        }
      } else {
        // No files to process, just use the URLs directly
        if (productForm.id) {
          // Update existing product
          await updateProduct(productForm.id, validatedForm);
          toast.success('Product updated successfully');
        } else {
          // Add new product
          await addProduct(validatedForm);
          toast.success('Product added successfully');
        }
      }
      
      // Refresh products list
      // This ensures the products tab shows the updated data
      const productsStore = useProductsStore.getState();
      await productsStore.refreshProducts();
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setProductForm(DEFAULT_PRODUCT_FORM);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}. Please check all image URLs are valid.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Edit product
  const handleEditProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      additionalImages: product.additionalImages || [],
      category: product.category,
      description: product.description,
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock: product.stock || 0,
      featured: product.featured || false,
      shopName: product.shopName || 'Ahadu Market',
      imageFile: null,
      additionalImageFiles: [],
      shippingPrice: product.shippingPrice || 0,
      supplierName: product.supplierName || ''
    });
    setIsDialogOpen(true);
  };
  
  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        deleteProduct(id);
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };
  
  // Filter products
  const filteredProducts = useMemo(() => {
    return getAllProducts()
      .filter(product => {
        // Category filter
        if (categoryFilter !== 'all' && product.category !== categoryFilter) {
          return false;
        }
        
        // Search term filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search)
          );
        }
        
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [getAllProducts, searchTerm, categoryFilter]);
  
  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
        <Button onClick={() => {
          setProductForm(DEFAULT_PRODUCT_FORM);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        
        <Select 
          value={categoryFilter} 
          onValueChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1); // Reset to first page on filter change
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm || categoryFilter !== 'all' ? 'No products match your filters' : 'No products found'}
                  </TableCell>
                </TableRow>
              ) : paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded overflow-hidden">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(product.price)}
                  </TableCell>
                  <TableCell>{product.stock || 'N/A'}</TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary">
                        Featured
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-center py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productForm.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {productForm.id ? 'Update the product details below.' : 'Fill in the details to add a new product to your store.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={productForm.name} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input 
                    id="shopName" 
                    name="shopName" 
                    value={productForm.shopName} 
                    onChange={handleFormChange} 
                    placeholder="Ahadu Market"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price (ETB)</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={productForm.price} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="shippingPrice">Shipping Price (ETB)</Label>
                  <Input 
                    id="shippingPrice" 
                    name="shippingPrice" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={productForm.shippingPrice} 
                    onChange={handleFormChange} 
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    id="stock" 
                    name="stock" 
                    type="number" 
                    min="0" 
                    value={productForm.stock} 
                    onChange={handleFormChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input 
                    id="supplierName" 
                    name="supplierName" 
                    value={productForm.supplierName} 
                    onChange={handleFormChange} 
                    placeholder="Supplier name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={productForm.category} 
                    onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                        {apiCategories.length > 0 ? (
                          apiCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))
                        ) : (
                          // Full set of fallback categories
                          <>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Fashion">Fashion</SelectItem>
                            <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                            <SelectItem value="Beauty">Beauty</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Toys & Kids">Toys & Kids</SelectItem>
                            <SelectItem value="Books & Media">Books & Media</SelectItem>
                            <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                            <SelectItem value="Hand Made">Hand Made</SelectItem>
                            <SelectItem value="Accessories">Accessories</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Kitchen">Kitchen</SelectItem>
                            <SelectItem value="Automotive">Automotive</SelectItem>
                            <SelectItem value="Art">Art</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Preorder">Preorder</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </>
                        )}
                      </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured" 
                    name="featured"
                    checked={productForm.featured} 
                    onCheckedChange={(checked) => {
                      setProductForm(prev => ({ ...prev, featured: checked === true }))
                    }} 
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Main Image URL or Upload</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="image" 
                      name="image" 
                      value={productForm.image} 
                      onChange={handleFormChange} 
                      placeholder="Enter image URL or upload" 
                      className="flex-1"
                      required={!productForm.imageFile} 
                      disabled={!!productForm.imageFile}
                    />
                    <Label 
                      htmlFor="imageUpload" 
                      className={`cursor-pointer px-3 py-2 rounded-md text-sm ${productForm.imageFile ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted hover:bg-muted/80'} flex items-center gap-1`}
                    >
                      {productForm.imageFile ? (
                        <>
                          <Check className="h-4 w-4" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Browse
                        </>
                      )}
                    </Label>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = URL.createObjectURL(file);
                          setProductForm(prev => ({
                            ...prev,
                            image: imageUrl,
                            imageFile: file
                          }));
                        }
                      }}
                    />
                    {productForm.imageFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          if (productForm.image.startsWith('blob:')) {
                            URL.revokeObjectURL(productForm.image);
                          }
                          setProductForm(prev => ({
                            ...prev,
                            image: '',
                            imageFile: null
                          }));
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Product Images</Label>
                  <div className="space-y-4">
                    {/* URL Input */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Add images via URL:</p>
                      {productForm.additionalImages.map((image, index) => (
                        <div key={`url-${index}`} className="flex gap-2">
                          <Input 
                            value={image} 
                            onChange={(e) => handleAdditionalImageChange(index, e.target.value)} 
                            placeholder={`Image URL ${index + 1}`} 
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => removeImageField(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addImageField}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image URL
                      </Button>
                    </div>
                    
                    {/* File Upload */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Or upload image files:</p>
                      
                      {/* Uploaded Files Preview */}
                      {productForm.additionalImageFiles && productForm.additionalImageFiles.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {productForm.additionalImageFiles.map((file, index) => (
                            <div key={`file-${index}`} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                              <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`Uploaded ${index + 1}`} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="flex-1 truncate text-sm">{file.name}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  const newFiles = [...productForm.additionalImageFiles];
                                  newFiles.splice(index, 1);
                                  setProductForm(prev => ({
                                    ...prev,
                                    additionalImageFiles: newFiles
                                  }));
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <Label 
                        htmlFor="multiImageUpload" 
                        className="cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Choose files or drag & drop</span>
                      </Label>
                      <input
                        type="file"
                        id="multiImageUpload"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const fileArray = Array.from(files);
                            setProductForm(prev => ({
                              ...prev,
                              additionalImageFiles: [...(prev.additionalImageFiles || []), ...fileArray]
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="colors">Colors (comma separated)</Label>
                  <Input 
                    id="colors" 
                    name="colors" 
                    value={productForm.colors.join(', ')} 
                    onChange={(e) => handleArrayChange('colors', e.target.value)} 
                    placeholder="Red, Blue, Green" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="sizes">Sizes (comma separated)</Label>
                  <Input 
                    id="sizes" 
                    name="sizes" 
                    value={productForm.sizes.join(', ')} 
                    onChange={(e) => handleArrayChange('sizes', e.target.value)} 
                    placeholder="S, M, L, XL" 
                  />
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <Label htmlFor="description">Product Description</Label>
              <textarea 
                id="description" 
                name="description" 
                className="w-full min-h-32 p-3 border rounded-md focus:ring focus:ring-primary/30 focus:border-primary" 
                value={productForm.description} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            
            {/* Image Preview */}
            {(productForm.image || productForm.additionalImages.some(Boolean) || (productForm.additionalImageFiles?.length || 0) > 0) && (
              <div>
                <Label>Image Preview</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {productForm.image && (
                    <div className="relative group rounded-md overflow-hidden">
                      <img 
                        src={productForm.image} 
                        alt="Main product image" 
                        className="h-24 w-24 object-cover border rounded-md" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">Main Image</p>
                      </div>
                    </div>
                  )}
                  
                  {productForm.additionalImages.filter(Boolean).map((image, index) => (
                    <div key={`preview-url-${index}`} className="relative group rounded-md overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Additional image ${index + 1}`} 
                        className="h-24 w-24 object-cover border rounded-md" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => removeImageField(index)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{productForm.id ? 'Update Product' : 'Add Product'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Customers Tab
function CustomersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await brain.get_all_users();
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle user status change
  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await brain.update_user_status(
        { userId: userId },
        { status: isActive ? 'active' : 'inactive' }
      );
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ));
      
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await brain.delete_user({ userId: userId });
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // Filter users
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const search = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }, [users, searchTerm]);
  
  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-[300px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'No name provided'}</p>
                        <p className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.role === 'admin' ? 'border-purple-200 bg-purple-100 text-purple-800' : ''}>
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateUserStatus(user.id, !user.isActive)}
                          disabled={user.role === 'admin'}
                        >
                          {user.isActive ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Activate User
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === 'admin'}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <CardFooter className="flex items-center justify-center py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  const [testTelegramLoading, setTestTelegramLoading] = useState(false);
  
  const handleTestTelegramNotification = async () => {
    setTestTelegramLoading(true);
    try {
      const response = await brain.test_telegram_notification();
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      
      const data = await response.json();
      toast.success(data.message || 'Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setTestTelegramLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your store settings and preferences</p>
      </div>
      
      {/* Settings Sections */}
      <div className="grid gap-8">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications about orders and customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Telegram Notifications */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">Telegram Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive real-time notifications for new orders and status changes</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestTelegramNotification}
                  disabled={testTelegramLoading}
                >
                  {testTelegramLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>Test Notification</>
                  )}
                </Button>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  To setup or change Telegram notifications, please contact the system administrator to update the bot token and chat ID.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
