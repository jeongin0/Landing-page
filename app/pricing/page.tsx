"use client";

import Header from "@/components/Header";
import { usePlan, startCheckout } from "@/lib/usePlan";

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "0원",
    features: [
      "프로젝트 2개",
      "클릭 편집",
      "이미지 업로드",
      "HTML · 이미지 내보내기",
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "월 구독",
    features: [
      "프로젝트 무제한",
      "AI 카피 생성",
      "이미지 크기 조절",
      "Free의 모든 기능 포함",
    ],
    cta: "Pro 구독 시작",
  },
  {
    key: "lifetime" as const,
    name: "연간",
    price: "연 구독",
    features: ["Pro 전체 기능", "1년마다 자동 갱신", "월 구독보다 저렴"],
    cta: "연간 구독 시작",
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
                  "flex h-full flex-col rounded-2xl border p-6 transition-colors " +
                  (current
                    ? "border-2 border-violet-600 ring-2 ring-violet-100"
                    : "border-gray-200 hover:border-gray-900")
                }
              >
                {current && (
                  <div className="mb-2 inline-block self-start rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
                    현재 플랜
                  </div>
                )}
                <div className="font-bold">{p.name}</div>
                <div className="mt-1 text-2xl font-extrabold">{p.price}</div>
                <ul className="mt-4 space-y-1 text-sm text-gray-600">
                  {p.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  {p.key !== "free" ? (
                    <button
                      onClick={() => startCheckout(p.key)}
                      disabled={current}
                      className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {current ? "현재 이용 중" : p.cta}
                    </button>
                  ) : (
                    <div className="text-center text-xs text-gray-400">
                      {current ? "현재 플랜" : "기본 제공"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
