"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 결제 후 LemonSqueezy 가 /?upgraded=1 로 돌려보내면 뜨는 완료 안내.
export default function UpgradedBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get("upgraded") === "1") setOpen(true);
  }, [params]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    router.replace("/");
    // 헤더의 플랜 뱃지 등 plan 상태를 새로 읽도록
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-xl"
        style={{ wordBreak: "keep-all" }}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-violet-600 text-2xl text-white">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-extrabold">결제가 완료되었습니다</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          이용해 주셔서 감사합니다.
          <br />
          결제와 주문이 모두 처리되었습니다.
          <br />
          영수증은 곧 이메일로 발송됩니다.
          <br />
          플랜 반영에는 최대 1~2분이 걸릴 수 있습니다.
        </p>
        <button
          onClick={close}
          className="mt-6 w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white"
        >
          계속
        </button>
      </div>
    </div>
  );
}
