import type { StoreContent, SectionRef } from "./schema";
import { PAD_PX, clampStyle } from "./schema";
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
  const m = /^#?([0-9a-f]{6})/i.exec(hex || "");
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140;
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
  const href = esc(c.cta.href || "#");
  const ctaSpan = `<span style="${sx("cta.text")}">${esc(c.cta.text)}</span>`;
  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const priceCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;
  const img = (src: string, css: string) =>
    `<img src="${esc(src)}" alt="" style="display:block;${css}"/>`;

  // ═══════════ STRIP ═══════════
  const strip = (): string => {
    const overlay = (inner: string, align: "left" | "right" | "center" = "left") =>
      `<div style="position:absolute;left:0;right:0;bottom:0;padding:96px 24px 40px;text-align:${align};background:linear-gradient(to top,rgba(0,0,0,.78),rgba(0,0,0,.35) 45%,rgba(0,0,0,0))">
        <div style="max-width:640px;${align === "right" ? "margin-left:auto" : align === "center" ? "margin:0 auto" : ""}">${inner}</div>
      </div>`;
    const bar = heroCtaHidden && priceCtaHidden
      ? ""
      : `<div style="position:sticky;bottom:0;z-index:40;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#000;color:#fff;padding:12px 20px;border-top:1px solid rgba(255,255,255,.1)">
          <div style="font-weight:900;font-size:15px">${esc(c.pricing.price)}<span style="margin-left:8px;font-weight:400;font-size:12px;text-decoration:line-through;opacity:.5">${esc(c.pricing.compareAt)}</span></div>
          <a href="${href}" style="flex:none;background:${esc(primary)};color:#fff;text-decoration:none;padding:12px 28px;font-weight:900;font-size:14px;letter-spacing:.12em">${ctaSpan}</a>
        </div>`;

    const heroTxt = `${c.hero.badge ? `<span style="display:inline-block;background:#fff;color:#000;padding:6px 12px;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;${sx("hero.badge")}">${esc(c.hero.badge)}</span>` : ""}
      <h1 style="margin:16px 0 0;font-size:52px;font-weight:900;line-height:1.05;letter-spacing:-.01em;color:#fff;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
      <p style="margin:16px 0 0;max-width:560px;font-size:15px;line-height:1.6;color:rgba(255,255,255,.8);${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>`;

    const one = (s: SectionRef): string => {
      const dark = isDark(s.bg) || false;
      const bandOpen = `<section style="position:relative;${s.bg ? `background:${esc(s.bg)};` : ""}${dark ? "color:#fff;" : ""}padding:${pad(s)}px 0"><div style="max-width:${s.wPx ?? 620}px;margin:0 auto;padding:0 24px">`;
      const bandClose = `</div></section>`;
      const line = dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.14)";

      switch (s.type) {
        case "hero":
          if (c.hero.mode === "text")
            return `<section style="background:${esc(primary)};color:#fff;padding:96px 24px;text-align:center"><div style="max-width:760px;margin:0 auto">${heroTxt}</div></section>`;
          if (c.hero.mode === "image")
            return `<section>${img(c.hero.image, "width:100%")}</section>`;
          return `<section style="position:relative;height:78vh;min-height:440px;overflow:hidden">
            ${img(c.hero.image, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover")}
            ${overlay(heroTxt, "left")}</section>`;

        case "highlights":
          return c.highlights
            .map((h, i) => {
              const right = i % 2 === 1;
              const media = h.iconImage
                ? img(h.iconImage, "width:100%;height:58vh;max-height:560px;min-height:360px;object-fit:cover")
                : `<div style="width:100%;height:48vh;max-height:460px;min-height:320px;background:${right ? A(primary, "e6") : esc(primary)}"></div>`;
              const cap = `<div style="font-size:11px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.7)">Point ${p2(i + 1)}</div>
                <h3 style="margin:8px 0 0;font-size:34px;font-weight:900;line-height:1.15;color:#fff;${sx("highlights.title")}">${esc(h.title)}</h3>
                <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,.8);${sx("highlights.desc")}">${nl2br(h.desc)}</p>`;
              return `<section style="position:relative">${media}
                <div aria-hidden style="position:absolute;top:-24px;${right ? "right" : "left"}:-12px;font-size:min(30vw,240px);font-weight:900;line-height:1;color:rgba(255,255,255,.15)">${p2(i + 1)}</div>
                ${overlay(cap, right ? "right" : "left")}</section>`;
            })
            .join("");

        case "callout":
          return `${bandOpen.replace(`max-width:${s.wPx ?? 620}px`, `max-width:${s.wPx ?? 860}px`)}<div style="text-align:center">
            <p style="margin:0;font-size:44px;font-weight:900;line-height:1.1;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
            ${c.callout.sub ? `<p style="margin:20px auto 0;max-width:420px;font-size:14px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;opacity:.7;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
          </div>${bandClose}`;

        case "checklist":
          return `${bandOpen}<h2 style="margin:0;font-size:32px;font-weight:900;line-height:1.15;${sx("checklist.heading")}">${esc(c.checklist.heading)}</h2>
            <ul style="list-style:none;margin:32px 0 0;padding:0">${c.checklist.items
              .map(
                (it, i) => `<li style="display:flex;gap:16px;padding:16px 0;${i ? `border-top:1px solid ${line}` : ""}">
                  <span style="font-size:18px;font-weight:900;color:${esc(primary)}">✓</span>
                  <span style="flex:1;font-size:16px;font-weight:700;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></li>`,
              )
              .join("")}</ul>${bandClose}`;

        case "steps":
          return `${bandOpen}<h2 style="margin:0;font-size:32px;font-weight:900;${sx("steps.heading")}">${esc(c.steps.heading)}</h2>
            <div style="margin-top:32px">${c.steps.items
              .map(
                (st, i) => `<div style="display:flex;gap:20px;padding:24px 0;${i ? `border-top:1px solid ${line}` : ""}">
                  <div style="font-size:40px;font-weight:900;line-height:1;color:${esc(primary)}">${p2(i + 1)}</div>
                  <div style="flex:1"><div style="font-size:19px;font-weight:900;${sx("steps.title")}">${esc(st.title)}</div>
                  <p style="margin:6px 0 0;font-size:14px;line-height:1.6;opacity:.7;${sx("steps.desc")}">${nl2br(st.desc)}</p></div></div>`,
              )
              .join("")}</div>${bandClose}`;

        case "detail":
          if (c.detail.mode === "text")
            return `${bandOpen}<h2 style="margin:0;font-size:32px;font-weight:900;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>
              <p style="margin:20px 0 0;font-size:16px;line-height:1.9;opacity:.8;${sx("detail.body")}">${nl2br(c.detail.body)}</p>${bandClose}`;
          if (c.detail.mode === "image")
            return `<section>${img(c.detail.image, "width:100%")}</section>`;
          return `<section style="position:relative">${img(c.detail.image, "width:100%;max-height:70vh;object-fit:cover")}
            ${overlay(`<h2 style="margin:0;font-size:40px;font-weight:900;color:#fff;${sx("detail.heading")}">${esc(c.detail.heading)}</h2>`, "left")}</section>
            ${bandOpen}<p style="margin:0;font-size:16px;line-height:1.9;opacity:.8;${sx("detail.body")}">${nl2br(c.detail.body)}</p>${bandClose}`;

        case "specs":
          return `${bandOpen}${c.specs
            .map(
              (sp, i) => `<div style="display:flex;justify-content:space-between;padding:16px 0;font-size:15px;${i ? `border-top:1px solid ${line}` : ""}">
                <span style="font-weight:900;text-transform:uppercase;letter-spacing:.04em;${sx("specs.label")}">${esc(sp.label)}</span>
                <span style="opacity:.7;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
            )
            .join("")}${bandClose}`;

        case "reviews":
          return `<section style="${s.bg ? `background:${esc(s.bg)};` : ""}${dark ? "color:#fff;" : ""}padding:${pad(s)}px 0">
            <div style="padding:0 24px 24px"><h2 style="margin:0;font-size:32px;font-weight:900">고객 후기</h2></div>
            <div style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory">${c.reviews
              .map(
                (r, i) => `<div style="width:440px;flex:none;scroll-snap-align:start;padding:32px 40px;${i ? `border-left:1px solid ${line}` : ""}">
                  <div style="color:#fbbf24;letter-spacing:.15em">★★★★★</div>
                  <p style="margin:12px 0 0;font-size:19px;font-weight:700;line-height:1.5;${sx("reviews.text")}">${nl2br(r.text)}</p>
                  <div style="margin:20px 0 0;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;opacity:.5;${sx("reviews.name")}">${esc(r.name)}</div></div>`,
              )
              .join("")}</div></section>`;

        case "pricing":
          return `${bandOpen.replace(`max-width:${s.wPx ?? 620}px`, `max-width:${s.wPx ?? 720}px`)}<div style="text-align:center">
            <div style="display:flex;align-items:flex-end;justify-content:center;gap:12px">
              <span style="font-size:72px;font-weight:900;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
              <span style="font-size:18px;text-decoration:line-through;opacity:.4;padding-bottom:8px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
            </div>
            <p style="margin:12px 0 0;font-size:14px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.7;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
            ${priceCtaHidden ? "" : `<a href="${href}" style="display:inline-block;margin-top:32px;background:#fff;color:#000;text-decoration:none;padding:16px 48px;font-weight:900;letter-spacing:.14em;text-transform:uppercase">${ctaSpan}</a>`}
          </div>${bandClose}`;

        case "faq":
          return `${bandOpen}<h2 style="margin:0;font-size:32px;font-weight:900">자주 묻는 질문</h2>
            <div style="margin-top:32px">${c.faq
              .map(
                (f, i) => `<div style="padding:20px 0;${i ? `border-top:1px solid ${line}` : ""}">
                  <div style="font-size:17px;font-weight:900;${sx("faq.q")}">${esc(f.q)}</div>
                  <p style="margin:8px 0 0;font-size:14px;line-height:1.6;opacity:.7;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
              )
              .join("")}</div>${bandClose}`;

        case "block": {
          if (!s.block) return "";
          const b = s.block;
          if (b.mode === "image") return `<section>${img(b.image, "width:100%")}</section>`;
          if (b.mode === "text")
            return `${bandOpen}<h2 style="margin:0;font-size:30px;font-weight:900;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.9;opacity:.8;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>${bandClose}`;
          return `<section style="position:relative">${img(b.image, "width:100%;max-height:64vh;object-fit:cover")}
            ${overlay(`<h2 style="margin:0;font-size:38px;font-weight:900;color:#fff;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>`, "left")}</section>
            ${bandOpen}<p style="margin:0;font-size:15px;line-height:1.9;opacity:.8;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>${bandClose}`;
        }
        default:
          return "";
      }
    };
    return en.map(one).join("") + bar;
  };

  // ═══════════ RAIL ═══════════
  const rail = (): string => {
    const H2 = (txt: string, key: string) =>
      `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:36px;line-height:1.15;${sx(key)}">${esc(txt)}</h2>`;
    const hair = "rgba(0,0,0,.12)";

    const one = (s: SectionRef): string => {
      const inner = ((): string => {
        switch (s.type) {
          case "hero": {
            const eb = c.hero.badge
              ? `<div style="margin-bottom:32px;font-size:11px;font-weight:600;letter-spacing:.34em;text-transform:uppercase;opacity:.45;${sx("hero.badge")}">${esc(c.hero.badge)}</div>`
              : "";
            const h1 = `<h1 style="margin:0;font-family:${SERIF};font-weight:500;font-size:76px;line-height:1.03;letter-spacing:-.01em;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>`;
            const sub = `<p style="margin:32px 0 0;max-width:360px;font-size:14px;line-height:1.9;opacity:.6;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>`;
            const cta = heroCtaHidden
              ? ""
              : `<div style="margin-top:32px"><a href="${href}" style="display:inline-block;border-bottom:1px solid currentColor;color:inherit;text-decoration:none;padding-bottom:4px;font-size:11px;font-weight:600;letter-spacing:.24em;text-transform:uppercase">${ctaSpan}</a></div>`;
            if (c.hero.mode === "text") return `${eb}${h1}${sub}${cta}`;
            if (c.hero.mode === "image")
              return `${eb}${h1}${sub}${cta}<div style="margin-top:56px">${img(c.hero.image, "width:100%")}</div>`;
            const pct = s.splitPct ?? 50;
            return `${eb}${h1}<div style="display:flex;flex-wrap:wrap;gap:40px;margin-top:56px">
              <div style="flex:1 1 ${pct}%">${img(c.hero.image, "width:100%")}</div>
              <div style="flex:1 1 ${100 - pct - 10}%">${sub}${cta}</div></div>`;
          }
          case "highlights":
            return c.highlights
              .map(
                (h, i) => `<div style="display:grid;grid-template-columns:64px 1fr;gap:24px;margin-left:-64px;padding:48px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                <div style="font-family:${SERIF};font-size:36px;opacity:.25">${p2(i + 1)}</div>
                <div><h3 style="margin:0;font-family:${SERIF};font-weight:500;font-size:24px;${sx("highlights.title")}">${esc(h.title)}</h3>
                <p style="margin:12px 0 0;max-width:440px;font-size:13px;line-height:1.8;opacity:.55;${sx("highlights.desc")}">${nl2br(h.desc)}</p></div></div>`,
              )
              .join("");
          case "checklist":
            return `${H2(c.checklist.heading, "checklist.heading")}
              <ul style="list-style:none;margin:40px 0 0;padding:0;max-width:520px">${c.checklist.items
                .map(
                  (it, i) => `<li style="display:flex;gap:16px;padding:16px 0;font-size:14px;line-height:1.8;opacity:.8;${i ? `border-top:1px solid ${hair}` : ""}">
                    <span style="opacity:.35">—</span><span style="${sx("checklist.item")}">${esc(it.text)}</span></li>`,
                )
                .join("")}</ul>`;
          case "callout":
            return `<div style="width:48px;height:1px;background:currentColor;opacity:.3"></div>
              <p style="margin:32px 0 0;max-width:640px;font-family:${SERIF};font-weight:500;font-style:italic;font-size:40px;line-height:1.35;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
              ${c.callout.sub ? `<p style="margin:28px 0 0;font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;opacity:.45;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}`;
          case "steps":
            return `${H2(c.steps.heading, "steps.heading")}
              <div style="margin-top:40px">${c.steps.items
                .map(
                  (st, i) => `<div style="display:grid;grid-template-columns:64px 1fr;gap:24px;margin-left:-64px;padding:28px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                    <div style="font-family:${SERIF};font-size:36px;opacity:.25">${p2(i + 1)}</div>
                    <div><div style="font-family:${SERIF};font-weight:500;font-size:20px;${sx("steps.title")}">${esc(st.title)}</div>
                    <p style="margin:8px 0 0;max-width:440px;font-size:13px;line-height:1.8;opacity:.55;${sx("steps.desc")}">${nl2br(st.desc)}</p></div></div>`,
                )
                .join("")}</div>`;
          case "detail": {
            const txt = `${H2(c.detail.heading, "detail.heading")}<p style="margin:20px 0 0;font-size:14px;line-height:1.9;opacity:.65;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
            if (c.detail.mode === "text") return `<div style="max-width:560px">${txt}</div>`;
            if (c.detail.mode === "image") return img(c.detail.image, "width:100%");
            const pct = s.splitPct ?? 50;
            return `<div style="display:flex;flex-wrap:wrap;gap:40px;align-items:center">
              <div style="flex:1 1 ${pct}%">${img(c.detail.image, "width:100%")}</div>
              <div style="flex:1 1 ${100 - pct - 10}%">${txt}</div></div>`;
          }
          case "specs":
            return `<div style="max-width:520px">${c.specs
              .map(
                (sp, i) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:32px;padding:16px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                  <span style="font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</span>
                  <span style="font-family:${SERIF};font-size:16px;${sx("specs.value")}">${esc(sp.value)}</span></div>`,
              )
              .join("")}</div>`;
          case "reviews":
            return c.reviews
              .map(
                (r, i) => `<figure style="margin:0;padding:48px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                <div style="font-family:${SERIF};font-size:36px;line-height:1;opacity:.15">&ldquo;</div>
                <p style="margin:8px 0 0;max-width:640px;font-family:${SERIF};font-weight:500;font-size:26px;line-height:1.5;${sx("reviews.text")}">${nl2br(r.text)}</p>
                <figcaption style="margin-top:24px;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;opacity:.45;${sx("reviews.name")}">${esc(r.name)}</figcaption></figure>`,
              )
              .join("");
          case "pricing":
            return `<div style="max-width:420px">
              <div style="display:flex;align-items:baseline;gap:16px">
                <span style="font-family:${SERIF};font-weight:500;font-size:44px;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
                <span style="font-size:14px;text-decoration:line-through;opacity:.35;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span>
              </div>
              <p style="margin:16px 0 0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.5;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
              ${priceCtaHidden ? "" : `<div style="margin-top:32px"><a href="${href}" style="display:inline-block;border:1px solid currentColor;color:inherit;text-decoration:none;padding:16px 48px;font-size:11px;font-weight:600;letter-spacing:.24em;text-transform:uppercase">${ctaSpan}</a></div>`}
            </div>`;
          case "faq":
            return `<div style="max-width:640px"><h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:36px">자주 묻는 질문</h2>
              <div style="margin-top:40px">${c.faq
                .map(
                  (f, i) => `<div style="padding:20px 0;${i ? `border-top:1px solid ${hair}` : ""}">
                    <div style="font-family:${SERIF};font-weight:500;font-size:16px;${sx("faq.q")}">${esc(f.q)}</div>
                    <p style="margin:8px 0 0;font-size:13px;line-height:1.8;opacity:.55;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
                )
                .join("")}</div></div>`;
          case "block": {
            if (!s.block) return "";
            const b = s.block;
            const txt = `<h2 style="margin:0;font-family:${SERIF};font-weight:500;font-size:32px;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
              <p style="margin:20px 0 0;font-size:14px;line-height:1.9;opacity:.65;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>`;
            if (b.mode === "text") return `<div style="max-width:560px">${txt}</div>`;
            if (b.mode === "image") return img(b.image, "width:100%");
            return `<div style="display:flex;flex-wrap:wrap;gap:40px;align-items:center">
              <div style="flex:1 1 45%">${img(b.image, "width:100%")}</div><div style="flex:1 1 45%">${txt}</div></div>`;
          }
          default:
            return "";
        }
      })();
      if (!inner.trim()) return "";
      return `<section style="border-top:1px solid rgba(0,0,0,.1);padding:${pad(s)}px 0;${s.bg ? `background:${esc(s.bg)};` : ""}"><div style="max-width:${s.wPx ?? 760}px">${inner}</div></section>`;
    };

    const railList = en
      .map(
        (s, i) => `<li style="display:flex;gap:10px;margin-bottom:12px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;opacity:${i === 0 ? "1" : ".3"}">
          <span style="font-family:${SERIF}">${p2(i + 1)}</span><span>${esc(s.type === "block" ? s.block?.heading || "블록" : railLabel(s.type))}</span></li>`,
      )
      .join("");

    return `<div style="max-width:1200px;margin:0 auto;padding:0 24px">
      <div style="display:flex;gap:56px;align-items:flex-start">
        <aside style="flex:none;width:170px;position:sticky;top:0;padding:64px 0" class="rail-aside"><ol style="list-style:none;margin:0;padding:0">${railList}</ol></aside>
        <div style="flex:1;min-width:0">${en.map(one).join("")}</div>
      </div>
    </div>`;
  };

  // ═══════════ BENTO ═══════════
  const bento = (): string => {
    const card =
      "border:1px solid rgba(0,0,0,.06);background:#fff;border-radius:24px;box-shadow:0 2px 24px rgba(0,0,0,.06)";
    const H2 = (txt: string, key: string) =>
      `<h2 style="margin:0;font-size:30px;font-weight:800;${sx(key)}">${esc(txt)}</h2>`;
    const chip = A(primary, "14");

    const one = (s: SectionRef, idx: number): string => {
      const body = ((): string => {
        switch (s.type) {
          case "hero": {
            const stats = c.specs.slice(0, 3);
            const txt = `${c.hero.badge ? `<span style="display:inline-block;border-radius:9999px;padding:6px 14px;font-size:12px;font-weight:700;background:${esc(c.hero.badgeBg)};color:${esc(c.hero.badgeText)};${sx("hero.badge")}">${esc(c.hero.badge)}</span>` : ""}
              <h1 style="margin:20px 0 0;font-size:48px;font-weight:800;line-height:1.12;${sx("hero.title")}">${nl2br(c.hero.title)}</h1>
              <p style="margin:16px 0 0;max-width:440px;font-size:15px;line-height:1.6;opacity:.65;${sx("hero.subtitle")}">${nl2br(c.hero.subtitle)}</p>
              ${heroCtaHidden ? "" : `<div style="margin-top:26px"><a href="${href}" style="display:inline-block;background:${esc(primary)};color:#fff;text-decoration:none;border-radius:12px;padding:14px 28px;font-weight:700;font-size:14px;box-shadow:0 10px 24px rgba(0,0,0,.16)">${ctaSpan}</a></div>`}`;
            const imgEl =
              c.hero.mode === "text"
                ? ""
                : `<div style="flex:1 1 45%">${img(c.hero.image, "width:100%;border-radius:16px")}</div>`;
            return `<div style="${card};padding:48px">
              <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:center"><div style="flex:1 1 45%">${txt}</div>${imgEl}</div>
            </div>
            ${stats.length ? `<div style="display:flex;gap:12px;margin:-32px 48px 0;position:relative;z-index:1">${stats
              .map(
                (sp) => `<div style="flex:1;${card};padding:16px;text-align:center">
                  <div style="font-size:24px;font-weight:800;${sx("specs.value")}">${esc(sp.value)}</div>
                  <div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</div></div>`,
              )
              .join("")}</div>` : ""}`;
          }
          case "highlights":
            return `<div style="display:flex;flex-wrap:wrap;gap:16px">${c.highlights
              .map(
                (h, i) => `<div style="${card};padding:32px;flex:1 1 ${i === 0 ? "58%" : "28%"}">
                  <div style="width:48px;height:48px;border-radius:16px;background:${chip};display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden">${
                    h.iconImage ? img(h.iconImage, "width:100%;height:100%;object-fit:cover") : esc(h.icon || "✨")
                  }</div>
                  <h3 style="margin:16px 0 0;font-weight:700;font-size:${i === 0 ? "22px" : "16px"};${sx("highlights.title")}">${esc(h.title)}</h3>
                  <p style="margin:8px 0 0;font-size:14px;line-height:1.6;opacity:.6;${sx("highlights.desc")}">${nl2br(h.desc)}</p></div>`,
              )
              .join("")}</div>`;
          case "checklist":
            return `<div style="${card};padding:48px">${H2(c.checklist.heading, "checklist.heading")}
              <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px">${c.checklist.items
                .map(
                  (it) => `<div style="flex:1 1 45%;display:flex;gap:12px;align-items:flex-start;border-radius:16px;padding:14px 16px;background:${A(primary, "0a")}">
                    <span style="flex:none;width:20px;height:20px;border-radius:9999px;background:${esc(primary)};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:2px">✓</span>
                    <span style="font-size:14px;font-weight:500;line-height:1.6;${sx("checklist.item")}">${esc(it.text)}</span></div>`,
                )
                .join("")}</div></div>`;
          case "callout":
            return `<div style="border-radius:24px;padding:72px 32px;text-align:center;color:#fff;background:linear-gradient(135deg,${esc(primary)},${A(primary, "cc")});box-shadow:0 12px 32px rgba(0,0,0,.16)">
              <p style="margin:0 auto;max-width:640px;font-size:34px;font-weight:800;line-height:1.3;${sx("callout.text")}">${nl2br(c.callout.text)}</p>
              ${c.callout.sub ? `<p style="margin:16px auto 0;max-width:420px;font-size:14px;opacity:.85;${sx("callout.sub")}">${esc(c.callout.sub)}</p>` : ""}
              ${heroCtaHidden ? "" : `<div style="margin-top:26px"><a href="${href}" style="display:inline-block;background:#fff;color:${esc(primary)};text-decoration:none;border-radius:12px;padding:14px 32px;font-weight:700;font-size:14px">${ctaSpan}</a></div>`}</div>`;
          case "steps":
            return `<div style="${card};padding:48px">${H2(c.steps.heading, "steps.heading")}
              <div style="display:flex;flex-wrap:wrap;gap:24px;margin-top:36px">${c.steps.items
                .map(
                  (st, i) => `<div style="flex:1 1 28%">
                    <div style="width:40px;height:40px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center">${i + 1}</div>
                    <div style="margin:12px 0 0;font-weight:700;${sx("steps.title")}">${esc(st.title)}</div>
                    <p style="margin:6px 0 0;font-size:13px;line-height:1.6;opacity:.6;${sx("steps.desc")}">${nl2br(st.desc)}</p></div>`,
                )
                .join("")}</div></div>`;
          case "detail": {
            const txt = `${H2(c.detail.heading, "detail.heading")}<p style="margin:16px 0 0;font-size:15px;line-height:1.7;opacity:.65;${sx("detail.body")}">${nl2br(c.detail.body)}</p>`;
            if (c.detail.mode === "text") return `<div style="${card};padding:48px">${txt}</div>`;
            if (c.detail.mode === "image")
              return `<div style="${card};overflow:hidden">${img(c.detail.image, "width:100%")}</div>`;
            const pct = s.splitPct ?? 50;
            return `<div style="${card};padding:32px;display:flex;flex-wrap:wrap;gap:32px;align-items:center">
              <div style="flex:1 1 ${pct}%">${img(c.detail.image, "width:100%;border-radius:16px")}</div>
              <div style="flex:1 1 ${100 - pct - 8}%">${txt}</div></div>`;
          }
          case "specs":
            return `<div style="display:flex;flex-wrap:wrap;gap:16px">${c.specs
              .map(
                (sp) => `<div style="${card};padding:20px;flex:1 1 20%">
                  <div style="font-size:18px;font-weight:800;${sx("specs.value")}">${esc(sp.value)}</div>
                  <div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.45;${sx("specs.label")}">${esc(sp.label)}</div></div>`,
              )
              .join("")}</div>`;
          case "reviews":
            return `<h2 style="margin:0 0 24px;text-align:center;font-size:30px;font-weight:800">고객 후기</h2>
              <div style="display:flex;flex-wrap:wrap;gap:16px">${c.reviews
                .map(
                  (r) => `<div style="${card};padding:24px;flex:1 1 28%">
                    <div style="display:flex;gap:12px;align-items:center">
                      <div style="flex:none;width:40px;height:40px;border-radius:9999px;background:${esc(primary)};color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center">${esc((r.name || "?").trim().slice(0, 1))}</div>
                      <div><div style="font-size:12px;font-weight:700;${sx("reviews.name")}">${esc(r.name)}</div><div style="color:#fbbf24;font-size:11px">★★★★★</div></div></div>
                    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;opacity:.75;${sx("reviews.text")}">${nl2br(r.text)}</p></div>`,
                )
                .join("")}</div>`;
          case "pricing":
            return `<div style="${card};max-width:420px;margin:0 auto;padding:36px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.12)">
              <div style="display:flex;align-items:flex-end;justify-content:center;gap:10px">
                <span style="font-size:42px;font-weight:800;line-height:1;${sx("pricing.price")}">${esc(c.pricing.price)}</span>
                <span style="font-size:16px;text-decoration:line-through;opacity:.4;padding-bottom:6px;${sx("pricing.compareAt")}">${esc(c.pricing.compareAt)}</span></div>
              <p style="margin:12px 0 0;font-size:14px;opacity:.65;${sx("pricing.note")}">${esc(c.pricing.note)}</p>
              ${priceCtaHidden ? "" : `<a href="${href}" style="display:block;margin-top:26px;background:${esc(primary)};color:#fff;text-decoration:none;border-radius:12px;padding:16px;font-weight:700;font-size:16px">${ctaSpan}</a>`}</div>`;
          case "faq":
            return `<div style="${card};padding:48px"><h2 style="margin:0;text-align:center;font-size:30px;font-weight:800">자주 묻는 질문</h2>
              <div style="max-width:640px;margin:28px auto 0">${c.faq
                .map(
                  (f, i) => `<div style="padding:20px 0;${i ? "border-top:1px solid rgba(0,0,0,.08)" : ""}">
                    <div style="display:flex;justify-content:space-between;gap:12px"><div style="font-weight:700;${sx("faq.q")}">${esc(f.q)}</div><span style="opacity:.3;font-size:18px">+</span></div>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.6;opacity:.6;${sx("faq.a")}">${nl2br(f.a)}</p></div>`,
                )
                .join("")}</div></div>`;
          case "block": {
            if (!s.block) return "";
            const b = s.block;
            const txt = `<h2 style="margin:0;font-size:28px;font-weight:800;${sx(`block.${s.key}.heading`)}">${esc(b.heading)}</h2>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;opacity:.7;${sx(`block.${s.key}.body`)}">${nl2br(b.body)}</p>`;
            if (b.mode === "text") return `<div style="${card};padding:40px">${txt}</div>`;
            if (b.mode === "image") return `<div style="${card};overflow:hidden">${img(b.image, "width:100%")}</div>`;
            return `<div style="${card};padding:32px;display:flex;flex-wrap:wrap;gap:32px;align-items:center">
              <div style="flex:1 1 45%">${img(b.image, "width:100%;border-radius:16px")}</div><div style="flex:1 1 45%">${txt}</div></div>`;
          }
          default:
            return "";
        }
      })();
      if (!body.trim()) return "";
      const p = Math.round(pad(s) / 2);
      return `<section id="bento-${idx}" style="padding:${p}px 0;${s.bg ? `background:${esc(s.bg)};` : ""}"><div style="max-width:${s.wPx ?? 1160}px;margin:0 auto">${body}</div></section>`;
    };

    const nav = `<div style="position:sticky;top:0;z-index:40;padding:12px;text-align:center">
      <nav style="display:inline-flex;gap:4px;align-items:center;background:rgba(255,255,255,.9);border:1px solid rgba(0,0,0,.06);border-radius:9999px;padding:6px 8px;box-shadow:0 8px 24px rgba(0,0,0,.1);backdrop-filter:blur(8px);max-width:100%;overflow-x:auto">
        ${en
          .slice(0, 7)
          .map(
            (s, i) => `<a href="#bento-${i}" style="flex:none;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:600;color:inherit;text-decoration:none;opacity:.6">${esc(s.type === "block" ? s.block?.heading || "블록" : railLabel(s.type))}</a>`,
          )
          .join("")}
        ${heroCtaHidden && priceCtaHidden ? "" : `<a href="${href}" style="flex:none;border-radius:9999px;padding:6px 16px;font-size:12px;font-weight:700;background:${esc(primary)};color:#fff;text-decoration:none">${ctaSpan}</a>`}
      </nav></div>`;

    return `<div style="background:#f1f2f6">${nav}<div style="max-width:1220px;margin:0 auto;padding:0 16px 80px">${en
      .map(one)
      .join("")}</div></div>`;
  };

  const body =
    style === "editorial" ? rail() : style === "showcase" ? bento() : strip();

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
  @media(max-width:820px){
    .rail-aside{display:none!important}
    h1{font-size:34px!important}
    h2{font-size:24px!important}
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function railLabel(type: SectionRef["type"]): string {
  const m: Record<string, string> = {
    hero: "메인",
    highlights: "강점",
    detail: "상세",
    checklist: "추천 대상",
    callout: "강조",
    steps: "진행 순서",
    specs: "스펙",
    reviews: "후기",
    pricing: "가격",
    faq: "FAQ",
    block: "블록",
  };
  return m[type] || type;
}
