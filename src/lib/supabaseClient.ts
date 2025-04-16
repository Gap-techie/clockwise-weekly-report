
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://hhdjatldrffgnkzbwrmx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGphdGxkcmZmZ25remJ3cm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODA2MzYsImV4cCI6MjA2MDE1NjYzNn0.dOW7_q1J69UhUyymvwa7BMIlh6SyWqHccv36pDd_8hM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

