import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/services/emailService";
import { placeOrder, ApiError } from "@/services/api";
import type { CheckoutRequest } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  FileText,
  CreditCard,
  Wallet,
  Truck,
  Shield,
  Check,
  Lock,
  ArrowLeft,
  Package,
  Clock,
  Zap,
  Map,
  Hash
} from "lucide-react";
import { 
  getProvinces, 
  getCitiesByProvince, 
  getPostalCodesByCity 
} from "@/data/indonesiaLocations";

// Shipping options
const shippingOptions = [
  {
    id: "jnt",
    name: "JNT",
    logo: "JNT",
    services: [
      { id: "jnt_reg", name: "Regular", price: 15000, duration: "3-5 days" },
      { id: "jnt_exp", name: "Express", price: 25000, duration: "1-2 days" },
    ],
  },
  {
    id: "jne",
    name: "JNE",
    logo: "JNE",
    services: [
      { id: "jne_reg", name: "REG", price: 18000, duration: "3-5 days" },
      { id: "jne_yes", name: "YES", price: 28000, duration: "1 day" },
      { id: "jne_oke", name: "OKE", price: 12000, duration: "4-6 days" },
    ],
  },
  {
    id: "tiki",
    name: "TIKI",
    logo: "TIKI",
    services: [
      { id: "tiki_reg", name: "Regular", price: 16000, duration: "3-4 days" },
      { id: "tiki_ons", name: "ONS", price: 30000, duration: "Next day" },
    ],
  },
];

// Payment options (removed COD)
const paymentOptions = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer to BCA, Mandiri, or BNI",
    icon: Building2,
    badge: "Recommended",
  },
  {
    id: "e_wallet",
    name: "E-Wallet",
    description: "GoPay, OVO, Dana, ShopeePay",
    icon: Wallet,
  },
  {
    id: "credit_card",
    name: "Credit Card",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [selectedCourier, setSelectedCourier] = useState("jnt");
  const [selectedService, setSelectedService] = useState("jnt_reg");
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleProvinceChange = (value: string) => {
    setFormData({
      ...formData,
      province: value,
      city: "", // Reset city when province changes
      postalCode: "", // Reset postal code when province changes
    });
    if (errors.province) {
      setErrors({ ...errors, province: "", city: "", postalCode: "" });
    }
  };

  const handleCityChange = (value: string) => {
    setFormData({
      ...formData,
      city: value,
      postalCode: "", // Reset postal code when city changes
    });
    if (errors.city) {
      setErrors({ ...errors, city: "", postalCode: "" });
    }
  };

  const handlePostalCodeChange = (value: string) => {
    setFormData({
      ...formData,
      postalCode: value,
    });
    if (errors.postalCode) {
      setErrors({ ...errors, postalCode: "" });
    }
  };

  // Get available cities based on selected province
  const availableCities = useMemo(() => {
    if (!formData.province) return [];
    return getCitiesByProvince(formData.province);
  }, [formData.province]);

  // Get available postal codes based on selected province and city
  const availablePostalCodes = useMemo(() => {
    if (!formData.province || !formData.city) return [];
    return getPostalCodesByCity(formData.province, formData.city);
  }, [formData.province, formData.city]);

  const handleCourierChange = (courierId: string) => {
    setSelectedCourier(courierId);
    // Auto-select the first service of the selected courier
    const courier = shippingOptions.find(c => c.id === courierId);
    if (courier && courier.services.length > 0) {
      setSelectedService(courier.services[0].id);
    }
  };

  const getSelectedShippingCost = () => {
    for (const courier of shippingOptions) {
      const service = courier.services.find(s => s.id === selectedService);
      if (service) return service.price;
    }
    return 0;
  };

  const getSelectedShippingInfo = () => {
    for (const courier of shippingOptions) {
      const service = courier.services.find(s => s.id === selectedService);
      if (service) return { courier: courier.name, service: service.name, duration: service.duration };
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      e_wallet: "E-Wallet",
      credit_card: "Credit Card",
    };
    return names[method] || method;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Prepare checkout request data
    const checkoutData: CheckoutRequest = {
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        notes: formData.notes || undefined,
      },
      shipping: {
        courier: shippingInfo?.courier || "",
        service: shippingInfo?.service || "",
        duration: shippingInfo?.duration || "",
        cost: shippingCost,
      },
      payment: {
        method: paymentMethod,
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        size: item.size,
        quantity: item.quantity,
      })),
      subtotal: subtotal,
      total: total,
    };

    try {
      // Call the checkout API
      const response = await placeOrder(checkoutData);

      // Prepare order data for confirmation page
      const orderData = {
        orderId: response.data.orderId || response.data.orderNumber,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
        })),
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          notes: formData.notes,
        },
        shipping: {
          courier: shippingInfo?.courier || "",
          service: shippingInfo?.service || "",
          duration: shippingInfo?.duration || "",
          cost: shippingCost,
        },
        payment: {
          method: paymentMethod,
          methodName: getPaymentMethodName(paymentMethod),
          ...response.data.payment,
        },
        subtotal: subtotal,
        total: total,
        orderDate: response.data.orderDate || new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      // Save order to localStorage for later access
      localStorage.setItem("lastOrder", JSON.stringify(orderData));

      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail(orderData);
        toast({
          title: "📧 Confirmation email sent!",
          description: `Order details sent to ${formData.email}`,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }

      // Clear cart
      clearCart();

      // Navigate to confirmation page with order data
      navigate("/order-confirmation", { state: { orderData } });

    } catch (error) {
      console.error("Checkout error:", error);
      
      if (error instanceof ApiError) {
        toast({
          title: "Order Failed",
          description: error.message || "Failed to place order. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const subtotal = getTotalPrice();
  const shippingCost = getSelectedShippingCost();
  const total = subtotal + shippingCost;
  const shippingInfo = getSelectedShippingInfo();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <PromoBar />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground mt-1">Complete your order</p>
          </div>
          <Link to="/cart">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="hidden md:flex items-center justify-center gap-4 mb-10 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
              <Check className="h-4 w-4" />
            </div>
            <span>Cart</span>
          </div>
          <div className="w-12 h-px bg-accent" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <span className="font-medium">Checkout</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span>Complete</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Shipping Address</h2>
                    <p className="text-sm text-muted-foreground">Where should we deliver?</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={cn(
                          "pl-10 rounded-xl h-11",
                          errors.fullName && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={cn(
                          "pl-10 rounded-xl h-11",
                          errors.email && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 rounded-xl h-11",
                        errors.phone && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Street address, apartment, suite, etc."
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={cn(
                        "pl-10 rounded-xl resize-none",
                        errors.address && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-destructive">{errors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-medium">
                      Province <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                      <Select value={formData.province} onValueChange={handleProvinceChange}>
                        <SelectTrigger
                          id="province"
                          className={cn(
                            "pl-10 rounded-xl h-11",
                            errors.province && "border-destructive focus-visible:ring-destructive"
                          )}
                        >
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {getProvinces().map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.province && (
                      <p className="text-xs text-destructive">{errors.province}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                      <Select 
                        value={formData.city} 
                        onValueChange={handleCityChange}
                        disabled={!formData.province}
                      >
                        <SelectTrigger
                          id="city"
                          className={cn(
                            "pl-10 rounded-xl h-11",
                            errors.city && "border-destructive focus-visible:ring-destructive",
                            !formData.province && "opacity-50"
                          )}
                        >
                          <SelectValue placeholder={formData.province ? "Select city" : "Select province first"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {availableCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium">
                      Postal Code <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                      <Select 
                        value={formData.postalCode} 
                        onValueChange={handlePostalCodeChange}
                        disabled={!formData.city}
                      >
                        <SelectTrigger
                          id="postalCode"
                          className={cn(
                            "pl-10 rounded-xl h-11",
                            errors.postalCode && "border-destructive focus-visible:ring-destructive",
                            !formData.city && "opacity-50"
                          )}
                        >
                          <SelectValue placeholder={formData.city ? "Select postal code" : "Select city first"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {availablePostalCodes.map((postalCode) => (
                            <SelectItem key={postalCode} value={postalCode}>
                              {postalCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.postalCode && (
                      <p className="text-xs text-destructive">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Order Notes <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Special instructions, delivery preferences..."
                      className="pl-10 rounded-xl resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <Truck className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Shipping Method</h2>
                    <p className="text-sm text-muted-foreground">Choose your preferred courier</p>
                  </div>
                </div>

                {/* Courier Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {shippingOptions.map((courier) => (
                    <button
                      key={courier.id}
                      type="button"
                      onClick={() => handleCourierChange(courier.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                        selectedCourier === courier.id
                          ? "border-accent bg-accent/5"
                          : "border-border/50 hover:border-accent/30 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "text-xl font-bold mb-1 transition-colors",
                        selectedCourier === courier.id ? "text-accent" : "text-foreground"
                      )}>
                        {courier.logo}
                      </div>
                      <span className="text-xs text-muted-foreground">{courier.name}</span>
                      {selectedCourier === courier.id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-accent-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Service Selection */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Select Service</p>
                  <div className="space-y-2">
                    {shippingOptions
                      .find(c => c.id === selectedCourier)
                      ?.services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                            selectedService === service.id
                              ? "border-accent bg-accent/5"
                              : "border-border/50 hover:border-accent/30 hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              selectedService === service.id ? "bg-accent/20" : "bg-muted"
                            )}>
                              {service.name.includes("Express") || service.name === "YES" || service.name === "ONS" ? (
                                <Zap className={cn(
                                  "h-5 w-5",
                                  selectedService === service.id ? "text-accent" : "text-muted-foreground"
                                )} />
                              ) : (
                                <Package className={cn(
                                  "h-5 w-5",
                                  selectedService === service.id ? "text-accent" : "text-muted-foreground"
                                )} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{service.name}</span>
                                {(service.name.includes("Express") || service.name === "YES" || service.name === "ONS") && (
                                  <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700">
                                    Fast
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.duration}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Rp {service.price.toLocaleString()}</p>
                            {selectedService === service.id && (
                              <Check className="h-4 w-4 text-accent ml-auto mt-1" />
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Payment Method</h2>
                    <p className="text-sm text-muted-foreground">Choose how you want to pay</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = paymentMethod === option.id;
                    
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={cn(
                          "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 text-center transition-all",
                          isSelected 
                            ? "border-accent bg-accent/5" 
                            : "border-border/50 hover:border-accent/30 hover:bg-muted/30"
                        )}
                      >
                        {option.badge && (
                          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-accent text-accent-foreground">
                            {option.badge}
                          </Badge>
                        )}
                        
                        <div className={cn(
                          "p-3 rounded-xl transition-colors",
                          isSelected ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div>
                          <span className="font-medium text-sm">{option.name}</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-accent-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Payment Info */}
                {paymentMethod === "bank_transfer" && (
                  <div className="bg-muted/30 rounded-xl p-4 text-sm">
                    <p className="font-medium mb-2">Bank Account Details:</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Bank BCA: 1234567890 (Tomo Batik)</p>
                      <p>Bank Mandiri: 0987654321 (Tomo Batik)</p>
                    </div>
                  </div>
                )}

                {paymentMethod === "e_wallet" && (
                  <div className="bg-muted/30 rounded-xl p-4 text-sm">
                    <p className="font-medium mb-2">Supported E-Wallets:</p>
                    <div className="flex flex-wrap gap-2">
                      {["GoPay", "OVO", "Dana", "ShopeePay", "LinkAja"].map((wallet) => (
                        <Badge key={wallet} variant="secondary">{wallet}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "credit_card" && (
                  <div className="bg-muted/30 rounded-xl p-4 text-sm">
                    <p className="font-medium mb-2">Accepted Cards:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Visa", "Mastercard", "JCB", "American Express"].map((card) => (
                        <Badge key={card} variant="secondary">{card}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-20 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Order Summary
                </h2>
                
                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                  {items.map((item, index) => (
                    <div 
                      key={`${item.id}-${item.size}`} 
                      className="flex gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-xl border">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Info */}
                {shippingInfo && (
                  <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20">
                    <Truck className="h-5 w-5 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{shippingInfo.courier} - {shippingInfo.service}</p>
                      <p className="text-xs text-muted-foreground">{shippingInfo.duration}</p>
                    </div>
                    <span className="text-sm font-semibold">Rp {shippingCost.toLocaleString()}</span>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({getTotalItems()} items)
                    </span>
                    <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Rp {shippingCost.toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="text-2xl font-bold">
                      Rp {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold rounded-xl gap-2" 
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-accent" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 text-accent" />
                    <span>Tracked Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-4 w-4 text-accent" />
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>24/7 Support</span>
                  </div>
                </div>

                {/* Secure Notice */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Lock className="h-3 w-3" />
                  <span>Your payment info is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
