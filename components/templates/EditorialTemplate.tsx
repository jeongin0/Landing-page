"use client";

import type { SectionRef } from "@/lib/schema";
import Editable from "@/components/Editable";
import { type Ctx, tpOf, SectionImage, FlexImage, CtaLink, pad2 } from "./parts";

// ─────────────────────────────────────────────────────────────
// EDITORIAL — 미니멀 럭셔리 브랜드. 세리프 대형 제목, 넓은 여백,
// 1px 헤어라인, 대문자 트래킹 라벨, 무채색.
// ─────────────────────────────────────────────────────────────

const SERIF: React.CSSProperties = {
  fontFamily: "'Nanum Myeongjo', ui-serif, Georgia, 'Times New Roman', serif",
};

export function renderEditorial(
  s: SectionRef,
  idx: number,
  onDark: boolean,
  ctx: Ctx,
): React.ReactNode {
  const { c, set, editing } = ctx;
  const tp = tpOf(ctx);
  const hair = onDark ? "border-white/20" : "border-black/12";
  // 이 Tailwind 빌드는 divide-* 를 생성하지 않음 → 자식마다 border 로 직접 구분선
  const bt = onDark ? "border-white/15" : "border-black/12";

  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-45">
      {children}
    </span>
  );

  const heading = (
    text: string,
    key: string,
    onChange: (v: string) => void,
    cls = "text-[26px] font-medium leading-tight md:text-[34px]",
  ) => (
    <Editable
      as="h2"
      editing={editing}
      {...tp(key)}
      style={SERIF}
      className={cls}
      value={text}
      onChange={onChange}
    />
  );

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  const heroText = (
    <div className="text-center">
      {c.hero.badge && (
        <div className="mb-6">
          <Editable
            as="span"
            editing={editing}
            value={c.hero.badge}
            {...tp("hero.badge")}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-45"
            onChange={(v) => set({ hero: { ...c.hero, badge: v } })}
          />
        </div>
      )}
      <Editable
        as="h1"
        multiline
        editing={editing}
        {...tp("hero.title")}
        style={SERIF}
        className="mx-auto max-w-3xl text-[38px] font-medium leading-[1.08] md:text-[62px]"
        value={c.hero.title}
        onChange={(v) => set({ hero: { ...c.hero, title: v } })}
      />
      <Editable
        as="p"
        multiline
        editing={editing}
        {...tp("hero.subtitle")}
        className="mx-auto mt-7 max-w-md text-[14px] leading-relaxed opacity-60"
        value={c.hero.subtitle}
        onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
      />
      {!heroCtaHidden && (
        <div className="mt-9">
          <CtaLink
            ctx={ctx}
            className="inline-block border border-current px-11 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em]"
          />
        </div>
      )}
    </div>
  );

  switch (s.type) {
    case "hero": {
      if (c.hero.mode === "text") return heroText;
      if (c.hero.mode === "image")
        return (
          <div className="-mx-5">
            <SectionImage ctx={ctx} k="hero" natural imgClassName="" fallbackAspect="16/10" />
          </div>
        );
      return (
        <div>
          {heroText}
          <div className={"mt-14 border-t pt-14 " + hair}>
            <SectionImage
              ctx={ctx}
              k="hero"
              natural={false}
              imgClassName="w-full object-cover"
              fallbackAspect="16/10"
            />
          </div>
        </div>
      );
    }

    case "highlights":
      return (
        <div className="flex flex-col md:flex-row">
          {c.highlights.map((h, i) => (
            <div
              key={i}
              className={
                "flex-1 py-7 first:pt-0 last:pb-0 md:px-9 md:py-1 md:first:pl-0 md:last:pr-0 " +
                (i > 0 ? "border-t md:border-t-0 md:border-l " + bt : "")
              }
            >
              <div className="text-2xl opacity-25" style={SERIF}>
                {pad2(i + 1)}
              </div>
              <Editable
                as="h3"
                editing={editing}
                {...tp("highlights.title")}
                style={SERIF}
                className="mt-3 text-lg font-medium"
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
                className="mt-2 text-[13px] leading-relaxed opacity-55"
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
        <div className="mx-auto max-w-xl text-center">
          {heading(
            c.checklist.heading,
            "checklist.heading",
            (v) => set({ checklist: { ...c.checklist, heading: v } }),
            "text-[26px] font-medium md:text-[32px]",
          )}
          <ul className="mx-auto mt-9 max-w-md text-left">
            {c.checklist.items.map((it, i) => (
              <li
                key={i}
                className={
                  "flex gap-3 py-3.5 text-[14px] leading-relaxed opacity-80 " +
                  (i > 0 ? "border-t " + bt : "")
                }
              >
                <span className="opacity-40">—</span>
                <Editable
                  as="span"
                  editing={editing}
                  {...tp("checklist.item")}
                  className="flex-1"
                  value={it.text}
                  onChange={(v) => {
                    const items = [...c.checklist.items];
                    items[i] = { text: v };
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
        <div className="text-center">
          <div className="mx-auto h-px w-10 bg-current opacity-25" />
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("callout.text")}
            style={SERIF}
            className="mx-auto mt-8 max-w-2xl text-[26px] font-medium italic leading-snug md:text-[38px]"
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
          <div className="mx-auto mt-8 h-px w-10 bg-current opacity-25" />
        </div>
      );

    case "steps":
      return (
        <div className="mx-auto max-w-2xl">
          {heading(
            c.steps.heading,
            "steps.heading",
            (v) => set({ steps: { ...c.steps, heading: v } }),
            "text-center text-[26px] font-medium md:text-[32px]",
          )}
          <div className="mt-9">
            {c.steps.items.map((st, i) => (
              <div
                key={i}
                className={
                  "grid grid-cols-[auto_1fr] gap-6 py-6 " +
                  (i > 0 ? "border-t " + bt : "")
                }
              >
                <div className="text-2xl opacity-25" style={SERIF}>
                  {pad2(i + 1)}
                </div>
                <div>
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("steps.title")}
                    style={SERIF}
                    className="text-base font-medium"
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
                    className="mt-1.5 text-[13px] leading-relaxed opacity-55"
                    value={st.desc}
                    onChange={(v) => {
                      const items = [...c.steps.items];
                      items[i] = { ...st, desc: v };
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
      const head = (
        <>
          <Eyebrow>Detail</Eyebrow>
          {heading(
            c.detail.heading,
            "detail.heading",
            (v) => set({ detail: { ...c.detail, heading: v } }),
            "mt-3 text-[26px] font-medium md:text-[32px]",
          )}
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("detail.body")}
            className="mt-4 text-[14px] leading-relaxed opacity-65"
            value={c.detail.body}
            onChange={(v) => set({ detail: { ...c.detail, body: v } })}
          />
        </>
      );
      if (c.detail.mode === "text")
        return <div className="mx-auto max-w-xl text-center">{head}</div>;
      if (c.detail.mode === "image")
        return (
          <div className="-mx-5">
            <SectionImage ctx={ctx} k="detail" natural imgClassName="" fallbackAspect="3/2" />
          </div>
        );
      return (
        <div className="grid gap-8 md:grid-cols-[0.85fr_1fr] md:items-center md:gap-14">
          <SectionImage
            ctx={ctx}
            k="detail"
            natural={false}
            imgClassName="w-full object-cover"
            fallbackAspect="3/4"
          />
          <div>{head}</div>
        </div>
      );
    }

    case "specs":
      return (
        <div className="mx-auto max-w-xl">
          {c.specs.map((sp, i) => (
            <div
              key={i}
              className={
                "flex items-baseline justify-between gap-6 py-3.5 " +
                (i > 0 ? "border-t " + bt : "")
              }
            >
              <Editable
                as="span"
                editing={editing}
                {...tp("specs.label")}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-45"
                value={sp.label}
                onChange={(v) => {
                  const specs = [...c.specs];
                  specs[i] = { ...sp, label: v };
                  set({ specs });
                }}
              />
              <Editable
                as="span"
                editing={editing}
                {...tp("specs.value")}
                style={SERIF}
                className="text-right text-[15px]"
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
        <div className="mx-auto max-w-2xl">
          {c.reviews.map((r, i) => (
            <figure
              key={i}
              className={
                "py-10 text-center first:pt-0 last:pb-0 " +
                (i > 0 ? "border-t " + bt : "")
              }
            >
              <div className="text-4xl leading-none opacity-20" style={SERIF}>
                &ldquo;
              </div>
              <Editable
                as="p"
                multiline
                editing={editing}
                {...tp("reviews.text")}
                style={SERIF}
                className="mx-auto mt-3 max-w-xl text-[19px] font-medium leading-relaxed md:text-[22px]"
                value={r.text}
                onChange={(v) => {
                  const reviews = [...c.reviews];
                  reviews[i] = { ...r, text: v };
                  set({ reviews });
                }}
              />
              <Editable
                as="div"
                editing={editing}
                {...tp("reviews.name")}
                className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-45"
                value={r.name}
                onChange={(v) => {
                  const reviews = [...c.reviews];
                  reviews[i] = { ...r, name: v };
                  set({ reviews });
                }}
              />
            </figure>
          ))}
        </div>
      );

    case "pricing":
      return (
        <div className="mx-auto max-w-sm text-center">
          <div className="flex items-baseline justify-center gap-3">
            <Editable
              as="span"
              editing={editing}
              {...tp("pricing.price")}
              style={SERIF}
              className="text-[40px] font-medium"
              value={c.pricing.price}
              onChange={(v) => set({ pricing: { ...c.pricing, price: v } })}
            />
            <Editable
              as="span"
              editing={editing}
              {...tp("pricing.compareAt")}
              className="text-[13px] line-through opacity-35"
              value={c.pricing.compareAt}
              onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })}
            />
          </div>
          <Editable
            as="p"
            editing={editing}
            {...tp("pricing.note")}
            className="mt-3 text-[12px] uppercase tracking-[0.16em] opacity-50"
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
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-[26px] font-medium md:text-[32px]" style={SERIF}>
            자주 묻는 질문
          </h2>
          <div className="mt-9">
            {c.faq.map((f, i) => (
              <div key={i} className={"py-5 " + (i > 0 ? "border-t " + bt : "")}>
                <Editable
                  as="div"
                  editing={editing}
                  {...tp("faq.q")}
                  style={SERIF}
                  className="text-[16px] font-medium"
                  value={f.q}
                  onChange={(v) => {
                    const faq = [...c.faq];
                    faq[i] = { ...f, q: v };
                    set({ faq });
                  }}
                />
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("faq.a")}
                  className="mt-2 text-[13px] leading-relaxed opacity-55"
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
            style={SERIF}
            className="text-[24px] font-medium md:text-[30px]"
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
            className="mt-4 text-[14px] leading-relaxed opacity-65"
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
          imgClassName="w-full object-cover"
          fallbackAspect="3/2"
        />
      );
      if (b.mode === "text") return text;
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
