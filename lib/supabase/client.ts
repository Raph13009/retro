import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function hasRealValue(value: string | undefined, placeholder: string) {
  return Boolean(value && value.trim() && value !== placeholder && !value.includes("your-"));
}

export const hasSupabaseEnv =
  hasRealValue(supabaseUrl, "your-supabase-project-url") &&
  hasRealValue(supabaseAnonKey, "your-supabase-anon-key") &&
  Boolean(supabaseUrl?.startsWith("https://"));

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    })
  : null;
