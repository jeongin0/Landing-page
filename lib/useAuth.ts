"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "./supabase/client";

export type AuthState = {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
};

// 현재 로그인 상태.
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabaseBrowser();
    let alive = true;

    (async () => {
      const { data } = await sb.auth.getUser();
      if (alive) {
        setUser(data.user);
        setLoading(false);
      }
    })();

    const { data: sub } = sb.auth.onAuthStateChange((_e: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isAnonymous: !!user?.is_anonymous,
  };
}
