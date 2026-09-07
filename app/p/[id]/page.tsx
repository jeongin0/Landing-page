import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { StoreContent } from "@/lib/schema";
import StoreProduct from "@/components/templates/StoreProduct";

export const revalidate = 60; // 게시 페이지는 60초 캐시

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

async function getPublished(id: string) {
  const { data } = await db()
    .from("projects")
    .select("title, content, published")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  return data as { title: string; content: StoreContent } | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getPublished(id);
  return { title: p?.content?.brand?.name || p?.title || "랜딩페이지" };
}

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getPublished(id);
  if (!p) notFound();

  return <StoreProduct content={p.content} editing={false} />;
}
