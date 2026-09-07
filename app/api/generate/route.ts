import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 월 사용량 한도 (30일 롤링)
const MONTHLY_LIMIT: Record<string, number> = {
  free: 10,
  pro: 200,
  lifetime: 200,
};

// 상품 정보 -> 랜딩페이지 카피(JSON) 생성
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new NextResponse(
      "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local 파일에 키를 넣고 서버를 재시작하세요.",
      { status: 500 },
    );
  }

  // ── 인증 + 사용량 확인 ─────────────────────────────
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const sb = supabaseAdmin();
  const { data: userData } = await sb.auth.getUser(token);
  const user = userData.user;
  if (!user || user.is_anonymous) {
    return new NextResponse("AI 생성은 로그인 후 이용할 수 있습니다.", { status: 401 });
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = profile?.plan ?? "free";
  const limit = MONTHLY_LIMIT[plan] ?? MONTHLY_LIMIT.free;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await sb
    .from("ai_generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if ((count ?? 0) >= limit) {
    return new NextResponse(
      plan === "free"
        ? `무료 플랜은 30일에 ${limit}회까지 생성할 수 있습니다. 업그레이드하면 늘어납니다.`
        : `이번 주기 생성 한도(${limit}회)에 도달했습니다.`,
      { status: 429 },
    );
  }

  const { product, features, audience, tone } = await req.json();
  if (!product) return new NextResponse("상품명이 필요합니다.", { status: 400 });

  const client = new Anthropic({ apiKey });

  const prompt = `너는 한국어 랜딩페이지 카피라이터야. 아래 상품 정보로 "스토어 단일상품" 랜딩페이지의 문구를 작성해.

상품명: ${product}
핵심 특징:
${features || "(입력 없음)"}
타겟 고객: ${audience || "(입력 없음)"}
톤: ${tone || "신뢰감 있고 담백한"}

규칙:
- 과장/허위 표현 금지, 근거 없는 최상급 표현 자제
- 짧고 구체적으로. 히어로 제목은 20자 내외
- highlights는 정확히 3개
- specs는 3~5개
- reviews는 3개 (실제 후기처럼 자연스럽게, 이름은 "김**" 형식)
- faq는 3개

아래 JSON 스키마에 맞춰 **JSON만** 출력해. 다른 말 절대 금지.
{
  "cta": { "text": string },
  "hero": { "badge": string, "title": string, "subtitle": string },
  "highlights": [{ "icon": string(이모지 1개), "title": string, "desc": string }],
  "detail": { "heading": string, "body": string },
  "specs": [{ "label": string, "value": string }],
  "reviews": [{ "name": string, "text": string, "rating": number(4 또는 5) }],
  "pricing": { "price": string, "compareAt": string, "note": string },
  "faq": [{ "q": string, "a": string }]
}`;

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const jsonStr = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr);

    // 성공한 생성만 사용량으로 기록
    await sb.from("ai_generations").insert({ user_id: user.id });

    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return new NextResponse(
      e instanceof Error ? e.message : "생성 중 오류가 발생했습니다.",
      { status: 500 },
    );
  }
}
