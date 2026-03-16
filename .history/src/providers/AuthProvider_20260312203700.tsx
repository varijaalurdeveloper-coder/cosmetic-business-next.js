"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/utils/supabase/client";
import { getAuthErrorMessage } from "@/utils/auth-errors";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setUser(null);
          setAccessToken(null);
          setIsInitialized(true);
          return;
        }

        const session = data.session;

        if (session?.user) {
          // Verify the session is still valid
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            console.error("User verification failed:", userError);
            await supabase.auth.signOut();
            setUser(null);
            setAccessToken(null);
            setIsInitialized(true);
            return;
          }

          const user: User = {
            id: userData.user.id,
            email: userData.user.email!,
            name: userData.user.user_metadata?.name || "User",
            role: userData.user.user_metadata?.role || "customer",
          };

          setUser(user);
          setAccessToken(session.access_token);
        } else {
          setUser(null);
          setAccessToken(null);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setAccessToken(null);
        setIsInitialized(true);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || "User",
            role: session.user.user_metadata?.role || "customer",
          };

          setUser(user);
          setAccessToken(session.access_token);
        } else {
          setUser(null);
          setAccessToken(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // First check if user already exists by attempting to sign in
      const { data: existingSession } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (existingSession.session) {
        const errorInfo = getAuthErrorMessage("User already exists");
        return { success: false, error: errorInfo.message };
      }
    } catch (error) {
      // Expected - user doesn't exist yet
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "customer",
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        const errorInfo = getAuthErrorMessage(error);
        return { success: false, error: errorInfo.message };
      }

      if (data.user) {
        // For new signups, try to auto-login after signup
        const loginResult = await login(email, password);
        return loginResult;
      }

      return { success: false, error: "Signup failed. Please try again." };
    } catch (error) {
      console.error("Signup error:", error);
      const errorInfo = getAuthErrorMessage(error);
      return { success: false, error: errorInfo.message };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        // Clear any stale session data
        setUser(null);
        setAccessToken(null);
        return false;
      }

      if (data.session?.user) {
        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name || "User",
          role: data.session.user.user_metadata?.role || "customer",
        };

        setUser(user);
        setAccessToken(data.session.access_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      setAccessToken(null);
      return false;
    }
  };

  const logout = async () => {
    try {
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
