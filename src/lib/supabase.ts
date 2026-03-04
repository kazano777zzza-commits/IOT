/**
 * Supabase Client
 * Kết nối đến Supabase PostgreSQL database
 */

import { createClient } from '@supabase/supabase-js';

// Lấy từ Supabase Dashboard > Project Settings > API
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local');
}

// Client dùng phía client (browser) - quyền hạn chế theo RLS
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client dùng phía server (API routes) - full quyền, bypass RLS
// Dùng service_role key để INSERT dữ liệu từ server
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, // fallback về anon key nếu không có service key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export type Database = {
  public: {
    Tables: {
      sensor_history: {
        Row: SensorHistoryRow;
        Insert: SensorHistoryInsert;
      };
    };
  };
};

export interface SensorHistoryRow {
  id: string;
  created_at: string;
  temp: number | null;
  hum: number | null;
  dht_ok: number;
  mq135: number;
  mq135_value: number;
  light: number;
  light_value: number;
  sound: number;
  sound_value: number;
  mq2: number;
  mq2_value: number;
  room_status: number;
  comfort_index: number;
  message: string | null;
  sound_msg: string | null;
  light_msg: string | null;
  mq2_msg: string | null;
  mq135_msg: string | null;
  dht_msg: string | null;
}

export interface SensorHistoryInsert {
  temp?: number | null;
  hum?: number | null;
  dht_ok?: number;
  mq135?: number;
  mq135_value?: number;
  light?: number;
  light_value?: number;
  sound?: number;
  sound_value?: number;
  mq2?: number;
  mq2_value?: number;
  room_status?: number;
  comfort_index?: number;
  message?: string | null;
  sound_msg?: string | null;
  light_msg?: string | null;
  mq2_msg?: string | null;
  mq135_msg?: string | null;
  dht_msg?: string | null;
}
