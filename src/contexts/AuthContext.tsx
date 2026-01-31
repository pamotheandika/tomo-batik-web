import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "facebook" | "email";
  role?: "user" | "admin";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  logoutAdmin: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for persisting users
const USER_STORAGE_KEY = "tomo_batik_user";
const ADMIN_STORAGE_KEY = "tomo_batik_admin";

// Demo admin credentials (in production, this would be validated server-side)
const ADMIN_CREDENTIALS = {
  email: "admin@tomobatik.com",
  password: "admin123",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load user and admin from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const savedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    if (savedAdmin) {
      try {
        setAdminUser(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  // Save admin to localStorage when it changes
  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [adminUser]);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Google Login
  // In production, integrate with Firebase Auth or Google OAuth
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // For demo: Simulate Google OAuth popup
      // In production, use Firebase Auth or Google Identity Services
      
      // Simulated OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock user data (replace with actual OAuth response)
      const mockGoogleUser: User = {
        id: `google_${Date.now()}`,
        name: "Google User",
        email: "user@gmail.com",
        avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        provider: "google",
      };

      // In production, you would do:
      // const provider = new GoogleAuthProvider();
      // const result = await signInWithPopup(auth, provider);
      // const user = result.user;

      setUser(mockGoogleUser);
      closeLoginModal();
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook Login
  // In production, integrate with Firebase Auth or Facebook SDK
  const loginWithFacebook = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // For demo: Simulate Facebook OAuth popup
      // In production, use Firebase Auth or Facebook SDK
      
      // Simulated OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock user data (replace with actual OAuth response)
      const mockFacebookUser: User = {
        id: `facebook_${Date.now()}`,
        name: "Facebook User",
        email: "user@facebook.com",
        avatar: "https://graph.facebook.com/default/picture?type=square",
        provider: "facebook",
      };

      // In production, you would do:
      // const provider = new FacebookAuthProvider();
      // const result = await signInWithPopup(auth, provider);
      // const user = result.user;

      setUser(mockFacebookUser);
      closeLoginModal();
    } catch (error) {
      console.error("Facebook login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  // Admin login with email/password
  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, this would be a real API call to validate credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const admin: AdminUser = {
          id: "admin_001",
          name: "Admin Tomo Batik",
          email: email,
          role: "admin",
        };
        setAdminUser(admin);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Admin login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = adminUser !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        loginWithFacebook,
        loginAsAdmin,
        logout,
        logoutAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

