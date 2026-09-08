import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// LemonSqueezy webhook: 결제 상태 -> profiles.plan 반영
export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return new NextResponse("no secret", { status: 500 });

  const raw = await req.text();
  const sig = req.headers.get("x-signature") || "";
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (
    sig.length !== digest.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest))
  ) {
    return new NextResponse("bad signature", { status: 401 });
  }

  const body = JSON.parse(raw);
  const event: string = body.meta?.event_name || "";
  const attr = body.data?.attributes || {};
  // 체크아웃 시 넘긴 custom 데이터에서 user_id / plan 회수
  const custom = body.meta?.custom_data || attr.first_order_item?.custom_data || {};
  const userId: string | undefined = custom.user_id;
  const wantedPlan: string | undefined = custom.plan;
  const lifetimeVariant = process.env.LEMONSQUEEZY_VARIANT_LIFETIME;
  // order 페이로드는 first_order_item.variant_id, subscription 페이로드는 attr.variant_id
  const variantId = String(attr.variant_id ?? attr.first_order_item?.variant_id ?? "");
  const isLifetime =
    wantedPlan === "lifetime" ||
    (!!lifetimeVariant && variantId === String(lifetimeVariant));

  const admin = supabaseAdmin();

  await admin.from("payments").insert({
    user_id: userId ?? null,
    ls_event: event,
    ls_order_id: String(body.data?.id ?? ""),
    status: attr.status ?? null,
    raw: body,
  });

  if (!userId) return NextResponse.json({ ok: true, note: "no user_id" });

  let plan: string | null = null;
  let periodEnd: string | null = null;
  let subId: string | null = null;

  // Pro = 월 구독, Lifetime = 연 구독. 둘 다 LemonSqueezy Subscription.
  if (event === "order_created" && attr.status === "paid") {
    // 구독 첫 결제 시에도 order_created 가 온다. custom.plan 으로 즉시 부여.
    if (isLifetime) plan = "lifetime";
    else if (wantedPlan === "pro") plan = "pro";
  } else if (
    event === "subscription_created" ||
    event === "subscription_updated" ||
    event === "subscription_resumed"
  ) {
    const s = attr.status; // active | on_trial | paused | past_due | unpaid | cancelled | expired
    const active = s === "active" || s === "on_trial";
    plan = active ? (isLifetime ? "lifetime" : "pro") : "free";
    periodEnd = attr.renews_at ?? null;
    subId = String(body.data?.id ?? "");
  } else if (event === "subscription_cancelled" || event === "subscription_expired") {
    plan = "free";
  }

  console.log("[lemon webhook]", {
    event,
    status: attr.status,
    userId,
    wantedPlan,
    variantId,
    isLifetime,
    resolvedPlan: plan,
  });

  if (plan) {
    // 프로필 행이 없을 수도 있으므로 upsert
    await admin.from("profiles").upsert({
      id: userId,
      plan,
      current_period_end: periodEnd,
      ls_subscription_id: subId,
      ls_customer_id: String(attr.customer_id ?? "") || null,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, event, plan });
}
