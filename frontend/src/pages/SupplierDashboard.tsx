import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "utils/userAuthStore";
import Navbar from "components/Navbar";
import { Loader2, PackageOpen, Truck, ShoppingBag, BarChart3, Bell, Trash2 } from "lucide-react";
import brain from "brain";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define types
interface SupplierProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface SupplierOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface SupplierOrder {
  id: string;
  supplierItems: SupplierOrderItem[];
  supplierSubtotal: number;
  orderStatus: string;
  shippingInfo: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
  };
  createdAt: string;
}

const SupplierDashboard = () => {
  const { isAuthenticated, currentUser } = useUserAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!isAuthenticated || !currentUser) {
        navigate("/sign-in");
        return;
      }

      // Check if user is a supplier
      if (currentUser.role !== "supplier") {
        toast.error("You don't have supplier permissions");
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch supplier's products
        const productsResponse = await brain.get_supplier_products({ supplier_id: currentUser.id });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
          setStats(prev => ({ ...prev, totalProducts: productsData.products?.length || 0 }));
          
          // Calculate low stock products
          const lowStock = productsData.products?.filter(p => p.stock < 10).length || 0;
          setStats(prev => ({ ...prev, lowStockProducts: lowStock }));
        }

        // Fetch supplier's orders
        const ordersResponse = await brain.get_supplier_orders({ supplier_id: currentUser.id });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
          setStats(prev => ({ ...prev, totalOrders: ordersData.orders?.length || 0 }));
          
          // Calculate pending orders
          const pending = ordersData.orders?.filter(o => o.orderStatus === "pending" || o.orderStatus === "processing").length || 0;
          setStats(prev => ({ ...prev, pendingOrders: pending }));
          
          // Calculate new orders since last checked
          const lastCheckedTime = localStorage.getItem(`supplier_${currentUser.id}_last_checked`);
          setLastChecked(lastCheckedTime);
          
          if (lastCheckedTime) {
            const newOrders = ordersData.orders?.filter(o => {
              return new Date(o.createdAt) > new Date(lastCheckedTime);
            }).length || 0;
            setNewOrdersCount(newOrders);
          } else {
            // If never checked before, all orders are considered new
            setNewOrdersCount(ordersData.orders?.length || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching supplier data:", error);
        toast.error("Failed to load supplier data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplierData();
  }, [isAuthenticated, currentUser, navigate]);
  
  // Update last checked timestamp when viewing the orders tab
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id) {
      // Only update timestamp when switching to orders tab
      if (activeTab === "orders") {
        const now = new Date().toISOString();
        localStorage.setItem(`supplier_${currentUser.id}_last_checked`, now);
        setLastChecked(now);
        setNewOrdersCount(0); // Reset new orders count
      }
    }
  }, [activeTab, isAuthenticated, currentUser]);

  // Handle product status update
  const handleProductUpdate = (productId: string) => {
    // Navigate to product edit page
    navigate(`/supplier-product-edit?id=${productId}`);
  };

  // Handle product deletion
  const handleProductDelete = async (productId: string) => {
    try {
      const response = await brain.delete_product({ productId: productId });
      if (response.ok) {
        toast.success("Product deleted successfully");
        // Refresh products list
        const productsResponse = await brain.get_supplier_products({ supplier_id: currentUser?.id || "" });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
          setStats(prev => ({ ...prev, totalProducts: productsData.products?.length || 0 }));
          
          // Recalculate low stock products
          const lowStock = productsData.products?.filter(p => p.stock < 10).length || 0;
          setStats(prev => ({ ...prev, lowStockProducts: lowStock }));
        }
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    }
  };

  // Handle order processing
  const handleProcessOrder = (orderId: string) => {
    toast.promise(
      updateOrderStatus(orderId, "processing"),
      {
        loading: "Updating order status...",
        success: "Order marked as processing",
        error: "Failed to update order status"
      }
    );
  };

  // Handle order shipping
  const handleShipOrder = (orderId: string) => {
    toast.promise(
      updateOrderStatus(orderId, "shipped"),
      {
        loading: "Updating order status...",
        success: "Order marked as shipped",
        error: "Failed to update order status"
      }
    );
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await brain.update_order_status(
        { order_id: orderId },
        { status, notes: `Updated by supplier ${currentUser?.name}` }
      );

      if (response.ok) {
        // Refresh orders
        const ordersResponse = await brain.get_supplier_orders({ supplier_id: currentUser?.id || "" });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
          
          // Recalculate pending orders count
          const pending = ordersData.orders?.filter(o => 
            o.orderStatus === "pending" || o.orderStatus === "processing"
          ).length || 0;
          setStats(prev => ({ ...prev, pendingOrders: pending }));
        }
        return true;
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get order status badge color
  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Skeleton loader for products
  const ProductsSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center p-4 border rounded-lg animate-pulse">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for orders
  const OrdersSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-xl text-gray-600">Loading supplier dashboard...</span>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {currentUser?.name}! Manage your products and orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <PackageOpen className="h-8 w-8 text-blue-500 mr-2" />
                <span className="text-3xl font-bold">{stats.totalProducts}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-green-500 mr-2" />
                <span className="text-3xl font-bold">{stats.totalOrders}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-yellow-500 mr-2" />
                <span className="text-3xl font-bold">{stats.lowStockProducts}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-purple-500 mr-2" />
                <span className="text-3xl font-bold">{stats.pendingOrders}</span>
                {newOrdersCount > 0 && (
                  <div className="ml-2 flex items-center text-sm font-medium text-red-500">
                    <Bell className="h-4 w-4 mr-1" />
                    {newOrdersCount} new
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="products" onClick={() => setActiveTab("products")}>My Products</TabsTrigger>
            <TabsTrigger value="orders" onClick={() => setActiveTab("orders")}>
              Orders
              {newOrdersCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {newOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Products</h2>
              <Button>
                <Link to="/supplier-product-add">Add New Product</Link>
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ETB {product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={product.stock < 10 ? "text-red-600 font-semibold" : ""}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.featured ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Featured</Badge>
                          ) : (
                            <Badge variant="outline">Standard</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/supplier-product-edit?id=${product.id}`)}
                            >
                              Edit
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Product</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => document.querySelector('[data-state="open"]')?.closest('dialog')?.close()}>Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                      handleProductDelete(product.id);
                                      document.querySelector('[data-state="open"]')?.closest('dialog')?.close();
                                    }}
                                  >
                                    Delete Product
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <PackageOpen className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">You don't have any products yet</p>
                  <Button>
                    <Link to="/supplier-product-add">Add Your First Product</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>

            {newOrdersCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center">
                <Bell className="h-5 w-5 text-amber-500 mr-2" />
                <div>
                  <p className="font-medium text-amber-800">
                    You have {newOrdersCount} new order{newOrdersCount !== 1 ? 's' : ''} since your last visit
                  </p>
                  <p className="text-sm text-amber-600">
                    Last checked: {lastChecked ? new Date(lastChecked).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            )}
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order.id.substring(order.id.length - 6)}</CardTitle>
                        <Badge className={getOrderStatusColor(order.orderStatus)}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        Placed on {formatDate(order.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-t border-b py-4 my-2">
                        <h4 className="font-medium mb-2">Order Items</h4>
                        {order.supplierItems.map((item, index) => (
                          <div key={index} className="flex justify-between py-1">
                            <span>
                              {item.name} <span className="text-gray-500">× {item.quantity}</span>
                            </span>
                            <span>ETB {item.price.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                          <span>Subtotal</span>
                          <span>ETB {order.supplierSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-1">Shipping Address</h4>
                        <p className="text-gray-600">
                          {order.shippingInfo.fullName}<br />
                          {order.shippingInfo.address}<br />
                          {order.shippingInfo.city}, {order.shippingInfo.state}<br />
                          {order.shippingInfo.country}<br />
                          {order.shippingInfo.phone}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" className="mr-2">
                        View Details
                      </Button>
                      {(order.orderStatus === "pending") && (
                        <Button onClick={() => handleProcessOrder(order.id)}>
                          Start Processing
                        </Button>
                      )}
                      {(order.orderStatus === "processing") && (
                        <Button onClick={() => handleShipOrder(order.id)}>
                          Mark as Shipped
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No orders found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
};

export default SupplierDashboard;
