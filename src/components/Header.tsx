import { Menu, Search, User, ShoppingBag, LogOut, Package, Heart, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = getTotalItems();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              {/* User Info in Mobile Menu */}
              {user && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-accent/20 text-accent">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">
                  Beranda
                </Link>
                <Link to="/catalog" className="text-sm font-medium hover:text-accent transition-colors">
                  Catalog
                </Link>
                <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">
                  About
                </Link>

                {user ? (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link to="/order" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                    <a href="#" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </a>
                    <a href="#" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </a>
                    <button
                      onClick={logout}
                      className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link
                      to="/register"
                      className="text-sm font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Sign Up / Sign In
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation - Left */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">
              Beranda
            </Link>
            <Link to="/catalog" className="text-sm font-medium hover:text-accent transition-colors">
              Catalog
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">
              About
            </Link>
          </nav>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="text-xl font-serif font-semibold tracking-wider">TOMO BATIK</span>
              <span className="text-[10px] tracking-widest text-muted-foreground">PREMIUM BATIK</span>
            </div>
          </Link>

          {/* Desktop Navigation - Right */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-accent/20 text-accent text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/order" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/register">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
