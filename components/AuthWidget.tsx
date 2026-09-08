"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { usePlan } from "@/lib/usePlan";

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  lifetime: "연간",
};

export default function AuthWidget({ hideSignOut = false }: { hideSignOut?: boolean }) {
  const { user, loading, isAnonymous } = useAuth();
  const { plan } = usePlan();
  const router = useRouter();

  if (loading) return <span className="text-xs text-gray-400">…</span>;

  const permanent = user && !isAnonymous;

  if (permanent) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/pricing"
          className={
            "rounded-full px-2 py-0.5 text-xs font-semibold " +
            (plan === "free"
              ? "bg-gray-100 text-gray-600"
              : "bg-gray-900 text-white")
          }
          title="요금제 보기"
        >
          {PLAN_LABEL[plan] ?? "Free"}
        </Link>
        <span className="hidden text-gray-500 sm:inline">{user!.email}</span>
        {!hideSignOut && (
          <button
            onClick={async () => {
              await supabaseBrowser().auth.signOut();
              router.refresh();
              location.reload();
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
          >
            로그아웃
          </button>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white"
    >
      로그인 / 회원가입
    </Link>
  );
}
