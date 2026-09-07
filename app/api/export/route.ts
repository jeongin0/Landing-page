import { NextResponse } from "next/server";
import { exportHtml } from "@/lib/exportHtml";
import type { StoreContent } from "@/lib/schema";

// 편집 결과를 독립 실행 가능한 HTML 파일로 내보내기
export async function POST(req: Request) {
  const { content, paid } = (await req.json()) as {
    content: StoreContent;
    paid?: boolean;
  };
  const html = exportHtml(content, !paid);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
