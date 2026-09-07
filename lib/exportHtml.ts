import type { StoreContent, SectionType } from "./schema";
import { WIDTH_PX } from "./schema";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br/>");

// StoreContent -> 외부 의존성 0 (Tailwind/JS 없음)의 자체 완결 HTML.
// 인라인 스타일 기반 + <style> 블록의 media query 로만 반응형.
// <style> 이 제거돼도 모바일 단일 컬럼으로 정상 표시됨.
export function exportHtml(c: StoreContent, watermark = false): string {
  const t = c.theme;
  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 960)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];

  const wrap = `max-width:${maxW}px;margin:0 auto;padding:0 20px;`;
  const card = `border:1px solid rgba(0,0,0,.06);border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.04);`;
  const btn = (big = false) =>
    `<a href="${esc(c.cta.href || "#")}" style="display:inline-block;background:${esc(
      t.primary,
    )};color:#fff;font-weight:700;border-radius:8px;text-decoration:none;padding:${
      big ? "16px 40px;font-size:18px" : "12px 28px"
    }">${esc(c.cta.text)}</a>`;

  const badge = c.hero.badge
    ? `<span style="display:inline-block;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:700;background:${esc(
        c.hero.badgeBg,
      )};color:${esc(c.hero.badgeText)}">${esc(c.hero.badge)}</span>`
    : "";

  const hIcon = (h: (typeof c.highlights)[number]) =>
    h.iconImage
      ? `<img src="${esc(h.iconImage)}" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:cover"/>`
      : `<div style="font-size:30px">${esc(h.icon)}</div>`;

  const S: Record<SectionType, () => string> = {
    hero: () => `<section class="lb-hero" style="${wrap}padding-top:56px;padding-bottom:56px">
  <div class="lb-hero-text">
    ${badge}
    <h1 style="margin:16px 0 0;font-size:32px;font-weight:800;line-height:1.2">${nl2br(c.hero.title)}</h1>
    <p style="margin:16px 0 0;font-size:16px;opacity:.8">${nl2br(c.hero.subtitle)}</p>
    <div style="margin-top:24px">${btn()}</div>
  </div>
  <img src="${esc(c.hero.image)}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:4/3;box-shadow:0 10px 30px rgba(0,0,0,.12)"/>
</section>`,

    highlights: () => `<section style="${wrap}padding:40px 20px">
  <div class="lb-grid3">${c.highlights
    .map(
      (h) => `<div style="${card}">
      ${hIcon(h)}
      <h3 style="margin:12px 0 0;font-weight:700">${esc(h.title)}</h3>
      <p style="margin:8px 0 0;font-size:14px;opacity:.75">${nl2br(h.desc)}</p></div>`,
    )
    .join("")}</div>
</section>`,

    detail: () => `<section class="lb-hero" style="${wrap}padding:56px 20px">
  <img src="${esc(c.detail.image)}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:4/3;box-shadow:0 10px 30px rgba(0,0,0,.12)"/>
  <div class="lb-hero-text">
    <h2 style="margin:0;font-size:24px;font-weight:800">${esc(c.detail.heading)}</h2>
    <p style="margin:16px 0 0;opacity:.8">${nl2br(c.detail.body)}</p>
  </div>
</section>`,

    specs: () => `<section style="${wrap}padding:40px 20px">
  <div style="border:1px solid rgba(0,0,0,.06);border-radius:16px;overflow:hidden">${c.specs
    .map(
      (s, i) => `<div style="display:flex;justify-content:space-between;padding:12px 20px;font-size:14px;${
        i < c.specs.length - 1 ? "border-bottom:1px solid rgba(0,0,0,.06)" : ""
      }">
      <span style="font-weight:700">${esc(s.label)}</span><span style="opacity:.75">${esc(s.value)}</span></div>`,
    )
    .join("")}</div>
</section>`,

    reviews: () => `<section style="${wrap}padding:40px 20px">
  <h2 style="text-align:center;font-size:24px;font-weight:800;margin:0 0 24px">고객 후기</h2>
  <div class="lb-grid3">${c.reviews
    .map(
      (r) => `<div style="${card}">
      <div style="color:#f59e0b">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p style="margin:8px 0 0;font-size:14px">${nl2br(r.text)}</p>
      <div style="margin:12px 0 0;font-size:12px;font-weight:700;opacity:.6">${esc(r.name)}</div></div>`,
    )
    .join("")}</div>
</section>`,

    pricing: () => `<section id="pricing" style="${wrap}padding:56px 20px;text-align:center">
  <div style="border:1px solid rgba(0,0,0,.06);border-radius:24px;padding:40px">
    <div style="display:flex;align-items:flex-end;justify-content:center;gap:12px">
      <span style="font-size:36px;font-weight:800">${esc(c.pricing.price)}</span>
      <span style="font-size:18px;text-decoration:line-through;opacity:.4">${esc(c.pricing.compareAt)}</span>
    </div>
    <p style="margin:8px 0 0;font-size:14px;opacity:.7">${esc(c.pricing.note)}</p>
    <div style="margin-top:24px">${btn(true)}</div>
  </div>
</section>`,

    faq: () => `<section style="${wrap}padding:40px 20px">
  <h2 style="font-size:24px;font-weight:800;margin:0 0 24px">자주 묻는 질문</h2>
  <div>${c.faq
    .map(
      (f) => `<div style="border:1px solid rgba(0,0,0,.06);border-radius:12px;padding:20px;margin-bottom:16px">
      <div style="font-weight:700">${esc(f.q)}</div>
      <p style="margin:8px 0 0;font-size:14px;opacity:.75">${nl2br(f.a)}</p></div>`,
    )
    .join("")}</div>
</section>`,
  };

  const body = c.sections
    .filter((s) => s.enabled)
    .map((s) => S[s.type]())
    .join("\n");

  const wm = watermark
    ? `<a href="https://landing-page-jeongin2.vercel.app" target="_blank" style="position:fixed;bottom:12px;right:12px;background:#111827;color:#fff;font:600 12px sans-serif;padding:6px 10px;border-radius:9999px;text-decoration:none;z-index:9999">랜딩페이지 빌더로 제작</a>`
    : "";

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(c.hero.title.split("\n")[0] || "상세페이지")}</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:${esc(t.bg)};color:${esc(t.text)};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.5}
  img{max-width:100%;display:block}
  .lb-grid3{display:grid;gap:24px}
  .lb-hero{display:block}
  .lb-hero-text{margin-top:24px}
  @media(min-width:768px){
    .lb-grid3{grid-template-columns:repeat(3,1fr)}
    .lb-hero{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
    .lb-hero-text{margin-top:0}
  }
</style>
</head>
<body>
${body}
${wm}
</body>
</html>`;
}
