"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

export default function AuthWidget() {
  const { user, loading, isAnonymous } = useAuth();
  const router = useRouter();

  if (loading) return <span className="text-xs text-gray-400">…</span>;

  const permanent = user && !isAnonymous;

  if (permanent) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden text-gray-500 sm:inline">{user!.email}</span>
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
