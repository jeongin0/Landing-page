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
