import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← 홈
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
      <div className="prose prose-sm mt-6 max-w-none text-sm leading-relaxed text-gray-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <div className="mt-12 flex gap-4 border-t border-gray-100 pt-6 text-xs text-gray-400">
        <Link href="/legal/terms" className="hover:underline">이용약관</Link>
        <Link href="/legal/privacy" className="hover:underline">개인정보처리방침</Link>
        <Link href="/legal/refund" className="hover:underline">환불정책</Link>
      </div>
    </main>
  );
}
