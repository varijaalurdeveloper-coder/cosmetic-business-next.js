/**
 * Setup Script for Business Owner Account
 * 
 * This script creates a business owner account with admin privileges
 * Email: rimaorganiccosmetics@gmail.com
 * Password: rima2015
 * 
 * Run this script once to create the business owner account
 */

import { createClient } from 'npm:@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBusinessOwner() {
  console.log('Setting up business owner account...');

  try {
    // Create business owner account
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'rimaorganiccosmetics@gmail.com',
      password: 'rima2015',
      user_metadata: {
        name: 'Rima Cosmetics Owner',
        role: 'admin'
      },
      email_confirm: true // Auto-confirm email since email server isn't configured
    });

    if (error) {
      console.error('Error creating business owner:', error.message);
      return;
    }

    console.log('✅ Business owner account created successfully!');
    console.log('Email: rimaorganiccosmetics@gmail.com');
    console.log('Password: rima2015');
    console.log('Role: admin');
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
