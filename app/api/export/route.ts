import { NextResponse } from "next/server";
import { exportHtml } from "@/lib/exportHtml";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StoreContent } from "@/lib/schema";

// 편집 결과를 독립 실행 가능한 HTML 파일로 내보내기.
// 워터마크 제거 여부는 클라이언트 값이 아니라 서버에서 요금제를 직접 확인해 결정한다.
export async function POST(req: Request) {
  const { content } = (await req.json()) as { content: StoreContent };

  let paid = false;
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (token) {
    const sb = supabaseAdmin();
    const { data: userData } = await sb.auth.getUser(token);
    const user = userData.user;
    if (user && !user.is_anonymous) {
      const { data: profile } = await sb
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      paid = profile?.plan === "pro" || profile?.plan === "lifetime";
    }
  }

  const html = exportHtml(content, !paid);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
