"use client";

import type { StoreContent, SectionRef } from "@/lib/schema";
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
  const serif = style === "editorial" ? "font-serif" : "";

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

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  const ctaBtn = (big: boolean, hidden: boolean, cls: string) =>
    hidden ? null : (
      <div className={cls}>
        <a
          href={c.cta.href || "#"}
          className={
            "inline-block rounded-full font-bold text-white shadow-md " +
            (big ? "px-12 py-4 text-lg" : "px-9 py-3.5")
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
      className="inline-block rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide"
      style={{ background: c.hero.badgeBg, color: c.hero.badgeText }}
    >
      <Editable as="span" editing={editing} value={c.hero.badge} {...tp("hero.badge")}
        onChange={(v) => set({ hero: { ...c.hero, badge: v } })} />
    </span>
  ) : null;

  // 통이미지 / 리사이즈 이미지
  const bigImg = (
    src: string,
    key: "hero" | "detail",
    natural: boolean,
    fallbackAspect: string,
  ) => {
    const cur = key === "hero" ? c.hero : c.detail;
    if (natural) {
      // 통이미지: 자르지 않고 원본 비율 그대로
      return (
        <div
          className="relative mx-auto"
          style={{ width: `${Math.max(20, Math.min(100, cur.imageW ?? 100))}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="block w-full" draggable={false} />
          {editing && canResize && (
            <span
              onPointerDown={(e) => startWidthDrag(e, key)}
              title="드래그해서 이미지 폭 조절"
              className="absolute -bottom-2 -right-2 z-10 h-6 w-6 cursor-ew-resize touch-none rounded-full border-2 border-white bg-gray-900 shadow-md"
            />
          )}
        </div>
      );
    }
    return (
      <ResizableImage
        src={src}
        editing={editing}
        widthPct={cur.imageW ?? 100}
        aspect={cur.imageAspect ? String(cur.imageAspect) : fallbackAspect}
        imgClassName="w-full rounded-3xl object-cover shadow-xl"
        onResize={
          canResize
            ? (p, a) =>
                set({
                  [key]: { ...cur, imageW: p, ...(a != null ? { imageAspect: a } : {}) },
                } as Partial<StoreContent>)
            : undefined
        }
      />
    );
  };

  // 통이미지 폭 조절용 드래그 (자르지 않는 이미지)
  const startWidthDrag = (e: React.PointerEvent, key: "hero" | "detail") => {
    e.preventDefault();
    e.stopPropagation();
    const box = (e.currentTarget as HTMLElement).parentElement?.parentElement;
    if (!box || !onChange) return;
    const rect = box.getBoundingClientRect();
    const cur = key === "hero" ? c.hero : c.detail;
    const move = (ev: PointerEvent) => {
      const xPct = ((ev.clientX - rect.left) / rect.width) * 100;
      const next = Math.max(20, Math.min(100, Math.round(2 * xPct - 100)));
      set({ [key]: { ...cur, imageW: next } } as Partial<StoreContent>);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const heroTextBlock = (onDark: boolean) => (
    <div className="text-center">
      {badge}
      <Editable as="h1" multiline editing={editing} {...tp("hero.title")}
        className={`mt-5 text-[28px] font-extrabold leading-[1.3] md:text-[40px] ${serif}`}
        value={c.hero.title}
        onChange={(v) => set({ hero: { ...c.hero, title: v } })} />
      <Editable as="p" multiline editing={editing} {...tp("hero.subtitle")}
        className={"mx-auto mt-4 max-w-xl text-[15px] leading-relaxed md:text-base " + (onDark ? "opacity-85" : "opacity-65")}
        value={c.hero.subtitle}
        onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })} />
      {ctaBtn(false, heroCtaHidden, "mt-7 flex justify-center")}
    </div>
  );

  const heroSection = (onDark: boolean) => {
    if (c.hero.mode === "text") return heroTextBlock(onDark);
    if (c.hero.mode === "image")
      return <div className="-mx-5">{bigImg(c.hero.image, "hero", true, "1/1")}</div>;
    return (
      <div>
        {heroTextBlock(onDark)}
        <div className="mt-10">{bigImg(c.hero.image, "hero", false, "4/3")}</div>
      </div>
    );
  };

  const sectionHeading = (text: string, key: string, onChange2: (v: string) => void) => (
    <Editable as="h2" editing={editing} {...tp(key)}
      className={`text-center text-[22px] font-extrabold md:text-[26px] ${serif}`}
      value={text}
      onChange={onChange2} />
  );

  const highlightsSection = () => (
    <div className="space-y-3.5">
      {c.highlights.map((h, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-2xl border border-current/10 bg-current/[0.03] p-5"
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl text-[15px] font-black text-white"
            style={{ background: primary }}
          >
            {h.iconImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={h.iconImage} alt="" className="h-full w-full object-cover" />
            ) : (
              String(i + 1).padStart(2, "0")
            )}
          </span>
          <div className="min-w-0 flex-1">
            <Editable as="h3" editing={editing} className={`font-bold ${serif}`} value={h.title} {...tp("highlights.title")}
              onChange={(v) => {
                const highlights = [...c.highlights];
                highlights[i] = { ...h, title: v };
                set({ highlights });
              }} />
            <Editable as="p" multiline editing={editing} className="mt-1.5 text-sm leading-relaxed opacity-65" value={h.desc} {...tp("highlights.desc")}
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
      {sectionHeading(c.checklist.heading, "checklist.heading", (v) =>
        set({ checklist: { ...c.checklist, heading: v } }),
      )}
      <ul className="mx-auto mt-7 max-w-lg space-y-2.5">
        {c.checklist.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border border-current/10 bg-current/[0.06] px-4 py-3.5">
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
      <Editable as="p" multiline editing={editing} className={`text-[24px] font-extrabold leading-snug md:text-[30px] ${serif}`}
        value={c.callout.text} {...tp("callout.text")}
        onChange={(v) => set({ callout: { ...c.callout, text: v } })} />
      {(c.callout.sub || editing) && (
        <Editable as="p" editing={editing} className="mx-auto mt-3 max-w-md text-sm opacity-65"
          value={c.callout.sub} {...tp("callout.sub")}
          onChange={(v) => set({ callout: { ...c.callout, sub: v } })} />
      )}
    </div>
  );

  const stepsSection = () => (
    <div>
      {sectionHeading(c.steps.heading, "steps.heading", (v) =>
        set({ steps: { ...c.steps, heading: v } }),
      )}
      <div className="mt-7 space-y-3.5">
        {c.steps.items.map((st, i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-current/10 bg-current/[0.03] p-5">
            <span className="text-lg font-black tabular-nums opacity-25">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <Editable as="div" editing={editing} className="font-extrabold" style={{ color: primary }} value={st.title} {...tp("steps.title")}
                onChange={(v) => {
                  const items = [...c.steps.items];
                  items[i] = { ...st, title: v };
                  set({ steps: { ...c.steps, items } });
                }} />
              <Editable as="p" multiline editing={editing} className="mt-1 text-sm leading-relaxed opacity-65" value={st.desc} {...tp("steps.desc")}
                onChange={(v) => {
                  const items = [...c.steps.items];
                  items[i] = { ...st, desc: v };
                  set({ steps: { ...c.steps, items } });
                }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const detailSection = () => {
    const heading = (
      <Editable as="h2" editing={editing} className={`text-center text-[22px] font-extrabold md:text-[26px] ${serif}`} {...tp("detail.heading")}
        value={c.detail.heading}
        onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
    );
    const bodyEl = (
      <Editable as="p" multiline editing={editing} className="mt-4 text-center leading-relaxed opacity-75" {...tp("detail.body")}
        value={c.detail.body}
        onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
    );
    if (c.detail.mode === "text")
      return <div>{heading}{bodyEl}</div>;
    if (c.detail.mode === "image")
      return <div className="-mx-5">{bigImg(c.detail.image, "detail", true, "1/1")}</div>;
    return (
      <div>
        {heading}
        {bodyEl}
        <div className="mt-8">{bigImg(c.detail.image, "detail", false, "4/3")}</div>
      </div>
    );
  };

  const specsSection = () => (
    <div className="overflow-hidden rounded-2xl border border-current/10">
      {c.specs.map((s, i) => (
        <div
          key={i}
          className={
            "flex justify-between px-5 py-3.5 text-sm " +
            (i < c.specs.length - 1 ? "border-b border-current/10" : "")
          }
        >
          <Editable as="span" editing={editing} className="font-bold" value={s.label} {...tp("specs.label")}
            onChange={(v) => {
              const specs = [...c.specs];
              specs[i] = { ...s, label: v };
              set({ specs });
            }} />
          <Editable as="span" editing={editing} className="opacity-65" value={s.value} {...tp("specs.value")}
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
      <h2 className={`text-center text-[22px] font-extrabold md:text-[26px] ${serif}`}>고객 후기</h2>
      <div className="mt-7 space-y-3.5">
        {c.reviews.map((r, i) => (
          <div key={i} className="rounded-2xl border border-current/10 bg-current/[0.03] p-5">
            <div className="text-sm tracking-widest text-amber-400">★★★★★</div>
            <Editable as="p" multiline editing={editing} className="mt-2 text-sm leading-relaxed" value={r.text} {...tp("reviews.text")}
              onChange={(v) => {
                const reviews = [...c.reviews];
                reviews[i] = { ...r, text: v };
                set({ reviews });
              }} />
            <Editable as="div" editing={editing} className="mt-3 text-xs font-bold opacity-50" value={r.name} {...tp("reviews.name")}
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
    <div className="mx-auto max-w-sm rounded-[28px] border border-current/10 bg-current/[0.05] p-9 text-center">
      <div className="flex items-end justify-center gap-2.5">
        <Editable as="span" editing={editing} className="text-[40px] font-extrabold leading-none" value={c.pricing.price} {...tp("pricing.price")}
          onChange={(v) => set({ pricing: { ...c.pricing, price: v } })} />
        <Editable as="span" editing={editing} className="pb-1.5 text-base line-through opacity-40" value={c.pricing.compareAt} {...tp("pricing.compareAt")}
          onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })} />
      </div>
      <Editable as="p" editing={editing} className="mt-3 text-sm opacity-65" value={c.pricing.note} {...tp("pricing.note")}
        onChange={(v) => set({ pricing: { ...c.pricing, note: v } })} />
      {ctaBtn(true, pricingCtaHidden, "mt-7 flex justify-center")}
    </div>
  );

  const faqSection = () => (
    <div>
      <h2 className={`text-center text-[22px] font-extrabold md:text-[26px] ${serif}`}>자주 묻는 질문</h2>
      <div className="mx-auto mt-7 max-w-xl space-y-3">
        {c.faq.map((f, i) => (
          <div key={i} className="rounded-2xl border border-current/10 p-5">
            <Editable as="div" editing={editing} className="font-bold" value={f.q} {...tp("faq.q")}
              onChange={(v) => {
                const faq = [...c.faq];
                faq[i] = { ...f, q: v };
                set({ faq });
              }} />
            <Editable as="p" multiline editing={editing} className="mt-2 text-sm leading-relaxed opacity-65" value={f.a} {...tp("faq.a")}
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
    const w = Math.max(20, Math.min(100, b.imageW ?? 100));
    const img =
      b.mode === "image" ? (
        <div className="relative mx-auto" style={{ width: `${w}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.image} alt="" className="block w-full" draggable={false} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={b.image}
          alt=""
          className="w-full rounded-3xl object-cover shadow-xl"
          style={{ aspectRatio: b.imageAspect ? String(b.imageAspect) : "4/3" }}
        />
      );
    const text = (
      <div className={b.align === "center" ? "text-center" : ""}>
        <Editable as="h2" editing={editing} className={`text-[22px] font-extrabold md:text-[26px] ${serif}`} value={b.heading}
          styleKey={`block.${s.key}.heading`} textStyle={c.textStyles?.[`block.${s.key}.heading`]}
          selected={selectedTextKey === `block.${s.key}.heading`} onSelect={onSelectText}
          onChange={(v) => setBlock({ heading: v })} />
        <Editable as="p" multiline editing={editing} className="mt-3 leading-relaxed opacity-75" value={b.body}
          styleKey={`block.${s.key}.body`} textStyle={c.textStyles?.[`block.${s.key}.body`]}
          selected={selectedTextKey === `block.${s.key}.body`} onSelect={onSelectText}
          onChange={(v) => setBlock({ body: v })} />
      </div>
    );
    if (b.mode === "text") return text;
    if (b.mode === "image") return <div className="-mx-5">{img}</div>;
    return (
      <div>
        {img}
        <div className="mt-6">{text}</div>
      </div>
    );
  };

  const renderInner = (s: SectionRef, idx: number, onDark: boolean): React.ReactNode => {
    switch (s.type) {
      case "hero": return heroSection(onDark);
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
        const hasBgImg = !!s.bgImage;
        const contain = s.bgFit === "contain";
        const onDark = isDarkHex(s.bg) || (hasBgImg && !contain);
        const inner = renderInner(s, i, onDark);
        if (!inner) return null;
        const pad = PAD_PX[s.pad ?? "normal"];
        const sw = s.w ? WIDTH_PX[s.w] : maxW;
        return (
          <section
            key={s.key || `${s.type}-${i}`}
            className="relative"
            style={{
              background: s.bg || undefined,
              color: onDark ? "#ffffff" : undefined,
              paddingTop: pad,
              paddingBottom: pad,
            }}
          >
            {hasBgImg && (
              <>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `url("${s.bgImage}")`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: contain ? "contain" : "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: s.bgFixed ? "fixed" : undefined,
                  }}
                />
                {!contain && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: s.bg || "rgba(0,0,0,.4)" }}
                  />
                )}
              </>
            )}
            <div className="relative mx-auto px-5" style={{ maxWidth: sw }}>
              {inner}
            </div>
          </section>
        );
      })}
    </div>
  );
}
