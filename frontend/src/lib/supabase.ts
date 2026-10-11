import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhknbvsoaisrfjlhudpz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa25idnNvYWlzcmZqbGh1ZHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTkzMzAsImV4cCI6MjA4ODE5NTMzMH0.7H-kXWf0Tn0wFjnoicAnjXazspc2IMyl_lkXkRm0A6k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
