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
        )};color:#fff;font-weight:700;border-radius:9999px;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.15);padding:${
          big ? "16px 48px;font-size:18px" : "14px 36px"
        };${sx("cta.text")}">${esc(c.cta.text)}</a>`;

  const badge = c.hero.badge
    ? `<span style="display:inline-block;border-radius:9999px;padding:6px 16px;font-size:12px;font-weight:700;letter-spacing:.02em;background:${esc(
        c.hero.badgeBg,
      )};color:${esc(c.hero.badgeText)};${sx("hero.badge")}">${esc(c.hero.badge)}</span>`
    : "";

  // 잘리지 않는 이미지 (통이미지) — 섹션 좌우 여백까지 꽉 채움
  const naturalImg = (src: string, w?: number) =>
    `<div style="margin:0 -20px"><div style="width:${Math.max(
      20,
      Math.min(100, w ?? 100),
    )}%;margin:0 auto"><img src="${esc(
      src,
    )}" alt="" style="display:block;width:100%"/></div></div>`;
  // 비율 고정 이미지
  const ratioImg = (src: string, w?: number, aspect?: number, fallback = "4/3") =>
    `<div style="width:${Math.max(20, Math.min(100, w ?? 100))}%;margin:0 auto"><img src="${esc(
      src,
    )}" alt="" style="display:block;width:100%;border-radius:24px;object-fit:cover;aspect-ratio:${
      aspect ?? fallback
    };box-shadow:0 16px 40px rgba(0,0,0,.16)"/></div>`;

  const inner = (s: SectionRef, onDark: boolean): string => {
    const bd = onDark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.08)";
    const soft = onDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.03)";

    const heroText = `<div style="text-align:center">
      ${badge}
      <h1 style="margin:20px 0 0;font-size:29px;font-weight:800;line-height:1.3;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
      <p style="margin:16px auto 0;max-width:520px;font-size:15px;line-height:1.7;opacity:${onDark ? ".85" : ".65"};${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
      ${btn(false, heroCtaHidden) ? `<div style="margin-top:26px">${btn(false, heroCtaHidden)}</div>` : ""}
    </div>`;

    switch (s.type) {
      case "hero":
        if (c.hero.mode === "text") return heroText;
        if (c.hero.mode === "image") return naturalImg(c.hero.image, c.hero.imageW);
        return `${heroText}<div style="margin-top:40px">${ratioImg(c.hero.image, c.hero.imageW, c.hero.imageAspect)}</div>`;

      case "highlights":
        return c.highlights
          .map(
            (h, i) => `<div style="display:flex;gap:16px;align-items:flex-start;border:1px solid ${bd};background:${soft};border-radius:16px;padding:20px;margin-bottom:14px">
        <span style="flex:0 0 auto;width:44px;height:44px;border-radius:16px;overflow:hidden;background:${esc(primary)};color:#fff;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center">${
          h.iconImage
            ? `<img src="${esc(h.iconImage)}" alt="" style="width:100%;height:100%;object-fit:cover"/>`
            : String(i + 1).padStart(2, "0")
        }</span>
        <div style="flex:1;min-width:0">
          <h3 style="margin:0;font-weight:700;${sx("highlights.title")}">${esc(h.title)}</h3>
          <p style="margin:6px 0 0;font-size:14px;opacity:.65;line-height:1.65;${sx("highlights.desc")}">${nl2br(h.desc)}</p>
        </div></div>`,
          )
          .join("");

      case "checklist":
        return `<h2 style="text-align:center;margin:0 0 26px;font-size:23px;font-weight:800;${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
      <div style="max-width:520px;margin:0 auto">${c.checklist.items
        .map(
          (it) => `<div style="display:flex;gap:12px;align-items:flex-start;border:1px solid ${bd};background:${
            onDark ? "rgba(255,255,255,.06)" : soft
          };border-radius:16px;padding:14px 18px;margin-bottom:10px">
          <span style="flex:0 0 auto;width:20px;height:20px;border-radius:9999px;background:${esc(primary)};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:2px">✓</span>
          <span style="font-size:14px;font-weight:500;line-height:1.65;${sx("checklist.item")}">${esc(it.text)}</span></div>`,
        )
        .join("")}</div>`;

      case "callout":
        return `<div style="text-align:center">
        <p style="margin:0;font-size:25px;font-weight:800;line-height:1.4;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
        ${c.callout.sub ? `<p style="margin:14px auto 0;max-width:420px;font-size:14px;opacity:.65;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
      </div>`;

      case "steps":
        return `<h2 style="text-align:center;margin:0 0 26px;font-size:23px;font-weight:800;${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
      ${c.steps.items
        .map(
          (st, i) => `<div style="display:flex;gap:16px;align-items:flex-start;border:1px solid ${bd};background:${soft};border-radius:16px;padding:20px;margin-bottom:14px">
          <span style="font-size:18px;font-weight:900;opacity:.25">${String(i + 1).padStart(2, "0")}</span>
          <div style="flex:1">
            <div style="font-weight:800;color:${esc(primary)};${sx("steps.title")}">${esc(st.title)}</div>
            <p style="margin:4px 0 0;font-size:14px;opacity:.65;line-height:1.65;${sx("steps.desc")}">${nl2br(st.desc)}</p>
          </div></div>`,
        )
        .join("")}`;

      case "detail": {
        const dHead = `<h2 style="text-align:center;margin:0;font-size:23px;font-weight:800;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>`;
        const dBody = `<p style="text-align:center;margin:16px 0 0;opacity:.75;line-height:1.75;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
        if (c.detail.mode === "text") return `${dHead}${dBody}`;
        if (c.detail.mode === "image") return naturalImg(c.detail.image, c.detail.imageW);
        return `${dHead}${dBody}<div style="margin-top:32px">${ratioImg(c.detail.image, c.detail.imageW, c.detail.imageAspect)}</div>`;
      }

      case "specs":
        return `<div style="border:1px solid ${bd};border-radius:16px;overflow:hidden">${c.specs
          .map(
            (sp, i) => `<div style="display:flex;justify-content:space-between;padding:14px 20px;font-size:14px;${
              i < c.specs.length - 1 ? `border-bottom:1px solid ${bd}` : ""
            }">
        <span style="font-weight:700;${sx("specs.label")}">${esc(sp.label)}</span><span style="opacity:.65;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
          )
          .join("")}</div>`;

      case "reviews":
        return `<h2 style="text-align:center;font-size:23px;font-weight:800;margin:0 0 26px">고객 후기</h2>
      ${c.reviews
        .map(
          (r) => `<div style="border:1px solid ${bd};background:${soft};border-radius:16px;padding:20px;margin-bottom:14px">
        <div style="color:#fbbf24;letter-spacing:.15em;font-size:13px">★★★★★</div>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.65;${sx("reviews.text")}">${nl2br(r.text)}</p>
        <div style="margin:12px 0 0;font-size:12px;font-weight:700;opacity:.5;${sx("reviews.name")}">${esc(r.name)}</div></div>`,
        )
        .join("")}`;

      case "pricing":
        return `<div style="max-width:380px;margin:0 auto;border:1px solid ${bd};background:${
          onDark ? "rgba(255,255,255,.06)" : soft
        };border-radius:28px;padding:36px;text-align:center">
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:10px">
          <span style="font-size:40px;font-weight:800;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
          <span style="font-size:16px;text-decoration:line-through;opacity:.4;padding-bottom:6px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
        </div>
        <p style="margin:12px 0 0;font-size:14px;opacity:.65;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
        ${btn(true, pricingCtaHidden) ? `<div style="margin-top:26px">${btn(true, pricingCtaHidden)}</div>` : ""}
      </div>`;

      case "faq":
        return `<h2 style="text-align:center;font-size:23px;font-weight:800;margin:0 0 26px">자주 묻는 질문</h2>
      <div style="max-width:560px;margin:0 auto">${c.faq
        .map(
          (f) => `<div style="border:1px solid ${bd};border-radius:16px;padding:20px;margin-bottom:12px">
        <div style="font-weight:700;${sx("faq.q")}">${esc(f.q)}</div>
        <p style="margin:8px 0 0;font-size:14px;opacity:.65;line-height:1.65;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
        )
        .join("")}</div>`;

      case "block": {
        if (!s.block) return "";
        const b = s.block;
        const bTxt = `<div style="text-align:${b.align === "center" ? "center" : "left"}">
          <h2 style="margin:0;font-size:23px;font-weight:800;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
          <p style="margin:14px 0 0;opacity:.75;line-height:1.75;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>
        </div>`;
        if (b.mode === "text") return bTxt;
        if (b.mode === "image") return naturalImg(b.image, b.imageW);
        return `${ratioImg(b.image, b.imageW, b.imageAspect)}<div style="margin-top:24px">${bTxt}</div>`;
      }
      default:
        return "";
    }
  };

  const shell = (s: SectionRef): string => {
    const hasBgImg = !!s.bgImage;
    const contain = s.bgFit === "contain";
    const onDark = isDarkHex(s.bg) || (hasBgImg && !contain);
    const html = inner(s, onDark);
    if (!html.trim()) return "";
    const pad = PAD_PX[s.pad ?? "normal"];
    const sw = s.w ? WIDTH_PX[s.w] : maxW;
    const bg = s.bg ? `background:${esc(s.bg)};` : "";
    const bgLayer = hasBgImg
      ? `<div style="position:absolute;inset:0;background-image:url(&quot;${esc(
          s.bgImage!,
        )}&quot;);background-repeat:no-repeat;background-size:${
          contain ? "contain" : "cover"
        };background-position:center;${
          s.bgFixed ? "background-attachment:fixed;" : ""
        }"></div>${
          contain
            ? ""
            : `<div style="position:absolute;inset:0;background:${esc(s.bg || "rgba(0,0,0,.4)")}"></div>`
        }`
      : "";
    return `<section style="position:relative;${bg}${onDark ? "color:#fff;" : ""}padding:${pad}px 0">
  ${bgLayer}
  <div style="position:relative;max-width:${sw}px;margin:0 auto;padding:0 20px">${html}</div>
</section>`;
  };

  const body = c.sections.filter((s) => s.enabled).map(shell).join("\n");
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
  img{max-width:100%}
  @media(min-width:768px){
    h1{font-size:40px!important}
    .lb-hd{font-size:26px!important}
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
