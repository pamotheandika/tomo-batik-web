import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import WhatsAppChat from "@/components/WhatsAppChat";
import OrderNotification from "@/components/OrderNotification";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import BatikTulis from "./pages/BatikTulis";
import ReadyToWear from "./pages/ReadyToWear";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/index" element={<Index />} />
              <Route path="/batik-tulis" element={<BatikTulis />} />
              <Route path="/ready-to-wear" element={<ReadyToWear />} />
              <Route path="/about" element={<About />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Order confirmation - accessible after checkout or via URL with token */}
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/order/:orderCode" element={<OrderConfirmation />} />
              {/* Track order - search by order code + email */}
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/register" element={<Register />} />
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <OrderNotification />
            <WhatsAppChat />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
