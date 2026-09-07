"use client";

import type { StoreContent, SectionType } from "@/lib/schema";
import { WIDTH_PX } from "@/lib/schema";
import Editable from "@/components/Editable";

type Props = {
  content: StoreContent;
  onChange?: (next: StoreContent) => void;
  editing: boolean;
};

export default function StoreProduct({ content, onChange, editing }: Props) {
  const c = content;
  const set = (patch: Partial<StoreContent>) => onChange?.({ ...c, ...patch });
  const style = c.style || "classic";

  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 960)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];
  const wrap = "mx-auto w-full px-5";
  const wrapStyle = { maxWidth: maxW };

  const headingFont = style === "editorial" ? "font-serif" : "";
  const h1Size =
    style === "spotlight"
      ? "text-4xl md:text-6xl"
      : style === "editorial"
        ? "text-4xl md:text-5xl"
        : "text-3xl md:text-4xl";

  const ctaBtn = (big = false) => (
    <a
      href={c.cta.href || "#"}
      className={
        "inline-block rounded-lg font-semibold text-white " +
        (big ? "px-10 py-4 text-lg" : "px-6 py-3")
      }
      style={{ background: c.theme.primary }}
    >
      <Editable as="span" editing={editing} value={c.cta.text}
        onChange={(v) => set({ cta: { ...c.cta, text: v } })} />
    </a>
  );

  const badge = c.hero.badge ? (
    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: c.hero.badgeBg, color: c.hero.badgeText }}>
      <Editable as="span" editing={editing} value={c.hero.badge}
        onChange={(v) => set({ hero: { ...c.hero, badge: v } })} />
    </span>
  ) : null;

  const heroTitle = (
    <Editable as="h1" multiline editing={editing}
      className={`mt-4 font-extrabold leading-tight ${h1Size} ${headingFont}`}
      value={c.hero.title}
      onChange={(v) => set({ hero: { ...c.hero, title: v } })} />
  );
  const heroSub = (
    <Editable as="p" multiline editing={editing} className="mt-4 text-base opacity-80"
      value={c.hero.subtitle}
      onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })} />
  );

  // ── HERO ── 스타일별로 완전히 다르게
  const hero =
    style === "spotlight" ? (
      <section className={wrap + " py-16 text-center"} style={wrapStyle}>
        <img src={c.hero.image} alt="" className="mx-auto mb-10 w-full rounded-3xl object-cover shadow-xl"
          style={{ aspectRatio: "16/9" }} />
        {badge}
        {heroTitle}
        <div className="mx-auto max-w-2xl">{heroSub}</div>
        <div className="mt-8">{ctaBtn(true)}</div>
      </section>
    ) : style === "editorial" ? (
      <section className={wrap + " py-14"} style={wrapStyle}>
        {badge}
        {heroTitle}
        <div className="max-w-2xl">{heroSub}</div>
        <div className="mt-6">{ctaBtn()}</div>
        <img src={c.hero.image} alt="" className="mt-10 w-full rounded-2xl object-cover shadow-lg"
          style={{ aspectRatio: "21/9" }} />
      </section>
    ) : (
      <section className={wrap + " grid items-center gap-10 py-14 md:grid-cols-2"} style={wrapStyle}>
        <div>
          {badge}
          {heroTitle}
          {heroSub}
          <div className="mt-6">{ctaBtn()}</div>
        </div>
        <img src={c.hero.image} alt="" className="w-full rounded-2xl object-cover shadow-lg"
          style={{ aspectRatio: "4/3" }} />
      </section>
    );

  // 강점 아이콘 (이미지 우선, 없으면 이모지)
  const hIcon = (h: (typeof c.highlights)[number], size: number) =>
    h.iconImage ? (
      <img src={h.iconImage} alt="" style={{ width: size, height: size }} className="rounded-lg object-cover" />
    ) : (
      <Editable as="div" editing={editing} className="text-3xl" value={h.icon}
        onChange={(v) => {
          const highlights = [...c.highlights];
          highlights[c.highlights.indexOf(h)] = { ...h, icon: v };
          set({ highlights });
        }} />
    );

  const hTitle = (h: (typeof c.highlights)[number]) => (
    <Editable as="h3" editing={editing} className={"mt-3 font-bold " + headingFont} value={h.title}
      onChange={(v) => {
        const highlights = [...c.highlights];
        highlights[c.highlights.indexOf(h)] = { ...h, title: v };
        set({ highlights });
      }} />
  );
  const hDesc = (h: (typeof c.highlights)[number]) => (
    <Editable as="p" multiline editing={editing} className="mt-2 text-sm opacity-75" value={h.desc}
      onChange={(v) => {
        const highlights = [...c.highlights];
        highlights[c.highlights.indexOf(h)] = { ...h, desc: v };
        set({ highlights });
      }} />
  );

  const highlights =
    style === "spotlight" ? (
      <section className={wrap + " py-12"} style={wrapStyle}>
        <div className="grid gap-8 text-center md:grid-cols-3">
          {c.highlights.map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="grid h-14 w-14 place-items-center rounded-full"
                style={{ background: c.theme.primary + "14" }}>{hIcon(h, 32)}</div>
              {hTitle(h)}
              {hDesc(h)}
            </div>
          ))}
        </div>
      </section>
    ) : style === "editorial" ? (
      <section className={wrap + " py-12"} style={wrapStyle}>
        <div className="divide-y divide-black/10">
          {c.highlights.map((h, i) => (
            <div key={i} className="flex gap-5 py-6">
              <div className="text-lg font-bold opacity-30">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                {hTitle(h)}
                {hDesc(h)}
              </div>
              <div>{hIcon(h, 40)}</div>
            </div>
          ))}
        </div>
      </section>
    ) : (
      <section className={wrap + " py-10"} style={wrapStyle}>
        <div className="grid gap-6 md:grid-cols-3">
          {c.highlights.map((h, i) => (
            <div key={i} className="rounded-2xl border border-black/5 p-6 shadow-sm">
              {hIcon(h, 40)}
              {hTitle(h)}
              {hDesc(h)}
            </div>
          ))}
        </div>
      </section>
    );

  const detail =
    style === "spotlight" || style === "editorial" ? (
      <section className={wrap + " py-14"} style={wrapStyle}>
        <Editable as="h2" editing={editing}
          className={`text-center text-2xl font-extrabold ${headingFont}`}
          value={c.detail.heading}
          onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
        <img src={c.detail.image} alt="" className="my-8 w-full rounded-2xl object-cover shadow-lg"
          style={{ aspectRatio: "16/9" }} />
        <div className="mx-auto max-w-2xl">
          <Editable as="p" multiline editing={editing} className="opacity-80"
            value={c.detail.body}
            onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
        </div>
      </section>
    ) : (
      <section className={wrap + " grid items-center gap-10 py-14 md:grid-cols-2"} style={wrapStyle}>
        <img src={c.detail.image} alt="" className="w-full rounded-2xl object-cover shadow-lg"
          style={{ aspectRatio: "4/3" }} />
        <div>
          <Editable as="h2" editing={editing} className={"text-2xl font-extrabold " + headingFont}
            value={c.detail.heading}
            onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
          <Editable as="p" multiline editing={editing} className="mt-4 opacity-80"
            value={c.detail.body}
            onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
        </div>
      </section>
    );

  const specs = (
    <section className={wrap + " py-10"} style={wrapStyle}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-black/5">
        {c.specs.map((s, i) => (
          <div key={i} className="flex justify-between border-b border-black/5 px-5 py-3 text-sm last:border-0">
            <Editable as="span" editing={editing} className="font-semibold" value={s.label}
              onChange={(v) => {
                const specs = [...c.specs];
                specs[i] = { ...s, label: v };
                set({ specs });
              }} />
            <Editable as="span" editing={editing} className="opacity-75" value={s.value}
              onChange={(v) => {
                const specs = [...c.specs];
                specs[i] = { ...s, value: v };
                set({ specs });
              }} />
          </div>
        ))}
      </div>
    </section>
  );

  const reviews = (
    <section className={wrap + " py-10"} style={wrapStyle}>
      <h2 className={`mb-6 text-center text-2xl font-extrabold ${headingFont}`}>고객 후기</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {c.reviews.map((r, i) => (
          <div key={i} className="rounded-2xl border border-black/5 p-6 shadow-sm">
            <div className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <Editable as="p" multiline editing={editing} className="mt-2 text-sm" value={r.text}
              onChange={(v) => {
                const reviews = [...c.reviews];
                reviews[i] = { ...r, text: v };
                set({ reviews });
              }} />
            <Editable as="div" editing={editing} className="mt-3 text-xs font-semibold opacity-60" value={r.name}
              onChange={(v) => {
                const reviews = [...c.reviews];
                reviews[i] = { ...r, name: v };
                set({ reviews });
              }} />
          </div>
        ))}
      </div>
    </section>
  );

  const pricing = (
    <section id="pricing" className={wrap + " py-14 text-center"} style={wrapStyle}>
      <div className="mx-auto max-w-xl rounded-3xl border border-black/5 p-10 shadow-sm">
        <div className="flex items-end justify-center gap-3">
          <Editable as="span" editing={editing} className="text-4xl font-extrabold" value={c.pricing.price}
            onChange={(v) => set({ pricing: { ...c.pricing, price: v } })} />
          <Editable as="span" editing={editing} className="text-lg line-through opacity-40" value={c.pricing.compareAt}
            onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })} />
        </div>
        <Editable as="p" editing={editing} className="mt-2 text-sm opacity-70" value={c.pricing.note}
          onChange={(v) => set({ pricing: { ...c.pricing, note: v } })} />
        <div className="mt-6">{ctaBtn(true)}</div>
      </div>
    </section>
  );

  const faq = (
    <section className={wrap + " py-10"} style={wrapStyle}>
      <h2 className={`mb-6 text-2xl font-extrabold ${headingFont}`}>자주 묻는 질문</h2>
      <div className="mx-auto max-w-2xl space-y-4">
        {c.faq.map((f, i) => (
          <div key={i} className="rounded-xl border border-black/5 p-5">
            <Editable as="div" editing={editing} className="font-semibold" value={f.q}
              onChange={(v) => {
                const faq = [...c.faq];
                faq[i] = { ...f, q: v };
                set({ faq });
              }} />
            <Editable as="p" multiline editing={editing} className="mt-2 text-sm opacity-75" value={f.a}
              onChange={(v) => {
                const faq = [...c.faq];
                faq[i] = { ...f, a: v };
                set({ faq });
              }} />
          </div>
        ))}
      </div>
    </section>
  );

  const map: Record<SectionType, React.ReactNode> = {
    hero, highlights, detail, specs, reviews, pricing, faq,
  };

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {c.sections.filter((s) => s.enabled).map((s) => (
        <div key={s.type}>{map[s.type]}</div>
      ))}
    </div>
  );
}
