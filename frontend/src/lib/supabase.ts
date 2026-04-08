import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnggpufdfmkoypmdtlbt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZ2dwdWZkZm1rb3lwbWR0bGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzk3MjMsImV4cCI6MjA3ODAxNTcyM30.Jv4KomFoIO5xm6vHaur8a34JCTKK4x4i5ku_SFW8Ik4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
