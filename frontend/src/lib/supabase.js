'use client';

import { createBrowserClient } from '@supabase/ssr';

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
export const BEATS_BUCKET = 'beats';
