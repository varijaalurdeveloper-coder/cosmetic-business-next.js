import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function verifyUser(authHeader?: string | null) {
  if (!authHeader) return null;

  try {
    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error("Invalid token:", error);
      return null;
    }

    return {
      id: data.user.id, 
      email: data.user.email,
    };
  } catch (error) {
    console.error("verifyUser error:", error);
    return null;
  }
}