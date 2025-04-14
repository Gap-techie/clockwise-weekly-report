
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://placeholder-project.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyLXByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjM3ODE2NCwiZXhwIjoxOTI3OTU0MTY0fQ.placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
