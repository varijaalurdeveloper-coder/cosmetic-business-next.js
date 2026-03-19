if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing required Supabase info environment variables.\nDefine NEXT_PUBLIC_SUPABASE_PROJECT_ID and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables.");
}

export const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;