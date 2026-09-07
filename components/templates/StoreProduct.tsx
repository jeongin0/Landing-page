"use client";

import type { StoreContent, SectionType } from "@/lib/schema";
import Editable from "@/components/Editable";

type Props = {
  content: StoreContent;
  onChange?: (next: StoreContent) => void;
  editing: boolean;
};

export default function StoreProduct({ content, onChange, editing }: Props) {
  const c = content;
  const set = (patch: Partial<StoreContent>) => onChange?.({ ...c, ...patch });

  const ctaBtn = (extra?: string) => (
    <a
      href={c.cta.href || "#"}
      className={
        "inline-block rounded-lg px-6 py-3 font-semibold text-white " + (extra || "")
      }
      style={{ background: c.theme.primary }}
    >
      <Editable
        as="span"
        editing={editing}
        value={c.cta.text}
        onChange={(v) => set({ cta: { ...c.cta, text: v } })}
      />
    </a>
  );

  const sections: Record<SectionType, React.ReactNode> = {
    hero: (
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-14 md:grid-cols-2">
        <div>
          {c.hero.badge && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: c.theme.primary + "1a", color: c.theme.primary }}
            >
              <Editable as="span" editing={editing} value={c.hero.badge}
                onChange={(v) => set({ hero: { ...c.hero, badge: v } })} />
            </span>
          )}
          <Editable as="h1" multiline editing={editing}
            className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl"
            value={c.hero.title}
            onChange={(v) => set({ hero: { ...c.hero, title: v } })} />
          <Editable as="p" multiline editing={editing}
            className="mt-4 text-base opacity-80"
            value={c.hero.subtitle}
            onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })} />
          <div className="mt-6">{ctaBtn()}</div>
        </div>
        <img src={c.hero.image} alt="" className="w-full rounded-2xl object-cover shadow-lg"
          style={{ aspectRatio: "4/3" }} />
      </section>
    ),

    highlights: (
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {c.highlights.map((h, i) => (
            <div key={i} className="rounded-2xl border border-black/5 p-6 shadow-sm">
              <Editable as="div" editing={editing} className="text-3xl" value={h.icon}
                onChange={(v) => {
                  const highlights = [...c.highlights];
                  highlights[i] = { ...h, icon: v };
                  set({ highlights });
                }} />
              <Editable as="h3" editing={editing} className="mt-3 font-bold" value={h.title}
                onChange={(v) => {
                  const highlights = [...c.highlights];
                  highlights[i] = { ...h, title: v };
                  set({ highlights });
                }} />
              <Editable as="p" multiline editing={editing} className="mt-2 text-sm opacity-75" value={h.desc}
                onChange={(v) => {
                  const highlights = [...c.highlights];
                  highlights[i] = { ...h, desc: v };
                  set({ highlights });
                }} />
            </div>
          ))}
        </div>
      </section>
    ),

    detail: (
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-14 md:grid-cols-2">
        <img src={c.detail.image} alt="" className="w-full rounded-2xl object-cover shadow-lg"
          style={{ aspectRatio: "4/3" }} />
        <div>
          <Editable as="h2" editing={editing} className="text-2xl font-extrabold" value={c.detail.heading}
            onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
          <Editable as="p" multiline editing={editing} className="mt-4 opacity-80" value={c.detail.body}
            onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
        </div>
      </section>
    ),

    specs: (
      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="overflow-hidden rounded-2xl border border-black/5">
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
    ),

    reviews: (
      <section className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="mb-6 text-center text-2xl font-extrabold">고객 후기</h2>
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
    ),

    pricing: (
      <section id="pricing" className="mx-auto max-w-3xl px-5 py-14 text-center">
        <div className="rounded-3xl border border-black/5 p-10 shadow-sm">
          <div className="flex items-end justify-center gap-3">
            <Editable as="span" editing={editing} className="text-4xl font-extrabold" value={c.pricing.price}
              onChange={(v) => set({ pricing: { ...c.pricing, price: v } })} />
            <Editable as="span" editing={editing} className="text-lg line-through opacity-40" value={c.pricing.compareAt}
              onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })} />
          </div>
          <Editable as="p" editing={editing} className="mt-2 text-sm opacity-70" value={c.pricing.note}
            onChange={(v) => set({ pricing: { ...c.pricing, note: v } })} />
          <div className="mt-6">{ctaBtn("px-10 py-4 text-lg")}</div>
        </div>
      </section>
    ),

    faq: (
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="mb-6 text-2xl font-extrabold">자주 묻는 질문</h2>
        <div className="space-y-4">
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
    ),
  };

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {c.sections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.type}>{sections[s.type]}</div>
        ))}
    </div>
  );
}
