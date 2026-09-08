import { NextResponse } from "next/server";
import { exportHtml } from "@/lib/exportHtml";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StoreContent } from "@/lib/schema";

// 편집 결과를 독립 실행 가능한 HTML 파일로 내보내기. (모든 플랜 동일 · 워터마크 없음)
// 로그인 사용자만 — 편집기에서 access_token 을 Authorization 헤더로 보냄.
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabaseAdmin().auth.getUser(token);
  if (!userData.user) {
    return new NextResponse("로그인이 필요합니다.", { status: 401 });
  }

  const { content } = (await req.json()) as { content: StoreContent };
  const html = exportHtml(content);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
