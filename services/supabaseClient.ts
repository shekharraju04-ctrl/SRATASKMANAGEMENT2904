import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project's URL and Anon Key.
// You can get these from your Supabase project's dashboard:
// Project Settings > API
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  // This is not an error that should crash the app, but a warning for the developer.
  // The user will see this in the console if they haven't configured their credentials.
  console.warn('Supabase credentials are not configured. Please replace placeholders in services/supabaseClient.ts. The application will not function correctly until this is done.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);