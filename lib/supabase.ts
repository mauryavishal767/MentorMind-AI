import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });

  if (data.user && !error) {
    // Create profile
    await supabase.from('profiles').insert([
      {
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      }
    ]);
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  preferred_learning_style: string;
  interests: string[];
  goals: string[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Mentor {
  id: string;
  name: string;
  description: string;
  personality: string;
  expertise: string[];
  avatar_url?: string;
  system_prompt: string;
  voice_id?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  mentor_id: string;
  title?: string;
  topic?: string;
  status: 'active' | 'archived' | 'completed';
  metadata: any;
  created_at: string;
  updated_at: string;
  mentor?: Mentor;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: any;
  audio_url?: string;
  created_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  topics: string[];
  milestones: any[];
  progress_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressTracking {
  id: string;
  user_id: string;
  topic: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sessions_completed: number;
  total_time_minutes: number;
  achievements: string[];
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}