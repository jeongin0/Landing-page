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
  // 체크아웃 시 넘긴 custom 데이터에서 user_id 회수
  const userId: string | undefined =
    body.meta?.custom_data?.user_id || attr.first_order_item?.custom_data?.user_id;

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

  if (event === "order_created" && attr.status === "paid") {
    // Lifetime(일회성) 결제
    plan = "lifetime";
  } else if (
    event === "subscription_created" ||
    event === "subscription_updated" ||
    event === "subscription_resumed"
  ) {
    const s = attr.status; // active | on_trial | paused | past_due | unpaid | cancelled | expired
    plan = s === "active" || s === "on_trial" ? "pro" : "free";
    periodEnd = attr.renews_at ?? null;
    subId = String(body.data?.id ?? "");
  } else if (event === "subscription_cancelled" || event === "subscription_expired") {
    plan = "free";
  }

  if (plan) {
    await admin
      .from("profiles")
      .update({
        plan,
        current_period_end: periodEnd,
        ls_subscription_id: subId,
        ls_customer_id: String(attr.customer_id ?? "") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true, event, plan });
}
