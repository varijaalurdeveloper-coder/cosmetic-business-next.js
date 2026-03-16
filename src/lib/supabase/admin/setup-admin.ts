// This file is for documentation purposes only
// To create an admin account, use the signup endpoint with the following payload:
// POST /make-server-35cd97c6/signup
// {
//   "email": "admin@rimacosmetics.com",
//   "password": "admin123",
//   "name": "Admin"
// }
// Then manually update the user's metadata in Supabase Dashboard:
// Go to Authentication > Users > Select the user > Edit user metadata
// Set: { "role": "admin", "name": "Admin" }

export const ADMIN_SETUP_INSTRUCTIONS = `
To create an admin account:

1. Sign up using the application with email: admin@rimacosmetics.com
2. Go to your Supabase Dashboard
3. Navigate to Authentication > Users
4. Find the admin user and click Edit
5. Update the user metadata to include: { "role": "admin", "name": "Admin" }
6. Save changes

OR use the API directly:
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-35cd97c6/signup \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -d '{"email":"admin@rimacosmetics.com","password":"admin123","name":"Admin"}'

Then update metadata in dashboard as mentioned above.
`;
