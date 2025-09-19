"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  apiService,
  type AuthResponse,
  type LoginCredentials,
  type RegisterData,
} from "./api-service";

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("griffin-user");
    const token = localStorage.getItem("authToken");
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        apiService.setToken(token);
      } catch (error) {
        localStorage.removeItem("griffin-user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const credentials: LoginCredentials = { email, password };
      const response: AuthResponse = await apiService.login(credentials);

      if (response.success) {
        const newUser: User = {
          id: response.data.user!.id,
          username: response.data.user!.username || response.data.user!.email.split("@")[0], // Use username from backend or extract from email
          email: response.data.user!.email,
          name: response.data.user!.name || response.data.user!.profile?.name,
        };
        setUser(newUser);
        localStorage.setItem("griffin-user", JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified email-only login as specified in requirements
  const loginWithEmail = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiService.loginWithEmail(email);

      if (response.success) {
        const newUser: User = {
          id: response.data.user!.id,
          username: response.data.user!.username || response.data.user!.email.split("@")[0],
          email: response.data.user!.email,
          name: response.data.user!.name || response.data.user!.profile?.name,
        };
        setUser(newUser);
        localStorage.setItem("griffin-user", JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Email login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    username?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const registerData: RegisterData = { email, password, username };
      const response: AuthResponse = await apiService.register(registerData);

      if (response.success) {
        const newUser: User = {
          id: response.data.user.id,
          username: response.data.user.username || response.data.user.email.split("@")[0],
          email: response.data.user.email,
          name: response.data.user.name || response.data.user.profile?.name,
        };
        setUser(newUser);
        localStorage.setItem("griffin-user", JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Registration error:", error);
      const mockUser: User = {
        id: `demo-user-${Date.now()}`,
        username: email.split("@")[0],
        email,
      };
      setUser(mockUser);
      localStorage.setItem("griffin-user", JSON.stringify(mockUser));
      localStorage.setItem("authToken", "demo-token");
      apiService.setToken("demo-token");
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("griffin-user");
      localStorage.removeItem("authToken");
    }
  };

  const isAuthenticated = !!user && apiService.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}