import type { StoreContent, SectionType } from "./schema";
import { WIDTH_PX } from "./schema";
import { fontStack, googleFontsHref } from "./fonts";

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
export function exportHtml(c: StoreContent): string {
  const t = c.theme;
  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 960)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];

  const wrap = `padding:0 20px;`;
  const secMax = (w?: keyof typeof WIDTH_PX) => (w ? WIDTH_PX[w] : maxW);

  // 텍스트 블록별 폰트/크기 오버라이드 → 인라인 스타일 조각
  const ts = c.textStyles || {};
  const sx = (key: string) => {
    const s = ts[key];
    if (!s) return "";
    const parts: string[] = [];
    const f = fontStack(s.font);
    if (f) parts.push(`font-family:${f}`);
    if (s.size) parts.push(`font-size:${s.size}px`);
    return parts.length ? parts.join(";") + ";" : "";
  };
  const card = `border:1px solid rgba(0,0,0,.06);border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.04);`;
  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;
  const btn = (big = false, hidden = false) =>
    hidden
      ? ""
      : `<a href="${esc(c.cta.href || "#")}" style="display:inline-block;background:${esc(
          t.primary,
        )};color:#fff;font-weight:700;border-radius:8px;text-decoration:none;padding:${
          big ? "16px 40px;font-size:18px" : "12px 28px"
        };${sx("cta.text")}">${esc(c.cta.text)}</a>`;

  const badge = c.hero.badge
    ? `<span style="display:inline-block;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:700;background:${esc(
        c.hero.badgeBg,
      )};color:${esc(c.hero.badgeText)};${sx("hero.badge")}">${esc(c.hero.badge)}</span>`
    : "";

  const hIcon = (h: (typeof c.highlights)[number]) =>
    h.iconImage
      ? `<img src="${esc(h.iconImage)}" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:cover"/>`
      : `<div style="font-size:30px">${esc(h.icon)}</div>`;

  const S: Record<SectionType, () => string> = {
    hero: () => {
      const hImg = `<div style="width:${c.hero.imageW ?? 100}%;margin:0 auto"><img src="${esc(
        c.hero.image,
      )}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:${
        c.hero.imageAspect ?? (c.hero.mode === "image" ? "16/9" : "4/3")
      };box-shadow:0 10px 30px rgba(0,0,0,.12)"/></div>`;
      const hText = `<div class="lb-hero-text">
    ${badge}
    <h1 style="margin:16px 0 0;font-size:32px;font-weight:800;line-height:1.2;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
    <p style="margin:16px 0 0;font-size:16px;opacity:.8;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
    ${btn(false, heroCtaHidden) ? `<div style="margin-top:24px">${btn(false, heroCtaHidden)}</div>` : ""}
  </div>`;
      if (c.hero.mode === "text")
        return `<section style="${wrap}padding:56px 20px">${hText}</section>`;
      if (c.hero.mode === "image")
        return `<section style="${wrap}padding:56px 20px">${hImg}</section>`;
      return `<section class="lb-hero lb-hero-main" style="${wrap}padding-top:56px;padding-bottom:56px">${hText}${hImg}</section>`;
    },

    highlights: () => `<section style="${wrap}padding:40px 20px">
  <div class="lb-grid3 lb-grid-h">${c.highlights
    .map(
      (h) => `<div style="${card}">
      ${hIcon(h)}
      <h3 style="margin:12px 0 0;font-weight:700;${sx("highlights.title")}">${esc(h.title)}</h3>
      <p style="margin:8px 0 0;font-size:14px;opacity:.75;${sx("highlights.desc")}">${nl2br(h.desc)}</p></div>`,
    )
    .join("")}</div>
</section>`,

    detail: () => {
      const dImg = `<div style="width:${c.detail.imageW ?? 100}%;margin:0 auto"><img src="${esc(
        c.detail.image,
      )}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:${
        c.detail.imageAspect ?? (c.detail.mode === "image" ? "16/9" : "4/3")
      };box-shadow:0 10px 30px rgba(0,0,0,.12)"/></div>`;
      const dText = `<div class="lb-hero-text">
    <h2 style="margin:0;font-size:24px;font-weight:800;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
    <p style="margin:16px 0 0;opacity:.8;${sx("detail.body")}">${nl2br(c.detail.body)}</p>
  </div>`;
      if (c.detail.mode === "text")
        return `<section style="${wrap}padding:56px 20px">${dText}</section>`;
      if (c.detail.mode === "image")
        return `<section style="${wrap}padding:56px 20px">${dImg}</section>`;
      return `<section class="lb-hero lb-detail-main" style="${wrap}padding:56px 20px">${dImg}${dText}</section>`;
    },

    specs: () => `<section style="${wrap}padding:40px 20px">
  <div style="border:1px solid rgba(0,0,0,.06);border-radius:16px;overflow:hidden">${c.specs
    .map(
      (s, i) => `<div style="display:flex;justify-content:space-between;padding:12px 20px;font-size:14px;${
        i < c.specs.length - 1 ? "border-bottom:1px solid rgba(0,0,0,.06)" : ""
      }">
      <span style="font-weight:700;${sx("specs.label")}">${esc(s.label)}</span><span style="opacity:.75;${sx("specs.value")}">${esc(s.value)}</span></div>`,
    )
    .join("")}</div>
</section>`,

    reviews: () => `<section style="${wrap}padding:40px 20px">
  <h2 style="text-align:center;font-size:24px;font-weight:800;margin:0 0 24px">고객 후기</h2>
  <div class="lb-grid3 lb-grid-r">${c.reviews
    .map(
      (r) => `<div style="${card}display:flex;flex-direction:column">
      <div style="color:#f59e0b">★★★★★</div>
      <p style="margin:8px 0 0;font-size:14px;flex:1;${sx("reviews.text")}">${nl2br(r.text)}</p>
      <div style="margin:12px 0 0;font-size:12px;font-weight:700;opacity:.6;${sx("reviews.name")}">${esc(r.name)}</div></div>`,
    )
    .join("")}</div>
</section>`,

    pricing: () => `<section id="pricing" style="${wrap}padding:56px 20px;text-align:center">
  <div style="border:1px solid rgba(0,0,0,.06);border-radius:24px;padding:40px">
    <div style="display:flex;align-items:flex-end;justify-content:center;gap:12px">
      <span style="font-size:36px;font-weight:800;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
      <span style="font-size:18px;text-decoration:line-through;opacity:.4;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
    </div>
    <p style="margin:8px 0 0;font-size:14px;opacity:.7;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
    ${btn(true, pricingCtaHidden) ? `<div style="margin-top:24px">${btn(true, pricingCtaHidden)}</div>` : ""}
  </div>
</section>`,

    faq: () => `<section style="${wrap}padding:40px 20px">
  <h2 style="font-size:24px;font-weight:800;margin:0 0 24px">자주 묻는 질문</h2>
  <div>${c.faq
    .map(
      (f) => `<div style="border:1px solid rgba(0,0,0,.06);border-radius:12px;padding:20px;margin-bottom:16px">
      <div style="font-weight:700;${sx("faq.q")}">${esc(f.q)}</div>
      <p style="margin:8px 0 0;font-size:14px;opacity:.75;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
    )
    .join("")}</div>
</section>`,
  };

  const body = c.sections
    .filter((s) => s.enabled)
    .map(
      (s) =>
        `<div style="max-width:${secMax(s.w)}px;margin:0 auto">${S[s.type]()}</div>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(c.hero.title.split("\n")[0] || "상세페이지")}</title>${
    googleFontsHref(Object.values(ts).map((s) => s.font))
      ? `\n<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link rel="stylesheet" href="${googleFontsHref(
          Object.values(ts).map((s) => s.font),
        )}"/>`
      : ""
  }
<style>
  *{box-sizing:border-box}
  body{margin:0;background:${esc(t.bg)};color:${esc(t.text)};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.5;word-break:keep-all;overflow-wrap:break-word}
  img{max-width:100%;display:block}
  .lb-grid3{display:grid;gap:24px}
  .lb-hero{display:block}
  .lb-hero-text{margin-top:24px}
  @media(min-width:768px){
    .lb-grid3{grid-template-columns:repeat(3,1fr)}
    .lb-grid-h{grid-template-columns:repeat(${Math.max(1, c.highlights.length)},1fr)}
    .lb-grid-r{grid-template-columns:repeat(${Math.max(1, c.reviews.length)},1fr)}
    .lb-hero{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
    .lb-hero-main{grid-template-columns:${100 - (c.hero.splitPct ?? 50)}fr ${c.hero.splitPct ?? 50}fr}
    .lb-detail-main{grid-template-columns:${c.detail.splitPct ?? 50}fr ${100 - (c.detail.splitPct ?? 50)}fr}
    .lb-hero-text{margin-top:0}
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
