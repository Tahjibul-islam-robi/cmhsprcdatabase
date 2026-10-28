import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ogirhrypyhlbbyacbcrr.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_vE5sz6UFIJYioosQBWeIdQ_4Nf81WzU";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getPublicStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${supabaseUrl}/storage/v1/object/public/club-materials/${path}`;
}

