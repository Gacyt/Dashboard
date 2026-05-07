import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

let supabaseSingleton: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseSingleton) {
    supabaseSingleton = createSupabaseBrowserClient();
  }
  return supabaseSingleton;
}
