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

  // ✅ Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

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
      } catch (error) {
        console.error("Auth init error:", error);
      }
    };

    initAuth();

    // ✅ Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return () => subscription.unsubscribe();
  }, []);

  // ✅ SIGNUP (calls API)
  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ IMPORTANT
        body: JSON.stringify({
          firstName: firstName || "",
          lastName: lastName || "",
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      const errorInfo = getAuthErrorMessage(error);
      return { success: false, error: errorInfo.message };
    }
  };

  // ✅ LOGIN (admin + user)
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 🔐 Try admin login first
      const adminRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ IMPORTANT
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (adminRes.ok) {
        const data = await adminRes.json();

        if (data.isAdmin) {
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: "admin",
          };

          setUser(user);
          setAccessToken("admin-session"); // simple marker
          return { success: true };
        }
      }

      // 👤 Fallback: normal user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
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

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      const errorInfo = getAuthErrorMessage(error);
      return { success: false, error: errorInfo.message };
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});

      await supabase.auth.signOut();

      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error("Logout error:", error);
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

// ✅ Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}