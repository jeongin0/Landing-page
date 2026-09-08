import type { StoreContent, SectionRef } from "./schema";
import { PAD_PX, WIDTH_PX, clampStyle } from "./schema";
import { fontStack, googleFontsHref } from "./fonts";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br/>");
const p2 = (n: number) => String(n).padStart(2, "0");
const A = (hex: string, hh: string) => {
  const m = /^#?([0-9a-fA-F]{6})/.exec(hex || "");
  return m ? "#" + m[1] + hh : hex;
};
function isDark(hex?: string) {
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?/i.exec(hex || "");
  if (!m) return false;
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (m[2]) {
    const a = parseInt(m[2], 16) / 255;
    r = r * a + 255 * (1 - a);
    g = g * a + 255 * (1 - a);
    b = b * a + 255 * (1 - a);
  }
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}
const SERIF = "'Nanum Myeongjo', ui-serif, Georgia, 'Times New Roman', serif";

export function exportHtml(c: StoreContent): string {
  const t = c.theme;
  const primary = t.primary || "#2563eb";
  const style = clampStyle(c.style);
  const en = c.sections.filter((s) => s.enabled);

  const ts = c.textStyles || {};
  const sx = (key: string) => {
    const s = ts[key];
    if (!s) return "";
    const out: string[] = [];
    const f = fontStack(s.font);
    if (f) out.push(`font-family:${f}`);
    if (s.size) out.push(`font-size:${s.size}px`);
    return out.length ? out.join(";") + ";" : "";
  };
  const pad = (s: SectionRef) => s.padPx ?? PAD_PX[s.pad ?? "normal"];
  const pageW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 720)
      : WIDTH_PX[c.layout.width];
  const bgImgDark = (s: SectionRef) => !!s.bgImage && s.bgFit !== "contain";
  // 섹션 배경 이미지 레이어 (부모 section 은 position:relative 여야 함)
  const bgLayer = (s: SectionRef) => {
    if (!s.bgImage) return "";
    const contain = s.bgFit === "contain";
    return `<div style="position:absolute;inset:0;background-image:url(&quot;${esc(
      s.bgImage,
    )}&quot;);background-size:${contain ? "contain" : "cover"};background-position:center;background-repeat:no-repeat;${
      s.bgFixed ? "background-attachment:fixed;" : ""
    }"></div>${
      contain ? "" : `<div style="position:absolute;inset:0;background:${esc(s.bg || "rgba(0,0,0,.42)")}"></div>`
    }`;
  };
  const longImg = (src: string, w?: number) =>
    `<div style="width:${Math.max(20, Math.min(100, w ?? 100))}%;margin:0 auto"><img src="${esc(src)}" alt="" style="display:block;width:100%"/></div>`;

  // ═══════════ STRIP ═══════════
  const strip = (): string => {
    const pill = (txt: string, onDark: boolean) =>
      `<span style="display:inline-block;border-radius:9999px;padding:6px 16px;font-size:11px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;${
        onDark ? "background:#fff;color:#111" : `background:${esc(primary)};color:#fff`
      }">${esc(txt)}</span>`;
    const band = (s: SectionRef, inner: string, narrow = pageW) => {
      const bg = s.bg || t.bg || "#fff";
      const dark = isDark(bg) || bgImgDark(s);
      return `<section style="position:relative;${s.bgImage ? "" : `background:${esc(bg)};`}${
        dark ? "color:#fff;" : ""
      }padding:${pad(s)}px 0">${bgLayer(s)}<div style="position:relative;max-width:${
        s.wPx ?? narrow
      }px;margin:0 auto;padding:0 24px;text-align:center">${inner}</div></section>`;
    };
    const one = (s: SectionRef): string => {
      const dark = isDark(s.bg) || bgImgDark(s);
      switch (s.type) {
        case "hero": {
          const txt = `${c.hero.badge ? `<div style="margin-bottom:20px">${pill(c.hero.badge, dark)}</div>` : ""}
            <h1 style="margin:0;font-size:54px;font-weight:900;line-height:1.15;letter-spacing:-.01em;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
            <p style="margin:20px auto 0;max-width:520px;font-size:15px;line-height:1.6;opacity:.62;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>`;
          if (c.hero.mode === "image")
            return `<section>${longImg(c.hero.image, c.hero.imageW)}</section>`;
          if (c.hero.mode === "text") return band(s, txt);
          return band(s, txt) + `<section>${longImg(c.hero.image, c.hero.imageW)}</section>`;
        }
        case "highlights":
          return c.highlights
            .map((h, i) => {
              const bg = i % 2 === 0 ? s.bg || t.bg || "#fff" : A(primary, "0f");
              const d = isDark(bg);
              return `<section style="background:${esc(bg)};${d ? "color:#fff;" : ""}padding:${pad(s)}px 0 ${
                h.iconImage ? Math.round(pad(s) * 0.55) : pad(s)
              }px"><div style="max-width:${s.wPx ?? pageW}px;margin:0 auto;padding:0 24px;text-align:center">
                ${pill(`Point ${p2(i + 1)}`, d)}
                <h3 style="margin:16px 0 0;font-size:34px;font-weight:900;line-height:1.15;${sx("highlights.title")}">${esc(h.title)}</h3>
                <p style="margin:12px auto 0;max-width:420px;font-size:15px;line-height:1.6;opacity:.66;${sx("highlights.desc")}">${nl2br(h.desc)}</p>
              </div></section>${
                h.iconImage
                  ? `<section style="background:${esc(bg)}"><div style="max-width:900px;margin:0 auto"><img src="${esc(h.iconImage)}" alt="" style="display:block;width:100%"/></div></section>`
                  : ""
              }`;
            })
            .join("");
        case "callout":
          return band(
            s,
            `<p style="margin:0;font-size:44px;font-weight:900;line-height:1.15;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
            ${c.callout.sub ? `<p style="margin:20px auto 0;max-width:420px;font-size:14px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;opacity:.7;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}`,
          );
        case "checklist":
          return band(
            s,
            `${pill("Check", dark)}
            <h2 style="margin:16px 0 0;font-size:34px;font-weight:900;line-height:1.15;${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
            <ul style="list-style:none;margin:32px auto 0;padding:0;max-width:420px;text-align:left">${c.checklist.items
              .map(
                (it, i) => `<li style="display:flex;gap:16px;padding:16px 0;${i ? "border-top:1px solid rgba(255,255,255,.18)" : ""}">
                <span style="font-size:18px;font-weight:900;color:${dark ? "#fff" : esc(primary)}">✓</span>
                <span style="flex:1;font-size:16px;font-weight:700;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></li>`,
              )
              .join("")}</ul>`,
          );
        case "steps":
          return band(
            s,
            `${pill("Step", dark)}
            <h2 style="margin:16px 0 0;font-size:34px;font-weight:900;${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
            <div style="max-width:520px;margin:32px auto 0;text-align:left">${c.steps.items
              .map(
                (st, i) => `<div style="display:flex;gap:20px;padding:24px 0;${i ? `border-top:1px solid ${dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)"}` : ""}">
                <div style="font-size:36px;font-weight:900;line-height:1;color:${dark ? "#fff" : esc(primary)}">${p2(i + 1)}</div>
                <div style="flex:1"><div style="font-size:20px;font-weight:900;${sx("steps.title")}">${esc(st.title)}</div>
                <p style="margin:6px 0 0;font-size:14px;line-height:1.6;opacity:.7;${sx("steps.desc")}">${nl2br(st.desc)}</p></div></div>`,
              )
              .join("")}</div>`,
          );
        case "detail": {
          if (c.detail.mode === "image")
            return `<section>${longImg(c.detail.image, c.detail.imageW)}</section>`;
          const head = `${pill("Detail", dark)}
            <h2 style="margin:16px 0 0;font-size:34px;font-weight:900;line-height:1.15;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
            <p style="margin:16px auto 0;max-width:520px;font-size:16px;line-height:1.9;opacity:.78;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
          if (c.detail.mode === "text") return band(s, head);
          return band(s, head) + `<section style="background:${esc(s.bg || t.bg || "#fff")}">${longImg(c.detail.image, c.detail.imageW)}</section>`;
        }
        case "specs":
          return band(
            s,
            `${pill("제품 정보", dark)}
            <div style="max-width:420px;margin:24px auto 0;text-align:left">${c.specs
              .map(
                (sp, i) => `<div style="display:flex;justify-content:space-between;padding:16px 0;font-size:15px;${
                  i ? `border-top:1px solid ${dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)"}` : ""
                }">
                <span style="font-weight:900;${sx("specs.label")}">${esc(sp.label)}</span>
                <span style="opacity:.7;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
              )
              .join("")}</div>`,
          );
        case "reviews":
          return band(
            s,
            `${pill("Review", dark)}
            <div style="max-width:560px;margin:28px auto 0;text-align:left">${c.reviews
              .map(
                (r, i) => `<div style="padding:24px 0;${i ? `border-top:1px solid ${dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)"}` : ""}">
                <div style="color:#fbbf24;letter-spacing:.15em">★★★★★</div>
                <p style="margin:8px 0 0;font-size:17px;font-weight:700;line-height:1.6;${sx("reviews.text")}">${nl2br(r.text)}</p>
                <div style="margin:12px 0 0;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;opacity:.5;${sx("reviews.name")}">${esc(r.name)}</div></div>`,
              )
              .join("")}</div>`,
            720,
          );
        case "pricing":
          return band(
            s,
            `<div style="display:flex;align-items:flex-end;justify-content:center;gap:12px">
              <span style="font-size:64px;font-weight:900;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
              <span style="font-size:18px;text-decoration:line-through;opacity:.4;padding-bottom:8px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span></div>
            <p style="margin:12px 0 0;font-size:14px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.7;${sx("pricing.note")}">${esc(c.pricing.note)}</p>`,
          );
        case "faq":
          return band(
            s,
            `${pill("FAQ", dark)}
            <div style="max-width:560px;margin:28px auto 0;text-align:left">${c.faq
              .map(
                (f, i) => `<div style="padding:20px 0;${i ? `border-top:1px solid ${dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)"}` : ""}">
                <div style="font-size:18px;font-weight:900;${sx("faq.q")}">${esc(f.q)}</div>
                <p style="margin:8px 0 0;font-size:14px;line-height:1.6;opacity:.7;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
              )
              .join("")}</div>`,
            720,
          );
        case "block": {
          if (!s.block) return "";
          const b = s.block;
          if (b.mode === "image")
            return `<section style="background:${esc(s.bg || t.bg || "#fff")}">${longImg(b.image, b.imageW)}</section>`;
          const txt = `<h2 style="margin:0;font-size:32px;font-weight:900;line-height:1.15;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
            <p style="margin:16px auto 0;max-width:520px;font-size:15px;line-height:1.9;opacity:.78;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>`;
          if (b.mode === "text") return band(s, txt);
          return band(s, txt) + `<section style="background:${esc(s.bg || t.bg || "#fff")}">${longImg(b.image, b.imageW)}</section>`;
        }
        default:
          return "";
      }
    };
    return en.map(one).join("");
  };

  // ═══════════ RAIL ═══════════
  const rail = (): string => {
    const hair = "rgba(0,0,0,.12)";
    const wrap = (s: SectionRef, inner: string, narrow = pageW, center = true) =>
      `<section style="position:relative;${
        s.bgImage ? "" : s.bg ? `background:${esc(s.bg)};` : ""
      }${bgImgDark(s) ? "color:#fff;" : ""}padding:${pad(s)}px 0">${bgLayer(s)}<div style="position:relative;max-width:${
        s.wPx ?? narrow
      }px;margin:0 auto;padding:0 24px;${center ? "text-align:center" : ""}">${inner}</div></section>`;
    const one = (s: SectionRef): string => {
      switch (s.type) {
        case "hero": {
          const eb = c.hero.badge
            ? `<div style="margin-bottom:28px;font-size:11px;font-weight:600;letter-spacing:.34em;text-transform:uppercase;opacity:.45;${sx("hero.badge")}">${esc(c.hero.badge)}</div>`
            : "";
          const h1 = `<h1 style="margin:0 auto;max-width:900px;font-family:${SERIF};font-weight:500;font-size:76px;line-height:1.05;letter-spacing:-.01em;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>`;
          const sub = `<p style="margin:28px auto 0;max-width:400px;font-size:14px;line-height:1.9;opacity:.6;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>`;
          const top = `<section style="padding:${pad(s)}px 0 ${Math.round(pad(s) * 0.7)}px;text-align:center"><div style="padding:0 24px">${eb}${h1}${c.hero.mode !== "image" ? sub : ""}</div></section>`;
          return c.hero.mode === "text" ? top : top + `<section>${longImg(c.hero.image, c.hero.imageW)}</section>`;
        }
        case "highlights":
          return wrap(
            s,
            `<div style="display:flex;flex-wrap:wrap">${c.highlights
              .map(
                (h, i) => `<div style="flex:1 1 220px;padding:0 40px;${i ? `border-left:1px solid ${hair}` : ""}">
                <div style="font-family:${SERIF};font-size:48px;opacity:.25">${p2(i + 1)}</div>
                <h3 style="margin:16px 0 0;font-family:${SERIF};font-weight:500;font-size:24px;${sx("highlights.title")}">${esc(h.title)}</h3>
                <p style="margin:12px 0 0;font-size:13px;line-height:1.8;opacity:.55;${sx("highlights.desc")}">${nl2br(h.desc)}</p></div>`,
              )
              .join("")}</div>`,
            940,
            false,
          );
        case "checklist":
          return wrap(
            s,
            `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:36px;${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
            <ul style="list-style:none;margin:40px auto 0;padding:0;max-width:520px;text-align:left">${c.checklist.items
              .map(
                (it, i) => `<li style="display:flex;gap:16px;padding:16px 0;font-size:14px;line-height:1.8;opacity:.8;${i ? `border-top:1px solid ${hair}` : ""}">
                <span style="opacity:.35">—</span><span style="${sx("checklist.item")}">${esc(it.text)}</span></li>`,
              )
              .join("")}</ul>`,
          );
        case "callout":
          return wrap(
            s,
            `<div style="width:48px;height:1px;background:currentColor;opacity:.3;margin:0 auto"></div>
            <p style="margin:32px auto;max-width:640px;font-family:${SERIF};font-weight:500;font-style:italic;font-size:44px;line-height:1.35;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
            ${c.callout.sub ? `<p style="margin:0 0 32px;font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;opacity:.45;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
            <div style="width:48px;height:1px;background:currentColor;opacity:.3;margin:0 auto"></div>`,
          );
        case "steps":
          return wrap(
            s,
            `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:36px;${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
            <div style="max-width:640px;margin:40px auto 0;text-align:left">${c.steps.items
              .map(
                (st, i) => `<div style="display:grid;grid-template-columns:56px 1fr;gap:24px;padding:28px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                <div style="font-family:${SERIF};font-size:36px;opacity:.25">${p2(i + 1)}</div>
                <div><div style="font-family:${SERIF};font-weight:500;font-size:21px;${sx("steps.title")}">${esc(st.title)}</div>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.8;opacity:.55;${sx("steps.desc")}">${nl2br(st.desc)}</p></div></div>`,
              )
              .join("")}</div>`,
          );
        case "detail": {
          if (c.detail.mode === "image")
            return `<section>${longImg(c.detail.image, c.detail.imageW)}</section>`;
          const txt = `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:34px;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
            <p style="margin:20px 0 0;font-size:14px;line-height:1.9;opacity:.65;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
          if (c.detail.mode === "text") return wrap(s, `<div style="max-width:640px;margin:0 auto">${txt}</div>`, 680, false);
          const pct = s.splitPct ?? 50;
          return `<section style="padding:${pad(s)}px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;flex-wrap:wrap;gap:40px;align-items:center">
            <div style="flex:1 1 ${pct}%">${longImg(c.detail.image, 100)}</div>
            <div style="flex:1 1 ${100 - pct}%">${txt}</div></div></section>`;
        }
        case "specs":
          return wrap(
            s,
            `<div style="max-width:640px;margin:0 auto">${c.specs
              .map(
                (sp, i) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:32px;padding:16px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                <span style="font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</span>
                <span style="font-family:${SERIF};font-size:16px;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
              )
              .join("")}</div>`,
            680,
            false,
          );
        case "reviews":
          return wrap(
            s,
            `<div style="max-width:640px;margin:0 auto">${c.reviews
              .map(
                (r, i) => `<figure style="margin:0;padding:48px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                <div style="font-family:${SERIF};font-size:36px;line-height:1;opacity:.15">&ldquo;</div>
                <p style="margin:8px auto 0;max-width:520px;font-family:${SERIF};font-weight:500;font-size:26px;line-height:1.55;${sx("reviews.text")}">${nl2br(r.text)}</p>
                <figcaption style="margin-top:24px;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;opacity:.45;${sx("reviews.name")}">${esc(r.name)}</figcaption></figure>`,
              )
              .join("")}</div>`,
          );
        case "pricing":
          return wrap(
            s,
            `<div style="display:flex;align-items:baseline;justify-content:center;gap:16px">
              <span style="font-family:${SERIF};font-weight:500;font-size:44px;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
              <span style="font-size:14px;text-decoration:line-through;opacity:.35;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span></div>
            <p style="margin:16px 0 0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.5;${sx("pricing.note")}">${esc(c.pricing.note)}</p>`,
          );
        case "faq":
          return wrap(
            s,
            `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:36px;text-align:center">자주 묻는 질문</h2>
            <div style="max-width:640px;margin:40px auto 0;text-align:left">${c.faq
              .map(
                (f, i) => `<div style="padding:20px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                <div style="font-family:${SERIF};font-weight:500;font-size:16px;${sx("faq.q")}">${esc(f.q)}</div>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.8;opacity:.55;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
              )
              .join("")}</div>`,
            760,
            false,
          );
        case "block": {
          if (!s.block) return "";
          const b = s.block;
          if (b.mode === "image") return `<section>${longImg(b.image, b.imageW)}</section>`;
          const txt = `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:34px;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
            <p style="margin:20px 0 0;font-size:14px;line-height:1.9;opacity:.65;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>`;
          if (b.mode === "text") return wrap(s, `<div style="max-width:640px;margin:0 auto">${txt}</div>`, 680, false);
          return wrap(s, `<div style="max-width:640px;margin:0 auto">${txt}</div>`, 680, false) + `<section>${longImg(b.image, b.imageW)}</section>`;
        }
        default:
          return "";
      }
    };
    return en.map(one).join("");
  };

  // ═══════════ BENTO ═══════════
  const bento = (): string => {
    const card = "border-radius:28px;background:#fff;box-shadow:0 6px 30px rgba(0,0,0,.07)";
    const chip = A(primary, "14");
    const one = (s: SectionRef): string => {
      const inner = ((): string => {
        switch (s.type) {
          case "hero": {
            const stats = c.specs.slice(0, 3);
            const txt = `${c.hero.badge ? `<span style="display:inline-block;border-radius:9999px;padding:6px 14px;font-size:12px;font-weight:700;background:${esc(c.hero.badgeBg)};color:${esc(c.hero.badgeText)};${sx("hero.badge")}">${esc(c.hero.badge)}</span>` : ""}
              <h1 style="margin:20px 0 0;font-size:46px;font-weight:800;line-height:1.14;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
              <p style="margin:16px 0 0;max-width:420px;font-size:15px;line-height:1.6;opacity:.65;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>`;
            const imgCol =
              c.hero.mode === "text"
                ? ""
                : `<div style="flex:1 1 45%"><img src="${esc(c.hero.image)}" alt="" style="display:block;width:100%;border-radius:16px"/></div>`;
            return `<div style="${card};padding:48px">
              <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:center"><div style="flex:1 1 45%">${txt}</div>${imgCol}</div></div>
              ${
                stats.length === 3
                  ? `<div style="display:flex;gap:12px;max-width:80%;margin:-36px auto 0;position:relative;z-index:1">${stats
                      .map(
                        (sp) => `<div style="flex:1;${card};padding:16px 12px;text-align:center">
                        <div style="font-size:17px;font-weight:800;line-height:1.15;word-break:keep-all;${sx("specs.value")}">${esc(sp.value)}</div>
                        <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</div></div>`,
                      )
                      .join("")}</div>`
                  : ""
              }`;
          }
          case "highlights":
            return `<div style="display:flex;flex-wrap:wrap;gap:16px">${c.highlights
              .map(
                (h) => `<div style="flex:1 1 260px;${card};padding:28px">
                <div style="width:56px;height:56px;border-radius:16px;background:${chip};display:flex;align-items:center;justify-content:center;font-size:24px;overflow:hidden">${
                  h.iconImage ? `<img src="${esc(h.iconImage)}" alt="" style="width:100%;height:100%;object-fit:cover"/>` : esc(h.icon || "✨")
                }</div>
                <h3 style="margin:20px 0 0;font-size:17px;font-weight:700;${sx("highlights.title")}">${esc(h.title)}</h3>
                <p style="margin:8px 0 0;font-size:13.5px;line-height:1.6;opacity:.6;${sx("highlights.desc")}">${nl2br(h.desc)}</p></div>`,
              )
              .join("")}</div>`;
          case "checklist":
            return `<div style="${card};padding:48px"><h2 style="margin:0;font-size:30px;font-weight:800;${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
              <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px">${c.checklist.items
                .map(
                  (it) => `<div style="flex:1 1 45%;display:flex;gap:12px;align-items:flex-start;border-radius:16px;padding:16px;background:${A(primary, "0d")}">
                  <span style="flex:none;width:20px;height:20px;border-radius:9999px;background:${esc(primary)};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:2px">✓</span>
                  <span style="font-size:14px;font-weight:500;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></div>`,
                )
                .join("")}</div></div>`;
          case "callout":
            return `<div style="border-radius:28px;padding:80px 32px;text-align:center;color:#fff;background:linear-gradient(135deg,${esc(primary)},${A(primary, "cc")});box-shadow:0 10px 36px rgba(0,0,0,.14)">
              <p style="margin:0 auto;max-width:640px;font-size:34px;font-weight:800;line-height:1.3;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
              ${c.callout.sub ? `<p style="margin:16px auto 0;max-width:420px;font-size:14px;opacity:.85;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}</div>`;
          case "steps":
            return `<div style="${card};padding:48px;text-align:center"><h2 style="margin:0;font-size:30px;font-weight:800;${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
              <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:24px;margin-top:40px">${c.steps.items
                .map(
                  (st, i) => `<div style="flex:1 1 28%;display:flex;flex-direction:column;align-items:center">
                  <div style="width:40px;height:40px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center">${i + 1}</div>
                  <div style="margin:16px 0 0;font-weight:700;${sx("steps.title")}">${esc(st.title)}</div>
                  <p style="margin:6px 0 0;max-width:240px;font-size:13px;line-height:1.6;opacity:.6;${sx("steps.desc")}">${nl2br(st.desc)}</p></div>`,
                )
                .join("")}</div></div>`;
          case "detail": {
            const txt = `<h2 style="margin:0;font-size:30px;font-weight:800;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.7;opacity:.65;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
            if (c.detail.mode === "text") return `<div style="${card};padding:48px">${txt}</div>`;
            if (c.detail.mode === "image")
              return `<div style="${card};overflow:hidden"><img src="${esc(c.detail.image)}" alt="" style="display:block;width:100%"/></div>`;
            const pct = s.splitPct ?? 50;
            return `<div style="${card};padding:32px;display:flex;flex-wrap:wrap;gap:32px;align-items:center">
              <div style="flex:1 1 ${pct}%"><img src="${esc(c.detail.image)}" alt="" style="display:block;width:100%;border-radius:16px"/></div>
              <div style="flex:1 1 ${100 - pct}%">${txt}</div></div>`;
          }
          case "specs":
            return `<div style="display:flex;flex-wrap:wrap;gap:16px">${c.specs
              .map(
                (sp) => `<div style="flex:1 1 20%;${card};padding:20px">
                <div style="font-size:18px;font-weight:800;line-height:1;${sx("specs.value")}">${esc(sp.value)}</div>
                <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</div></div>`,
              )
              .join("")}</div>`;
          case "reviews":
            return `<h2 style="margin:0 0 28px;text-align:center;font-size:30px;font-weight:800">고객 후기</h2>
              <div style="display:flex;flex-wrap:wrap;gap:16px">${c.reviews
                .map(
                  (r) => `<div style="flex:1 1 28%;${card};padding:24px">
                  <div style="display:flex;gap:12px;align-items:center">
                    <div style="flex:none;width:40px;height:40px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center">${esc((r.name || "?").trim().slice(0, 1))}</div>
                    <div><div style="font-size:12px;font-weight:700;${sx("reviews.name")}">${esc(r.name)}</div><div style="color:#fbbf24;font-size:11px">★★★★★</div></div></div>
                  <p style="margin:16px 0 0;font-size:14px;line-height:1.6;opacity:.75;${sx("reviews.text")}">${nl2br(r.text)}</p></div>`,
                )
                .join("")}</div>`;
          case "pricing":
            return `<div style="${card};max-width:420px;margin:0 auto;padding:40px;text-align:center">
              <div style="display:flex;align-items:flex-end;justify-content:center;gap:10px">
                <span style="font-size:42px;font-weight:800;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
                <span style="font-size:16px;text-decoration:line-through;opacity:.4;padding-bottom:6px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span></div>
              <p style="margin:12px 0 0;font-size:14px;opacity:.65;${sx("pricing.note")}">${esc(c.pricing.note)}</p></div>`;
          case "faq":
            return `<div style="${card};padding:48px"><h2 style="margin:0;text-align:center;font-size:30px;font-weight:800">자주 묻는 질문</h2>
              <div style="max-width:640px;margin:28px auto 0">${c.faq
                .map(
                  (f, i) => `<div style="padding:20px 0;${i ? "border-top:1px solid rgba(0,0,0,.07)" : ""}">
                  <div style="display:flex;justify-content:space-between;gap:12px"><div style="font-weight:700;${sx("faq.q")}">${esc(f.q)}</div><span style="opacity:.3;font-size:18px">+</span></div>
                  <p style="margin:8px 0 0;font-size:14px;line-height:1.6;opacity:.6;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
                )
                .join("")}</div></div>`;
          case "block": {
            if (!s.block) return "";
            const b = s.block;
            const txt = `<h2 style="margin:0;font-size:28px;font-weight:800;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;opacity:.7;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>`;
            if (b.mode === "image")
              return `<div style="${card};overflow:hidden"><img src="${esc(b.image)}" alt="" style="display:block;width:100%"/></div>`;
            if (b.mode === "text") return `<div style="${card};padding:40px">${txt}</div>`;
            return `<div style="${card};padding:32px;display:flex;flex-wrap:wrap;gap:32px;align-items:center">
              <div style="flex:1 1 45%"><img src="${esc(b.image)}" alt="" style="display:block;width:100%;border-radius:16px"/></div><div style="flex:1 1 45%">${txt}</div></div>`;
          }
          default:
            return "";
        }
      })();
      if (!inner.trim()) return "";
      const p = Math.round(pad(s) / 2.4);
      return `<section style="position:relative;padding:${p}px 0;${
        s.bgImage ? "" : s.bg ? `background:${esc(s.bg)};` : ""
      }${bgImgDark(s) ? "color:#fff;" : ""}">${bgLayer(s)}<div style="position:relative">${inner}</div></section>`;
    };
    return `<div style="background:#eef0f5"><div style="max-width:${pageW + 40}px;margin:0 auto;padding:24px 16px 40px">${en
      .map(one)
      .join("")}</div></div>`;
  };

  const body = style === "editorial" ? rail() : style === "showcase" ? bento() : strip();

  const fams = new Set(Object.values(ts).map((s) => s.font));
  let fontsHref = googleFontsHref(fams);
  if (style === "editorial") {
    const base = "family=Nanum+Myeongjo:wght@400;700;800";
    fontsHref = fontsHref
      ? fontsHref.replace("?", "?" + base + "&")
      : `https://fonts.googleapis.com/css2?${base}&display=swap`;
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
  @media(max-width:820px){ h1{font-size:34px!important} h2{font-size:24px!important} h3{font-size:20px!important} }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
