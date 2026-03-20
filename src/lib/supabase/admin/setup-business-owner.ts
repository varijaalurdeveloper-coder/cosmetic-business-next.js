/**
 * Setup Script for Business Owner Account
 *
 * This script creates a business owner account with admin privileges
 * Email: rimaorganiccosmetics@gmail.com
 *
 * Run this script once to create the business owner account
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const businessOwnerPassword = process.env.BUSINESS_OWNER_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !businessOwnerPassword) {
  console.error(
    'Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / BUSINESS_OWNER_PASSWORD'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBusinessOwner() {
  console.log('Setting up business owner account...');

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'rimaorganiccosmetics@gmail.com',
      password: businessOwnerPassword,
      user_metadata: {
        name: 'Rima Cosmetics Owner',
        role: 'admin',
      },
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating business owner:', error.message);
      return;
    }

    console.log('✅ Business owner account created successfully!');
    console.log('Email: rimaorganiccosmetics@gmail.com');
    console.log('Role: admin');
    console.log('Password loaded from environment variable');
    console.log('\nThe business owner can now:');
    console.log('- Access the admin dashboard at /admin');
    console.log('- View all orders received, pending, and completed');
    console.log('- Update order statuses (pending → confirmed → shipped → delivered)');
    console.log('- Monitor total revenue and customer details');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

setupBusinessOwner();