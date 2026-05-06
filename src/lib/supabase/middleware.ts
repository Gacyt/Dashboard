import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import type { SetAllCookies } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

export async function updateSession(
  request: NextRequest
): Promise<{ response: NextResponse; user: User | null }> {
  const { url, anonKey } = getSupabasePublicEnv();
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { response, user };
}

