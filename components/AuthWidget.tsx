"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

export default function AuthWidget() {
  const { user, loading, isAnonymous } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading) return <span className="text-xs text-gray-400">…</span>;

  const permanent = user && !isAnonymous;

  return (
    <>
      {permanent ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{user!.email}</span>
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
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white"
        >
          로그인 / 가입
        </button>
      )}
      {open && <AuthModal isAnonymous={isAnonymous} onClose={() => setOpen(false)} />}
    </>
  );
}

function AuthModal({
  isAnonymous,
  onClose,
}: {
  isAnonymous: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
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
        onClose();
        location.reload();
        return;
      }
      // 가입: 지금 익명 세션이면 그 계정을 그대로 이메일 계정으로 승격 (프로젝트 유지)
      if (isAnonymous) {
        const { error } = await sb.auth.updateUser({ email, password });
        if (error) throw error;
        setMsg(
          "확인 메일을 보냈어요. 메일의 링크를 클릭하면 가입이 완료됩니다. (기존 작업은 그대로 유지됩니다)",
        );
      } else {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("확인 메일을 보냈어요. 메일의 링크를 클릭하면 로그인됩니다.");
      }
      router.refresh();
    } catch (e) {
      setMsg("오류: " + (e instanceof Error ? e.message : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex gap-4 text-sm font-semibold">
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

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (6자 이상)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        {mode === "signup" && isAnonymous && (
          <p className="mt-2 text-xs text-gray-400">
            지금 만든 작업이 이 계정에 그대로 연결됩니다.
          </p>
        )}
        {msg && <p className="mt-3 rounded-lg bg-gray-50 p-2 text-xs text-gray-700">{msg}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            닫기
          </button>
          <button
            onClick={submit}
            disabled={loading || !email || password.length < 6}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {loading ? "처리 중…" : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
