"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase/client";

export type Plan = "free" | "pro" | "lifetime";

export function usePlan() {
  const [plan, setPlan] = useState<Plan>("free");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: sess } = await sb.auth.getSession();
        const uid = sess.session?.user?.id;
        setAuthed(!!uid);
        if (!uid) {
          setPlan("free");
          return;
        }
        const { data } = await sb
          .from("profiles")
          .select("plan")
          .eq("id", uid)
          .maybeSingle();
        setPlan((data?.plan as Plan) || "free");
      } catch {
        setPlan("free");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    plan,
    authed,
    loading,
    isPaid: plan === "pro" || plan === "lifetime",
  };
}

export async function startCheckout(planWanted: "pro" | "lifetime") {
  const sb = supabaseBrowser();
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    location.href = "/login?next=/pricing";
    return;
  }
  const res = await fetch("/api/lemon/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan: planWanted }),
  });
  if (!res.ok) {
    alert(await res.text());
    return;
  }
  const { url } = await res.json();
  location.href = url;
}
