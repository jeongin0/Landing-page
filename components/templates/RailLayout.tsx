"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionRef } from "@/lib/schema";
import { SECTION_LABELS } from "@/lib/schema";
import Editable from "@/components/Editable";
import {
  type Ctx,
  tpOf,
  pad2,
  sectionPad,
  EditFrame,
  PadHandles,
  SplitDivider,
  SectionImage,
  FlexImage,
  CtaLink,
} from "./parts";

// ════════════════════════════════════════════════════════════
// RAIL — 좌측 고정 인덱스 레일 + 우측 본문 2단. 세리프 대형 제목이
// 좌측 여백(거터)으로 걸침, 큰 여백, 밴드/카드 없음, 무채색.
// ════════════════════════════════════════════════════════════

const SERIF: React.CSSProperties = {
  fontFamily: "'Nanum Myeongjo', ui-serif, Georgia, 'Times New Roman', serif",
};
const COL = 760;

export default function RailLayout({ ctx }: { ctx: Ctx }) {
  const { c, set, editing, primary } = ctx;
  const tp = tpOf(ctx);
  const enabled = c.sections.filter((s) => s.enabled);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => {
          if (e.isIntersecting) {
            const idx = els.indexOf(e.target as HTMLElement);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled.length]);

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  const label = (s: SectionRef) =>
    s.type === "block" ? s.block?.heading || "블록" : SECTION_LABELS[s.type];

  const H2 = (text: string, key: string, onChange: (v: string) => void, extra = "") => (
    <Editable
      as="h2"
      editing={editing}
      {...tp(key)}
      style={SERIF}
      className={"text-[26px] font-medium leading-[1.15] md:text-[36px] " + extra}
      value={text}
      onChange={onChange}
    />
  );

  const splitRow = (
    s: SectionRef,
    i: number,
    imgKey: "hero" | "detail",
    text: React.ReactNode,
  ) => {
    const pct = s.splitPct ?? 50;
    return (
      <div className="relative mt-10 grid gap-8 md:mt-14 md:gap-0" style={undefined}>
        <div className="md:grid md:items-center" style={{ gridTemplateColumns: `${pct}% ${100 - pct}%` }}>
          <div className="md:pr-10">
            <SectionImage
              ctx={ctx}
              k={imgKey}
              natural={false}
              imgClassName="w-full object-cover"
              fallbackAspect="4/5"
            />
          </div>
          <div className="mt-6 md:mt-0 md:pl-10">{text}</div>
        </div>
        <SplitDivider ctx={ctx} idx={i} s={s} />
      </div>
    );
  };

  const renderSection = (s: SectionRef, i: number): React.ReactNode => {
    switch (s.type) {
      case "hero": {
        const eyebrow = c.hero.badge && (
          <Editable
            as="div"
            editing={editing}
            value={c.hero.badge}
            {...tp("hero.badge")}
            className="mb-8 text-[11px] font-semibold uppercase tracking-[0.34em] opacity-45"
            onChange={(v) => set({ hero: { ...c.hero, badge: v } })}
          />
        );
        const title = (
          <Editable
            as="h1"
            multiline
            editing={editing}
            {...tp("hero.title")}
            style={SERIF}
            className="text-[44px] font-medium leading-[1.02] tracking-[-0.01em] md:-ml-1 md:text-[80px]"
            value={c.hero.title}
            onChange={(v) => set({ hero: { ...c.hero, title: v } })}
          />
        );
        const sub = (
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("hero.subtitle")}
            className="mt-8 max-w-sm text-[14px] leading-[1.9] opacity-60"
            value={c.hero.subtitle}
            onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
          />
        );
        const cta = !heroCtaHidden && (
          <div className="mt-8">
            <CtaLink
              ctx={ctx}
              className="inline-block border-b border-current pb-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
            />
          </div>
        );
        if (c.hero.mode === "text")
          return (
            <div>
              {eyebrow}
              {title}
              {sub}
              {cta}
            </div>
          );
        if (c.hero.mode === "image")
          return (
            <div>
              {eyebrow}
              {title}
              {sub}
              {cta}
              <div className="mt-14">
                <SectionImage ctx={ctx} k="hero" natural imgClassName="w-full object-cover" fallbackAspect="16/10" />
              </div>
            </div>
          );
        return (
          <div>
            {eyebrow}
            {title}
            {splitRow(s, i, "hero", <>{sub}{cta}</>)}
          </div>
        );
      }

      case "highlights":
        return (
          <div>
            {c.highlights.map((h, hi) => (
              <div
                key={hi}
                className="grid grid-cols-[48px_1fr] gap-6 border-t border-black/12 py-9 first:border-t-0 md:-ml-16 md:grid-cols-[64px_1fr] md:py-12"
              >
                <div className="text-2xl opacity-25 md:text-4xl" style={SERIF}>
                  {pad2(hi + 1)}
                </div>
                <div>
                  <Editable
                    as="h3"
                    editing={editing}
                    {...tp("highlights.title")}
                    style={SERIF}
                    className="text-[19px] font-medium md:text-[24px]"
                    value={h.title}
                    onChange={(v) => {
                      const highlights = [...c.highlights];
                      highlights[hi] = { ...h, title: v };
                      set({ highlights });
                    }}
                  />
                  <Editable
                    as="p"
                    multiline
                    editing={editing}
                    {...tp("highlights.desc")}
                    className="mt-3 max-w-md text-[13px] leading-[1.8] opacity-55"
                    value={h.desc}
                    onChange={(v) => {
                      const highlights = [...c.highlights];
                      highlights[hi] = { ...h, desc: v };
                      set({ highlights });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "checklist":
        return (
          <div>
            {H2(c.checklist.heading, "checklist.heading", (v) =>
              set({ checklist: { ...c.checklist, heading: v } }),
            )}
            <ul className="mt-10 max-w-lg">
              {c.checklist.items.map((it, ii) => (
                <li
                  key={ii}
                  className="flex gap-4 border-t border-black/12 py-4 text-[14px] leading-[1.8] opacity-80 first:border-t-0"
                >
                  <span className="opacity-35">—</span>
                  <Editable
                    as="span"
                    editing={editing}
                    {...tp("checklist.item")}
                    className="flex-1"
                    value={it.text}
                    onChange={(v) => {
                      const items = [...c.checklist.items];
                      items[ii] = { text: v };
                      set({ checklist: { ...c.checklist, items } });
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        );

      case "callout":
        return (
          <div>
            <div className="h-px w-12 bg-current opacity-30" />
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("callout.text")}
              style={SERIF}
              className="mt-8 max-w-2xl text-[26px] font-medium italic leading-[1.35] md:text-[40px]"
              value={c.callout.text}
              onChange={(v) => set({ callout: { ...c.callout, text: v } })}
            />
            {(c.callout.sub || editing) && (
              <Editable
                as="p"
                editing={editing}
                {...tp("callout.sub")}
                className="mt-7 text-[11px] font-semibold uppercase tracking-[0.26em] opacity-45"
                value={c.callout.sub}
                onChange={(v) => set({ callout: { ...c.callout, sub: v } })}
              />
            )}
          </div>
        );

      case "steps":
        return (
          <div>
            {H2(c.steps.heading, "steps.heading", (v) =>
              set({ steps: { ...c.steps, heading: v } }),
            )}
            <div className="mt-10">
              {c.steps.items.map((st, si) => (
                <div
                  key={si}
                  className="grid grid-cols-[48px_1fr] gap-6 border-t border-black/12 py-7 first:border-t-0 md:-ml-16 md:grid-cols-[64px_1fr]"
                >
                  <div className="text-2xl opacity-25 md:text-4xl" style={SERIF}>
                    {pad2(si + 1)}
                  </div>
                  <div>
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("steps.title")}
                      style={SERIF}
                      className="text-[17px] font-medium md:text-[20px]"
                      value={st.title}
                      onChange={(v) => {
                        const items = [...c.steps.items];
                        items[si] = { ...st, title: v };
                        set({ steps: { ...c.steps, items } });
                      }}
                    />
                    <Editable
                      as="p"
                      multiline
                      editing={editing}
                      {...tp("steps.desc")}
                      className="mt-2 max-w-md text-[13px] leading-[1.8] opacity-55"
                      value={st.desc}
                      onChange={(v) => {
                        const items = [...c.steps.items];
                        items[si] = { ...st, desc: v };
                        set({ steps: { ...c.steps, items } });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "detail": {
        const text = (
          <>
            {H2(c.detail.heading, "detail.heading", (v) =>
              set({ detail: { ...c.detail, heading: v } }),
            )}
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("detail.body")}
              className="mt-5 text-[14px] leading-[1.9] opacity-65"
              value={c.detail.body}
              onChange={(v) => set({ detail: { ...c.detail, body: v } })}
            />
          </>
        );
        if (c.detail.mode === "text") return <div className="max-w-xl">{text}</div>;
        if (c.detail.mode === "image")
          return (
            <SectionImage ctx={ctx} k="detail" natural imgClassName="w-full object-cover" fallbackAspect="3/2" />
          );
        return splitRow(s, i, "detail", text);
      }

      case "specs":
        return (
          <div className="max-w-xl">
            {c.specs.map((sp, si) => (
              <div
                key={si}
                className="flex items-baseline justify-between gap-8 border-t border-black/12 py-4 first:border-t-0"
              >
                <Editable
                  as="span"
                  editing={editing}
                  {...tp("specs.label")}
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-45"
                  value={sp.label}
                  onChange={(v) => {
                    const specs = [...c.specs];
                    specs[si] = { ...sp, label: v };
                    set({ specs });
                  }}
                />
                <Editable
                  as="span"
                  editing={editing}
                  {...tp("specs.value")}
                  style={SERIF}
                  className="text-right text-[16px]"
                  value={sp.value}
                  onChange={(v) => {
                    const specs = [...c.specs];
                    specs[si] = { ...sp, value: v };
                    set({ specs });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case "reviews":
        return (
          <div>
            {c.reviews.map((r, ri) => (
              <figure
                key={ri}
                className="border-t border-black/12 py-12 first:border-t-0 first:pt-0"
              >
                <div className="text-4xl leading-none opacity-15" style={SERIF}>
                  &ldquo;
                </div>
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("reviews.text")}
                  style={SERIF}
                  className="mt-2 max-w-2xl text-[21px] font-medium leading-[1.5] md:text-[26px]"
                  value={r.text}
                  onChange={(v) => {
                    const reviews = [...c.reviews];
                    reviews[ri] = { ...r, text: v };
                    set({ reviews });
                  }}
                />
                <Editable
                  as="div"
                  editing={editing}
                  {...tp("reviews.name")}
                  className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] opacity-45"
                  value={r.name}
                  onChange={(v) => {
                    const reviews = [...c.reviews];
                    reviews[ri] = { ...r, name: v };
                    set({ reviews });
                  }}
                />
              </figure>
            ))}
          </div>
        );

      case "pricing":
        return (
          <div className="max-w-md">
            <div className="flex items-baseline gap-4">
              <Editable
                as="span"
                editing={editing}
                {...tp("pricing.price")}
                style={SERIF}
                className="text-[44px] font-medium leading-none"
                value={c.pricing.price}
                onChange={(v) => set({ pricing: { ...c.pricing, price: v } })}
              />
              <Editable
                as="span"
                editing={editing}
                {...tp("pricing.compareAt")}
                className="text-[14px] line-through opacity-35"
                value={c.pricing.compareAt}
                onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })}
              />
            </div>
            <Editable
              as="p"
              editing={editing}
              {...tp("pricing.note")}
              className="mt-4 text-[12px] uppercase tracking-[0.18em] opacity-50"
              value={c.pricing.note}
              onChange={(v) => set({ pricing: { ...c.pricing, note: v } })}
            />
            {!pricingCtaHidden && (
              <div className="mt-8">
                <CtaLink
                  ctx={ctx}
                  className="inline-block border border-current px-12 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]"
                />
              </div>
            )}
          </div>
        );

      case "faq":
        return (
          <div className="max-w-2xl">
            <h2 className="text-[26px] font-medium md:text-[36px]" style={SERIF}>
              자주 묻는 질문
            </h2>
            <div className="mt-10">
              {c.faq.map((f, fi) => (
                <div key={fi} className="border-t border-black/12 py-5 first:border-t-0">
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("faq.q")}
                    style={SERIF}
                    className="text-[16px] font-medium"
                    value={f.q}
                    onChange={(v) => {
                      const faq = [...c.faq];
                      faq[fi] = { ...f, q: v };
                      set({ faq });
                    }}
                  />
                  <Editable
                    as="p"
                    multiline
                    editing={editing}
                    {...tp("faq.a")}
                    className="mt-2 text-[13px] leading-[1.8] opacity-55"
                    value={f.a}
                    onChange={(v) => {
                      const faq = [...c.faq];
                      faq[fi] = { ...f, a: v };
                      set({ faq });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "block": {
        if (!s.block) return null;
        const b = s.block;
        const setBlock = (patch: Partial<typeof b>) =>
          ctx.setSection(i, { block: { ...b, ...patch } });
        const text = (
          <>
            <Editable
              as="h2"
              editing={editing}
              style={SERIF}
              className="text-[24px] font-medium md:text-[32px]"
              value={b.heading}
              styleKey={`block.${s.key}.heading`}
              textStyle={c.textStyles?.[`block.${s.key}.heading`]}
              selected={ctx.selectedTextKey === `block.${s.key}.heading`}
              onSelect={ctx.onSelectText}
              onChange={(v) => setBlock({ heading: v })}
            />
            <Editable
              as="p"
              multiline
              editing={editing}
              className="mt-5 text-[14px] leading-[1.9] opacity-65"
              value={b.body}
              styleKey={`block.${s.key}.body`}
              textStyle={c.textStyles?.[`block.${s.key}.body`]}
              selected={ctx.selectedTextKey === `block.${s.key}.body`}
              onSelect={ctx.onSelectText}
              onChange={(v) => setBlock({ body: v })}
            />
          </>
        );
        if (b.mode === "text") return <div className="max-w-xl">{text}</div>;
        if (b.mode === "image")
          return (
            <FlexImage
              src={b.image}
              widthPct={b.imageW}
              aspect={b.imageAspect}
              natural
              editing={editing}
              canResize={ctx.canResize}
              imgClassName="w-full object-cover"
              fallbackAspect="3/2"
              onResize={(p) => setBlock({ imageW: p })}
            />
          );
        return (
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center md:gap-0">
            <div className="md:pr-10">
              <FlexImage
                src={b.image}
                widthPct={b.imageW}
                aspect={b.imageAspect}
                natural={false}
                editing={editing}
                canResize={ctx.canResize}
                imgClassName="w-full object-cover"
                fallbackAspect="4/5"
                onResize={(p, a) => setBlock({ imageW: p, ...(a != null ? { imageAspect: a } : {}) })}
              />
            </div>
            <div className="md:pl-10">{text}</div>
            <SplitDivider ctx={ctx} idx={i} s={s} />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
      />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="md:grid md:grid-cols-[170px_1fr] md:gap-14 lg:gap-24">
          <aside className="hidden md:block">
            <div className="sticky top-0 py-16">
              <ol className="space-y-3">
                {enabled.map((s, idx) => (
                  <li
                    key={s.key || s.type + idx}
                    className={
                      "flex gap-2.5 text-[10px] uppercase tracking-[0.16em] transition-opacity " +
                      (active === idx ? "opacity-100" : "opacity-30")
                    }
                  >
                    <span className="tabular-nums" style={SERIF}>
                      {pad2(idx + 1)}
                    </span>
                    <span className={active === idx ? "font-bold" : ""}>{label(s)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div>
            {enabled.map((s, idx) => {
              const i = c.sections.indexOf(s);
              const inner = renderSection(s, i);
              if (!inner) return null;
              const pad = sectionPad(s);
              return (
                <section
                  key={s.key || `${s.type}-${i}`}
                  ref={(el) => {
                    refs.current[idx] = el;
                  }}
                  className="relative border-t border-black/10 first:border-t-0"
                  style={{
                    paddingTop: pad,
                    paddingBottom: pad,
                    background: s.bg || undefined,
                    color: undefined,
                  }}
                >
                  <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="!mx-0 max-w-full">
                    {inner}
                  </EditFrame>
                  <PadHandles ctx={ctx} idx={i} s={s} />
                </section>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ background: primary }} className="h-1 w-full" />
    </div>
  );
}
