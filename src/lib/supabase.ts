import { createClient } from '@supabase/supabase-js';

// These are public keys - safe to expose in client-side code
// Get these from your Supabase project dashboard: https://app.supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  games_played: number;
  games_won: number;
};

export type GameRoom = {
  id: string;
  name: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  players: GamePlayer[];
  current_turn?: string;
  okey_tile?: OkeyTile;
  discarded_tile?: OkeyTile;
};

export type GamePlayer = {
  user_id: string;
  username: string;
  avatar_url?: string;
  tiles: OkeyTile[];
  score: number;
  is_ready: boolean;
};

export type OkeyTile = {
  id: string;
  color: 'red' | 'blue' | 'black' | 'yellow';
  value: number;
  is_okey: boolean;
  is_fake_okey: boolean;
};
