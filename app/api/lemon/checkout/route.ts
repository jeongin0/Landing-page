import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 로그인 사용자를 LemonSqueezy 결제창으로. user_id 를 custom 으로 실어보냄.
export async function POST(req: Request) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) {
    return new NextResponse("결제 설정이 안 되어 있습니다.", { status: 500 });
  }

  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const { data: userData } = await supabaseAdmin().auth.getUser(token);
  const user = userData.user;
  if (!user || user.is_anonymous) {
    return new NextResponse("로그인이 필요합니다.", { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "pro" | "lifetime" };
  const variantId =
    plan === "lifetime"
      ? process.env.LEMONSQUEEZY_VARIANT_LIFETIME
      : process.env.LEMONSQUEEZY_VARIANT_PRO;
  if (!variantId) return new NextResponse("상품 설정 오류", { status: 500 });

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(req.url).origin;

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            custom: { user_id: user.id, plan },
          },
          product_options: {
            redirect_url: `${origin}/?upgraded=1`,
            // 포트폴리오/테스트용: 결제창에 테스트 카드 안내 노출
            description:
              "<p><strong>테스트 결제입니다 (실제 결제 아님)</strong><br/>" +
              "카드번호: 4242 4242 4242 4242<br/>" +
              "만료일: 미래의 아무 날짜 · CVC: 아무 3자리 숫자<br/>" +
              "이름 · 주소 · 우편번호도 아무 값이나 입력하면 됩니다.</p>",
            receipt_thank_you_note:
              "완료되었습니다!<br/>결제와 주문 모두 마쳤습니다.<br/>영수증이 곧 이메일로 발송됩니다.",
          },
          checkout_options: {
            desc: true,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("LS checkout error", JSON.stringify(json));
    return new NextResponse("결제창 생성 실패: " + JSON.stringify(json.errors ?? json), {
      status: 500,
    });
  }

  return NextResponse.json({ url: json.data.attributes.url });
}
