import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getOrderByToken, confirmOrderPayment, ApiError } from "@/services/api";
import type { OrderDetails } from "@/services/api";
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Copy,
  Download,
  Share2,
  ArrowRight,
  Clock,
  ShoppingBag,
  Home,
  FileText,
  Sparkles,
  Upload,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EMAIL_CONFIG } from "@/services/emailService";

interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes: string;
  };
  shipping: {
    courier: string;
    service: string;
    duration: string;
    cost: number;
    trackingNumber?: string;
  };
  payment: {
    method: string;
    methodName: string;
    status?: string;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  subtotal: number;
  total: number;
  orderDate: string;
  status?: string;
  guestToken?: string;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderCode } = useParams<{ orderCode: string }>();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("token");
  
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Try to get order data from various sources
  const loadOrderData = async () => {
    setLoading(true);
    setError(null);

    // Priority 1: If we have orderCode and token in URL, fetch from API
    if (orderCode && guestToken) {
      try {
        const response = await getOrderByToken(orderCode, guestToken);
        const apiOrder = response.data;
        
        setOrderData({
          orderId: apiOrder.orderNumber || apiOrder.orderId,
          items: apiOrder.items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
          })),
          customer: {
            fullName: apiOrder.customer.fullName,
            email: apiOrder.customer.email,
            phone: apiOrder.customer.phone,
            address: apiOrder.customer.address,
            city: apiOrder.customer.city,
            postalCode: apiOrder.customer.postalCode,
            notes: apiOrder.customer.notes || "",
          },
          shipping: {
            courier: apiOrder.shipping.courier,
            service: apiOrder.shipping.service,
            duration: apiOrder.shipping.duration,
            cost: apiOrder.shipping.cost,
            trackingNumber: apiOrder.shipping.trackingNumber,
          },
          payment: {
            method: apiOrder.payment.method,
            methodName: apiOrder.payment.methodName,
            status: apiOrder.payment.status,
            bankDetails: apiOrder.payment.bankDetails,
          },
          subtotal: apiOrder.subtotal,
          total: apiOrder.total,
          orderDate: apiOrder.orderDate,
          status: apiOrder.status,
          guestToken: guestToken,
        });
        
        if (apiOrder.payment.status === "paid" || apiOrder.status === "payment_confirmed") {
          setPaymentConfirmed(true);
        }
        
        setLoading(false);
        return;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load order details");
        }
        setLoading(false);
        return;
      }
    }

    // Priority 2: Get from navigation state (just after checkout)
    if (location.state?.orderData) {
      setOrderData(location.state.orderData as OrderData);
      setShowConfetti(true);
      setLoading(false);
      return;
    }

    // Priority 3: Try localStorage (fallback)
    const savedOrder = localStorage.getItem("lastOrder");
    if (savedOrder) {
      try {
        setOrderData(JSON.parse(savedOrder) as OrderData);
        setLoading(false);
        return;
      } catch {
        // Invalid JSON
      }
    }

    // No order data found
    setError("No order found");
    setLoading(false);
  };

  useEffect(() => {
    loadOrderData();
  }, [orderCode, guestToken, location.state]);

  useEffect(() => {
    // Hide confetti after animation
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleCopyOrderId = () => {
    if (orderData) {
      navigator.clipboard.writeText(orderData.orderId);
      toast({
        title: "Order ID copied!",
        description: orderData.orderId,
      });
    }
  };

  const handleCopyTrackingUrl = () => {
    if (orderData) {
      const url = orderData.guestToken 
        ? `${window.location.origin}/order/${orderData.orderId}?token=${orderData.guestToken}`
        : `${window.location.origin}/track-order`;
      navigator.clipboard.writeText(url);
      toast({ title: "Tracking URL copied!" });
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderData) return;
    setIsConfirming(true);
    
    try {
      if (orderData.guestToken) {
        await confirmOrderPayment(orderData.orderId, orderData.guestToken);
      } else {
        // Simulate for localStorage orders
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setPaymentConfirmed(true);
      toast({
        title: "✅ Payment confirmation received!",
        description: "We will verify your payment and process your order shortly.",
      });
    } catch (err) {
      toast({
        title: "Failed to confirm payment",
        description: err instanceof ApiError ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!orderData) return;
    const message = `Hi, I would like to confirm my payment for Order ID: ${orderData.orderId}. Total: Rp ${orderData.total.toLocaleString()}`;
    const whatsappUrl = `https://wa.me/${EMAIL_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "payment_confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Payment Verifying
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Package className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Truck className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting Payment
          </Badge>
        );
    }
  };

  const getPaymentInstructions = () => {
    if (!orderData) return null;
    
    switch (orderData.payment.method) {
      case "bank_transfer":
        return (
          <div className="space-y-4">
            {!paymentConfirmed ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Please transfer the total amount to one of our bank accounts:
                </p>
                <div className="space-y-2">
                  {orderData.payment.bankDetails ? (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{orderData.payment.bankDetails.bankName}</p>
                        <p className="text-sm text-muted-foreground">
                          {orderData.payment.bankDetails.accountNumber} ({orderData.payment.bankDetails.accountName})
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(orderData.payment.bankDetails!.accountNumber);
                        toast({ title: "Account number copied!" });
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Bank BCA</p>
                          <p className="text-sm text-muted-foreground">1234567890 (Tomo Batik)</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("1234567890");
                          toast({ title: "Account number copied!" });
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Bank Mandiri</p>
                          <p className="text-sm text-muted-foreground">0987654321 (Tomo Batik)</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText("0987654321");
                          toast({ title: "Account number copied!" });
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  * Please include your Order ID in the transfer description
                </p>

                <Separator />

                {/* Confirm Payment Section */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Already transferred? Confirm your payment:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button 
                      onClick={handleConfirmPayment}
                      disabled={isConfirming}
                      className="w-full gap-2 rounded-xl"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          I Have Transferred
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleWhatsAppConfirm}
                      className="w-full gap-2 rounded-xl"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Confirm via WhatsApp
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-600 mb-2">Payment Confirmation Received!</h4>
                <p className="text-sm text-muted-foreground">
                  We will verify your payment within 1x24 hours and notify you via email.
                </p>
              </div>
            )}
          </div>
        );
      case "e_wallet":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You will receive a payment request on your e-wallet app shortly.
            </p>
            <div className="flex flex-wrap gap-2">
              {["GoPay", "OVO", "Dana", "ShopeePay"].map((wallet) => (
                <Badge key={wallet} variant="secondary">{wallet}</Badge>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
              <p className="text-sm text-amber-800">
                ⏰ Please complete your payment within 24 hours to avoid order cancellation.
              </p>
            </div>
          </div>
        );
      case "credit_card":
        return (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-600 mb-2">Payment Successful!</h4>
            <p className="text-sm text-muted-foreground">
              Your payment has been processed. You will receive a confirmation email shortly.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error State - Order Not Found
  if (error || !orderData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {error || "We couldn't find this order. The link may be invalid or expired."}
            </p>

            <div className="space-y-4">
              <Link to="/track-order">
                <Button className="w-full gap-2 rounded-xl">
                  <Search className="h-4 w-4" />
                  Track Your Order
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <Header />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][
                    Math.floor(Math.random() * 5)
                  ],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {orderCode ? "Order Details" : "Thank You for Your Order!"}
            </h1>
            {getStatusBadge(orderData.status)}
          </div>
          
          <p className="text-muted-foreground mb-4">
            {orderCode 
              ? `Viewing order for ${orderData.customer.email}`
              : <>Your order has been successfully placed. We've sent a confirmation email to{" "}
                  <span className="font-medium text-foreground">{orderData.customer.email}</span>
                </>
            }
          </p>
          
          {/* Order ID */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-card border rounded-xl mb-4">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <span className="font-mono font-semibold text-accent">{orderData.orderId}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyOrderId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Share/Bookmark Link */}
          {orderData.guestToken && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyTrackingUrl} className="gap-2">
                <Share2 className="h-4 w-4" />
                Copy Order Link
              </Button>
              <p className="text-xs text-muted-foreground">
                Save this link to track your order anytime
              </p>
            </div>
          )}

          {/* Email Notice - Only show for new orders */}
          {!orderCode && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto mt-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-green-100 rounded-lg mt-0.5">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-green-800">Confirmation Email Sent!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Check your inbox for order details and a link to track your order anytime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps - Only show for new orders */}
        {!orderCode && (
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-10 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline text-sm">Cart</span>
            </div>
            <div className="w-8 md:w-12 h-px bg-accent" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline text-sm">Checkout</span>
            </div>
            <div className="w-8 md:w-12 h-px bg-accent" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Complete</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Ordered */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Items Ordered</h2>
                  <p className="text-sm text-muted-foreground">
                    {orderData.items.reduce((acc, item) => acc + item.quantity, 0)} items
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div 
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 p-3 bg-muted/30 rounded-xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Shipping Address</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{orderData.customer.fullName}</p>
                  <p className="text-muted-foreground">{orderData.customer.address}</p>
                  <p className="text-muted-foreground">
                    {orderData.customer.city}
                    {orderData.customer.postalCode && `, ${orderData.customer.postalCode}`}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground pt-2">
                    <Phone className="h-4 w-4" />
                    <span>{orderData.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{orderData.customer.email}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <Truck className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Shipping Method</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{orderData.shipping.courier}</p>
                      <p className="text-sm text-muted-foreground">{orderData.shipping.service}</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {orderData.shipping.duration}
                    </Badge>
                  </div>
                  <Separator />
                  {orderData.shipping.trackingNumber ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tracking:</span>
                      <span className="font-mono font-medium">{orderData.shipping.trackingNumber}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        navigator.clipboard.writeText(orderData.shipping.trackingNumber!);
                        toast({ title: "Tracking number copied!" });
                      }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Tracking number will be sent via email</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Payment Details</h3>
                  <p className="text-sm text-muted-foreground">{orderData.payment.methodName}</p>
                </div>
              </div>
              {getPaymentInstructions()}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-20 space-y-6">
              <h3 className="font-semibold text-lg">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">{orderData.orderDate}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Rp {orderData.shipping.cost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">Rp {orderData.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Amount to Transfer (for bank transfer) */}
              {orderData.payment.method === "bank_transfer" && !paymentConfirmed && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Amount to Transfer</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">
                      Rp {orderData.total.toLocaleString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(orderData.total.toString());
                        toast({ title: "Amount copied!" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}


              {/* Navigation */}
              <div className="space-y-2">
                <Link to="/catalog">
                  <Button className="w-full gap-2 rounded-xl">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full gap-2 rounded-xl">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Confetti CSS */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 4s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;
