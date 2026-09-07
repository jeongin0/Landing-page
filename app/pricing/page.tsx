"use client";

import Header from "@/components/Header";
import { usePlan, startCheckout } from "@/lib/usePlan";

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "0원",
    features: ["프로젝트 3개", "클릭 편집 · AI 카피", "HTML 내보내기 (워터마크)"],
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "월 구독",
    features: ["프로젝트 무제한", "워터마크 없음", "이미지 업로드", "우선 지원"],
    cta: "Pro 시작",
  },
  {
    key: "lifetime" as const,
    name: "Lifetime",
    price: "1회 결제",
    features: ["Pro 전체 기능", "1년 이용"],
    cta: "1년 구매",
  },
];

export default function PricingPage() {
  const { plan } = usePlan();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="text-2xl font-extrabold">요금제</h1>
        <p className="mt-1 text-sm text-gray-500">
          결제는 LemonSqueezy 로 안전하게 처리됩니다. 언제든 해지 가능.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((p) => {
            const current = plan === p.key;
            return (
              <div
                key={p.key}
                className={
                  "rounded-2xl border p-6 " +
                  (p.key === "pro" ? "border-gray-900" : "border-gray-200")
                }
              >
                <div className="font-bold">{p.name}</div>
                <div className="mt-1 text-2xl font-extrabold">{p.price}</div>
                <ul className="mt-4 space-y-1 text-sm text-gray-600">
                  {p.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                {p.key !== "free" && (
                  <button
                    onClick={() => startCheckout(p.key)}
                    disabled={current}
                    className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {current ? "현재 이용 중" : p.cta}
                  </button>
                )}
                {current && p.key === "free" && (
                  <div className="mt-5 text-center text-xs text-gray-400">현재 플랜</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
