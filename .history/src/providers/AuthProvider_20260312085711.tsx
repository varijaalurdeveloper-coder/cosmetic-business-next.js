"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/utils/supabase/client";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);


  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || "User",
          role: session.user.user_metadata?.role || "customer",
        };

        setUser(userData);
        setAccessToken(session.access_token);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || "User",
          role: session.user.user_metadata?.role || "customer",
        };

        setUser(userData);
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-35cd97c6/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Signup error:", data.error);
        return false;
      }

      return await login(email, password);
    } catch (error) {
      console.error("Signup error:", error);
      return false;
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
        console.error("Login error:", error);
        return false;
      }

      if (data.session?.user) {
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name || "User",
          role: data.session.user.user_metadata?.role || "customer",
        };

        setUser(userData);
        setAccessToken(data.session.access_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
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
