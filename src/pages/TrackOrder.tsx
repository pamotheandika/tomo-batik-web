import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trackOrderByEmail, confirmOrderPayment, ApiError } from "@/services/api";
import type { OrderDetails } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowLeft,
  Home,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  Upload,
  Loader2,
  FileText,
  ArrowRight,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { EMAIL_CONFIG } from "@/services/emailService";

const TrackOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [orderCode, setOrderCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Order state
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderCode.trim()) {
      setError("Please enter your order code");
      return;
    }
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await trackOrderByEmail(orderCode.trim(), email.trim());
      setOrder(response.data);
      
      if (response.data.payment.status === "paid" || response.data.status === "payment_confirmed") {
        setPaymentConfirmed(true);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError("Order not found. Please check your order code and email address.");
        } else if (err.status === 403) {
          setError("Email address does not match this order.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to find order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setOrderCode("");
    setEmail("");
    setError(null);
    setPaymentConfirmed(false);
  };

  const handleCopyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber || order.orderId);
      toast({ title: "Order ID copied!" });
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    setIsConfirming(true);
    
    try {
      if (order.guestToken) {
        await confirmOrderPayment(order.orderNumber || order.orderId, order.guestToken);
      } else {
        // Simulate for orders without token
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
    if (!order) return;
    const message = `Hi, I would like to confirm my payment for Order ID: ${order.orderNumber || order.orderId}. Total: Rp ${order.total.toLocaleString()}`;
    const whatsappUrl = `https://wa.me/${EMAIL_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "awaiting_payment":
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting Payment
          </Badge>
        );
      case "payment_confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Payment Verifying
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
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
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Search Form View
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">Track Your Order</h1>
              <p className="text-muted-foreground">
                Enter your order code and email address to view your order details and status.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderCode" className="text-sm font-medium">
                    Order Code <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="orderCode"
                      placeholder="TB-XXXXX-XXXX"
                      value={orderCode}
                      onChange={(e) => {
                        setOrderCode(e.target.value);
                        setError(null);
                      }}
                      className="pl-10 rounded-xl h-12 font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find this in your confirmation email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="pl-10 rounded-xl h-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The email you used when placing the order
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Order Not Found</p>
                      <p className="text-xs text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold rounded-xl gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Help Section */}
            <div className="mt-8 p-6 bg-muted/30 rounded-2xl">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Check your email</p>
                    <p>We sent your order details and tracking link to your email after checkout.</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Contact Support</p>
                    <p>Having trouble? Reach out via WhatsApp for immediate assistance.</p>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-accent"
                      onClick={() => {
                        const message = "Hi, I need help tracking my order.";
                        window.open(`https://wa.me/${EMAIL_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                    >
                      Chat with us <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link to="/">
                <Button variant="ghost" className="gap-2">
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

  // Order Details View
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={handleReset}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Search Another Order
        </button>

        {/* Order Header */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">Order Details</h1>
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.payment.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold text-accent">{order.orderNumber || order.orderId}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyOrderId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {order.orderDate}
              </p>
            </div>
          </div>

          {/* Unpaid Order Warning */}
          {(order.status === "awaiting_payment" || order.status === "pending") && order.payment.status === "pending" && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Payment Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please complete your payment to process this order. Orders without payment will be cancelled after 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold">Items Ordered</h2>
                  <p className="text-sm text-muted-foreground">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-3 bg-muted/30 rounded-xl">
                    {item.image && (
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Customer Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Shipping Address</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.customer.fullName}</p>
                  <p className="text-muted-foreground">{order.customer.address}</p>
                  <p className="text-muted-foreground">
                    {order.customer.city}
                    {order.customer.postalCode && `, ${order.customer.postalCode}`}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground pt-2">
                    <Phone className="h-4 w-4" />
                    <span>{order.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{order.customer.email}</span>
                  </div>
                </div>
              </div>

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
                      <p className="font-medium">{order.shipping.courier}</p>
                      <p className="text-sm text-muted-foreground">{order.shipping.service}</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.shipping.duration}
                    </Badge>
                  </div>
                  {order.shipping.trackingNumber && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="font-mono font-medium">{order.shipping.trackingNumber}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                          navigator.clipboard.writeText(order.shipping.trackingNumber!);
                          toast({ title: "Tracking number copied!" });
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Payment</h3>
                  <p className="text-sm text-muted-foreground">{order.payment.methodName}</p>
                </div>
              </div>

              {order.payment.method === "bank_transfer" && !paymentConfirmed && order.payment.status !== "paid" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {order.payment.bankDetails ? (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.payment.bankDetails.bankName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.payment.bankDetails.accountNumber} ({order.payment.bankDetails.accountName})
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText(order.payment.bankDetails!.accountNumber);
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

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Already transferred? Confirm your payment:</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Button onClick={handleConfirmPayment} disabled={isConfirming} className="gap-2 rounded-xl">
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
                      <Button variant="outline" onClick={handleWhatsAppConfirm} className="gap-2 rounded-xl">
                        <MessageCircle className="h-4 w-4" />
                        Confirm via WhatsApp
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(paymentConfirmed || order.payment.status === "paid") && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-600 mb-2">
                    {order.payment.status === "paid" ? "Payment Received!" : "Payment Confirmation Received!"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.payment.status === "paid" 
                      ? "Your payment has been verified. Your order is being processed."
                      : "We will verify your payment within 1x24 hours and notify you via email."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-20 space-y-6">
              <h3 className="font-semibold text-lg">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">{order.orderDate}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Rp {order.shippingCost?.toLocaleString() || order.shipping.cost.toLocaleString()}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- Rp {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">Rp {order.total.toLocaleString()}</span>
                </div>
              </div>

              {order.payment.method === "bank_transfer" && !paymentConfirmed && order.payment.status !== "paid" && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Amount to Transfer</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">
                      Rp {order.total.toLocaleString()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(order.total.toString());
                      toast({ title: "Amount copied!" });
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

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
    </div>
  );
};

export default TrackOrder;





