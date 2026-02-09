import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Plus,
  LogOut,
  Search,
  Edit,
  Trash2,
  ShieldCheck,
  LayoutDashboard,
  Box,
  TrendingUp,
  Users,
  ImagePlus,
  Save,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Tag,
} from "lucide-react";
import adminProductApi, {
  AdminProductPayload,
  AdminProductResponse,
  AdminProductListItem,
  ProductSize,
  generateSlug,
  Category,
  Subcategory,
  SubcategoryPayload,
} from "@/services/adminApi";
import { transformImageUrl } from "@/types/product";

const allSizes = ["S", "M", "L", "XL", "XXL", "Custom"];

const colorOptions = [
  { id: "blue", name: "Blue" },
  { id: "red", name: "Red" },
  { id: "white", name: "White" },
  { id: "black", name: "Black" },
  { id: "brown", name: "Brown" },
  { id: "green", name: "Green" },
  { id: "gold", name: "Gold" },
  { id: "cream", name: "Cream" },
];

// Form data type
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  categoryId: string;
  subcategoryId: string;
  motif: string;
  colors: string[];
  isSingleSize: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  stockQuantity: number;
  weightGrams: number;
  sizes: { size: string; stockQuantity: number; isAvailable: boolean }[];
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  discountPrice: undefined,
  imageUrl: "",
  categoryId: "",
  subcategoryId: "",
  motif: "",
  colors: [],
  isSingleSize: false,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  stockQuantity: 0,
  weightGrams: 250,
  sizes: [],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, isAdmin, logoutAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // State - using lightweight list items for table view
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "subcategories">("products");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // Subcategories state
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState<SubcategoryPayload & { id?: number }>({
    name: "",
    category_id: 0,
    description: "",
    display_order: 0,
  });
  
  // Product detail view state
  const [viewingProduct, setViewingProduct] = useState<AdminProductResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, authLoading, navigate]);

  // Fetch categories on mount
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await adminProductApi.getCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch categories";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchCategories();
      if (activeTab === "subcategories") {
        fetchSubcategories();
      }
    }
  }, [isAdmin, activeTab]);
  
  // Fetch subcategories
  const fetchSubcategories = async () => {
    setIsLoadingSubcategories(true);
    try {
      const data = await adminProductApi.getSubcategories();
      setSubcategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch subcategories";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use lightweight list endpoint for table view
      const { products: data } = await adminProductApi.getProductsList();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch products";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subcategory_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProductId(null);
  };

  // Convert form data to API payload
  const formToPayload = (data: ProductFormData): AdminProductPayload => {
    const totalStock = data.sizes.length > 0
      ? data.sizes.reduce((sum, s) => sum + s.stockQuantity, 0)
      : data.stockQuantity;

    return {
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description,
      price: data.price,
      discount_price: data.discountPrice || null,
      image_url: data.imageUrl || "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400",
      category_id: Number(data.categoryId), // Convert string to number
      subcategory_id: data.subcategoryId ? Number(data.subcategoryId) : undefined,
      motif: data.motif || undefined,
      colors: data.colors.length > 0 ? data.colors : undefined,
      is_single_size: data.isSingleSize,
      is_new: data.isNew,
      is_best_seller: data.isBestSeller,
      is_featured: data.isFeatured,
      stock_quantity: totalStock,
      weight_grams: data.weightGrams || 250,
      sizes: data.sizes.map((s) => ({
        size: s.size,
        stock_quantity: s.stockQuantity,
        is_available: s.isAvailable,
      })),
    };
  };

  // Convert API response to form data
  const productToForm = (product: AdminProductResponse): ProductFormData => {
    return {
      name: product.name,
      description: product.description || "",
      price: product.price,
      discountPrice: product.discount_price || undefined,
      imageUrl: product.image_url,
      categoryId: product.category_id,
      subcategoryId: product.subcategory_id || "",
      motif: product.motif || "",
      colors: product.colors || [],
      isSingleSize: product.is_single_size,
      isNew: product.is_new,
      isBestSeller: product.is_best_seller,
      isFeatured: product.is_featured,
      stockQuantity: product.stock_quantity,
      weightGrams: product.weight_grams || 250,
      sizes: product.available_sizes?.map((size) => ({
        size,
        stockQuantity: Math.floor(product.stock_quantity / (product.available_sizes?.length || 1)),
        isAvailable: true,
      })) || [],
    };
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Price, Category)",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = formToPayload(formData);
      const newProduct = await adminProductApi.createProduct(payload);
      // Refetch the list to get updated data
      await fetchProducts();
      setIsAddModalOpen(false);
      resetForm();
      
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added to inventory`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add product";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;

    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = formToPayload(formData);
      await adminProductApi.updateProduct(editingProductId, payload);
      
      // Refetch the list to get updated data
      await fetchProducts();
      setIsEditModalOpen(false);
      setEditingProductId(null);
      resetForm();

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update product";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await adminProductApi.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Product Deleted",
        description: "Product has been removed from inventory",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete product";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEditClick = async (product: AdminProductListItem) => {
    setEditingProductId(product.id);
    setIsEditModalOpen(true);
    
    // Fetch full product data for editing
    try {
      const fullProduct = await adminProductApi.getProduct(product.id);
      setFormData(productToForm(fullProduct));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      setIsEditModalOpen(false);
      setEditingProductId(null);
    }
  };

  const handleUpdateStock = async (product: AdminProductListItem, delta: number) => {
    const newStock = Math.max(0, product.stock_quantity + delta);
    
    try {
      await adminProductApi.updateStock(product.id, newStock);
      // Update local state for immediate feedback
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, stock_quantity: newStock } : p
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update stock";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = async (productId: number) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setViewingProduct(null);
    
    try {
      const product = await adminProductApi.getProduct(productId);
      setViewingProduct(product);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  // Stats for dashboard
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock_quantity || 0) < 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock_quantity || 0), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format price as nominal (Indonesian format with dots)
  const formatPriceNominal = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/\./g, '')) : price;
    if (isNaN(numPrice)) return '';
    return numPrice.toLocaleString('id-ID');
  };

  // Parse nominal price back to number
  const parsePriceNominal = (value: string): number => {
    const cleaned = value.replace(/\./g, '').replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  // Subcategory handlers
  const handleAddSubcategory = async () => {
    if (!subcategoryFormData.name || !subcategoryFormData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Category)",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await adminProductApi.createSubcategory(subcategoryFormData);
      await fetchSubcategories();
      await fetchCategories(); // Refresh categories to get updated subcategories
      setIsSubcategoryModalOpen(false);
      setSubcategoryFormData({ name: "", category_id: 0, description: "", display_order: 0 });
      toast({
        title: "Subcategory Added",
        description: "Subcategory has been added successfully",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add subcategory";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategoryId || !subcategoryFormData.name || !subcategoryFormData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await adminProductApi.updateSubcategory(editingSubcategoryId, subcategoryFormData);
      await fetchSubcategories();
      await fetchCategories(); // Refresh categories
      setIsSubcategoryModalOpen(false);
      setEditingSubcategoryId(null);
      setSubcategoryFormData({ name: "", category_id: 0, description: "", display_order: 0 });
      toast({
        title: "Subcategory Updated",
        description: "Subcategory has been updated successfully",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update subcategory";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      await adminProductApi.deleteSubcategory(id);
      await fetchSubcategories();
      await fetchCategories(); // Refresh categories
      toast({
        title: "Subcategory Deleted",
        description: "Subcategory has been removed successfully",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete subcategory";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEditSubcategoryClick = async (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setIsSubcategoryModalOpen(true);
    setSubcategoryFormData({
      name: subcategory.name,
      category_id: subcategory.parentId,
      description: subcategory.description || "",
      display_order: subcategory.display_order || 0,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Tomo Batik</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "bg-amber-500/10 text-amber-500"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "products"
                ? "bg-amber-500/10 text-amber-500"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "subcategories"
                ? "bg-amber-500/10 text-amber-500"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="font-medium">Subcategories</span>
          </button>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
              {adminUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminUser?.name}</p>
              <p className="text-xs text-slate-400 truncate">{adminUser?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-slate-400">Welcome back, {adminUser?.name}</p>
              </div>
              <Button
                onClick={fetchProducts}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Box className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-white">{totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Stock</p>
                    <p className="text-2xl font-bold text-white">{totalStock}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Inventory Value</p>
                    <p className="text-lg font-bold text-white">{formatPrice(totalValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Low Stock Items</p>
                    <p className="text-2xl font-bold text-white">{lowStockProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-red-400 font-semibold mb-4">⚠️ Low Stock Alert</h3>
                <div className="space-y-3">
                  {products
                    .filter((p) => (p.stock_quantity || 0) < 10)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="relative group"
                          >
                            <img
                              src={transformImageUrl(product.image_url)}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover transition-all group-hover:ring-2 group-hover:ring-amber-500"
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Search className="w-4 h-4 text-white" />
                            </div>
                          </button>
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-sm text-slate-400">{product.category_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-bold">{product.stock_quantity} left</p>
                          <button
                            onClick={() => {
                              setActiveTab("products");
                              handleEditClick(product);
                            }}
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Update Stock →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Product Management</h2>
                <p className="text-slate-400">Add and manage your product inventory</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                  setIsAddModalOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleAddProduct}
                      onCancel={() => {
                        setIsAddModalOpen(false);
                        resetForm();
                      }}
                      submitLabel="Add Product"
                      isLoading={isSaving}
                      categories={categories}
                      isLoadingCategories={isLoadingCategories}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
                <Button
                  onClick={fetchProducts}
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50"
              />
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading products...</p>
              </div>
            ) : (
              /* Products Table */
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-slate-400 font-medium">Product</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Category</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Subcategory</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Price</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Stock</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                        <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleViewProduct(product.id)}
                                className="relative group"
                              >
                                <img
                                  src={transformImageUrl(product.image_url)}
                                  alt={product.name}
                                  className="w-14 h-14 rounded-xl object-cover bg-slate-700 transition-all group-hover:ring-2 group-hover:ring-amber-500 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Search className="w-5 h-5 text-white" />
                                </div>
                              </button>
                              <div>
                                <p className="text-white font-medium">{product.name}</p>
                                <p className="text-sm text-slate-400">ID: {product.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                              {product.category_name}
                            </span>
                          </td>
                          <td className="p-4">
                            {product.subcategory_name ? (
                              <span className="px-3 py-1 rounded-full bg-slate-700/70 text-slate-300 text-sm">
                                {product.subcategory_name}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-sm">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{formatPrice(product.price)}</p>
                              {product.discount_price && (
                                <p className="text-sm text-green-400">{formatPrice(product.discount_price)}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateStock(product, -1)}
                                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className={`w-12 text-center font-medium ${(product.stock_quantity || 0) < 10 ? "text-red-400" : "text-white"}`}>
                                {product.stock_quantity || 0}
                              </span>
                              <button
                                onClick={() => handleUpdateStock(product, 1)}
                                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {product.is_new && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">New</span>
                              )}
                              {product.is_best_seller && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">Best Seller</span>
                              )}
                              {product.is_featured && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">Featured</span>
                              )}
                              {(product.stock_quantity || 0) < 10 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">Low Stock</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(product)}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && !isLoading && (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No products found</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => {
              setIsEditModalOpen(open);
              if (!open) {
                setEditingProductId(null);
                resetForm();
              }
            }}>
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Product</DialogTitle>
                </DialogHeader>
                <ProductForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleUpdateProduct}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingProductId(null);
                    resetForm();
                  }}
                  submitLabel="Save Changes"
                  isLoading={isSaving}
                  categories={categories}
                  isLoadingCategories={isLoadingCategories}
                />
              </DialogContent>
            </Dialog>

            {/* Product Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    Product Details
                  </DialogTitle>
                </DialogHeader>
                
                {isLoadingDetail ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                    <p className="text-slate-400">Loading product details...</p>
                  </div>
                ) : viewingProduct ? (
                  <div className="space-y-6">
                    {/* Product Image & Basic Info */}
                    <div className="flex gap-6">
                      <div className="shrink-0">
                        <img
                          src={transformImageUrl(viewingProduct.image_url)}
                          alt={viewingProduct.name}
                          className="w-48 h-48 rounded-2xl object-cover bg-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400";
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{viewingProduct.name}</h3>
                          <p className="text-slate-400 text-sm">Slug: {viewingProduct.slug}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {viewingProduct.is_new && (
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">New</span>
                          )}
                          {viewingProduct.is_best_seller && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">Best Seller</span>
                          )}
                          {viewingProduct.is_featured && (
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">Featured</span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-3">
                          {viewingProduct.discount_price ? (
                            <>
                              <span className="text-2xl font-bold text-green-400">{formatPrice(viewingProduct.discount_price)}</span>
                              <span className="text-lg text-slate-500 line-through">{formatPrice(viewingProduct.price)}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-white">{formatPrice(viewingProduct.price)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {viewingProduct.description && (
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
                        <p className="text-white">{viewingProduct.description}</p>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Category</h4>
                        <p className="text-white">{viewingProduct.category_name}</p>
                        {viewingProduct.subcategory_name && (
                          <p className="text-sm text-slate-400">{viewingProduct.subcategory_name}</p>
                        )}
                      </div>
                      
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Stock</h4>
                        <p className={`text-2xl font-bold ${viewingProduct.stock_quantity < 10 ? "text-red-400" : "text-green-400"}`}>
                          {viewingProduct.stock_quantity}
                        </p>
                        <p className="text-sm text-slate-400">units available</p>
                      </div>

                      {viewingProduct.motif && (
                        <div className="bg-slate-900/50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Motif</h4>
                          <p className="text-white">{viewingProduct.motif}</p>
                        </div>
                      )}

                      {viewingProduct.weight_grams && (
                        <div className="bg-slate-900/50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Weight</h4>
                          <p className="text-white">{viewingProduct.weight_grams} grams</p>
                        </div>
                      )}
                    </div>

                    {/* Available Sizes */}
                    {viewingProduct.available_sizes && viewingProduct.available_sizes.length > 0 && (
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Available Sizes</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingProduct.available_sizes.map((size) => (
                            <span
                              key={size}
                              className="px-4 py-2 rounded-lg bg-slate-700 text-white font-medium"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Colors */}
                    {viewingProduct.colors && viewingProduct.colors.length > 0 && (
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Colors</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingProduct.colors.map((color) => (
                            <span
                              key={color}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm capitalize"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-700">
                      <span>Created: {new Date(viewingProduct.created_at).toLocaleString()}</span>
                      {viewingProduct.updated_at && (
                        <span>Updated: {new Date(viewingProduct.updated_at).toLocaleString()}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          handleEditClick(products.find(p => p.id === viewingProduct.id)!);
                        }}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Product
                      </Button>
                      <Button
                        onClick={() => setIsDetailModalOpen(false)}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "subcategories" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Subcategory Management</h2>
                <p className="text-slate-400">Manage product subcategories</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={fetchSubcategories}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isLoadingSubcategories}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingSubcategories ? "animate-spin" : ""}`} />
                </Button>
                <Dialog open={isSubcategoryModalOpen} onOpenChange={(open) => {
                  setIsSubcategoryModalOpen(open);
                  if (!open) {
                    setEditingSubcategoryId(null);
                    setSubcategoryFormData({ name: "", category_id: 0, description: "", display_order: 0 });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {editingSubcategoryId ? "Edit Subcategory" : "Add New Subcategory"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label className="text-slate-300">Name *</Label>
                        <Input
                          value={subcategoryFormData.name}
                          onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                          placeholder="Enter subcategory name"
                          className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Category *</Label>
                        <Select
                          value={String(subcategoryFormData.category_id)}
                          onValueChange={(value) => setSubcategoryFormData({ ...subcategoryFormData, category_id: Number(value) })}
                          disabled={isLoadingCategories}
                        >
                          <SelectTrigger className="mt-1.5 bg-slate-900/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)} className="text-white hover:bg-slate-700">
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Description</Label>
                        <Textarea
                          value={subcategoryFormData.description || ""}
                          onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                          placeholder="Enter subcategory description"
                          className="mt-1.5 bg-slate-900/50 border-slate-600 text-white min-h-[80px]"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Display Order</Label>
                        <Input
                          type="number"
                          value={subcategoryFormData.display_order || ""}
                          onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, display_order: Number(e.target.value) || 0 })}
                          placeholder="0"
                          className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-slate-700">
                        <Button
                          onClick={() => {
                            setIsSubcategoryModalOpen(false);
                            setEditingSubcategoryId(null);
                            setSubcategoryFormData({ name: "", category_id: 0, description: "", display_order: 0 });
                          }}
                          variant="outline"
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={editingSubcategoryId ? handleUpdateSubcategory : handleAddSubcategory}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {editingSubcategoryId ? "Save Changes" : "Add Subcategory"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Subcategories Table */}
            {isLoadingSubcategories ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading subcategories...</p>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-slate-400 font-medium">Name</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Category</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Description</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Order</th>
                        <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subcategories.map((subcategory) => {
                        const parentCategory = categories.find(c => c.id === subcategory.parentId);
                        return (
                          <tr key={subcategory.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-4">
                              <p className="text-white font-medium">{subcategory.name}</p>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                                {parentCategory?.name || `Category ID: ${subcategory.parentId}`}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-slate-400 text-sm">{subcategory.description || "-"}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-white">{subcategory.display_order || 0}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditSubcategoryClick(subcategory)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(subcategory.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {subcategories.length === 0 && !isLoadingSubcategories && (
                  <div className="p-12 text-center">
                    <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No subcategories found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Product Form Component
interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isLoading?: boolean;
  categories: Category[];
  isLoadingCategories: boolean;
}

const ProductForm = ({ formData, setFormData, onSubmit, onCancel, submitLabel, isLoading, categories, isLoadingCategories }: ProductFormProps) => {
  // Get selected category
  const selectedCategory = categories.find((cat) => String(cat.id) === formData.categoryId);
  
  // Get subcategories for the selected category
  const filteredSubcategories = selectedCategory?.subcategories || [];

  // Format price as nominal (Indonesian format with dots)
  const formatPriceNominal = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/\./g, '')) : price;
    if (isNaN(numPrice) || numPrice === 0) return '';
    return numPrice.toLocaleString('id-ID');
  };

  // Parse nominal price back to number
  const parsePriceNominal = (value: string): number => {
    const cleaned = value.replace(/\./g, '').replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const toggleSize = (size: string) => {
    const existingIndex = formData.sizes.findIndex((s) => s.size === size);
    if (existingIndex >= 0) {
      setFormData({
        ...formData,
        sizes: formData.sizes.filter((s) => s.size !== size),
      });
    } else {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, { size, stockQuantity: 10, isAvailable: true }],
      });
    }
  };

  const updateSizeStock = (size: string, stock: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.map((s) =>
        s.size === size ? { ...s, stockQuantity: Math.max(0, stock) } : s
      ),
    });
  };

  const toggleColor = (colorId: string) => {
    if (formData.colors.includes(colorId)) {
      setFormData({
        ...formData,
        colors: formData.colors.filter((c) => c !== colorId),
      });
    } else {
      setFormData({
        ...formData,
        colors: [...formData.colors, colorId],
      });
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-slate-300">Product Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-slate-300">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter product description"
            className="mt-1.5 bg-slate-900/50 border-slate-600 text-white min-h-[80px]"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Price (IDR) *</Label>
          <Input
            type="text"
            value={formData.price ? formatPriceNominal(formData.price) : ""}
            onChange={(e) => {
              const parsed = parsePriceNominal(e.target.value);
              setFormData({ ...formData, price: parsed });
            }}
            placeholder="0"
            className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label className="text-slate-300">Discount Price (IDR)</Label>
          <Input
            type="text"
            value={formData.discountPrice ? formatPriceNominal(formData.discountPrice) : ""}
            onChange={(e) => {
              const parsed = parsePriceNominal(e.target.value);
              setFormData({ ...formData, discountPrice: parsed || undefined });
            }}
            placeholder="Optional"
            className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: "" })}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="mt-1.5 bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)} className="text-white hover:bg-slate-700">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-300">Subcategory</Label>
          <Select
            value={formData.subcategoryId}
            onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
            disabled={!formData.categoryId || isLoadingCategories}
          >
            <SelectTrigger className="mt-1.5 bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {filteredSubcategories.map((sub) => (
                <SelectItem key={sub.id} value={String(sub.id)} className="text-white hover:bg-slate-700">
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Motif & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Motif</Label>
          <Input
            value={formData.motif}
            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
            placeholder="e.g., Mega Mendung, Parang"
            className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label className="text-slate-300">Weight (grams)</Label>
          <Input
            type="number"
            value={formData.weightGrams || ""}
            onChange={(e) => setFormData({ ...formData, weightGrams: Number(e.target.value) })}
            placeholder="250"
            className="mt-1.5 bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <Label className="text-slate-300">Image URL</Label>
        <div className="flex gap-2 mt-1.5">
          <Input
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="bg-slate-900/50 border-slate-600 text-white"
          />
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0">
            <ImagePlus className="w-4 h-4" />
          </Button>
        </div>
        {formData.imageUrl && (
          <img
            src={transformImageUrl(formData.imageUrl)}
            alt="Preview"
            className="mt-2 w-20 h-20 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>

      {/* Colors */}
      <div>
        <Label className="text-slate-300">Colors</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {colorOptions.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => toggleColor(color.id)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                formData.colors.includes(color.id)
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-slate-600 text-slate-400 hover:border-amber-500/50"
              }`}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes with Stock */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-slate-300">Available Sizes & Stock</Label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isSingleSize}
              onChange={(e) => setFormData({ ...formData, isSingleSize: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500"
            />
            <span className="text-slate-400">Single Size</span>
          </label>
        </div>
        
        {!formData.isSingleSize ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => {
                const sizeData = formData.sizes.find((s) => s.size === size);
                const isSelected = !!sizeData;
                
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-slate-600 text-slate-400 hover:border-amber-500/50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            
            {/* Size stock inputs */}
            {formData.sizes.length > 0 && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-xl space-y-3">
                <p className="text-sm text-slate-400 mb-2">Set stock for each size:</p>
                {formData.sizes.map((sizeData) => (
                  <div key={sizeData.size} className="flex items-center gap-4">
                    <span className="w-16 text-white font-medium">{sizeData.size}</span>
                    <Input
                      type="number"
                      value={sizeData.stockQuantity}
                      onChange={(e) => updateSizeStock(sizeData.size, Number(e.target.value))}
                      className="w-24 bg-slate-800 border-slate-600 text-white"
                      min={0}
                    />
                    <span className="text-slate-400 text-sm">units</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Label className="text-slate-300">Total Stock Quantity *</Label>
            <Input
              type="number"
              value={formData.stockQuantity || ""}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
              placeholder="0"
              className="mt-1.5 bg-slate-900/50 border-slate-600 text-white w-32"
            />
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isNew}
            onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-slate-300">Mark as New</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isBestSeller}
            onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-slate-300">Best Seller</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-slate-300">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
