import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Search, RefreshCw, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

interface CreateSupplierData {
  name: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  description: string;
}

interface UpdateSupplierData {
  name?: string;
  phone?: string;
  company?: string;
  description?: string;
  status?: string;
}

const AdminSupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  
  // New supplier form state
  const [newSupplier, setNewSupplier] = useState<CreateSupplierData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    description: ""
  });
  
  // Edit supplier form state
  const [editFormData, setEditFormData] = useState<UpdateSupplierData>({
    name: "",
    phone: "",
    company: "",
    description: "",
    status: ""
  });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params: { status?: string, search?: string } = {};
      
      if (activeStatus) {
        params.status = activeStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await brain.get_suppliers(params);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers);
        setTotalSuppliers(data.total);
      } else {
        toast.error("Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSuppliers();
  }, [activeStatus]);

  // Handle search
  const handleSearch = () => {
    fetchSuppliers();
  };

  // Handle form input change for new supplier
  const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({ ...prev, [name]: value }));
  };

  // Handle form input change for edit supplier
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open edit modal and populate form
  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditFormData({
      name: supplier.name,
      phone: supplier.phone || "",
      company: supplier.company || "",
      description: supplier.description || "",
      status: supplier.status
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  // Create new supplier
  const createSupplier = async () => {
    try {
      // Validate form
      if (!newSupplier.name || !newSupplier.email || !newSupplier.password) {
        toast.error("Please fill in all required fields");
        return;
      }

      const response = await brain.create_supplier(newSupplier);
      if (response.ok) {
        toast.success("Supplier created successfully");
        setIsAddModalOpen(false);
        setNewSupplier({
          name: "",
          email: "",
          password: "",
          phone: "",
          company: "",
          description: ""
        });
        fetchSuppliers();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.detail || "Failed to create supplier");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to create supplier");
    }
  };

  // Update supplier
  const updateSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      const response = await brain.update_supplier(
        { supplier_id: selectedSupplier.id },
        editFormData
      );
      
      if (response.ok) {
        toast.success("Supplier updated successfully");
        setIsEditModalOpen(false);
        fetchSuppliers();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.detail || "Failed to update supplier");
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
    }
  };

  // Delete supplier
  const deleteSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      const response = await brain.delete_supplier({ supplierId: selectedSupplier.id });
      
      if (response.ok) {
        toast.success("Supplier role removed successfully");
        setIsDeleteModalOpen(false);
        fetchSuppliers();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.detail || "Failed to remove supplier role");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to remove supplier role");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Suppliers Management</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search suppliers..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchSuppliers} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveStatus(value === "all" ? null : value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderSupplierTable()}
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {renderSupplierTable()}
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4">
          {renderSupplierTable()}
        </TabsContent>
        <TabsContent value="suspended" className="space-y-4">
          {renderSupplierTable()}
        </TabsContent>
      </Tabs>

      {/* Add Supplier Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Create a supplier account. The supplier will be able to manage their own products and orders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newSupplier.name}
                  onChange={handleNewSupplierChange}
                  placeholder="Supplier name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={handleNewSupplierChange}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newSupplier.password}
                  onChange={handleNewSupplierChange}
                  placeholder="Create password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newSupplier.phone}
                  onChange={handleNewSupplierChange}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                value={newSupplier.company}
                onChange={handleNewSupplierChange}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={newSupplier.description}
                onChange={handleNewSupplierChange}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={createSupplier}>Create Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier details and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  placeholder="Supplier name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company Name</Label>
              <Input
                id="edit-company"
                name="company"
                value={editFormData.company}
                onChange={handleEditFormChange}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={editFormData.status}
                onChange={handleEditFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={updateSupplier}>Update Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Supplier Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Remove Supplier Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the supplier role from {selectedSupplier?.name}?
              This will convert the account to a regular customer account.  
              All their products will remain in the system but will need to be reassigned to another supplier.  
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteSupplier}>Remove Supplier Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Helper function to render supplier table
  function renderSupplierTable() {
    // Loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading suppliers...</span>
        </div>
      );
    }

    // No suppliers found
    if (suppliers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4 text-center">No suppliers found</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Supplier
          </Button>
        </div>
      );
    }

    // Render suppliers table
    return (
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Name</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Email</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Company</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Status</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Created At</th>
              <th className="py-3 px-4 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="bg-white hover:bg-gray-50">
                <td className="py-3 px-4">{supplier.name}</td>
                <td className="py-3 px-4">{supplier.email}</td>
                <td className="py-3 px-4">{supplier.company || "-"}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={supplier.status} />
                </td>
                <td className="py-3 px-4">{formatDate(supplier.createdAt)}</td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(supplier)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteModal(supplier)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="py-3 px-4 bg-white border-t flex justify-between items-center text-sm text-gray-600">
          <span>Showing {suppliers.length} of {totalSuppliers} suppliers</span>
        </div>
      </div>
    );
  }

  // Helper function to format date
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Helper component for status badge
  function StatusBadge({ status }: { status: string }) {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }
};

export default AdminSupplierManagement;
