import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Use a placeholder to prevent immediate crash if keys are missing
// In a real app, you would handle this more gracefully (e.g. showing a setup screen)
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('⚠️ Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment/secrets.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

export type SchoolProfile = {
  id: string;
  name: string;
  vision: string;
  mission: string[];
  history: string;
  logo_url?: string;
  contact_email: string;
  contact_phone: string;
  address: string;
};

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
  author_id: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  image_url: string;
  album: string;
  created_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  category: 'akademik' | 'non-akademik';
  description: string;
  image_url?: string;
  date: string;
};

export type AgendaItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'akan datang' | 'selesai';
};

export type PPDBRegistration = {
  id: string;
  full_name: string;
  registration_number: string;
  email: string;
  phone: string;
  address: string;
  document_url?: string;
  status: 'pending' | 'diterima' | 'ditolak';
  created_at: string;
};
