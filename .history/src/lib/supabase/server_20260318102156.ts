import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing required Supabase server environment variables.\nDefine SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey);