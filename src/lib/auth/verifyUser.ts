// file: src/lib/auth/verifyUser.ts

import { createClient } from "@/lib/supabase/server";

export async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}