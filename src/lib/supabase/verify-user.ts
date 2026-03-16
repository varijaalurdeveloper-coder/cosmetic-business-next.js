export async function verifyUser(authHeader?: string | null) {
  if (!authHeader) return null;

  // Without Supabase environment variables configured, 
  // create a mock user from the auth header
  try {
    const token = authHeader.replace("Bearer ", "");
    
    // Return a mock user object
    return {
      id: `user_${Date.now()}`,
      email: "user@example.com",
      user_metadata: {
        name: "Guest User",
      },
    };
  } catch (error) {
    return null;
  }
}