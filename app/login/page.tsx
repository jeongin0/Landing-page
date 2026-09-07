"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "login" ? "login" : "signup";
  const next = params.get("next") || "/projects";

  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    const sb = supabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
        return;
      }
      // 가입: 익명 세션이면 그 계정을 이메일 계정으로 승격 (작업 유지)
      const { data: sess } = await sb.auth.getSession();
      if (sess.session?.user?.is_anonymous) {
        const { error } = await sb.auth.updateUser({ email, password });
        if (error) throw error;
      } else {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
      }
      setMsg("확인 메일을 보냈어요. 메일의 링크를 클릭하면 가입이 완료됩니다.");
    } catch (e) {
      setMsg("오류: " + (e instanceof Error ? e.message : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <Link href="/" className="mb-8 flex items-center gap-2 font-extrabold">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-gray-900 text-xs text-white">
          L
        </span>
        랜딩페이지 빌더
      </Link>

      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="mb-5 flex gap-4 text-sm font-semibold">
          <button
            onClick={() => setMode("signup")}
            className={mode === "signup" ? "text-gray-900" : "text-gray-400"}
          >
            가입
          </button>
          <button
            onClick={() => setMode("login")}
            className={mode === "login" ? "text-gray-900" : "text-gray-400"}
          >
            로그인
          </button>
        </div>

        <label className="mb-1 block text-xs font-semibold text-gray-500">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs font-semibold text-gray-500">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && password.length >= 6 && submit()}
        />

        {mode === "signup" && (
          <p className="mt-2 text-xs text-gray-400">
            지금 만든 작업이 이 계정에 그대로 연결됩니다.
          </p>
        )}
        {msg && (
          <p className="mt-3 rounded-lg bg-gray-50 p-2 text-xs text-gray-700">{msg}</p>
        )}

        <button
          onClick={submit}
          disabled={loading || !email || password.length < 6}
          className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? "처리 중…" : mode === "login" ? "로그인" : "가입하기"}
        </button>

        {mode === "signup" && (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
            가입하면{" "}
            <Link href="/legal/terms" className="underline">이용약관</Link> 및{" "}
            <Link href="/legal/privacy" className="underline">개인정보처리방침</Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        )}
      </div>

      <Link href="/" className="mt-4 text-center text-xs text-gray-400 hover:underline">
        ← 돌아가기
      </Link>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-gray-400">…</div>}>
      <LoginInner />
    </Suspense>
  );
}
