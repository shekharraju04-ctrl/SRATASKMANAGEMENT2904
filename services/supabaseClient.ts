import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables, with fallbacks for development.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Warn the developer if they are using placeholder credentials.
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Supabase credentials are not fully configured. The application is using placeholder values. ' +
    'For full functionality, please set the SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);