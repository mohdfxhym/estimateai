import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  throw new Error(
    'Missing or invalid VITE_SUPABASE_URL environment variable. ' +
    'Please set it to your actual Supabase project URL (e.g., https://your-project-id.supabase.co) in your .env file.'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error(
    'Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please set it to your actual Supabase anonymous key in your .env file.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". ` +
    'Please ensure it\'s a valid URL (e.g., https://your-project-id.supabase.co)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          type: string;
          status: 'draft' | 'processing' | 'completed' | 'review';
          total_cost: number | null;
          accuracy: number | null;
          processing_time: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          status?: 'draft' | 'processing' | 'completed' | 'review';
          total_cost?: number | null;
          accuracy?: number | null;
          processing_time?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          status?: 'draft' | 'processing' | 'completed' | 'review';
          total_cost?: number | null;
          accuracy?: number | null;
          processing_time?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          file_url: string;
          processing_status: 'pending' | 'processing' | 'completed' | 'error';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          file_url: string;
          processing_status?: 'pending' | 'processing' | 'completed' | 'error';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          file_name?: string;
          file_size?: number;
          file_type?: string;
          file_url?: string;
          processing_status?: 'pending' | 'processing' | 'completed' | 'error';
          created_at?: string;
        };
      };
      estimation_items: {
        Row: {
          id: string;
          project_id: string;
          category: string;
          description: string;
          quantity: number;
          unit: string;
          rate: number;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          category: string;
          description: string;
          quantity: number;
          unit: string;
          rate: number;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          category?: string;
          description?: string;
          quantity?: number;
          unit?: string;
          rate?: number;
          amount?: number;
          created_at?: string;
        };
      };
    };
  };
};