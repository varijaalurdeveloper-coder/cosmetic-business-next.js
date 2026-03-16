import { AuthError } from "@supabase/supabase-js";

export interface AuthErrorInfo {
  message: string;
  isRateLimit: boolean;
  isEmailInUse: boolean;
  isInvalidCredentials: boolean;
}

export function getAuthErrorMessage(error: unknown): AuthErrorInfo {
  if (!error) {
    return {
      message: "An unknown error occurred. Please try again.",
      isRateLimit: false,
      isEmailInUse: false,
      isInvalidCredentials: false,
    };
  }

  // Handle Supabase AuthError
  if (error instanceof AuthError || (error && typeof error === "object" && "message" in error)) {
    const errorMsg = (error as any).message || "";

    // Rate limit errors
    if (errorMsg.includes("rate limit") || errorMsg.includes("too many")) {
      return {
        message: "Too many attempts. Please wait a few minutes before trying again.",
        isRateLimit: true,
        isEmailInUse: false,
        isInvalidCredentials: false,
      };
    }

    // Email already in use
    if (
      errorMsg.includes("already registered") ||
      errorMsg.includes("User already exists") ||
      errorMsg.includes("duplicate")
    ) {
      return {
        message: "This email is already registered. Please log in or use a different email.",
        isEmailInUse: true,
        isRateLimit: false,
        isInvalidCredentials: false,
      };
    }

    // Invalid password length
    if (errorMsg.includes("password") && errorMsg.includes("8")) {
      return {
        message: "Password must be at least 8 characters.",
        isRateLimit: false,
        isEmailInUse: false,
        isInvalidCredentials: false,
      };
    }

    // Invalid credentials
    if (
      errorMsg.includes("Invalid login credentials") ||
      errorMsg.includes("Incorrect password")
    ) {
      return {
        message: "Email or password is incorrect.",
        isRateLimit: false,
        isEmailInUse: false,
        isInvalidCredentials: true,
      };
    }

    // Generic message from Supabase
    return {
      message: errorMsg || "Authentication failed. Please try again.",
      isRateLimit: false,
      isEmailInUse: false,
      isInvalidCredentials: false,
    };
  }

  return {
    message: "An error occurred. Please try again.",
    isRateLimit: false,
    isEmailInUse: false,
    isInvalidCredentials: false,
  };
}
