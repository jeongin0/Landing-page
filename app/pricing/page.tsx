"use client";

import Header from "@/components/Header";
import { usePlan, startCheckout } from "@/lib/usePlan";

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "0원",
    features: [
      "프로젝트 3개",
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
    name: "Lifetime",
    price: "1회 결제",
    features: ["Pro 전체 기능", "1년 이용"],
    cta: "1년 이용권 구매",
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
                  "flex h-full flex-col rounded-2xl border p-6 " +
                  (p.key === "pro" ? "border-gray-900" : "border-gray-200")
                }
              >
                <div className="font-bold">{p.name}</div>
                <div className="mt-1 text-2xl font-extrabold">{p.price}</div>
                {p.key === "pro" && (
                  <div className="mt-3 rounded-lg bg-gray-100 p-3 text-[11px] leading-relaxed text-gray-500">
                    <div className="font-semibold text-gray-600">테스트 결제 (실제 결제 아님)</div>
                    카드번호 <span className="font-mono">4242 4242 4242 4242</span>
                    <br />
                    만료일 미래 아무 날짜 · CVC 아무 3자리
                    <br />
                    이름 · 우편번호도 아무 값이면 됩니다.
                  </div>
                )}
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
