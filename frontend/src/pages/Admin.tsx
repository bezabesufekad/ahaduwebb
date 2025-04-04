import React, { useState, useEffect, useMemo } from "react";
import brain from "../brain";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ToastProvider } from "../components/ToastProvider";
import { toast } from "sonner";
import { useAdminStore, User, set } from "../utils/adminStore";
import { useProductsStore, Product } from "../utils/productsStore";
import { useOrderStore, Order } from "../utils/orderStore";
import { useUserAuth } from "../utils/userAuthStore";
import { ADMIN_EMAIL } from "../utils/constants";

// Create or update a notification API endpoint to handle inventory alerts
const sendInventoryNotification = async (product: Product, message: string) => {
  try {
    const response = await brain.send_inventory_alert({
      product_id: product.id,
      product_name: product.name,
      current_stock: product.stock || 0,
      threshold: product.lowStockThreshold || 10,
      supplier_info: message
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('Inventory notification sent successfully');
      return true;
    } else {
      toast.error('Failed to send inventory notification');
      return false;
    }
  } catch (error) {
    console.error('Error sending inventory notification:', error);
    toast.error('Failed to send inventory notification');
    return false;
  }
};

export default function Admin() {
  // State for dashboard data loading
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  
  // Categories state for product form
  const [categories, setCategories] = useState<Array<{id?: string, name: string}>>([]);

  // Fetch dashboard data and categories when the admin panel loads
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingDashboard(true);
      setDashboardError(null);
      try {
        const response = await brain.get_order_summary();
        const data = await response.json();
        setOrderSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardError('Failed to fetch some dashboard data. Some information may be incomplete.');
        // Don't show toast error to avoid disrupting the user experience
      } finally {
        setIsLoadingDashboard(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await brain.get_categories({});
        const data = await response.json();
        if (data && data.categories) {
          // Transform categories into the format we need
          const formattedCategories = data.categories.map((name: string) => ({ name }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback categories if API fails
        setCategories([
          { name: 'Electronics' },
          { name: 'Clothing' },
          { name: 'Home & Kitchen' },
          { name: 'Beauty & Personal Care' },
          { name: 'Sports & Outdoors' },
          { name: 'Preorder' }
        ]);
      }
    };
    
    fetchDashboardData();
    fetchCategories();
  }, []);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useUserAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'analytics' | 'inventory'>('dashboard');
  
  // Price range state for products filtering
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  
  // Customer notification state
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedOrderForNotification, setSelectedOrderForNotification] = useState<Order | null>(null);
  const [notificationSending, setNotificationSending] = useState(false);
  
  // Helper functions for sending notifications
  const sendCustomerNotification = async (order: Order, message: string) => {
    setNotificationSending(true);
    try {
      const response = await brain.send_customer_notification({
        orderId: order.id,
        customerEmail: order.shippingInfo?.email || '',
        customerName: order.shippingInfo?.name || order.shippingInfo?.fullName || '',
        message: message,
        orderStatus: order.status
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Notification sent to customer successfully');
        return true;
      } else {
        toast.error('Failed to send notification to customer');
        return false;
      }
    } catch (error) {
      console.error('Error sending customer notification:', error);
      toast.error('Failed to send notification to customer');
      return false;
    } finally {
      setNotificationSending(false);
    }
  };


  // Customer notification dialog
  const handleShowNotificationDialog = (order: Order) => {
    setSelectedOrderForNotification(order);
    setNotificationMessage(`Dear ${order.shippingInfo?.name || order.shippingInfo?.fullName || 'Customer'},\n\nRegarding your order #${order.id.slice(-8)} with status: ${order.status}\n\n`);
    setShowNotificationDialog(true);
  };
  
  const handleSendNotification = async () => {
    if (!selectedOrderForNotification || !notificationMessage.trim()) {
      toast.error('Please enter a message to send');
      return;
    }
    
    const success = await sendCustomerNotification(selectedOrderForNotification, notificationMessage);
    if (success) {
      setShowNotificationDialog(false);
      setNotificationMessage('');
      setSelectedOrderForNotification(null);
    }
  };

  
  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be signed in to access the admin panel");
      navigate('/sign-in');
      return;
    }
    
    // Check if user is admin (in a real app, this would check a role in the database)
    if (currentUser?.email !== ADMIN_EMAIL) {
      toast.error("You don't have permission to access the admin panel");
      navigate('/');
      return;
    }
    
    // Load users when admin panel is first opened
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        await useAdminStore.getState().fetchUsers();
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, [isAuthenticated, currentUser, navigate]);
  
  // Admin store
  const { 
    updateProduct, 
    deleteProduct, 
    addProduct,
    updateOrderStatus,
    deleteOrder,
    users,
    updateUserStatus,
    deleteUser
  } = useAdminStore();
  
  // Product store
  const { products } = useProductsStore();
  
  // Order store
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // Load orders when admin panel is first opened
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoadingOrders(true);
      setOrderError(null);
      try {
        const response = await brain.get_all_orders({});
        const data = await response.json();
        if (data && data.orders) {
          setOrders(data.orders);
        } else {
          setOrderError('No orders found or invalid data format');
          setOrders([]);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrderError('Failed to load orders. Please try again.');
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    
    loadOrders();
  }, []);
  
  
  // State for bulk operations
  const [selectedItems, setSelectedItems] = useState<{
    products: string[];
    orders: string[];
    users: string[];
  }>({
    products: [],
    orders: [],
    users: []
  });

  // Inventory management state
  const [inventoryFilters, setInventoryFilters] = useState({
    lowStockOnly: false,
    searchQuery: '',
    category: ''
  });
  
  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    email: '',
    subject: '',
    message: ''
  });
  
  // Product form state
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    image: '',
    additionalImages: [], // Array to store additional product images
    category: '',
    description: '',
    colors: [],
    sizes: [],
    stock: 100, // Default stock value
    lowStockThreshold: 10, // Default threshold for low stock alerts
    shopName: 'Ahadu Market' // Default shop name
  });
  
  // Selected product for editing
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Selected order for viewing/editing
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Selected user for viewing/editing
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Loading state for user operations
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Table headers
  const productHeaders = ['ID', 'Image', 'Name', 'Price', 'Category', 'Actions'];
  const orderHeaders = ['Order ID', 'Customer', 'Total', 'Date', 'Status', 'Actions'];
  const userHeaders = ['ID', 'Name', 'Email', 'Status', 'Registered', 'Actions'];
  
  // Handle product form changes
  // Bulk selection handlers
  const handleSelectAllProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(prev => ({
        ...prev,
        products: products.map(p => p.id)
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        products: []
      }));
    }
  };

  const handleSelectAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(prev => ({
        ...prev,
        orders: orders.map(o => o.id)
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        orders: []
      }));
    }
  };

  const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(prev => ({
        ...prev,
        users: users.map(u => u.id)
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        users: []
      }));
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    setSelectedItems(prev => {
      if (checked) {
        return {
          ...prev,
          products: [...prev.products, id]
        };
      } else {
        return {
          ...prev,
          products: prev.products.filter(pId => pId !== id)
        };
      }
    });
  };

  const handleSelectOrder = (id: string, checked: boolean) => {
    setSelectedItems(prev => {
      if (checked) {
        return {
          ...prev,
          orders: [...prev.orders, id]
        };
      } else {
        return {
          ...prev,
          orders: prev.orders.filter(oId => oId !== id)
        };
      }
    });
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    setSelectedItems(prev => {
      if (checked) {
        return {
          ...prev,
          users: [...prev.users, id]
        };
      } else {
        return {
          ...prev,
          users: prev.users.filter(uId => uId !== id)
        };
      }
    });
  };

  // Bulk action handlers
  const handleBulkDeleteProducts = () => {
    if (selectedItems.products.length === 0) {
      toast.error("No products selected");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.products.length} products?`)) {
      // In a real app, this would be a batch operation to delete multiple products at once
      // For now, we'll delete them one by one
      const deletePromises = selectedItems.products.map(id => deleteProduct(id));
      
      Promise.all(deletePromises)
        .then(() => {
          toast.success(`${selectedItems.products.length} products deleted successfully`);
          setSelectedItems(prev => ({ ...prev, products: [] }));
        })
        .catch(error => {
          console.error('Error deleting products:', error);
          toast.error("Failed to delete some products");
        });
    }
  };

  const handleBulkUpdateProductCategory = (category: string) => {
    if (selectedItems.products.length === 0) {
      toast.error("No products selected");
      return;
    }

    if (window.confirm(`Are you sure you want to update the category of ${selectedItems.products.length} products to "${category}"?`)) {
      // Find the selected products
      const productsToUpdate = products.filter(p => selectedItems.products.includes(p.id));
      
      // Update each product's category
      const updatePromises = productsToUpdate.map(product => {
        return updateProduct(product.id, {
          ...product,
          category
        });
      });
      
      Promise.all(updatePromises)
        .then(() => {
          toast.success(`Updated category for ${selectedItems.products.length} products`);
        })
        .catch(error => {
          console.error('Error updating products:', error);
          toast.error("Failed to update some products");
        });
    }
  };

  const handleBulkUpdateOrderStatus = (status: string) => {
    if (selectedItems.orders.length === 0) {
      toast.error("No orders selected");
      return;
    }

    if (window.confirm(`Are you sure you want to update the status of ${selectedItems.orders.length} orders to "${status}"?`)) {
      // Find the selected orders
      const ordersToUpdate = orders.filter(o => selectedItems.orders.includes(o.id));
      
      // Update each order's status
      const updatePromises = ordersToUpdate.map(order => {
        return updateOrderStatus(order.id, status);
      });
      
      Promise.all(updatePromises)
        .then(() => {
          toast.success(`Updated status for ${selectedItems.orders.length} orders`);
          setSelectedItems(prev => ({ ...prev, orders: [] }));
        })
        .catch(error => {
          console.error('Error updating orders:', error);
          toast.error("Failed to update some orders");
        });
    }
  };

  const handleBulkUpdateUserStatus = (status: string) => {
    if (selectedItems.users.length === 0) {
      toast.error("No users selected");
      return;
    }

    if (window.confirm(`Are you sure you want to update the status of ${selectedItems.users.length} users to "${status}"?`)) {
      setIsUpdatingUser(true);
      
      // Find the selected users
      const usersToUpdate = users.filter(u => selectedItems.users.includes(u.id));
      
      // Update each user's status directly using the API
      const updatePromises = usersToUpdate.map(user => {
        return brain.update_user_status(
          { user_id: user.id },
          { status: status as any }
        );
      });
      
      Promise.all(updatePromises)
        .then(async () => {
          toast.success(`Updated status for ${selectedItems.users.length} users`);
          setSelectedItems(prev => ({ ...prev, users: [] }));
          
          // Refresh the users list to ensure UI is in sync with database
          await useAdminStore.getState().fetchUsers();
        })
        .catch(error => {
          console.error('Error updating users:', error);
          toast.error("Failed to update some users");
        })
        .finally(() => {
          setIsUpdatingUser(false);
        });
    }
  };

  const handleBulkDeleteUsers = () => {
    if (selectedItems.users.length === 0) {
      toast.error("No users selected");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.users.length} users?`)) {
      setIsUpdatingUser(true);
      
      // Delete users directly using the API
      const deletePromises = selectedItems.users.map(id => 
        brain.delete_user({ userId: id })
      );
      
      Promise.all(deletePromises)
        .then(async () => {
          toast.success(`${selectedItems.users.length} users deleted successfully`);
          setSelectedItems(prev => ({ ...prev, users: [] }));
          
          // Refresh the users list to ensure UI is in sync with database
          await useAdminStore.getState().fetchUsers();
        })
        .catch(error => {
          console.error('Error deleting users:', error);
          toast.error("Failed to delete some users");
        })
        .finally(() => {
          setIsUpdatingUser(false);
        });
    }
  };

  // Handle adding an additional image to product form
  const handleAddAdditionalImage = (imageUrl: string) => {
    setProductForm(prev => ({
      ...prev,
      additionalImages: [...(prev.additionalImages || []), imageUrl]
    }));
  };

  // Handle removing an additional image from product form
  const handleRemoveAdditionalImage = (index: number) => {
    setProductForm(prev => {
      const newImages = [...(prev.additionalImages || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        additionalImages: newImages
      };
    });
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle product form submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedProduct) {
        // Update existing product
        console.log('Updating product with form data:', {
          ...selectedProduct,
          ...productForm,
          stock: productForm.stock !== undefined ? productForm.stock : selectedProduct.stock,
          featured: productForm.featured !== undefined ? productForm.featured : selectedProduct.featured
        });
        
        // Use direct brain API call to ensure updates are properly processed
        const response = await brain.update_product(
          { product_id: selectedProduct.id },
          {
            name: productForm.name,
            description: productForm.description,
            price: productForm.price,
            category: productForm.category,
            stock: productForm.stock !== undefined ? productForm.stock : selectedProduct.stock,
            images: [productForm.image, ...(productForm.additionalImages || [])],
            featured: productForm.featured !== undefined ? productForm.featured : selectedProduct.featured,
            shopName: productForm.shopName || 'Ahadu Market'
          }
        );
        
        if (response.ok) {
          toast.success("Product updated successfully");
          // Refresh products to ensure UI stays in sync
          await useProductsStore.getState().refreshProducts();
        } else {
          toast.error("Failed to update product");
        }
      } else {
        // Add new product
        if (
          !productForm.name ||
          !productForm.price ||
          !productForm.image ||
          !productForm.category ||
          !productForm.description
        ) {
          toast.error("Please fill all required fields");
          return;
        }
        
        console.log('Adding new product with form data:', {
          ...productForm,
          stock: productForm.stock || 0,
          featured: productForm.featured || false
        });
        
        // Use direct brain API call to ensure product is created properly
        const response = await brain.create_product({
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          category: productForm.category,
          stock: productForm.stock || 0,
          images: [productForm.image, ...(productForm.additionalImages || [])],
          featured: productForm.featured !== undefined ? productForm.featured : false,
          shopName: productForm.shopName || 'Ahadu Market',
          specifications: {}
        });
        
        if (response.ok) {
          toast.success("Product added successfully");
          // Refresh products to ensure UI stays in sync
          await useProductsStore.getState().refreshProducts();
        } else {
          toast.error("Failed to add product");
        }
      }
      
      // Reset form
      setProductForm({
        name: '',
        price: 0,
        image: '',
        additionalImages: [],
        category: '',
        description: '',
        colors: [],
        sizes: [],
        stock: 0,
        featured: false,
        shopName: 'Ahadu Market'
      });
      setSelectedProduct(null);
    } catch (error) {
      toast.error("Error saving product");
      console.error(error);
    }
  };
  
  // Edit product
  const handleEditProduct = (product: Product) => {
    console.log('Editing product:', product);
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      additionalImages: product.additionalImages || [],
      category: product.category,
      description: product.description,
      colors: product.colors,
      sizes: product.sizes,
      stock: product.stock !== undefined ? product.stock : 0,
      featured: product.featured !== undefined ? product.featured : false,
      shopName: product.shopName || 'Ahadu Market'
    });
  };
  
  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const result = await deleteProduct(id);
        if (result) {
          toast.success("Product deleted successfully");
        } else {
          toast.error("Failed to delete product");
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error("Failed to delete product");
      }
    }
  };
  
  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const success = await updateOrderStatus(orderId, status);
      if (success) {
        toast.success(`Order status updated to ${status}`);
        setSelectedOrder(null);
      } else {
        toast.error(`Failed to update order status`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`An error occurred while updating order status`);
    }
  };
  
  // Delete order
  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const success = await deleteOrder(id);
        if (success) {
          toast.success("Order deleted successfully");
        } else {
          toast.error("Failed to delete order");
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error("Failed to delete order");
      }
    }
  };
  
  // Update user status
  const handleUpdateUserStatus = async (userId: string, status: User['status']) => {
    setIsUpdatingUser(true);
    try {
      const response = await brain.update_user_status(
        { user_id: userId },
        { status: status }
      );
      
      if (response.ok) {
        // Update local state
        const users = useAdminStore.getState().users;
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, status } : user
        );
        // Update users state in the component
        set({ users: updatedUsers });
        
        toast.success(`User status updated to ${status}`);
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, status } : null);
        }
        
        // Refresh users list
        await useAdminStore.getState().fetchUsers();
        return true;
      } else {
        toast.error('Failed to update user status');
        return false;
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('An error occurred while updating user status');
      return false;
    } finally {
      setIsUpdatingUser(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setIsUpdatingUser(true);
      try {
        const response = await brain.delete_user({ userId: id });
        
        if (response.ok) {
          // Update local state through the AdminStore
          const users = useAdminStore.getState().users;
          const updatedUsers = users.filter(u => u.id !== id);
          set({ users: updatedUsers });
          
          toast.success("User deleted successfully");
          
          // If there was a selected user and it was deleted, clear selection
          if (selectedUser && selectedUser.id === id) {
            setSelectedUser(null);
          }
          
          // Refresh users list
          await useAdminStore.getState().fetchUsers();
        } else {
          toast.error("Failed to delete user");
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setIsUpdatingUser(false);
      }
    }
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };
  
  // Check inventory levels and send alerts if necessary
  useEffect(() => {
    const checkLowInventory = () => {
      products.forEach(product => {
        if ((product.stock || 0) <= (product.lowStockThreshold || 10) && (product.stock || 0) > 0) {
          // Send alert for low stock items
          // In a production environment, we would have controls to manage notification frequency
          const message = `Product ${product.name} is running low with only ${product.stock} units remaining. Please consider restocking.`;
          sendInventoryNotification(product, message);
        }
      });
    };
    
    // Check inventory when products change
    if (products.length > 0) {
      checkLowInventory();
    }
  }, [products]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const generateMonthlySalesData = (orderData: Order[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data for all months
    const monthlySales = months.map(month => ({
      name: month,
      value: 0
    }));
    
    // Aggregate order amounts by month
    orderData.forEach(order => {
      const orderDate = new Date(order.createdAt);
      // Only include orders from current year
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        monthlySales[monthIndex].value += order.totalAmount;
      }
    });
    
    return monthlySales;
  };
  
  const getOrderStatusDistribution = (orderData: Order[]) => {
    const statusCounts: Record<string, number> = {};
    
    // Count orders by status
    orderData.forEach(order => {
      if (!statusCounts[order.status]) {
        statusCounts[order.status] = 0;
      }
      statusCounts[order.status]++;
    });
    
    // Convert to array for recharts
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };
  
  const getCategoryDistribution = (productData: Product[]) => {
    const categoryCounts: Record<string, number> = {};
    
    // Count products by category
    productData.forEach(product => {
      if (!categoryCounts[product.category]) {
        categoryCounts[product.category] = 0;
      }
      categoryCounts[product.category]++;
    });
    
    // Convert to array for recharts
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by count (descending)
  };
  
  const generateRecentActivities = (orderData: Order[], productData: Product[], userData: User[]) => {
    // Combine different types of activities
    const activities = [
      // Recent orders
      ...orderData.slice(0, 3).map(order => ({
        type: 'order',
        title: `New order #${order.id.slice(-8)} for ${formatCurrency(order.totalAmount)}`,
        time: formatDate(order.createdAt),
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      })),
      
      // Recently added products
      ...productData.slice(0, 2).map(product => ({
        type: 'product',
        title: `Added new product: ${product.name}`,
        time: '2 days ago', // Mock data since product doesn't have timestamp
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      })),
      
      // New users
      ...userData.slice(0, 2).map(user => ({
        type: 'user',
        title: `New user registered: ${user.fullName}`,
        time: formatDate(user.registeredAt),
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        )
      }))
    ];
    
    // Sort by time (most recent first) and limit to 5
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  };
  
  const getLowStockProducts = (productData: Product[]) => {
    // Filter products that are below their low stock threshold
    // In a real implementation, this would use actual stock field from database
    return productData
      .filter(product => (product.stock || 0) < (product.lowStockThreshold || 10))
      .sort((a, b) => (a.stock || 0) - (b.stock || 0)) // Sort by lowest stock first
      .slice(0, 5); // Limit to 5 products for display
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Prepare analytics data for the dashboard
  const dashboardData = useMemo(() => {
    // Fallback to generated data if API data is not available
    return {
      monthlySalesData: generateMonthlySalesData(orders),
      orderStatusData: getOrderStatusDistribution(orders),
      categoryData: getCategoryDistribution(products),
      activities: generateRecentActivities(orders, products, users),
      lowStockItems: getLowStockProducts(products),
      revenueSummary: {
        totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        weeklyRevenue: orders.reduce((sum, order) => {
          const orderDate = new Date(order.createdAt);
          const now = new Date();
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return orderDate >= weekAgo ? sum + order.totalAmount : sum;
        }, 0),
        monthlyRevenue: orders.reduce((sum, order) => {
          const orderDate = new Date(order.createdAt);
          const now = new Date();
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return orderDate >= monthAgo ? sum + order.totalAmount : sum;
        }, 0),
        averageOrderValue: orders.length > 0 ? 
          orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0
      }
    };
  }, [orders, products, users, orderSummary]);
  
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-end mb-4 gap-2">
            <button
            onClick={() => navigate('/admin-panel')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Advanced Panel
          </button>
          <button
            onClick={() => {
              navigate('/');
              toast.success("Returned to homepage");
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Store
          </button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your e-commerce store efficiently</p>
        </div>
        
        {/* Admin Navigation */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto bg-white rounded-lg shadow-sm p-1">
          <button 
            className={`py-3 px-6 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Dashboard
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('products')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Products
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Orders
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('users')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Users
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            Inventory
          </button>
          <button 
            className={`py-3 px-6 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Analytics
          </button>
        </div>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-blue-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500 font-medium">+12%</span> from last month
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Total Revenue Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-yellow-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500 font-medium">+15%</span> from last month
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-green-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500 font-medium">+5%</span> from last month
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-purple-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500 font-medium">+8%</span> from last month
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Sales Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-medium mb-4">Monthly Sales</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area type="monotone" dataKey="value" stroke="#1a3a8f" fill="#1a3a8f" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Order Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-medium mb-4">Order Status Distribution</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={dashboardData.orderStatusData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        fill="#8884d8"
                        label
                      >
                        {dashboardData.orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} orders`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent Activity and Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {dashboardData.activities.map((activity, index) => (
                    <div key={index} className="flex">
                      <div className={`${activity.iconBg} ${activity.iconColor} p-2 rounded-full mr-3 flex-shrink-0`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Low Stock Alerts */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Low Stock Alerts</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors">
                      Bulk Restock
                    </button>
                    <button className="px-3 py-1.5 bg-green-50 text-green-600 rounded text-sm font-medium hover:bg-green-100 transition-colors">
                      Email Notifications
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {dashboardData.lowStockItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="h-8 w-8 rounded object-cover mr-3" />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        <p className="text-xs font-medium text-red-600">{item.stock} left in stock</p>
                        <button 
                          className="text-xs mt-1 text-primary hover:underline"
                          onClick={() => handleEditProduct(item)} // Edit the low stock product
                        >
                          Restock now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Category Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-medium mb-4">Product Categories</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} products`} />
                    <Bar dataKey="value" fill="#1a3a8f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Advanced Search & Filtering</h2>
              
              {/* Product filters */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input 
                      id="searchTerm"
                      type="text" 
                      placeholder="Search by name, description or ID..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div className="md:w-48">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      id="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id || category.name} value={category.id || category.name.toLowerCase()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="flex items-center gap-2">
                      <input 
                        id="minPrice"
                        type="number" 
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      />
                      <span className="text-gray-500">to</span>
                      <input 
                        id="maxPrice"
                        type="number" 
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-48">
                    <label htmlFor="stockFilter" className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                    <select 
                      id="stockFilter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">All Products</option>
                      <option value="inStock">In Stock</option>
                      <option value="lowStock">Low Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h2>
              
              <form onSubmit={handleProductSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={productForm.name || ''}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={productForm.price || ''}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Main Product Image</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        id="image"
                        name="image"
                        value={productForm.image || ''}
                        onChange={handleProductFormChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                        placeholder="Enter image URL or upload an image"
                        required
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                // Set the data URL as the image value
                                handleProductFormChange({
                                  target: {
                                    name: 'image',
                                    value: reader.result as string
                                  }
                                } as any);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                    {productForm.image && (
                      <div className="mt-2">
                        <img src={productForm.image} alt="Product preview" className="h-20 w-20 object-cover rounded-md border border-gray-200" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={productForm.category || ''}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id || category.name.toLowerCase()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={productForm.stock || ''}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={productForm.shopName || 'Ahadu Market'}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      placeholder="Ahadu Market"
                    />
                    <p className="text-xs text-gray-500 mt-1">Store or shop name for this product</p>
                  </div>
                  
                  <div>
                    <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-700 mb-1">Additional Images</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(productForm.additionalImages || []).map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Additional image ${index + 1}`} 
                            className="h-16 w-16 object-cover rounded-md border border-gray-200" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        id="additionalImageUrl"
                        name="additionalImageUrl"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                        placeholder="Enter additional image URL or upload"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="additionalImageUpload"
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              // Process multiple files
                              Array.from(e.target.files).forEach(file => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleAddAdditionalImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              });
                              // Clear the file input after upload
                              (e.target as HTMLInputElement).value = '';
                              toast.success(`${e.target.files.length} image${e.target.files.length > 1 ? 's' : ''} added successfully`);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Upload Multiple
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('additionalImageUrl') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleAddAdditionalImage(input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Add multiple images to showcase your product from different angles</p>
                  </div>
                  
                  <div>
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      value={productForm.lowStockThreshold || ''}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">You'll receive alerts when stock falls below this number</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={productForm.description || ''}
                    onChange={handleProductFormChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setProductForm({
                          name: '',
                          price: 0,
                          image: '',
                          additionalImages: [],
                          category: '',
                          description: '',
                          colors: [],
                          sizes: []
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    {selectedProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Products Management</h2>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">{products.length} products found</p>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button 
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                        onClick={() => document.getElementById('bulkCategoryMenu')?.classList.toggle('hidden')}
                        disabled={selectedItems.products.length === 0}
                      >
                        Bulk Edit Category
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div id="bulkCategoryMenu" className="absolute mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10 hidden">
                        <ul className="py-1">
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateProductCategory('electronics')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Electronics
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateProductCategory('clothing')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Clothing
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateProductCategory('home')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Home & Kitchen
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateProductCategory('beauty')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Beauty & Personal Care
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateProductCategory('sports')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Sports & Outdoors
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 transition-colors flex items-center"
                      onClick={handleBulkDeleteProducts}
                      disabled={selectedItems.products.length === 0}
                    >
                      Bulk Delete {selectedItems.products.length > 0 && `(${selectedItems.products.length})`}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-primary focus:ring-primary-light rounded"
                            onChange={handleSelectAllProducts}
                            checked={selectedItems.products.length === products.length && products.length > 0}
                          />
                        </div>
                      </th>
                      {productHeaders.map((header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-primary focus:ring-primary-light rounded"
                              checked={selectedItems.products.includes(product.id)}
                              onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={product.image}
                              alt={product.name}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <p>{product.name}</p>
                            {(product.stock || 0) <= (product.lowStockThreshold || 10) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Low Stock: {product.stock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{products.length}</span> of{" "}
                    <span className="font-medium">{products.length}</span> results
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
// Inventory view
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Inventory Management</h2>
                <p className="text-gray-600 mt-1">Track and manage product stock levels</p>
              </div>
              
              {/* Inventory Filters */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      placeholder="Search products..."
                      value={inventoryFilters.searchQuery}
                      onChange={(e) => setInventoryFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    />
                  </div>
                  
                  <div className="w-full md:w-48">
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      value={inventoryFilters.category}
                      onChange={(e) => setInventoryFilters(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id || category.name} value={category.id || category.name.toLowerCase()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lowStockOnly"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={inventoryFilters.lowStockOnly}
                      onChange={(e) => setInventoryFilters(prev => ({ ...prev, lowStockOnly: e.target.checked }))}
                    />
                    <label htmlFor="lowStockOnly" className="text-sm font-medium text-gray-700">
                      Low Stock Only
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Low Stock Threshold
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products
                      .filter(p => {
                        // Apply filters
                        const matchesSearch = inventoryFilters.searchQuery === '' ||
                          p.name.toLowerCase().includes(inventoryFilters.searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(inventoryFilters.searchQuery.toLowerCase());
                          
                        const matchesCategory = inventoryFilters.category === '' ||
                          p.category === inventoryFilters.category;
                          
                        const matchesLowStock = !inventoryFilters.lowStockOnly ||
                          (p.stock || 0) <= (p.lowStockThreshold || 10);
                          
                        return matchesSearch && matchesCategory && matchesLowStock;
                      })
                      .map((product) => {
                        const isLowStock = (product.stock || 0) <= (product.lowStockThreshold || 10);
                        const isOutOfStock = (product.stock || 0) === 0;
                        
                        return (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{formatCurrency(product.price)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.stock || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                  value={product.lowStockThreshold || 10}
                                  min="1"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                      updateProduct(product.id, {
                                        name: product.name,
                                        price: product.price,
                                        description: product.description,
                                        image: product.image,
                                        additionalImages: product.additionalImages,
                                        category: product.category,
                                        stock: product.stock,
                                        lowStockThreshold: value
                                      });
                                    }
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isOutOfStock ? 'bg-red-100 text-red-800' : isLowStock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    // Prepare a notification message
                                    const message = `Product ${product.name} is ${isOutOfStock ? 'out of stock' : 'running low'} with only ${product.stock} units remaining. Please consider restocking.`;
                                    
                                    // Send notification
                                    sendInventoryNotification(product, message);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                  disabled={!isLowStock && !isOutOfStock}
                                >
                                  Alert
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              
              {/* No Results Message */}
              {products.filter(p => {
                const matchesSearch = inventoryFilters.searchQuery === '' ||
                  p.name.toLowerCase().includes(inventoryFilters.searchQuery.toLowerCase()) ||
                  p.description.toLowerCase().includes(inventoryFilters.searchQuery.toLowerCase());
                  
                const matchesCategory = inventoryFilters.category === '' ||
                  p.category === inventoryFilters.category;
                  
                const matchesLowStock = !inventoryFilters.lowStockOnly ||
                  (p.stock || 0) <= (p.lowStockThreshold || 10);
                  
                return matchesSearch && matchesCategory && matchesLowStock;
              }).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found matching the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Advanced Order Filtering</h2>
              
              {/* Order filters */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="orderSearch" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input 
                      id="orderSearch"
                      type="text" 
                      placeholder="Search by order ID or customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div className="md:w-48">
                    <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <select 
                      id="orderStatus"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <div className="w-full">
                        <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">From</label>
                        <input 
                          id="startDate"
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <div className="w-full">
                        <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">To</label>
                        <input 
                          id="endDate"
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-48">
                    <label htmlFor="amountRange" className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                    <div className="flex items-center gap-2">
                      <input 
                        id="minAmount"
                        type="number" 
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      />
                      <span className="text-gray-500">to</span>
                      <input 
                        id="maxAmount"
                        type="number" 
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Orders Management</h2>
                <div className="flex justify-between items-center mb-4">
                  {isLoadingOrders ? (
                    <p className="text-sm text-gray-600">Loading orders...</p>
                  ) : orderError ? (
                    <p className="text-sm text-red-600">{orderError}</p>
                  ) : (
                    <p className="text-sm text-gray-600">{orders.length} orders found</p>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button 
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                        onClick={() => document.getElementById('bulkOrderStatusMenu')?.classList.toggle('hidden')}
                        disabled={selectedItems.orders.length === 0 || isLoadingOrders}
                      >
                        Bulk Update Status
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div id="bulkOrderStatusMenu" className="absolute mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10 hidden">
                        <ul className="py-1">
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateOrderStatus('pending')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Pending
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateOrderStatus('processing')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Processing
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateOrderStatus('shipped')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Shipped
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateOrderStatus('delivered')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Delivered
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateOrderStatus('completed')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Completed
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateOrderStatus('cancelled')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Cancelled
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-green-50 text-green-600 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-primary focus:ring-primary-light rounded"
                            onChange={handleSelectAllOrders}
                            checked={selectedItems.orders.length === orders.length && orders.length > 0}
                          />
                        </div>
                      </th>
                      {orderHeaders.map((header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-primary focus:ring-primary-light rounded"
                              checked={selectedItems.orders.includes(order.id)}
                              onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.shippingInfo?.firstName || order.shippingInfo?.fullName?.split(' ')[0] || 'N/A'} {order.shippingInfo?.lastName || order.shippingInfo?.fullName?.split(' ').slice(1).join(' ') || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'delivered' || order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900 transition-colors mr-2"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleShowNotificationDialog(order)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              Notify
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{orders.length}</span> of{" "}
                    <span className="font-medium">{orders.length}</span> results
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">User Search & Filtering</h2>
              
              {/* User filters */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input 
                      id="userSearch"
                      type="text" 
                      placeholder="Search by name, email or phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div className="md:w-48">
                    <label htmlFor="userStatus" className="block text-sm font-medium text-gray-700 mb-1">User Status</label>
                    <select 
                      id="userStatus"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <div className="w-full">
                        <label htmlFor="regStartDate" className="block text-xs text-gray-500 mb-1">From</label>
                        <input 
                          id="regStartDate"
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <div className="w-full">
                        <label htmlFor="regEndDate" className="block text-xs text-gray-500 mb-1">To</label>
                        <input 
                          id="regEndDate"
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-48">
                    <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                    <select 
                      id="userRole"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Users Management</h2>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">{users.length} users found</p>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button 
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                        onClick={() => document.getElementById('bulkUserStatusMenu')?.classList.toggle('hidden')}
                        disabled={selectedItems.users.length === 0}
                      >
                        Bulk Update Status
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div id="bulkUserStatusMenu" className="absolute mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10 hidden">
                        <ul className="py-1">
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateUserStatus('active')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Active
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateUserStatus('inactive')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Inactive
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleBulkUpdateUserStatus('banned')} 
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Banned
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 transition-colors flex items-center"
                      onClick={handleBulkDeleteUsers}
                      disabled={selectedItems.users.length === 0 || isUpdatingUser}
                    >
                      Bulk Delete {selectedItems.users.length > 0 && `(${selectedItems.users.length})`}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-primary focus:ring-primary-light rounded"
                            onChange={handleSelectAllUsers}
                            checked={selectedItems.users.length === users.length && users.length > 0}
                          />
                        </div>
                      </th>
                      {userHeaders.map((header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-primary focus:ring-primary-light rounded"
                              checked={selectedItems.users.includes(user.id)}
                              onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                              disabled={isUpdatingUser}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : user.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(user.registeredAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={user.status}
                              onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as User['status'])}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              disabled={isUpdatingUser}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="banned">Banned</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              disabled={isUpdatingUser}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of{" "}
                    <span className="font-medium">{users.length}</span> results
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      
      {/* Customer Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Notification to Customer</DialogTitle>
            <DialogDescription>
              {selectedOrderForNotification && (
                <p className="text-sm text-gray-500">
                  Sending to {selectedOrderForNotification.shippingInfo?.name || selectedOrderForNotification.shippingInfo?.fullName || 'Customer'} (Order #{selectedOrderForNotification.id.slice(-8)})
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter your message to the customer..."
              className="min-h-[150px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)} disabled={notificationSending}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={notificationSending || !notificationMessage.trim()}>
              {notificationSending ? 'Sending...' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}