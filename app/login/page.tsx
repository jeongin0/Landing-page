"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { krAuthError } from "@/lib/authError";

const DUP_MSG = "이미 가입된 이메일입니다. 로그인해 주세요.";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "login" ? "login" : "signup";
  const next = params.get("next") || "/projects";

  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ kind: "info" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    const sb = supabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          setMsg({ kind: "error", text: krAuthError(error) });
          return;
        }
        router.push(next);
        router.refresh();
        return;
      }

      // 가입
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) {
        setMsg({ kind: "error", text: krAuthError(error) });
        return;
      }
      // Supabase 는 이메일 중복 시 에러 대신 identities 빈 배열로 응답 (계정 열거 방지)
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setMsg({ kind: "error", text: DUP_MSG });
        return;
      }

      // 이메일 확인이 꺼져 있으면 바로 세션이 생김 → 로그인 처리
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setMsg({
        kind: "info",
        text: "확인 메일을 보냈어요. 메일의 링크를 클릭하면 가입이 완료됩니다.",
      });
    } catch (e) {
      setMsg({ kind: "error", text: krAuthError(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-5">
      <Link href="/" className="mb-8 flex items-center gap-2 font-extrabold">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-gray-900 text-xs text-white">
          L
        </span>
        랜딩페이지 빌더
      </Link>

      <div className="rounded-2xl border border-gray-200 p-6 sm:p-8">
        <div className="mb-5 flex gap-4 text-sm font-semibold">
          <button
            onClick={() => {
              setMode("signup");
              setMsg(null);
            }}
            className={mode === "signup" ? "text-gray-900" : "text-gray-400"}
          >
            회원가입
          </button>
          <button
            onClick={() => {
              setMode("login");
              setMsg(null);
            }}
            className={mode === "login" ? "text-gray-900" : "text-gray-400"}
          >
            로그인
          </button>
        </div>

        <label className="mb-1 block text-xs font-semibold text-gray-500">
          이메일 (아이디)
        </label>
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

        {/* 모드에 따라 높이가 바뀌지 않도록 항상 같은 공간 확보 */}
        <div className="mt-2 min-h-[32px] text-xs text-gray-400">
          {mode === "signup" && "이메일이 곧 로그인 아이디가 됩니다."}
        </div>

        <div className="min-h-[44px]">
          {msg && (
            <p
              className={`rounded-lg p-2 text-xs ${
                msg.kind === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {msg.text}
              {msg.text === DUP_MSG && (
                <button
                  onClick={() => {
                    setMode("login");
                    setMsg(null);
                  }}
                  className="ml-1 font-semibold underline"
                >
                  로그인하기
                </button>
              )}
            </p>
          )}
        </div>

        <button
          onClick={submit}
          disabled={loading || !email || password.length < 6}
          className="mt-3 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? "처리 중…" : mode === "login" ? "로그인" : "가입하기"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
          계속 진행하면{" "}
          <Link href="/legal/terms" className="underline">
            이용약관
          </Link>{" "}
          및{" "}
          <Link href="/legal/privacy" className="underline">
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </p>
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
