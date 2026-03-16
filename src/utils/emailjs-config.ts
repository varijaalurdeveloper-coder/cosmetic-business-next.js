/**
 * ⚠️ DEPRECATED - EmailJS Configuration
 * 
 * ❌ This file is NO LONGER USED
 * 
 * Email notifications are now handled by Resend API on the server-side.
 * See /supabase/functions/server/index.tsx (sendOrderEmail function)
 * 
 * ✅ Benefits of switching to Resend:
 * - Server-side email sending (more secure)
 * - No API keys exposed to frontend
 * - Professional HTML email templates
 * - Better deliverability
 * - No duplicate email issues
 * 
 * 📄 Documentation: /RESEND_EMAIL_SETUP_COMPLETE.md
 * 
 * @deprecated Use Resend API instead (configured in server)
 */

// This configuration is kept for reference only
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'DEPRECATED_DO_NOT_USE',
  TEMPLATE_ID: 'DEPRECATED_DO_NOT_USE',
  PUBLIC_KEY: 'DEPRECATED_DO_NOT_USE',
  BUSINESS_EMAIL: 'rimaorganiccosmetics@gmail.com', // Still valid - used by Resend
};

/**
 * @deprecated EmailJS is no longer used. Emails are sent via Resend API.
 */
export function isEmailJSConfigured(): boolean {
  // Always return false since EmailJS is deprecated
  return false;
}

/**
 * @deprecated Use server-side Resend API instead
 */
export function getEmailJSConfigWarnings(): string[] {
  return [
    'EmailJS is deprecated in this application',
    'Email notifications are now handled by Resend API on the server',
    'See /RESEND_EMAIL_SETUP_COMPLETE.md for details'
  ];
}
