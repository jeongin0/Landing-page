import type { StoreContent, SectionRef } from "./schema";
import { WIDTH_PX, PAD_PX, clampStyle } from "./schema";
import { fontStack, googleFontsHref } from "./fonts";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br/>");
const pad2 = (n: number) => String(n).padStart(2, "0");

const alpha = (hex: string, hh: string) => {
  const m = /^#?([0-9a-fA-F]{6})/.exec(hex || "");
  return m ? "#" + m[1] + hh : hex;
};

function isDarkHex(hex?: string): boolean {
  if (!hex) return false;
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

const SERIF = "'Nanum Myeongjo', ui-serif, Georgia, 'Times New Roman', serif";

export function exportHtml(c: StoreContent): string {
  const t = c.theme;
  const primary = t.primary || "#2563eb";
  const style = clampStyle(c.style);
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

  const href = esc(c.cta.href || "#");
  const ctaText = `<span style="${sx("cta.text")}">${esc(c.cta.text)}</span>`;
  const btn = (big: boolean) => {
    if (style === "editorial")
      return `<a href="${href}" style="display:inline-block;border:1px solid currentColor;text-decoration:none;color:inherit;padding:${
        big ? "16px 48px" : "14px 44px"
      };font-size:11px;font-weight:600;letter-spacing:.24em;text-transform:uppercase">${ctaText}</a>`;
    if (style === "showcase")
      return `<a href="${href}" style="display:inline-block;background:${esc(
        primary,
      )};color:#fff;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 10px 24px rgba(0,0,0,.16);padding:${
        big ? "16px 40px;font-size:16px" : "14px 28px;font-size:14px"
      }">${ctaText}</a>`;
    // bold
    return `<a href="${href}" style="display:inline-block;background:${esc(
      primary,
    )};color:#fff;font-weight:900;border-radius:9999px;text-decoration:none;box-shadow:0 12px 30px rgba(0,0,0,.2);padding:${
      big ? "18px 40px;font-size:18px" : "16px 40px;font-size:16px"
    }">${ctaText}</a>`;
  };

  // 이미지 헬퍼
  const naturalImg = (src: string, w?: number) =>
    `<div style="margin:0 -20px"><div style="width:${Math.max(
      20,
      Math.min(100, w ?? 100),
    )}%;margin:0 auto"><img src="${esc(src)}" alt="" style="display:block;width:100%"/></div></div>`;
  const ratioImg = (
    src: string,
    w: number | undefined,
    aspect: number | undefined,
    fallback: string,
  ) => {
    const radius =
      style === "editorial" ? "0" : style === "showcase" ? "24px" : "28px";
    const shadow =
      style === "editorial" ? "none" : "0 18px 44px rgba(0,0,0,.18)";
    return `<div style="width:${Math.max(20, Math.min(100, w ?? 100))}%;margin:0 auto"><img src="${esc(
      src,
    )}" alt="" style="display:block;width:100%;border-radius:${radius};object-fit:cover;aspect-ratio:${
      aspect ?? fallback
    };box-shadow:${shadow}"/></div>`;
  };

  const badgeHtml = () => {
    if (!c.hero.badge) return "";
    if (style === "editorial")
      return `<div style="margin-bottom:24px;font-size:11px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;opacity:.45;${sx(
        "hero.badge",
      )}">${esc(c.hero.badge)}</div>`;
    return `<span style="display:inline-block;border-radius:9999px;padding:6px 16px;font-size:12px;font-weight:${
      style === "bold" ? 900 : 700
    };letter-spacing:.02em;background:${esc(c.hero.badgeBg)};color:${esc(
      c.hero.badgeText,
    )};${sx("hero.badge")}">${esc(c.hero.badge)}</span>`;
  };

  // ── 스타일별 섹션 렌더러 ────────────────────────────────
  const h2Style = (extra = "") => {
    if (style === "editorial")
      return `font-family:${SERIF};font-weight:500;font-size:26px;line-height:1.25;${extra}`;
    if (style === "showcase")
      return `font-weight:800;font-size:24px;${extra}`;
    return `font-weight:900;font-size:24px;line-height:1.2;${extra}`;
  };

  const bold = (s: SectionRef, onDark: boolean): string => {
    const soft = onDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.04)";
    const line = onDark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.12)";
    const pill = (txt: string) =>
      `<span style="display:inline-block;border-radius:9999px;padding:6px 14px;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#fff;background:${esc(
        primary,
      )}">${esc(txt)}</span>`;

    const heroText = `<div style="text-align:center">
      ${badgeHtml()}
      <h1 style="margin:20px 0 0;font-size:33px;font-weight:900;line-height:1.12;letter-spacing:-.01em;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
      <p style="margin:18px auto 0;max-width:520px;font-size:15px;line-height:1.7;opacity:${onDark ? ".85" : ".65"};${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
      ${heroCtaHidden ? "" : `<div style="margin-top:26px">${btn(false)}</div>`}
    </div>`;

    switch (s.type) {
      case "hero":
        if (c.hero.mode === "text") return heroText;
        if (c.hero.mode === "image") return naturalImg(c.hero.image, c.hero.imageW);
        return `${heroText}<div style="margin-top:36px">${ratioImg(c.hero.image, c.hero.imageW, c.hero.imageAspect, "4/3")}</div>`;

      case "highlights":
        return c.highlights
          .map((h, i) => {
            const flip = i % 2 === 1;
            const media = h.iconImage
              ? `<img src="${esc(h.iconImage)}" alt="" style="width:220px;max-width:100%;height:180px;object-fit:cover;border-radius:16px;flex:0 0 auto"/>`
              : `<div style="flex:0 0 auto;width:80px;height:80px;border-radius:22px;background:${esc(primary)};color:#fff;font-weight:900;font-size:24px;display:flex;align-items:center;justify-content:center">${pad2(i + 1)}</div>`;
            const body = `<div style="flex:1;min-width:0">
              <div style="font-size:11px;font-weight:900;letter-spacing:.2em;color:${onDark ? "#fff" : esc(primary)}">POINT ${pad2(i + 1)}</div>
              <h3 style="margin:8px 0 0;font-size:21px;font-weight:900;line-height:1.3;${sx("highlights.title")}">${esc(h.title)}</h3>
              <p style="margin:10px 0 0;font-size:15px;opacity:.7;line-height:1.65;${sx("highlights.desc")}">${nl2br(h.desc)}</p>
            </div>`;
            return `<div style="display:flex;gap:24px;align-items:center;background:${soft};border-radius:28px;padding:24px;margin-bottom:20px;flex-wrap:wrap;${
              flip ? "flex-direction:row-reverse" : ""
            }">${media}${body}</div>`;
          })
          .join("");

      case "checklist":
        return `<div style="background:${soft};border-radius:28px;padding:32px">
        <div style="text-align:center">${pill("Check List")}</div>
        <h2 style="text-align:center;margin:14px 0 24px;${h2Style()}${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
        <div style="max-width:520px;margin:0 auto">${c.checklist.items
          .map(
            (it) => `<div style="display:flex;gap:14px;align-items:center;background:${
              onDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)"
            };border-radius:16px;padding:14px 18px;margin-bottom:10px">
            <span style="flex:0 0 auto;width:26px;height:26px;border-radius:9999px;background:${esc(primary)};color:#fff;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center">✓</span>
            <span style="font-size:15px;font-weight:700;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></div>`,
          )
          .join("")}</div></div>`;

      case "callout":
        return `<div style="text-align:center">
        <p style="margin:0;font-size:27px;font-weight:900;line-height:1.35;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
        ${c.callout.sub ? `<div style="margin-top:18px"><span style="display:inline-block;border-radius:9999px;padding:8px 18px;font-size:12px;font-weight:900;color:#fff;background:${esc(primary)};${sx("callout.sub")}">${esc(c.callout.sub)}</span></div>` : ""}
      </div>`;

      case "steps":
        return `<div style="text-align:center">${pill("Step")}</div>
        <h2 style="text-align:center;margin:14px 0 26px;${h2Style()}${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
        ${c.steps.items
          .map(
            (st, i) => `<div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:20px">
            <div style="flex:0 0 auto;width:48px;height:48px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;font-size:16px;display:flex;align-items:center;justify-content:center">${i + 1}</div>
            <div style="flex:1">
              <div style="font-weight:900;font-size:18px;${sx("steps.title")}">${esc(st.title)}</div>
              <p style="margin:6px 0 0;font-size:14px;opacity:.7;line-height:1.65;${sx("steps.desc")}">${nl2br(st.desc)}</p>
            </div></div>`,
          )
          .join("")}`;

      case "detail": {
        const head = `<div style="text-align:center">${pill("Detail")}</div>
          <h2 style="text-align:center;margin:14px 0 0;${h2Style()}${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
          <p style="text-align:center;margin:16px auto 0;max-width:520px;opacity:.75;line-height:1.75;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
        if (c.detail.mode === "text") return head;
        if (c.detail.mode === "image") return naturalImg(c.detail.image, c.detail.imageW);
        return `${head}<div style="margin-top:32px">${ratioImg(c.detail.image, c.detail.imageW, c.detail.imageAspect, "4/3")}</div>`;
      }

      case "specs":
        return `<div style="border:2px solid ${line};border-radius:24px;overflow:hidden">${c.specs
          .map(
            (sp, i) => `<div style="display:flex;justify-content:space-between;padding:16px 24px;font-size:14px;background:${
              i % 2 ? "transparent" : soft
            };${i < c.specs.length - 1 ? `border-bottom:1px solid ${line}` : ""}">
          <span style="font-weight:900;${sx("specs.label")}">${esc(sp.label)}</span><span style="opacity:.7;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
          )
          .join("")}</div>`;

      case "reviews":
        return `<h2 style="text-align:center;margin:0 0 26px;${h2Style()}">고객 후기</h2>
        ${c.reviews
          .map(
            (r) => `<div style="border:2px solid ${line};background:${soft};border-radius:24px;padding:24px;margin-bottom:16px">
          <div style="color:#fbbf24;letter-spacing:.15em;font-size:14px">★★★★★</div>
          <p style="margin:10px 0 0;font-size:15px;font-weight:500;line-height:1.65;${sx("reviews.text")}">${nl2br(r.text)}</p>
          <div style="margin:16px 0 0"><span style="display:inline-block;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:900;background:${alpha(primary, "1f")};color:${onDark ? "#fff" : esc(primary)};${sx("reviews.name")}">${esc(r.name)}</span></div></div>`,
          )
          .join("")}`;

      case "pricing":
        return `<div style="max-width:420px;margin:0 auto;border:2px solid ${esc(primary)};background:${soft};border-radius:32px;padding:36px;text-align:center">
        <div style="text-align:center">${pill("특가")}</div>
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:10px;margin-top:18px">
          <span style="font-size:46px;font-weight:900;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
          <span style="font-size:16px;text-decoration:line-through;opacity:.4;padding-bottom:6px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
        </div>
        <p style="margin:12px 0 0;font-size:14px;opacity:.7;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
        ${pricingCtaHidden ? "" : `<div style="margin-top:26px">${btn(true)}</div>`}
      </div>`;

      case "faq":
        return `<h2 style="text-align:center;margin:0 0 26px;${h2Style()}">자주 묻는 질문</h2>
        <div style="max-width:560px;margin:0 auto">${c.faq
          .map(
            (f) => `<div style="border:2px solid ${line};border-radius:16px;padding:20px;margin-bottom:12px">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="flex:0 0 auto;width:24px;height:24px;border-radius:8px;background:${esc(primary)};color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center">Q</span>
            <div style="font-weight:900;${sx("faq.q")}">${esc(f.q)}</div>
          </div>
          <p style="margin:8px 0 0 36px;font-size:14px;opacity:.7;line-height:1.65;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
          )
          .join("")}</div>`;

      case "block":
        return blockHtml(s);
      default:
        return "";
    }
  };

  const editorial = (s: SectionRef, onDark: boolean): string => {
    const hair = onDark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)";
    const eyebrow = (txt: string) =>
      `<div style="font-size:11px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;opacity:.45">${esc(txt)}</div>`;

    const heroText = `<div style="text-align:center">
      ${badgeHtml()}
      <h1 style="margin:0;font-family:${SERIF};font-weight:500;font-size:44px;line-height:1.1;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
      <p style="margin:26px auto 0;max-width:440px;font-size:14px;line-height:1.8;opacity:.6;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
      ${heroCtaHidden ? "" : `<div style="margin-top:34px">${btn(false)}</div>`}
    </div>`;

    switch (s.type) {
      case "hero":
        if (c.hero.mode === "text") return heroText;
        if (c.hero.mode === "image") return naturalImg(c.hero.image, c.hero.imageW);
        return `${heroText}<div style="margin-top:52px;border-top:1px solid ${hair};padding-top:52px">${ratioImg(c.hero.image, c.hero.imageW, c.hero.imageAspect, "16/10")}</div>`;

      case "highlights":
        return `<div style="display:flex;flex-wrap:wrap;gap:0">${c.highlights
          .map(
            (h, i) => `<div style="flex:1 1 220px;padding:8px 32px;${
              i > 0 ? `border-left:1px solid ${hair}` : ""
            }">
            <div style="font-family:${SERIF};font-size:26px;opacity:.25">${pad2(i + 1)}</div>
            <h3 style="margin:14px 0 0;font-family:${SERIF};font-weight:500;font-size:18px;${sx("highlights.title")}">${esc(h.title)}</h3>
            <p style="margin:10px 0 0;font-size:13px;line-height:1.7;opacity:.55;${sx("highlights.desc")}">${nl2br(h.desc)}</p>
          </div>`,
          )
          .join("")}</div>`;

      case "checklist":
        return `<div style="max-width:520px;margin:0 auto;text-align:center">
        <h2 style="margin:0 0 32px;${h2Style()}${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
        <div style="max-width:420px;margin:0 auto;text-align:left">${c.checklist.items
          .map(
            (it, i) => `<div style="display:flex;gap:12px;padding:14px 0;font-size:14px;line-height:1.7;opacity:.8;${
              i > 0 ? `border-top:1px solid ${hair}` : ""
            }"><span style="opacity:.4">—</span><span style="${sx("checklist.item")}">${esc(it.text)}</span></div>`,
          )
          .join("")}</div></div>`;

      case "callout":
        return `<div style="text-align:center">
        <div style="width:40px;height:1px;background:currentColor;opacity:.25;margin:0 auto"></div>
        <p style="margin:32px auto;max-width:640px;font-family:${SERIF};font-weight:500;font-style:italic;font-size:28px;line-height:1.4;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
        ${c.callout.sub ? `<p style="margin:0 0 32px;font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;opacity:.45;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
        <div style="width:40px;height:1px;background:currentColor;opacity:.25;margin:0 auto"></div>
      </div>`;

      case "steps":
        return `<div style="max-width:640px;margin:0 auto">
        <h2 style="text-align:center;margin:0 0 32px;${h2Style()}${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
        ${c.steps.items
          .map(
            (st, i) => `<div style="display:grid;grid-template-columns:auto 1fr;gap:24px;padding:24px 0;${
              i > 0 ? `border-top:1px solid ${hair}` : ""
            }">
            <div style="font-family:${SERIF};font-size:24px;opacity:.25">${pad2(i + 1)}</div>
            <div><div style="font-family:${SERIF};font-weight:500;font-size:16px;${sx("steps.title")}">${esc(st.title)}</div>
            <p style="margin:6px 0 0;font-size:13px;line-height:1.7;opacity:.55;${sx("steps.desc")}">${nl2br(st.desc)}</p></div>
          </div>`,
          )
          .join("")}</div>`;

      case "detail": {
        const head = `${eyebrow("Detail")}
          <h2 style="margin:12px 0 0;${h2Style()}${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
          <p style="margin:18px 0 0;font-size:14px;line-height:1.8;opacity:.65;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
        if (c.detail.mode === "text")
          return `<div style="max-width:520px;margin:0 auto;text-align:center">${head}</div>`;
        if (c.detail.mode === "image") return naturalImg(c.detail.image, c.detail.imageW);
        return `<div style="display:flex;gap:48px;align-items:center;flex-wrap:wrap">
          <div style="flex:1 1 260px">${ratioImg(c.detail.image, c.detail.imageW, c.detail.imageAspect, "3/4")}</div>
          <div style="flex:1 1 260px">${head}</div>
        </div>`;
      }

      case "specs":
        return `<div style="max-width:520px;margin:0 auto">${c.specs
          .map(
            (sp, i) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:14px 0;${
              i > 0 ? `border-top:1px solid ${hair}` : ""
            }">
          <span style="font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</span>
          <span style="font-family:${SERIF};font-size:15px;text-align:right;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
          )
          .join("")}</div>`;

      case "reviews":
        return `<div style="max-width:640px;margin:0 auto">${c.reviews
          .map(
            (r, i) => `<figure style="margin:0;padding:40px 0;text-align:center;${
              i > 0 ? `border-top:1px solid ${hair}` : ""
            }">
          <div style="font-family:${SERIF};font-size:36px;line-height:1;opacity:.2">&ldquo;</div>
          <p style="margin:12px auto 0;max-width:560px;font-family:${SERIF};font-weight:500;font-size:21px;line-height:1.6;${sx("reviews.text")}">${nl2br(r.text)}</p>
          <figcaption style="margin-top:20px;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;opacity:.45;${sx("reviews.name")}">${esc(r.name)}</figcaption>
        </figure>`,
          )
          .join("")}</div>`;

      case "pricing":
        return `<div style="max-width:360px;margin:0 auto;text-align:center">
        <div style="display:flex;align-items:baseline;justify-content:center;gap:12px">
          <span style="font-family:${SERIF};font-weight:500;font-size:40px;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
          <span style="font-size:13px;text-decoration:line-through;opacity:.35;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
        </div>
        <p style="margin:12px 0 0;font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.5;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
        ${pricingCtaHidden ? "" : `<div style="margin-top:32px">${btn(true)}</div>`}
      </div>`;

      case "faq":
        return `<div style="max-width:640px;margin:0 auto">
        <h2 style="text-align:center;margin:0 0 32px;${h2Style()}">자주 묻는 질문</h2>
        ${c.faq
          .map(
            (f, i) => `<div style="padding:20px 0;${i > 0 ? `border-top:1px solid ${hair}` : ""}">
          <div style="font-family:${SERIF};font-weight:500;font-size:16px;${sx("faq.q")}">${esc(f.q)}</div>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.7;opacity:.55;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
          )
          .join("")}</div>`;

      case "block":
        return blockHtml(s);
      default:
        return "";
    }
  };

  const showcase = (s: SectionRef, onDark: boolean): string => {
    const card = onDark
      ? "border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);box-shadow:0 1px 3px rgba(0,0,0,.1)"
      : "border:1px solid rgba(0,0,0,.07);background:rgba(0,0,0,.015);box-shadow:0 1px 3px rgba(0,0,0,.06)";
    const tint = alpha(primary, onDark ? "22" : "0f");

    const heroText = (centered: boolean) => `<div style="${centered ? "text-align:center" : ""}">
      ${badgeHtml()}
      <h1 style="margin:20px 0 0;font-size:34px;font-weight:800;line-height:1.15;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
      <p style="margin:16px ${centered ? "auto" : "0"} 0;max-width:480px;font-size:15px;line-height:1.7;opacity:${onDark ? ".8" : ".65"};${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
      ${heroCtaHidden ? "" : `<div style="margin-top:26px">${btn(false)}</div>`}
    </div>`;

    switch (s.type) {
      case "hero":
        if (c.hero.mode === "text") return heroText(true);
        if (c.hero.mode === "image") return naturalImg(c.hero.image, c.hero.imageW);
        return `<div style="display:flex;gap:40px;align-items:center;flex-wrap:wrap">
          <div style="flex:1 1 280px">${heroText(false)}</div>
          <div style="flex:1 1 280px">${ratioImg(c.hero.image, c.hero.imageW, c.hero.imageAspect, "4/3")}</div>
        </div>`;

      case "highlights":
        return `<div style="display:flex;flex-wrap:wrap;gap:16px">${c.highlights
          .map(
            (h) => `<div style="flex:1 1 240px;border-radius:16px;padding:24px;${card}">
          <div style="width:48px;height:48px;border-radius:16px;background:${tint};display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden">${
            h.iconImage
              ? `<img src="${esc(h.iconImage)}" alt="" style="width:100%;height:100%;object-fit:cover"/>`
              : esc(h.icon || "✨")
          }</div>
          <h3 style="margin:16px 0 0;font-weight:700;${sx("highlights.title")}">${esc(h.title)}</h3>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.65;opacity:.6;${sx("highlights.desc")}">${nl2br(h.desc)}</p>
        </div>`,
          )
          .join("")}</div>`;

      case "checklist":
        return `<div style="border-radius:24px;padding:36px;background:${tint}">
        <h2 style="text-align:center;margin:0 0 24px;${h2Style()}${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px;max-width:640px;margin:0 auto">${c.checklist.items
          .map(
            (it) => `<div style="flex:1 1 260px;display:flex;gap:12px;align-items:flex-start;border-radius:12px;padding:14px 16px;background:${
              onDark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.7)"
            }">
          <span style="flex:0 0 auto;width:20px;height:20px;border-radius:9999px;background:${esc(primary)};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:2px">✓</span>
          <span style="font-size:14px;font-weight:500;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></div>`,
          )
          .join("")}</div></div>`;

      case "callout":
        return `<div style="border-radius:24px;padding:56px 32px;text-align:center;color:#fff;background:${esc(primary)}">
        <p style="margin:0 auto;max-width:640px;font-size:26px;font-weight:800;line-height:1.4;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
        ${c.callout.sub ? `<p style="margin:16px auto 0;max-width:420px;font-size:14px;opacity:.85;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
        ${heroCtaHidden ? "" : `<div style="margin-top:26px"><a href="${href}" style="display:inline-block;background:#fff;color:${esc(primary)};font-weight:700;border-radius:12px;text-decoration:none;padding:14px 32px;font-size:14px;box-shadow:0 10px 24px rgba(0,0,0,.16)">${ctaText}</a></div>`}
      </div>`;

      case "steps":
        return `<h2 style="text-align:center;margin:0 0 28px;${h2Style()}${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:16px">${c.steps.items
          .map(
            (st, i) => `<div style="flex:1 1 200px;border-radius:16px;padding:24px;${card}">
          <div style="width:40px;height:40px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center">${i + 1}</div>
          <div style="margin:12px 0 0;font-weight:700;${sx("steps.title")}">${esc(st.title)}</div>
          <p style="margin:6px 0 0;font-size:13px;line-height:1.65;opacity:.6;${sx("steps.desc")}">${nl2br(st.desc)}</p>
        </div>`,
          )
          .join("")}</div>`;

      case "detail": {
        const head = `<div><h2 style="margin:0;${h2Style()}${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.75;opacity:.65;${sx("detail.body")}">${nl2br(c.detail.body)}</p></div>`;
        if (c.detail.mode === "text")
          return `<div style="max-width:520px;margin:0 auto;text-align:center">${head}</div>`;
        if (c.detail.mode === "image") return naturalImg(c.detail.image, c.detail.imageW);
        return `<div style="display:flex;gap:40px;align-items:center;flex-wrap:wrap">
          <div style="flex:1 1 280px">${ratioImg(c.detail.image, c.detail.imageW, c.detail.imageAspect, "4/3")}</div>
          <div style="flex:1 1 280px">${head}</div>
        </div>`;
      }

      case "specs":
        return `<div style="display:flex;flex-wrap:wrap;gap:12px">${c.specs
          .map(
            (sp) => `<div style="flex:1 1 200px;border-radius:12px;padding:16px 20px;${card}">
          <div style="font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</div>
          <div style="margin-top:4px;font-weight:700;${sx("specs.value")}">${esc(sp.value)}</div></div>`,
          )
          .join("")}</div>`;

      case "reviews":
        return `<h2 style="text-align:center;margin:0 0 28px;${h2Style()}">고객 후기</h2>
        <div style="display:flex;flex-wrap:wrap;gap:16px">${c.reviews
          .map(
            (r) => `<div style="flex:1 1 240px;border-radius:16px;padding:24px;${card}">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="flex:0 0 auto;width:40px;height:40px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center">${esc((r.name || "?").trim().slice(0, 1))}</div>
            <div><div style="font-size:12px;font-weight:700;${sx("reviews.name")}">${esc(r.name)}</div><div style="color:#fbbf24;font-size:11px;letter-spacing:.1em">★★★★★</div></div>
          </div>
          <p style="margin:16px 0 0;font-size:14px;line-height:1.65;opacity:.75;${sx("reviews.text")}">${nl2br(r.text)}</p>
        </div>`,
          )
          .join("")}</div>`;

      case "pricing":
        return `<div style="max-width:360px;margin:0 auto;border-radius:24px;padding:32px;text-align:center;${
          onDark
            ? "border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05)"
            : "border:1px solid rgba(0,0,0,.08);background:#fff"
        };box-shadow:0 24px 60px rgba(0,0,0,.14)">
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:10px">
          <span style="font-size:42px;font-weight:800;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
          <span style="font-size:16px;text-decoration:line-through;opacity:.4;padding-bottom:6px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
        </div>
        <p style="margin:12px 0 0;font-size:14px;opacity:.65;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
        ${pricingCtaHidden ? "" : `<div style="margin-top:26px">${btn(true)}</div>`}
      </div>`;

      case "faq":
        return `<h2 style="text-align:center;margin:0 0 28px;${h2Style()}">자주 묻는 질문</h2>
        <div style="max-width:640px;margin:0 auto">${c.faq
          .map(
            (f) => `<div style="border-radius:16px;padding:20px;margin-bottom:12px;${card}">
          <div style="display:flex;justify-content:space-between;gap:12px"><div style="font-weight:700;${sx("faq.q")}">${esc(f.q)}</div><span style="opacity:.3;font-size:18px">+</span></div>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.65;opacity:.6;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
          )
          .join("")}</div>`;

      case "block":
        return blockHtml(s);
      default:
        return "";
    }
  };

  const blockHtml = (s: SectionRef): string => {
    if (!s.block) return "";
    const b = s.block;
    const hStyle =
      style === "editorial"
        ? `font-family:${SERIF};font-weight:500;font-size:24px`
        : style === "showcase"
          ? "font-weight:800;font-size:22px"
          : "font-weight:900;font-size:22px";
    const txt = `<div style="text-align:${b.align === "center" ? "center" : "left"}">
      <h2 style="margin:0;${hStyle};${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
      <p style="margin:14px 0 0;opacity:.72;line-height:1.75;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>
    </div>`;
    if (b.mode === "text") return txt;
    if (b.mode === "image") return naturalImg(b.image, b.imageW);
    return `<div style="display:flex;gap:40px;align-items:center;flex-wrap:wrap">
      <div style="flex:1 1 260px">${ratioImg(b.image, b.imageW, b.imageAspect, "4/3")}</div>
      <div style="flex:1 1 260px">${txt}</div>
    </div>`;
  };

  const renderInner =
    style === "editorial" ? editorial : style === "showcase" ? showcase : bold;

  const shell = (s: SectionRef): string => {
    const hasBgImg = !!s.bgImage;
    const contain = s.bgFit === "contain";
    const onDark = isDarkHex(s.bg) || (hasBgImg && !contain);
    const html = renderInner(s, onDark);
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
  const fontFams = new Set(Object.values(ts).map((s) => s.font));
  let fontsHref = googleFontsHref(fontFams);
  if (style === "editorial") {
    const base =
      "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap";
    fontsHref = fontsHref
      ? fontsHref + "&" + base.split("?")[1]
      : base;
  }

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
    h1{font-size:${style === "editorial" ? 62 : style === "showcase" ? 44 : 52}px!important}
  }
  @media(max-width:640px){
    section h1{font-size:${style === "editorial" ? 34 : 30}px!important}
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
