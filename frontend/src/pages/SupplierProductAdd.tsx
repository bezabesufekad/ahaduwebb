import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserAuth } from "utils/userAuthStore";
import Navbar from "components/Navbar";
import { PackageOpen, Loader2 } from "lucide-react";
import brain from "brain";

const SupplierProductAdd = () => {
  const { isAuthenticated, currentUser } = useUserAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Form state
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    salePrice: 0,
    category: "",
    stock: 0,
    images: [""],
    featured: false,
    brand: "",
    material: "",
    dimensions: "",
    weight: "",
    warranty: "",
    shippingPrice: 0
  });

  // Check authentication and role
  useEffect(() => {
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

    // Fetch categories
    const fetchCategories = async () => {
      try {
        // Get Ethiopian categories from constants
        const { ETHIOPIAN_CATEGORIES } = await import("utils/constants");
        
        // Also try to get from API
        try {
          const response = await brain.get_categories();
          if (response.ok) {
            const data = await response.json();
            if (data.categories && data.categories.length > 0) {
              // Combine API categories with Ethiopian ones
              const combinedCategories = [...new Set([...ETHIOPIAN_CATEGORIES, ...data.categories])];
              setCategories(combinedCategories);
            } else {
              // Use only Ethiopian categories
              setCategories(ETHIOPIAN_CATEGORIES);
            }
          } else {
            setCategories(ETHIOPIAN_CATEGORIES);
          }
        } catch (error) {
          console.error("Error fetching categories from API:", error);
          setCategories(ETHIOPIAN_CATEGORIES);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
        // Set default categories in case of error
        setCategories([
          "Traditional Clothing", "Coffee & Tea", "Electronics", "Fashion", 
          "Handmade Jewelry", "Leather Goods", "Spices & Teff", "Preorder"
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, currentUser, navigate]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === "price" || name === "salePrice" || name === "stock" || name === "shippingPrice" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setProductData(prev => ({
      ...prev,
      category: value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle image URL change
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...productData.images];
    newImages[index] = value;
    setProductData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Add new image field
  const addImageField = () => {
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  // Remove image field
  const removeImageField = (index: number) => {
    if (productData.images.length <= 1) return;
    
    const newImages = productData.images.filter((_, i) => i !== index);
    setProductData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!productData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (!productData.description.trim()) {
      toast.error("Product description is required");
      return;
    }
    
    if (productData.price <= 0) {
      toast.error("Product price must be greater than zero");
      return;
    }
    
    if (!productData.category) {
      toast.error("Product category is required");
      return;
    }
    
    if (productData.stock < 0) {
      toast.error("Product stock cannot be negative");
      return;
    }
    
    if (!productData.images[0] && imageFiles.length === 0) {
      toast.error("At least one product image is required");
      return;
    }
    
    // Filter out empty image URLs
    const filteredImages = productData.images.filter(img => img.trim() !== "");
    if (filteredImages.length === 0 && imageFiles.length === 0) {
      toast.error("At least one product image is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Process any uploaded files first - in a real implementation, this would upload to a server
      // and get back URLs, but for this demo we're using the object URLs directly
      const uploadedImages = imageFiles.map(file => URL.createObjectURL(file));
      
      // Combine uploaded images with manually entered URLs
      const allImages = [...filteredImages, ...uploadedImages].filter(url => url.trim() !== "");
      
      // Add supplier information
      const productWithSupplier = {
        ...productData,
        images: allImages,
        supplierId: currentUser.id,
        supplierName: currentUser.company || currentUser.name,
        shopName: currentUser.company || "Ahadu Market"
      };
      
      const response = await brain.create_product(productWithSupplier);
      
      if (response.ok) {
        toast.success("Product added successfully");
        navigate("/supplier-dashboard");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-xl text-gray-600">Loading...</span>
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
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/supplier-dashboard")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (ETB) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="salePrice">Sale Price (ETB) (optional)</Label>
                    <Input
                      id="salePrice"
                      name="salePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.salePrice || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={productData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={productData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Product Images *</Label>
                  <div className="mb-2 text-sm text-gray-500">Add image URLs or upload photos</div>
                  {productData.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-2">
                      <Input
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="Enter image URL"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImageField(index)}
                        disabled={productData.images.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center mt-3 space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addImageField}
                    >
                      Add Image URL
                    </Button>
                    <div className="relative">
                      <Input
                        type="file"
                        id="photo-upload"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            // Save actual files for later upload
                            const newFiles = Array.from(files);
                            setImageFiles(prev => [...prev, ...newFiles]);
                            
                            // Create preview URLs
                            for (let i = 0; i < files.length; i++) {
                              const imageUrl = URL.createObjectURL(files[i]);
                              if (i === 0 && productData.images[0] === "") {
                                // Replace first empty image
                                handleImageChange(0, imageUrl);
                              } else {
                                // Add new image
                                setProductData(prev => ({
                                  ...prev,
                                  images: [...prev.images, imageUrl]
                                }));
                              }
                            }
                          }
                        }}
                      />
                      <Button type="button" variant="secondary">
                        Upload Photos
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand (optional)</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={productData.brand || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="material">Material (optional)</Label>
                    <Input
                      id="material"
                      name="material"
                      value={productData.material || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dimensions">Dimensions (optional)</Label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      value={productData.dimensions || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., 10 x 5 x 3 inches"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (optional)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      value={productData.weight || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 kg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="warranty">Warranty (optional)</Label>
                    <Input
                      id="warranty"
                      name="warranty"
                      value={productData.warranty || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., 1 year"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shippingPrice">Shipping Price (ETB) (optional)</Label>
                    <Input
                      id="shippingPrice"
                      name="shippingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.shippingPrice || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={productData.featured}
                    onCheckedChange={(checked) => {
                      setProductData(prev => ({
                        ...prev,
                        featured: checked === true
                      }));
                    }}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">Mark as featured product</Label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-2"
                  onClick={() => navigate("/supplier-dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Product...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default SupplierProductAdd;
