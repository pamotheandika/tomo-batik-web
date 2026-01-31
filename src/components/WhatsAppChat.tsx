import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppChat = () => {
  const whatsappNumber = "6281234567890"; // Replace with actual WhatsApp number
  const message = "Hello! I'm interested in your batik products.";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-[#25D366] hover:bg-[#20BA5A] text-white"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default WhatsAppChat;
