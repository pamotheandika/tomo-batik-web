// Email Service for sending order confirmations
// Using EmailJS to send real emails from the frontend

import emailjs from "@emailjs/browser";

// ============================================
// EMAILJS CONFIGURATION
// ============================================
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an Email Service (Gmail) - you'll get a SERVICE_ID
// 3. Create an Email Template - you'll get a TEMPLATE_ID
// 4. Get your Public Key from Account > API Keys
// 5. Replace the values below with your actual IDs
// ============================================

const EMAILJS_CONFIG = {
  serviceId: "service_tomo_batik",      // Replace with your EmailJS Service ID
  templateId: "template_order_confirm", // Replace with your EmailJS Template ID  
  publicKey: "YOUR_PUBLIC_KEY",         // Replace with your EmailJS Public Key
};

// Email Configuration
export const EMAIL_CONFIG = {
  senderEmail: "tomobatikindonesia@gmail.com",
  senderName: "Tomo Batik Indonesia",
  supportEmail: "tomobatikindonesia@gmail.com",
  whatsappNumber: "6281234567890", // Update with actual number
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

interface OrderEmailData {
  orderId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shipping: {
    courier: string;
    service: string;
    duration: string;
    cost: number;
  };
  payment: {
    method: string;
    methodName: string;
  };
  subtotal: number;
  total: number;
  orderDate: string;
}

// Store orders for retrieval (in production, this would be in a database)
const ORDERS_STORAGE_KEY = "tomo_batik_orders";

export const saveOrder = (orderData: OrderEmailData): void => {
  const orders = getStoredOrders();
  orders[orderData.orderId] = {
    ...orderData,
    createdAt: new Date().toISOString(),
    status: "pending_payment",
  };
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

export const getOrderById = (orderId: string): OrderEmailData | null => {
  const orders = getStoredOrders();
  return orders[orderId] || null;
};

export const getStoredOrders = (): Record<string, OrderEmailData & { status?: string; createdAt?: string }> => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const updateOrderStatus = (orderId: string, status: string): void => {
  const orders = getStoredOrders();
  if (orders[orderId]) {
    orders[orderId] = { ...orders[orderId], status };
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
};

// Generate order tracking URL
export const getOrderTrackingUrl = (orderId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/order/${orderId}`;
};

// Format items for email
const formatItemsForEmail = (items: OrderEmailData["items"]): string => {
  return items
    .map(
      (item) =>
        `• ${item.name} (Size: ${item.size}) x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString()}`
    )
    .join("\n");
};

// Format items as HTML for email
const formatItemsAsHtml = (items: OrderEmailData["items"]): string => {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.size}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rp ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("");
};

// Get payment instructions based on method
const getPaymentInstructions = (method: string): string => {
  switch (method) {
    case "bank_transfer":
      return `
PAYMENT INSTRUCTIONS:
Please transfer to one of our bank accounts:
• Bank BCA: 1234567890 (Tomo Batik)
• Bank Mandiri: 0987654321 (Tomo Batik)

Important: Include your Order ID in the transfer description.
      `.trim();
    case "e_wallet":
      return "You will receive a payment request on your e-wallet app shortly (GoPay, OVO, Dana, ShopeePay).";
    case "credit_card":
      return "Your payment has been processed successfully.";
    default:
      return "";
  }
};

// Send order confirmation email using EmailJS
export const sendOrderConfirmationEmail = async (
  orderData: OrderEmailData
): Promise<{ success: boolean; message: string }> => {
  // Save order for tracking
  saveOrder(orderData);

  const trackingUrl = getOrderTrackingUrl(orderData.orderId);

  // Prepare template parameters for EmailJS
  const templateParams = {
    // Recipient
    to_email: orderData.customer.email,
    to_name: orderData.customer.fullName,
    
    // Sender
    from_name: EMAIL_CONFIG.senderName,
    from_email: EMAIL_CONFIG.senderEmail,
    reply_to: EMAIL_CONFIG.supportEmail,
    
    // Order Info
    order_id: orderData.orderId,
    order_date: orderData.orderDate,
    
    // Customer Info
    customer_name: orderData.customer.fullName,
    customer_email: orderData.customer.email,
    customer_phone: orderData.customer.phone,
    customer_address: orderData.customer.address,
    customer_city: orderData.customer.city,
    customer_postal: orderData.customer.postalCode,
    
    // Items (formatted as text)
    items_list: formatItemsForEmail(orderData.items),
    items_html: formatItemsAsHtml(orderData.items),
    items_count: orderData.items.reduce((acc, item) => acc + item.quantity, 0),
    
    // Shipping
    shipping_courier: orderData.shipping.courier,
    shipping_service: orderData.shipping.service,
    shipping_duration: orderData.shipping.duration,
    shipping_cost: `Rp ${orderData.shipping.cost.toLocaleString()}`,
    
    // Payment
    payment_method: orderData.payment.methodName,
    payment_instructions: getPaymentInstructions(orderData.payment.method),
    
    // Totals
    subtotal: `Rp ${orderData.subtotal.toLocaleString()}`,
    total: `Rp ${orderData.total.toLocaleString()}`,
    
    // Links
    tracking_url: trackingUrl,
    
    // Support
    support_email: EMAIL_CONFIG.supportEmail,
    whatsapp_number: EMAIL_CONFIG.whatsappNumber,
  };

  try {
    // Check if EmailJS is properly configured
    if (EMAILJS_CONFIG.publicKey === "YOUR_PUBLIC_KEY") {
      console.warn("⚠️ EmailJS not configured. Please update EMAILJS_CONFIG in emailService.ts");
      console.log("📧 Email would be sent to:", orderData.customer.email);
      console.log("📦 Order ID:", orderData.orderId);
      console.log("🔗 Tracking URL:", trackingUrl);
      
      // Return success anyway for demo purposes
      return {
        success: true,
        message: `Order saved! Email configuration pending. (Demo mode)`,
      };
    }

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log("✅ Email sent successfully:", response);

    return {
      success: true,
      message: `Order confirmation sent to ${orderData.customer.email}`,
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    
    // Still return success if order was saved (email can be resent)
    return {
      success: false,
      message: "Order saved but email failed to send. Please contact support.",
    };
  }
};

// Resend order confirmation email
export const resendOrderConfirmationEmail = async (
  orderId: string
): Promise<{ success: boolean; message: string }> => {
  const order = getOrderById(orderId);
  
  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  return sendOrderConfirmationEmail(order);
};

export default {
  sendOrderConfirmationEmail,
  resendOrderConfirmationEmail,
  getOrderById,
  getOrderTrackingUrl,
  saveOrder,
  updateOrderStatus,
  EMAIL_CONFIG,
};
