import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, X, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderData {
  orderId: string;
  total: number;
  orderDate: string;
  payment: {
    method: string;
    methodName: string;
  };
}

const OrderNotification = () => {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check for recent order in localStorage
    const savedOrder = localStorage.getItem("lastOrder");
    const dismissedUntil = localStorage.getItem("orderNotificationDismissed");
    
    if (dismissedUntil) {
      const dismissedTime = parseInt(dismissedUntil);
      if (Date.now() < dismissedTime) {
        setIsDismissed(true);
        return;
      }
    }

    if (savedOrder) {
      try {
        const orderData = JSON.parse(savedOrder);
        setOrder(orderData);
        // Delay showing the notification for better UX
        setTimeout(() => setIsVisible(true), 1000);
      } catch {
        // Invalid order data
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Dismiss for 1 hour
    localStorage.setItem("orderNotificationDismissed", String(Date.now() + 3600000));
  };

  const handleClearOrder = () => {
    localStorage.removeItem("lastOrder");
    localStorage.removeItem("orderNotificationDismissed");
    setOrder(null);
    setIsVisible(false);
  };

  if (!order || isDismissed || !isVisible) {
    return null;
  }

  const needsPaymentConfirmation = order.payment.method === "bank_transfer";

  return (
    <div 
      className={cn(
        "fixed bottom-20 right-4 z-40 max-w-sm",
        "animate-in slide-in-from-right-full duration-500"
      )}
    >
      <div className="bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-accent/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent/20 rounded-lg">
              <Package className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold text-sm">Recent Order</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-mono font-semibold text-accent">{order.orderId}</p>
            </div>
            {needsPaymentConfirmation && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting Payment
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold">Rp {order.total.toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <Link to="/order-confirmation" className="flex-1">
              <Button className="w-full gap-2 rounded-xl" size="sm">
                {needsPaymentConfirmation ? "Confirm Payment" : "View Order"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearOrder}
              className="text-muted-foreground text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNotification;

