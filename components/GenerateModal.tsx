"use client";

import { useState } from "react";
import type { StoreContent } from "@/lib/schema";
import { supabaseBrowser } from "@/lib/supabase/client";

type Props = {
  onClose: () => void;
  onApply: (content: StoreContent) => void;
  current: StoreContent;
};

export default function GenerateModal({ onClose, onApply, current }: Props) {
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("신뢰감 있고 담백한");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sess } = await supabaseBrowser().auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ product, features, audience, tone }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "생성 실패");
      }
      const partial = (await res.json()) as Partial<StoreContent>;
      // 텍스트만 교체, 테마/이미지/섹션 구성은 유지
      onApply({
        ...current,
        ...partial,
        theme: current.theme,
        sections: current.sections,
        hero: { ...current.hero, ...(partial.hero || {}), image: current.hero.image },
        detail: { ...current.detail, ...(partial.detail || {}), image: current.detail.image },
        cta: { ...current.cta, ...(partial.cta || {}) },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold">AI로 카피 생성</h2>
        <p className="mt-1 text-sm text-gray-500">
          상품 정보를 넣으면 히어로·강점·상세·후기·FAQ 문구를 자동으로 채웁니다.
        </p>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <label className="mb-1 block font-semibold">상품명</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="예: 휴대용 스테인리스 텀블러 350ml"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold">핵심 특징 (줄바꿈으로 구분)</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={4}
              placeholder={"6시간 보온\n12시간 보냉\n식기세척기 사용 가능\n밀폐 뚜껑"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold">타겟 고객</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="예: 출퇴근길에 커피를 마시는 30대 직장인"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold">톤</label>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={loading || !product}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {loading ? "생성 중…" : "생성하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
