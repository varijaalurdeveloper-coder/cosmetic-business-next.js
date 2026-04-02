"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/utils/supabase/client";
import { getAuthErrorMessage } from "@/utils/auth-errors";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setUser(null);
          setAccessToken(null);
          return;
        }

        const session = data.session;

        if (session?.user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();

          if (userError || !userData.user) {
            console.error("User verification failed:", userError);
            await supabase.auth.signOut();
            setUser(null);
            setAccessToken(null);
            return;
          }

          const user: User = {
            id: userData.user.id,
            email: userData.user.email || "",
            name:
              userData.user.user_metadata?.fullName ||
              userData.user.user_metadata?.name ||
              "User",
            role: userData.user.user_metadata?.role || "customer",
          };

          setUser(user);
          setAccessToken(session.access_token);
        } else {
          setUser(null);
          setAccessToken(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setAccessToken(null);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          name:
            session.user.user_metadata?.fullName ||
            session.user.user_metadata?.name ||
            "User",
          role: session.user.user_metadata?.role || "customer",
        };

        setUser(user);
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("📡 Calling signup API");
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName || "",
          lastName: lastName || "",
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      console.log("📡 Response status:", response.status);

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Signup failed. Please try again.",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      const errorInfo = getAuthErrorMessage(error);
      return { success: false, error: errorInfo.message };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, try admin login
      const adminLoginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
        credentials: "include", // Include cookies in the request
      });

      if (adminLoginResponse.ok) {
        const adminData = await adminLoginResponse.json();
        
        if (adminData.isAdmin) {
          const user: User = {
            id: adminData.user.id,
            email: adminData.user.email,
            name: adminData.user.name,
            role: "admin",
          };

          setUser(user);
          setAccessToken(adminData.user.id); // Use ID as token for admin
          return { success: true };
        }
      }

      // If admin login fails, try Supabase authentication for customers
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setUser(null);
        setAccessToken(null);
        const errorInfo = getAuthErrorMessage(error);
        return { success: false, error: errorInfo.message };
      }

      if (data.session?.user) {
        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email || "",
          name:
            data.session.user.user_metadata?.fullName ||
            data.session.user.user_metadata?.name ||
            "User",
          role: data.session.user.user_metadata?.role || "customer",
        };

        setUser(user);
        setAccessToken(data.session.access_token);
        return { success: true };
      }

      return { success: false, error: "Login failed. Please try again." };
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      setAccessToken(null);
      const errorInfo = getAuthErrorMessage(error);
      return { success: false, error: errorInfo.message };
    }
  };

  const logout = async () => {
    try {
      // Clear admin session by calling logout endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {
        // Endpoint may not exist yet, continue with Supabase logout
      });

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      }
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAdmin: user?.role === "admin",
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}