import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type SocialPlatform = {
  id: string;
  user_id: string;
  platform: 'linkedin' | 'instagram' | 'x' | 'tiktok' | 'github' | 'youtube';
  username: string;
  profile_url: string;
  is_visible: boolean;
  created_at: string;
};

export type Event = {
  id: string;
  created_by: string;
  name: string;
  party_code: string;
  description?: string;
  max_attendees: number;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  is_active: boolean;
  created_at: string;
  start_time: string;
  end_time?: string;
  ends_at?: string;
};

export type EventAttendee = {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  is_online: boolean;
  last_seen: string;
};
