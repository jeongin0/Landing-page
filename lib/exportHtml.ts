import type { StoreContent } from "./schema";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br/>");

// StoreContent -> 독립 실행 HTML (Tailwind CDN 포함)
export function exportHtml(c: StoreContent, watermark = false): string {
  const wm = watermark
    ? `<a href="https://landing-page-jeongin2.vercel.app" target="_blank" style="position:fixed;bottom:12px;right:12px;background:#111827;color:#fff;font:600 12px system-ui;padding:6px 10px;border-radius:9999px;text-decoration:none;z-index:9999">랜딩페이지 빌더로 제작</a>`
    : "";
  const t = c.theme;
  const btn = `display:inline-block;background:${esc(t.primary)};color:#fff;font-weight:700;border-radius:.5rem;padding:.9rem 2rem;text-decoration:none`;

  const highlights = c.highlights
    .map(
      (h) => `<div class="rounded-2xl border border-black/5 p-6 shadow-sm">
      <div class="text-3xl">${esc(h.icon)}</div>
      <h3 class="mt-3 font-bold">${esc(h.title)}</h3>
      <p class="mt-2 text-sm opacity-75">${nl2br(h.desc)}</p></div>`,
    )
    .join("");

  const specs = c.specs
    .map(
      (s) => `<div class="flex justify-between border-b border-black/5 px-5 py-3 text-sm last:border-0">
      <span class="font-semibold">${esc(s.label)}</span><span class="opacity-75">${esc(s.value)}</span></div>`,
    )
    .join("");

  const reviews = c.reviews
    .map(
      (r) => `<div class="rounded-2xl border border-black/5 p-6 shadow-sm">
      <div style="color:#f59e0b">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="mt-2 text-sm">${nl2br(r.text)}</p>
      <div class="mt-3 text-xs font-semibold opacity-60">${esc(r.name)}</div></div>`,
    )
    .join("");

  const faq = c.faq
    .map(
      (f) => `<div class="rounded-xl border border-black/5 p-5">
      <div class="font-semibold">${esc(f.q)}</div>
      <p class="mt-2 text-sm opacity-75">${nl2br(f.a)}</p></div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(c.brand.name)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>body{margin:0;background:${esc(t.bg)};color:${esc(t.text)}}</style>
</head>
<body>
<header class="sticky top-0 z-10 border-b border-black/5 backdrop-blur" style="background:${esc(t.bg)}e6">
  <div class="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
    <span class="text-lg font-bold">${esc(c.brand.name)}</span>
    <a href="#pricing" style="${btn};padding:.5rem 1rem;font-size:.875rem;border-radius:9999px">${esc(c.brand.ctaText)}</a>
  </div>
</header>

<section class="mx-auto grid max-w-5xl items-center gap-10 px-5 py-16 md:grid-cols-2">
  <div>
    <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold" style="background:${esc(t.primary)}1a;color:${esc(t.primary)}">${esc(c.hero.badge)}</span>
    <h1 class="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">${nl2br(c.hero.title)}</h1>
    <p class="mt-4 text-base opacity-80">${nl2br(c.hero.subtitle)}</p>
    <a href="#pricing" class="mt-6" style="${btn}">${esc(c.hero.ctaText)}</a>
  </div>
  <img src="${esc(c.hero.image)}" alt="" class="w-full rounded-2xl object-cover shadow-lg" style="aspect-ratio:4/3"/>
</section>

<section class="mx-auto max-w-5xl px-5 py-12">
  <div class="grid gap-6 md:grid-cols-3">${highlights}</div>
</section>

<section class="mx-auto grid max-w-5xl items-center gap-10 px-5 py-16 md:grid-cols-2">
  <img src="${esc(c.detail.image)}" alt="" class="w-full rounded-2xl object-cover shadow-lg" style="aspect-ratio:4/3"/>
  <div>
    <h2 class="text-2xl font-extrabold">${esc(c.detail.heading)}</h2>
    <p class="mt-4 opacity-80">${nl2br(c.detail.body)}</p>
  </div>
</section>

<section class="mx-auto max-w-3xl px-5 py-12">
  <div class="overflow-hidden rounded-2xl border border-black/5">${specs}</div>
</section>

<section class="mx-auto max-w-5xl px-5 py-12">
  <h2 class="mb-6 text-center text-2xl font-extrabold">고객 후기</h2>
  <div class="grid gap-6 md:grid-cols-3">${reviews}</div>
</section>

<section id="pricing" class="mx-auto max-w-3xl px-5 py-16 text-center">
  <div class="rounded-3xl border border-black/5 p-10 shadow-sm">
    <div class="flex items-end justify-center gap-3">
      <span class="text-4xl font-extrabold">${esc(c.pricing.price)}</span>
      <span class="text-lg line-through opacity-40">${esc(c.pricing.compareAt)}</span>
    </div>
    <p class="mt-2 text-sm opacity-70">${esc(c.pricing.note)}</p>
    <a href="#" class="mt-6" style="${btn};padding:1rem 2.5rem;font-size:1.125rem">${esc(c.pricing.ctaText)}</a>
  </div>
</section>

<section class="mx-auto max-w-3xl px-5 py-12">
  <h2 class="mb-6 text-2xl font-extrabold">자주 묻는 질문</h2>
  <div class="space-y-4">${faq}</div>
</section>

<footer class="border-t border-black/5 px-5 py-10 text-center text-xs opacity-60">${nl2br(c.footer.text)}</footer>
${wm}
</body>
</html>`;
}
