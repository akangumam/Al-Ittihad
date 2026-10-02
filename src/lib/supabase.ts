import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// isSupabaseReady: false = tampilkan pesan konfigurasi di LoginPage
export const isSupabaseReady = Boolean(
  url && !url.includes("xxxxxxxxxxxxxxxxxxxx") &&
  key && !key.includes("isi_anon_key"),
);

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  key ?? "placeholder-anon-key",
);
