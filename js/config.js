// ============================================
// TV Tracker - Supabase Configuration
// ============================================
// Replace these with your Supabase project credentials.
// Get them from: Supabase Dashboard > Project Settings > API
//
// Required Supabase table: "shows"
// Columns:
//   id (int8, primary key, default: gen_random_uuid())
//   user_id (uuid, nullable)
//   title (text)
//   description (text)
//   release_date (date)
//   genre (text)
//   language (text)
//   status (text)
//   platform (text)
//   platform_logo (text)
//   poster (text)
//   creators (jsonb)
//   cast_members (jsonb)
//   created_at (timestamptz, default: now())

const SUPABASE_CONFIG = {
  url: 'https://mxpcontnuqinscbesoib.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cGNvbnRudXFpbnNjYmVzb2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTIxNjMsImV4cCI6MjA5OTk2ODE2M30.UMlhCxNBQbcNi6y2cP9JD5_fmC34KNuIIxMhnOyDl4E'
};

var supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
