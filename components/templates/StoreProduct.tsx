"use client";

import type { StoreContent, SectionRef, SectionType } from "@/lib/schema";
import { WIDTH_PX, PAD_PX } from "@/lib/schema";
import Editable from "@/components/Editable";
import ResizableImage from "@/components/ResizableImage";

type Props = {
  content: StoreContent;
  onChange?: (next: StoreContent) => void;
  editing: boolean;
  canResize?: boolean;
  selectedTextKey?: string | null;
  onSelectText?: (key: string) => void;
};

// #RRGGBB -> 어두운 배경인지
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

export default function StoreProduct({
  content,
  onChange,
  editing,
  canResize = false,
  selectedTextKey = null,
  onSelectText,
}: Props) {
  const c = content;
  const set = (patch: Partial<StoreContent>) => onChange?.({ ...c, ...patch });
  const style = c.style || "classic";
  const primary = c.theme.primary || "#2563eb";
  const headingFont = style === "editorial" ? "font-serif" : "";

  const tp = (key: string) => ({
    styleKey: key,
    textStyle: c.textStyles?.[key],
    selected: selectedTextKey === key,
    onSelect: onSelectText,
  });

  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 720)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];

  // ── 공통 텍스트 조각 ──────────────────────────────
  const heroSplit = c.hero.splitPct ?? 50;
  const detailSplit = c.detail.splitPct ?? 50;

  const makeSplitDrag =
    (imageSide: "left" | "right", apply: (pct: number) => void) =>
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const row = (e.currentTarget as HTMLElement).closest("[data-split-row]");
      if (!row || !onChange) return;
      const rect = row.getBoundingClientRect();
      const move = (ev: PointerEvent) => {
        const raw =
          imageSide === "right"
            ? ((rect.right - ev.clientX) / rect.width) * 100
            : ((ev.clientX - rect.left) / rect.width) * 100;
        apply(Math.max(30, Math.min(75, Math.round(raw))));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  const startHeroSplit = makeSplitDrag("right", (p) =>
    set({ hero: { ...c.hero, splitPct: p } }),
  );
  const startDetailSplit = makeSplitDrag("left", (p) =>
    set({ detail: { ...c.detail, splitPct: p } }),
  );
  const splitHandle = (onDown: (e: React.PointerEvent) => void, side: "left" | "right") =>
    editing && canResize ? (
      <span
        onPointerDown={onDown}
        title="드래그해서 이미지 영역 넓히기 / 좁히기"
        className={
          "absolute top-1/2 z-10 hidden h-16 w-2.5 -translate-y-1/2 cursor-ew-resize touch-none rounded-full bg-current opacity-40 md:block " +
          (side === "left" ? "-left-5" : "-right-5")
        }
      />
    ) : null;

  const gridColsClass = (n: number) =>
    n <= 1 ? "" : n === 2 ? "sm:grid-cols-2" : n >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  const ctaBtn = (big: boolean, hidden: boolean, cls = "mt-6") =>
    hidden ? null : (
      <div className={cls}>
        <a
          href={c.cta.href || "#"}
          className={
            "inline-block rounded-xl font-bold text-white shadow-sm " +
            (big ? "px-10 py-4 text-lg" : "px-7 py-3")
          }
          style={{ background: primary }}
        >
          <Editable as="span" editing={editing} value={c.cta.text} {...tp("cta.text")}
            onChange={(v) => set({ cta: { ...c.cta, text: v } })} />
        </a>
      </div>
    );

  const badge = c.hero.badge ? (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-bold"
      style={{ background: c.hero.badgeBg, color: c.hero.badgeText }}
    >
      <Editable as="span" editing={editing} value={c.hero.badge} {...tp("hero.badge")}
        onChange={(v) => set({ hero: { ...c.hero, badge: v } })} />
    </span>
  ) : null;

  const resizableImg = (
    src: string,
    keyPrefix: "hero" | "detail",
    aspectFallback: string,
  ) => {
    const cur = keyPrefix === "hero" ? c.hero : c.detail;
    return (
      <ResizableImage
        src={src}
        editing={editing}
        widthPct={cur.imageW ?? 100}
        aspect={cur.imageAspect ? String(cur.imageAspect) : aspectFallback}
        imgClassName="w-full rounded-2xl object-cover shadow-lg"
        onResize={
          canResize
            ? (p, a) =>
                set({
                  [keyPrefix]: { ...cur, imageW: p, ...(a != null ? { imageAspect: a } : {}) },
                } as Partial<StoreContent>)
            : undefined
        }
      />
    );
  };

  // ── 섹션 내용 렌더러 (바깥 배경/여백은 SectionShell 이 담당) ──
  const heroText = (
    <>
      {badge}
      <Editable as="h1" multiline editing={editing} {...tp("hero.title")}
        className={`mt-4 text-3xl font-extrabold leading-[1.25] md:text-4xl ${headingFont}`}
        value={c.hero.title}
        onChange={(v) => set({ hero: { ...c.hero, title: v } })} />
      <Editable as="p" multiline editing={editing} {...tp("hero.subtitle")}
        className="mt-4 text-base leading-relaxed opacity-75"
        value={c.hero.subtitle}
        onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })} />
      {ctaBtn(false, heroCtaHidden, "mt-6")}
    </>
  );

  const heroSection = () => {
    if (c.hero.mode === "text") return <div>{heroText}</div>;
    if (c.hero.mode === "image")
      return <div className="-mx-5">{resizableImg(c.hero.image, "hero", "1/1")}</div>;
    return (
      <div
        data-split-row
        className="md:grid md:items-center md:gap-8"
        style={{ gridTemplateColumns: `${100 - heroSplit}fr ${heroSplit}fr` }}
      >
        <div>{heroText}</div>
        <div className="relative mt-8 md:mt-0">
          {splitHandle(startHeroSplit, "left")}
          {resizableImg(c.hero.image, "hero", "4/3")}
        </div>
      </div>
    );
  };

  const highlightsSection = () => (
    <div className="space-y-3">
      {c.highlights.map((h, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-2xl border border-current/10 p-5"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white"
            style={{ background: primary }}
          >
            {h.iconImage ? (
              <img src={h.iconImage} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              String(i + 1).padStart(2, "0")
            )}
          </span>
          <div className="min-w-0 flex-1">
            <Editable as="h3" editing={editing} className={`font-bold ${headingFont}`} value={h.title} {...tp("highlights.title")}
              onChange={(v) => {
                const highlights = [...c.highlights];
                highlights[i] = { ...h, title: v };
                set({ highlights });
              }} />
            <Editable as="p" multiline editing={editing} className="mt-1 text-sm leading-relaxed opacity-70" value={h.desc} {...tp("highlights.desc")}
              onChange={(v) => {
                const highlights = [...c.highlights];
                highlights[i] = { ...h, desc: v };
                set({ highlights });
              }} />
          </div>
        </div>
      ))}
    </div>
  );

  const checklistSection = () => (
    <div>
      <Editable as="h2" editing={editing} className={`text-center text-2xl font-extrabold ${headingFont}`}
        value={c.checklist.heading} {...tp("checklist.heading")}
        onChange={(v) => set({ checklist: { ...c.checklist, heading: v } })} />
      <ul className="mx-auto mt-6 max-w-lg space-y-3">
        {c.checklist.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl border border-current/10 bg-current/5 px-4 py-3">
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
              style={{ background: primary }}
            >
              ✓
            </span>
            <Editable as="span" editing={editing} className="text-sm font-medium leading-relaxed" value={it.text} {...tp("checklist.item")}
              onChange={(v) => {
                const items = [...c.checklist.items];
                items[i] = { text: v };
                set({ checklist: { ...c.checklist, items } });
              }} />
          </li>
        ))}
      </ul>
    </div>
  );

  const calloutSection = () => (
    <div className="text-center">
      <Editable as="p" multiline editing={editing} className={`text-2xl font-extrabold leading-snug md:text-3xl ${headingFont}`}
        value={c.callout.text} {...tp("callout.text")}
        onChange={(v) => set({ callout: { ...c.callout, text: v } })} />
      {(c.callout.sub || editing) && (
        <Editable as="p" editing={editing} className="mt-3 text-sm opacity-70"
          value={c.callout.sub} {...tp("callout.sub")}
          onChange={(v) => set({ callout: { ...c.callout, sub: v } })} />
      )}
    </div>
  );

  const stepsSection = () => (
    <div>
      <Editable as="h2" editing={editing} className={`text-center text-2xl font-extrabold ${headingFont}`}
        value={c.steps.heading} {...tp("steps.heading")}
        onChange={(v) => set({ steps: { ...c.steps, heading: v } })} />
      <div className="mt-6 space-y-3">
        {c.steps.items.map((st, i) => (
          <div key={i} className="rounded-2xl border border-current/10 p-5">
            <Editable as="div" editing={editing} className="font-extrabold" style={{ color: primary }} value={st.title} {...tp("steps.title")}
              onChange={(v) => {
                const items = [...c.steps.items];
                items[i] = { ...st, title: v };
                set({ steps: { ...c.steps, items } });
              }} />
            <Editable as="p" multiline editing={editing} className="mt-1 text-sm leading-relaxed opacity-70" value={st.desc} {...tp("steps.desc")}
              onChange={(v) => {
                const items = [...c.steps.items];
                items[i] = { ...st, desc: v };
                set({ steps: { ...c.steps, items } });
              }} />
          </div>
        ))}
      </div>
    </div>
  );

  const detailSection = () => {
    const heading = (cls: string) => (
      <Editable as="h2" editing={editing} className={cls} {...tp("detail.heading")}
        value={c.detail.heading}
        onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
    );
    const bodyEl = (cls: string) => (
      <Editable as="p" multiline editing={editing} className={cls} {...tp("detail.body")}
        value={c.detail.body}
        onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
    );
    if (c.detail.mode === "text")
      return (
        <div>
          {heading(`text-2xl font-extrabold ${headingFont}`)}
          {bodyEl("mt-4 leading-relaxed opacity-80")}
        </div>
      );
    if (c.detail.mode === "image")
      return <div className="-mx-5">{resizableImg(c.detail.image, "detail", "1/1")}</div>;
    return (
      <div
        data-split-row
        className="md:grid md:items-center md:gap-8"
        style={{ gridTemplateColumns: `${detailSplit}fr ${100 - detailSplit}fr` }}
      >
        <div className="relative">
          {splitHandle(startDetailSplit, "right")}
          {resizableImg(c.detail.image, "detail", "4/3")}
        </div>
        <div className="mt-8 md:mt-0">
          {heading(`text-2xl font-extrabold ${headingFont}`)}
          {bodyEl("mt-4 leading-relaxed opacity-80")}
        </div>
      </div>
    );
  };

  const specsSection = () => (
    <div className="overflow-hidden rounded-2xl border border-current/10">
      {c.specs.map((s, i) => (
        <div
          key={i}
          className={
            "flex justify-between px-5 py-3 text-sm " +
            (i < c.specs.length - 1 ? "border-b border-current/10" : "")
          }
        >
          <Editable as="span" editing={editing} className="font-bold" value={s.label} {...tp("specs.label")}
            onChange={(v) => {
              const specs = [...c.specs];
              specs[i] = { ...s, label: v };
              set({ specs });
            }} />
          <Editable as="span" editing={editing} className="opacity-70" value={s.value} {...tp("specs.value")}
            onChange={(v) => {
              const specs = [...c.specs];
              specs[i] = { ...s, value: v };
              set({ specs });
            }} />
        </div>
      ))}
    </div>
  );

  const reviewsSection = () => (
    <div>
      <h2 className={`text-center text-2xl font-extrabold ${headingFont}`}>고객 후기</h2>
      <div className={"mt-6 grid gap-4 " + gridColsClass(c.reviews.length)}>
        {c.reviews.map((r, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-current/10 p-5">
            <div className="text-amber-400">★★★★★</div>
            <Editable as="p" multiline editing={editing} className="mt-2 flex-1 text-sm leading-relaxed" value={r.text} {...tp("reviews.text")}
              onChange={(v) => {
                const reviews = [...c.reviews];
                reviews[i] = { ...r, text: v };
                set({ reviews });
              }} />
            <Editable as="div" editing={editing} className="mt-3 text-xs font-bold opacity-55" value={r.name} {...tp("reviews.name")}
              onChange={(v) => {
                const reviews = [...c.reviews];
                reviews[i] = { ...r, name: v };
                set({ reviews });
              }} />
          </div>
        ))}
      </div>
    </div>
  );

  const pricingSection = () => (
    <div className="mx-auto max-w-md rounded-3xl border border-current/10 bg-current/5 p-8 text-center">
      <div className="flex items-end justify-center gap-3">
        <Editable as="span" editing={editing} className="text-4xl font-extrabold" value={c.pricing.price} {...tp("pricing.price")}
          onChange={(v) => set({ pricing: { ...c.pricing, price: v } })} />
        <Editable as="span" editing={editing} className="pb-1 text-lg line-through opacity-40" value={c.pricing.compareAt} {...tp("pricing.compareAt")}
          onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })} />
      </div>
      <Editable as="p" editing={editing} className="mt-2 text-sm opacity-70" value={c.pricing.note} {...tp("pricing.note")}
        onChange={(v) => set({ pricing: { ...c.pricing, note: v } })} />
      {ctaBtn(true, pricingCtaHidden, "mt-6")}
    </div>
  );

  const faqSection = () => (
    <div>
      <h2 className={`text-2xl font-extrabold ${headingFont}`}>자주 묻는 질문</h2>
      <div className="mt-5 space-y-3">
        {c.faq.map((f, i) => (
          <div key={i} className="rounded-xl border border-current/10 p-5">
            <Editable as="div" editing={editing} className="font-bold" value={f.q} {...tp("faq.q")}
              onChange={(v) => {
                const faq = [...c.faq];
                faq[i] = { ...f, q: v };
                set({ faq });
              }} />
            <Editable as="p" multiline editing={editing} className="mt-2 text-sm leading-relaxed opacity-70" value={f.a} {...tp("faq.a")}
              onChange={(v) => {
                const faq = [...c.faq];
                faq[i] = { ...f, a: v };
                set({ faq });
              }} />
          </div>
        ))}
      </div>
    </div>
  );

  const blockSection = (s: SectionRef, idx: number) => {
    const b = s.block!;
    const setBlock = (patch: Partial<typeof b>) => {
      const sections = c.sections.map((x, j) =>
        j === idx ? { ...x, block: { ...b, ...patch } } : x,
      );
      set({ sections });
    };
    const align = b.align === "center" ? "text-center" : "";
    const img = (
      <img
        src={b.image}
        alt=""
        className="w-full rounded-2xl object-cover shadow-lg"
        style={{ aspectRatio: b.imageAspect ? String(b.imageAspect) : "4/3" }}
      />
    );
    const text = (
      <div className={align}>
        <Editable as="h2" editing={editing} className={`text-2xl font-extrabold ${headingFont}`} value={b.heading}
          styleKey={`block.${s.key}.heading`} textStyle={c.textStyles?.[`block.${s.key}.heading`]}
          selected={selectedTextKey === `block.${s.key}.heading`} onSelect={onSelectText}
          onChange={(v) => setBlock({ heading: v })} />
        <Editable as="p" multiline editing={editing} className="mt-3 leading-relaxed opacity-80" value={b.body}
          styleKey={`block.${s.key}.body`} textStyle={c.textStyles?.[`block.${s.key}.body`]}
          selected={selectedTextKey === `block.${s.key}.body`} onSelect={onSelectText}
          onChange={(v) => setBlock({ body: v })} />
      </div>
    );
    if (b.mode === "text") return text;
    if (b.mode === "image") return <div className="-mx-5">{img}</div>;
    return (
      <div className="md:grid md:items-center md:gap-8 md:grid-cols-2">
        <div>{img}</div>
        <div className="mt-6 md:mt-0">{text}</div>
      </div>
    );
  };

  const renderInner = (s: SectionRef, idx: number): React.ReactNode => {
    switch (s.type) {
      case "hero": return heroSection();
      case "highlights": return highlightsSection();
      case "checklist": return checklistSection();
      case "callout": return calloutSection();
      case "steps": return stepsSection();
      case "detail": return detailSection();
      case "specs": return specsSection();
      case "reviews": return reviewsSection();
      case "pricing": return pricingSection();
      case "faq": return faqSection();
      case "block": return s.block ? blockSection(s, idx) : null;
      default: return null;
    }
  };

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {c.sections.map((s, i) => {
        if (!s.enabled) return null;
        const inner = renderInner(s, i);
        if (!inner) return null;
        const dark = isDarkHex(s.bg);
        const pad = PAD_PX[s.pad ?? "normal"];
        const sw = s.w ? WIDTH_PX[s.w] : maxW;
        return (
          <section
            key={s.key || `${s.type}-${i}`}
            style={{
              background: s.bg || undefined,
              backgroundImage: s.bgImage ? `url("${s.bgImage}")` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: dark ? "#ffffff" : undefined,
              paddingTop: pad,
              paddingBottom: pad,
            }}
          >
            <div className="mx-auto px-5" style={{ maxWidth: sw }}>
              {inner}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export type { SectionType };
