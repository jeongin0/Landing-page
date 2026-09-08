import type { StoreContent, SectionRef } from "./schema";
import { WIDTH_PX, PAD_PX } from "./schema";
import { fontStack, googleFontsHref } from "./fonts";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br/>");

function isDarkHex(hex?: string): boolean {
  if (!hex) return false;
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

// StoreContent -> 외부 의존성 0 (Tailwind/JS 없음)의 자체 완결 HTML.
export function exportHtml(c: StoreContent): string {
  const t = c.theme;
  const primary = t.primary || "#2563eb";
  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 720)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];

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

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;
  const btn = (big: boolean, hidden: boolean) =>
    hidden
      ? ""
      : `<a href="${esc(c.cta.href || "#")}" style="display:inline-block;background:${esc(
          primary,
        )};color:#fff;font-weight:700;border-radius:12px;text-decoration:none;padding:${
          big ? "16px 40px;font-size:18px" : "13px 28px"
        };${sx("cta.text")}">${esc(c.cta.text)}</a>`;

  const badge = c.hero.badge
    ? `<span style="display:inline-block;border-radius:9999px;padding:5px 14px;font-size:12px;font-weight:700;background:${esc(
        c.hero.badgeBg,
      )};color:${esc(c.hero.badgeText)};${sx("hero.badge")}">${esc(c.hero.badge)}</span>`
    : "";

  const heroImg = (mode?: string) =>
    `<div style="width:${c.hero.imageW ?? 100}%;margin:0 auto"><img src="${esc(
      c.hero.image,
    )}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:${
      c.hero.imageAspect ?? (mode === "image" ? "1/1" : "4/3")
    };box-shadow:0 10px 30px rgba(0,0,0,.12)"/></div>`;
  const detailImg = (mode?: string) =>
    `<div style="width:${c.detail.imageW ?? 100}%;margin:0 auto"><img src="${esc(
      c.detail.image,
    )}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:${
      c.detail.imageAspect ?? (mode === "image" ? "1/1" : "4/3")
    };box-shadow:0 10px 30px rgba(0,0,0,.12)"/></div>`;

  // 섹션 내용 (배경/여백은 shell 이 담당)
  const inner = (s: SectionRef): string => {
    const dark = isDarkHex(s.bg);
    const bd = dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.08)";
    const soft = dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.03)";
    const heroTxt = `${badge}
      <h1 style="margin:16px 0 0;font-size:30px;font-weight:800;line-height:1.25;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
      <p style="margin:14px 0 0;font-size:16px;opacity:.75;line-height:1.6;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
      ${btn(false, heroCtaHidden) ? `<div style="margin-top:22px">${btn(false, heroCtaHidden)}</div>` : ""}`;

    switch (s.type) {
      case "hero":
        if (c.hero.mode === "text") return `<div>${heroTxt}</div>`;
        if (c.hero.mode === "image") return heroImg("image");
        return `<div class="lb-split lb-hero-main"><div>${heroTxt}</div>${heroImg()}</div>`;

      case "highlights":
        return c.highlights
          .map(
            (h, i) => `<div style="display:flex;gap:16px;align-items:flex-start;border:1px solid ${bd};border-radius:16px;padding:18px;margin-bottom:12px">
        <span style="flex:0 0 auto;width:40px;height:40px;border-radius:12px;background:${esc(primary)};color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center">${
          h.iconImage
            ? `<img src="${esc(h.iconImage)}" alt="" style="width:100%;height:100%;border-radius:12px;object-fit:cover"/>`
            : String(i + 1).padStart(2, "0")
        }</span>
        <div style="flex:1;min-width:0">
          <h3 style="margin:0;font-weight:700;${sx("highlights.title")}">${esc(h.title)}</h3>
          <p style="margin:4px 0 0;font-size:14px;opacity:.7;line-height:1.6;${sx("highlights.desc")}">${nl2br(h.desc)}</p>
        </div></div>`,
          )
          .join("");

      case "checklist":
        return `<h2 style="text-align:center;margin:0 0 22px;font-size:24px;font-weight:800;${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
      <div style="max-width:520px;margin:0 auto">${c.checklist.items
        .map(
          (it) => `<div style="display:flex;gap:12px;align-items:flex-start;border:1px solid ${bd};background:${soft};border-radius:12px;padding:12px 16px;margin-bottom:10px">
          <span style="flex:0 0 auto;width:20px;height:20px;border-radius:9999px;background:${esc(primary)};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:2px">✓</span>
          <span style="font-size:14px;font-weight:500;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></div>`,
        )
        .join("")}</div>`;

      case "callout":
        return `<div style="text-align:center">
        <p style="margin:0;font-size:26px;font-weight:800;line-height:1.4;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
        ${c.callout.sub ? `<p style="margin:12px 0 0;font-size:14px;opacity:.7;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
      </div>`;

      case "steps":
        return `<h2 style="text-align:center;margin:0 0 22px;font-size:24px;font-weight:800;${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
      ${c.steps.items
        .map(
          (st) => `<div style="border:1px solid ${bd};border-radius:16px;padding:18px;margin-bottom:12px">
          <div style="font-weight:800;color:${esc(primary)};${sx("steps.title")}">${esc(st.title)}</div>
          <p style="margin:4px 0 0;font-size:14px;opacity:.7;line-height:1.6;${sx("steps.desc")}">${nl2br(st.desc)}</p></div>`,
        )
        .join("")}`;

      case "detail": {
        const dTxt = `<div>
          <h2 style="margin:0;font-size:24px;font-weight:800;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
          <p style="margin:14px 0 0;opacity:.8;line-height:1.7;${sx("detail.body")}">${nl2br(c.detail.body)}</p>
        </div>`;
        if (c.detail.mode === "text") return dTxt;
        if (c.detail.mode === "image") return detailImg("image");
        return `<div class="lb-split lb-detail-main"><div>${detailImg()}</div>${dTxt}</div>`;
      }

      case "specs":
        return `<div style="border:1px solid ${bd};border-radius:16px;overflow:hidden">${c.specs
          .map(
            (sp, i) => `<div style="display:flex;justify-content:space-between;padding:13px 20px;font-size:14px;${
              i < c.specs.length - 1 ? `border-bottom:1px solid ${bd}` : ""
            }">
        <span style="font-weight:700;${sx("specs.label")}">${esc(sp.label)}</span><span style="opacity:.7;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
          )
          .join("")}</div>`;

      case "reviews":
        return `<h2 style="text-align:center;font-size:24px;font-weight:800;margin:0 0 22px">고객 후기</h2>
      <div class="lb-grid lb-grid-r">${c.reviews
        .map(
          (r) => `<div style="border:1px solid ${bd};border-radius:16px;padding:20px;display:flex;flex-direction:column">
        <div style="color:#fbbf24">★★★★★</div>
        <p style="margin:8px 0 0;font-size:14px;flex:1;line-height:1.6;${sx("reviews.text")}">${nl2br(r.text)}</p>
        <div style="margin:12px 0 0;font-size:12px;font-weight:700;opacity:.55;${sx("reviews.name")}">${esc(r.name)}</div></div>`,
        )
        .join("")}</div>`;

      case "pricing":
        return `<div style="max-width:420px;margin:0 auto;border:1px solid ${bd};background:${soft};border-radius:24px;padding:36px;text-align:center">
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:12px">
          <span style="font-size:36px;font-weight:800;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
          <span style="font-size:18px;text-decoration:line-through;opacity:.4;padding-bottom:4px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
        </div>
        <p style="margin:8px 0 0;font-size:14px;opacity:.7;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
        ${btn(true, pricingCtaHidden) ? `<div style="margin-top:22px">${btn(true, pricingCtaHidden)}</div>` : ""}
      </div>`;

      case "faq":
        return `<h2 style="font-size:24px;font-weight:800;margin:0 0 20px">자주 묻는 질문</h2>
      ${c.faq
        .map(
          (f) => `<div style="border:1px solid ${bd};border-radius:12px;padding:18px;margin-bottom:12px">
        <div style="font-weight:700;${sx("faq.q")}">${esc(f.q)}</div>
        <p style="margin:8px 0 0;font-size:14px;opacity:.7;line-height:1.6;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
        )
        .join("")}`;

      case "block": {
        if (!s.block) return "";
        const b = s.block;
        const bImg = `<img src="${esc(b.image)}" alt="" style="width:100%;border-radius:16px;object-fit:cover;aspect-ratio:${
          b.imageAspect ?? "4/3"
        };box-shadow:0 10px 30px rgba(0,0,0,.12)"/>`;
        const bTxt = `<div style="text-align:${b.align === "center" ? "center" : "left"}">
          <h2 style="margin:0;font-size:24px;font-weight:800;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
          <p style="margin:12px 0 0;opacity:.8;line-height:1.7;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>
        </div>`;
        if (b.mode === "text") return bTxt;
        if (b.mode === "image") return bImg;
        return `<div class="lb-split lb-split-5050"><div>${bImg}</div>${bTxt}</div>`;
      }
      default:
        return "";
    }
  };

  const shell = (s: SectionRef): string => {
    const html = inner(s);
    if (!html.trim()) return "";
    const dark = isDarkHex(s.bg);
    const pad = PAD_PX[s.pad ?? "normal"];
    const sw = s.w ? WIDTH_PX[s.w] : maxW;
    const bg = s.bg ? `background:${esc(s.bg)};` : "";
    const bgImg = s.bgImage
      ? `background-image:url("${esc(s.bgImage)}");background-size:cover;background-position:center;`
      : "";
    return `<section style="${bg}${bgImg}${dark ? "color:#fff;" : ""}padding:${pad}px 0">
  <div style="max-width:${sw}px;margin:0 auto;padding:0 20px">${html}</div>
</section>`;
  };

  const body = c.sections
    .filter((s) => s.enabled)
    .map(shell)
    .join("\n");

  const fontsHref = googleFontsHref(Object.values(ts).map((s) => s.font));

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(c.hero.title.split("\n")[0] || "상세페이지")}</title>${
    fontsHref
      ? `\n<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link rel="stylesheet" href="${fontsHref}"/>`
      : ""
  }
<style>
  *{box-sizing:border-box}
  body{margin:0;background:${esc(t.bg)};color:${esc(t.text)};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.5;word-break:keep-all;overflow-wrap:break-word}
  img{max-width:100%;display:block}
  .lb-split{display:block}
  .lb-split>*+*{margin-top:24px}
  .lb-grid{display:grid;gap:16px}
  @media(min-width:768px){
    .lb-split{display:grid;gap:32px;align-items:center}
    .lb-split>*+*{margin-top:0}
    .lb-hero-main{grid-template-columns:${100 - (c.hero.splitPct ?? 50)}fr ${c.hero.splitPct ?? 50}fr}
    .lb-detail-main{grid-template-columns:${c.detail.splitPct ?? 50}fr ${100 - (c.detail.splitPct ?? 50)}fr}
    .lb-split-5050{grid-template-columns:1fr 1fr}
    .lb-grid-r{grid-template-columns:repeat(${Math.min(3, Math.max(1, c.reviews.length))},1fr)}
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
