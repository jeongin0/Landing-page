"use client";

import Link from "next/link";
import AuthWidget from "./AuthWidget";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gray-900 text-xs text-white">
            L
          </span>
          상세페이지 빌더
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
            내 프로젝트
          </Link>
          <Link href="/pricing" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
            요금제
          </Link>
          <AuthWidget />
        </div>
      </div>
    </header>
  );
}
