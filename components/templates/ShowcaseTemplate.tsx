"use client";

import type { SectionRef } from "@/lib/schema";
import Editable from "@/components/Editable";
import {
  type Ctx,
  tpOf,
  alpha,
  SectionImage,
  FlexImage,
  CtaLink,
  Stars,
} from "./parts";

// ─────────────────────────────────────────────────────────────
// SHOWCASE — SaaS / 서비스 소개. 라운드 카드 그리드, 아이콘칩,
// 소프트 섀도우, 틴트 패널, 필 버튼.
// ─────────────────────────────────────────────────────────────

export function renderShowcase(
  s: SectionRef,
  idx: number,
  onDark: boolean,
  ctx: Ctx,
): React.ReactNode {
  const { c, set, editing, primary } = ctx;
  const tp = tpOf(ctx);
  const card = onDark
    ? "rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm"
    : "rounded-2xl border border-black/[0.07] bg-black/[0.015] shadow-sm";
  const tint = alpha(primary, onDark ? "22" : "0f");

  const heading = (
    text: string,
    key: string,
    onChange: (v: string) => void,
  ) => (
    <Editable
      as="h2"
      editing={editing}
      {...tp(key)}
      className="text-center text-[24px] font-extrabold md:text-[28px]"
      value={text}
      onChange={onChange}
    />
  );

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  const btn =
    "inline-block rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-lg";

  const heroTextCol = (centered: boolean) => (
    <div className={centered ? "text-center" : ""}>
      {c.hero.badge && (
        <span
          className="inline-block rounded-full px-3.5 py-1.5 text-xs font-bold"
          style={{ background: c.hero.badgeBg, color: c.hero.badgeText }}
        >
          <Editable
            as="span"
            editing={editing}
            value={c.hero.badge}
            {...tp("hero.badge")}
            onChange={(v) => set({ hero: { ...c.hero, badge: v } })}
          />
        </span>
      )}
      <Editable
        as="h1"
        multiline
        editing={editing}
        {...tp("hero.title")}
        className="mt-5 text-[30px] font-extrabold leading-[1.15] md:text-[44px]"
        value={c.hero.title}
        onChange={(v) => set({ hero: { ...c.hero, title: v } })}
      />
      <Editable
        as="p"
        multiline
        editing={editing}
        {...tp("hero.subtitle")}
        className={
          "mt-4 max-w-lg text-[15px] leading-relaxed " +
          (centered ? "mx-auto " : "") +
          (onDark ? "opacity-80" : "opacity-65")
        }
        value={c.hero.subtitle}
        onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
      />
      {!heroCtaHidden && (
        <div className={"mt-7 flex gap-3 " + (centered ? "justify-center" : "")}>
          <CtaLink ctx={ctx} className={btn} style={{ background: primary }} />
        </div>
      )}
    </div>
  );

  switch (s.type) {
    case "hero": {
      if (c.hero.mode === "text") return heroTextCol(true);
      if (c.hero.mode === "image")
        return (
          <div className="-mx-5">
            <SectionImage ctx={ctx} k="hero" natural imgClassName="" fallbackAspect="16/9" />
          </div>
        );
      return (
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          {heroTextCol(false)}
          <SectionImage
            ctx={ctx}
            k="hero"
            natural={false}
            imgClassName="w-full rounded-[24px] object-cover shadow-2xl"
            fallbackAspect="4/3"
          />
        </div>
      );
    }

    case "highlights":
      return (
        <div
          className={
            "grid gap-4 " +
            (c.highlights.length >= 3 ? "md:grid-cols-3" : "sm:grid-cols-2")
          }
        >
          {c.highlights.map((h, i) => (
            <div key={i} className={card + " p-6"}>
              <div
                className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl text-xl"
                style={{ background: tint }}
              >
                {h.iconImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.iconImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{h.icon || "✨"}</span>
                )}
              </div>
              <Editable
                as="h3"
                editing={editing}
                {...tp("highlights.title")}
                className="mt-4 font-bold"
                value={h.title}
                onChange={(v) => {
                  const highlights = [...c.highlights];
                  highlights[i] = { ...h, title: v };
                  set({ highlights });
                }}
              />
              <Editable
                as="p"
                multiline
                editing={editing}
                {...tp("highlights.desc")}
                className="mt-2 text-sm leading-relaxed opacity-60"
                value={h.desc}
                onChange={(v) => {
                  const highlights = [...c.highlights];
                  highlights[i] = { ...h, desc: v };
                  set({ highlights });
                }}
              />
            </div>
          ))}
        </div>
      );

    case "checklist":
      return (
        <div className="rounded-3xl p-8 md:p-10" style={{ background: tint }}>
          {heading(c.checklist.heading, "checklist.heading", (v) =>
            set({ checklist: { ...c.checklist, heading: v } }),
          )}
          <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
            {c.checklist.items.map((it, i) => (
              <div
                key={i}
                className={
                  "flex items-start gap-3 rounded-xl px-4 py-3.5 " +
                  (onDark ? "bg-white/[0.06]" : "bg-white/70")
                }
              >
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
                  style={{ background: primary }}
                >
                  ✓
                </span>
                <Editable
                  as="span"
                  editing={editing}
                  {...tp("checklist.item")}
                  className="text-sm font-medium leading-relaxed"
                  value={it.text}
                  onChange={(v) => {
                    const items = [...c.checklist.items];
                    items[i] = { text: v };
                    set({ checklist: { ...c.checklist, items } });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "callout":
      return (
        <div
          className="rounded-3xl px-8 py-12 text-center text-white md:py-16"
          style={{ background: primary }}
        >
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("callout.text")}
            className="mx-auto max-w-2xl text-[24px] font-extrabold leading-snug md:text-[32px]"
            value={c.callout.text}
            onChange={(v) => set({ callout: { ...c.callout, text: v } })}
          />
          {(c.callout.sub || editing) && (
            <Editable
              as="p"
              editing={editing}
              {...tp("callout.sub")}
              className="mx-auto mt-4 max-w-md text-sm opacity-85"
              value={c.callout.sub}
              onChange={(v) => set({ callout: { ...c.callout, sub: v } })}
            />
          )}
          {!heroCtaHidden && (
            <div className="mt-7">
              <CtaLink
                ctx={ctx}
                className="inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-bold shadow-lg"
                style={{ color: primary }}
              />
            </div>
          )}
        </div>
      );

    case "steps":
      return (
        <div>
          {heading(c.steps.heading, "steps.heading", (v) =>
            set({ steps: { ...c.steps, heading: v } }),
          )}
          <div className="mt-9 flex flex-col gap-4 md:flex-row">
            {c.steps.items.map((st, i) => (
              <div key={i} className={card + " flex-1 p-6"}>
                <div
                  className="grid h-10 w-10 place-items-center rounded-full text-sm font-black text-white"
                  style={{ background: primary }}
                >
                  {i + 1}
                </div>
                <Editable
                  as="div"
                  editing={editing}
                  {...tp("steps.title")}
                  className="mt-3 font-bold"
                  value={st.title}
                  onChange={(v) => {
                    const items = [...c.steps.items];
                    items[i] = { ...st, title: v };
                    set({ steps: { ...c.steps, items } });
                  }}
                />
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("steps.desc")}
                  className="mt-1.5 text-[13px] leading-relaxed opacity-60"
                  value={st.desc}
                  onChange={(v) => {
                    const items = [...c.steps.items];
                    items[i] = { ...st, desc: v };
                    set({ steps: { ...c.steps, items } });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "detail": {
      const head = (
        <div>
          <Editable
            as="h2"
            editing={editing}
            {...tp("detail.heading")}
            className="text-[24px] font-extrabold md:text-[28px]"
            value={c.detail.heading}
            onChange={(v) => set({ detail: { ...c.detail, heading: v } })}
          />
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("detail.body")}
            className="mt-4 text-[15px] leading-relaxed opacity-65"
            value={c.detail.body}
            onChange={(v) => set({ detail: { ...c.detail, body: v } })}
          />
        </div>
      );
      if (c.detail.mode === "text")
        return <div className="mx-auto max-w-xl text-center">{head}</div>;
      if (c.detail.mode === "image")
        return (
          <div className="-mx-5">
            <SectionImage ctx={ctx} k="detail" natural imgClassName="" fallbackAspect="16/9" />
          </div>
        );
      return (
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <SectionImage
            ctx={ctx}
            k="detail"
            natural={false}
            imgClassName="w-full rounded-[24px] object-cover shadow-xl"
            fallbackAspect="4/3"
          />
          {head}
        </div>
      );
    }

    case "specs":
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.specs.map((sp, i) => (
            <div key={i} className={card + " px-5 py-4"}>
              <Editable
                as="div"
                editing={editing}
                {...tp("specs.label")}
                className="text-[11px] font-semibold uppercase tracking-wide opacity-45"
                value={sp.label}
                onChange={(v) => {
                  const specs = [...c.specs];
                  specs[i] = { ...sp, label: v };
                  set({ specs });
                }}
              />
              <Editable
                as="div"
                editing={editing}
                {...tp("specs.value")}
                className="mt-1 font-bold"
                value={sp.value}
                onChange={(v) => {
                  const specs = [...c.specs];
                  specs[i] = { ...sp, value: v };
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
          <h2 className="text-center text-[24px] font-extrabold md:text-[28px]">고객 후기</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {c.reviews.map((r, i) => (
              <div key={i} className={card + " p-6"}>
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                    style={{ background: primary }}
                  >
                    {(r.name || "?").trim().slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("reviews.name")}
                      className="truncate text-xs font-bold"
                      value={r.name}
                      onChange={(v) => {
                        const reviews = [...c.reviews];
                        reviews[i] = { ...r, name: v };
                        set({ reviews });
                      }}
                    />
                    <Stars className="text-[10px]" />
                  </div>
                </div>
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("reviews.text")}
                  className="mt-4 text-sm leading-relaxed opacity-75"
                  value={r.text}
                  onChange={(v) => {
                    const reviews = [...c.reviews];
                    reviews[i] = { ...r, text: v };
                    set({ reviews });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "pricing":
      return (
        <div
          className={
            "mx-auto max-w-sm p-8 text-center " +
            (onDark
              ? "rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl"
              : "rounded-3xl border border-black/[0.08] bg-white shadow-2xl")
          }
        >
          <div className="flex items-end justify-center gap-2.5">
            <Editable
              as="span"
              editing={editing}
              {...tp("pricing.price")}
              className="text-[42px] font-extrabold leading-none"
              value={c.pricing.price}
              onChange={(v) => set({ pricing: { ...c.pricing, price: v } })}
            />
            <Editable
              as="span"
              editing={editing}
              {...tp("pricing.compareAt")}
              className="pb-1.5 text-base line-through opacity-40"
              value={c.pricing.compareAt}
              onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })}
            />
          </div>
          <Editable
            as="p"
            editing={editing}
            {...tp("pricing.note")}
            className="mt-3 text-sm opacity-65"
            value={c.pricing.note}
            onChange={(v) => set({ pricing: { ...c.pricing, note: v } })}
          />
          {!pricingCtaHidden && (
            <CtaLink
              ctx={ctx}
              className="mt-7 block rounded-xl px-8 py-4 text-base font-bold text-white shadow-lg"
              style={{ background: primary }}
            />
          )}
        </div>
      );

    case "faq":
      return (
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-[24px] font-extrabold md:text-[28px]">자주 묻는 질문</h2>
          <div className="mt-8 space-y-3">
            {c.faq.map((f, i) => (
              <div key={i} className={card + " p-5"}>
                <div className="flex items-start justify-between gap-3">
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("faq.q")}
                    className="font-bold"
                    value={f.q}
                    onChange={(v) => {
                      const faq = [...c.faq];
                      faq[i] = { ...f, q: v };
                      set({ faq });
                    }}
                  />
                  <span className="shrink-0 text-lg leading-none opacity-30">+</span>
                </div>
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("faq.a")}
                  className="mt-2 text-sm leading-relaxed opacity-60"
                  value={f.a}
                  onChange={(v) => {
                    const faq = [...c.faq];
                    faq[i] = { ...f, a: v };
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
      const setBlock = (patch: Partial<typeof b>) => {
        const sections = c.sections.map((x, j) =>
          j === idx ? { ...x, block: { ...b, ...patch } } : x,
        );
        set({ sections });
      };
      const text = (
        <div className={b.align === "center" ? "text-center" : ""}>
          <Editable
            as="h2"
            editing={editing}
            className="text-[22px] font-extrabold md:text-[26px]"
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
            className="mt-3 text-[15px] leading-relaxed opacity-70"
            value={b.body}
            styleKey={`block.${s.key}.body`}
            textStyle={c.textStyles?.[`block.${s.key}.body`]}
            selected={ctx.selectedTextKey === `block.${s.key}.body`}
            onSelect={ctx.onSelectText}
            onChange={(v) => setBlock({ body: v })}
          />
        </div>
      );
      const img = (
        <FlexImage
          src={b.image}
          widthPct={b.imageW}
          aspect={b.imageAspect}
          natural={b.mode === "image"}
          editing={editing}
          canResize={false}
          imgClassName="w-full rounded-[24px] object-cover shadow-xl"
          fallbackAspect="4/3"
        />
      );
      if (b.mode === "text")
        return <div className={card + " p-7 md:p-9"}>{text}</div>;
      if (b.mode === "image") return <div className="-mx-5">{img}</div>;
      return (
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          {img}
          {text}
        </div>
      );
    }

    default:
      return null;
  }
}
