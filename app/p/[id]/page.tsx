import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { normalizeContent } from "@/lib/schema";
import StoreProduct from "@/components/templates/StoreProduct";
import { googleFontsHref } from "@/lib/fonts";

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
  if (!data) return null;
  return {
    title: data.title as string,
    content: normalizeContent(data.content),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getPublished(id);
  return {
    title: p?.content?.hero?.title?.split("\n")[0] || p?.title || "상세페이지",
  };
}

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getPublished(id);
  if (!p) notFound();

  const fontsHref = googleFontsHref(
    Object.values(p.content.textStyles ?? {}).map((s) => s.font),
  );

  return (
    <>
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}
      <StoreProduct content={p.content} editing={false} />
    </>
  );
}
