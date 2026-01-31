import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone,
  Gift,
  ArrowLeft,
  Check,
  Sparkles
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({ title: "Please enter your full name", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Please enter your phone number", variant: "destructive" });
      return false;
    }
    if (formData.password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return false;
    }
    if (!agreedToTerms) {
      toast({ title: "Please agree to the terms and conditions", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account created successfully! 🎉",
        description: "Use code GETSTARTED20 for 20% off your first order!",
      });
      
      navigate("/catalog");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "20% off your first order",
    "Exclusive member discounts",
    "Early access to new collections",
    "Track orders easily",
    "Save favorite items",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
          
          {/* Left Side - Benefits */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              {/* Logo */}
              <div className="mb-8">
                <Link to="/" className="inline-block">
                  <div className="flex flex-col">
                    <span className="text-2xl font-serif font-semibold tracking-wider">TOMO BATIK</span>
                    <span className="text-[10px] tracking-widest text-muted-foreground">PREMIUM BATIK</span>
                  </div>
                </Link>
              </div>

              {/* Promo Banner */}
              <div className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-90">New Customer Offer</p>
                    <p className="text-2xl font-bold">20% OFF</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  <span className="text-sm">Use code:</span>
                  <code className="font-mono font-bold text-lg">GETSTARTED20</code>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Why Create an Account?</h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonial */}
              <div className="mt-8 p-6 bg-card rounded-xl border">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "Amazing quality batik! The craftsmanship is exceptional and the customer service is top-notch."
                </p>
                <p className="text-sm font-medium">— Sarah M., Jakarta</p>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <Link to="/" className="inline-block">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-serif font-semibold tracking-wider">TOMO BATIK</span>
                  <span className="text-[10px] tracking-widest text-muted-foreground">PREMIUM BATIK</span>
                </div>
              </Link>
            </div>

            {/* Mobile Promo */}
            <div className="lg:hidden bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-accent font-medium">
                🎁 Get 20% OFF with code <span className="font-mono font-bold">GETSTARTED20</span>
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Create Account</h1>
                <p className="text-muted-foreground text-sm">
                  Join us and discover authentic Indonesian batik
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 h-11 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 h-11 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-11 rounded-xl"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-11 rounded-xl"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    I agree to the{" "}
                    <a href="#" className="text-accent hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    // Open login modal or navigate to login
                    navigate("/");
                  }}
                  className="text-accent hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

