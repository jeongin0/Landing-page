"use client";

import { useState } from "react";

export default function IntroPopup() {
  // index 페이지에 들어올 때마다 노출 (닫기는 ✕ 로만)
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* 다시 열기 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-gray-300 bg-white/90 px-3 py-1.5 text-sm font-bold tracking-widest text-gray-600 shadow-sm backdrop-blur hover:text-gray-900"
      >
        ABOUT
      </button>

      {!open ? null : (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          style={{ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="사이트 소개"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            style={{ wordBreak: "keep-all" }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <span className="text-sm font-bold tracking-[0.25em] text-gray-400">
                ABOUT
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6">
              <p
                aria-hidden="true"
                className="text-3xl font-extrabold leading-none tracking-tight text-gray-900"
              >
                LANDING
                <br />
                BUILDER
              </p>

              <div className="mt-5 space-y-2 text-sm leading-relaxed text-gray-600">
                <p>
                  상품 정보 입력 → AI 카피 생성 → 클릭 편집 → HTML·이미지 내보내기로
                  스토어 상세페이지를 만드는 툴입니다.
                </p>
                <p>
                  Next.js(App Router)로 만들었고, 로그인 · 구독 결제(월/연) ·
                  요금제별 기능 제한 · 결제 웹훅까지 <b>수익화 흐름을 처음부터 끝까지</b>{" "}
                  직접 구현했습니다.
                </p>
                <p>AI를 활용해 기획부터 구현까지 진행했습니다.</p>
              </div>

              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-gray-500">
                <dt className="font-bold tracking-widest text-gray-400">소스</dt>
                <dd>
                  <a
                    href="https://github.com/jeongin0/Landing-page"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-gray-900"
                  >
                    GitHub
                  </a>
                </dd>
                <dt className="font-bold tracking-widest text-gray-400">배포</dt>
                <dd>Vercel (GitHub push → 자동 배포)</dd>
                <dt className="font-bold tracking-widest text-gray-400">인증·DB·이미지</dt>
                <dd>Supabase</dd>
                <dt className="font-bold tracking-widest text-gray-400">결제·웹훅</dt>
                <dd>LemonSqueezy</dd>
                <dt className="font-bold tracking-widest text-gray-400">AI 카피</dt>
                <dd>Google Gemini</dd>
                <dt className="font-bold tracking-widest text-gray-400">웹폰트</dt>
                <dd>Google Fonts</dd>
              </dl>

              <p className="mt-5 text-sm font-semibold text-gray-900">감사합니다.</p>

              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-sm text-gray-500">
                <dt className="font-bold tracking-widest text-gray-400">NAME</dt>
                <dd>박정인</dd>
                <dt className="font-bold tracking-widest text-gray-400">CONTACT</dt>
                <dd>010-6637-4423</dd>
              </dl>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
