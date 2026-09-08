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
  pad2,
} from "./parts";

// ─────────────────────────────────────────────────────────────
// BOLD — 커머스 상세페이지. 채도 높은 컬러블록, 블롭 배경,
// "POINT 01" 라벨, 풀블리드 사진 좌우 교차, 두꺼운 헤드라인.
// ─────────────────────────────────────────────────────────────

export function renderBold(
  s: SectionRef,
  idx: number,
  onDark: boolean,
  ctx: Ctx,
): React.ReactNode {
  const { c, set, editing, primary } = ctx;
  const tp = tpOf(ctx);
  const soft = onDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";
  const line = onDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";

  const Blob = ({ cls, op }: { cls: string; op: number }) => (
    <div
      aria-hidden
      className={"pointer-events-none absolute rounded-full blur-3xl " + cls}
      style={{ background: primary, opacity: op }}
    />
  );

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span
      className="inline-block rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white"
      style={{ background: primary }}
    >
      {children}
    </span>
  );

  const heading = (text: string, key: string, onChange: (v: string) => void) => (
    <Editable
      as="h2"
      editing={editing}
      {...tp(key)}
      className="mt-3 text-[24px] font-black leading-tight md:text-[30px]"
      value={text}
      onChange={onChange}
    />
  );

  const badge = c.hero.badge ? (
    <span
      className="inline-block rounded-full px-4 py-1.5 text-xs font-black tracking-wide"
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
  ) : null;

  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  const heroText = (
    <div className="relative isolate overflow-hidden rounded-[44px] px-1 py-4 text-center">
      <Blob cls="-left-28 -top-24 h-72 w-72" op={0.14} />
      <Blob cls="-right-24 top-20 h-56 w-56" op={0.09} />
      {badge}
      <Editable
        as="h1"
        multiline
        editing={editing}
        {...tp("hero.title")}
        className="mx-auto mt-5 max-w-2xl text-[32px] font-black leading-[1.12] tracking-tight md:text-[52px]"
        value={c.hero.title}
        onChange={(v) => set({ hero: { ...c.hero, title: v } })}
      />
      <Editable
        as="p"
        multiline
        editing={editing}
        {...tp("hero.subtitle")}
        className={
          "mx-auto mt-5 max-w-lg text-[15px] leading-relaxed md:text-base " +
          (onDark ? "opacity-85" : "opacity-65")
        }
        value={c.hero.subtitle}
        onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
      />
      {!heroCtaHidden && (
        <div className="mt-7 flex justify-center">
          <CtaLink
            ctx={ctx}
            className="inline-block rounded-full px-10 py-4 text-base font-black text-white shadow-xl transition hover:scale-[1.02]"
            style={{ background: primary }}
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
            <SectionImage ctx={ctx} k="hero" natural imgClassName="" fallbackAspect="1/1" />
          </div>
        );
      return (
        <div>
          {heroText}
          <div className="mt-10">
            <SectionImage
              ctx={ctx}
              k="hero"
              natural={false}
              imgClassName="w-full rounded-[28px] object-cover shadow-2xl"
              fallbackAspect="4/3"
            />
          </div>
        </div>
      );
    }

    case "highlights":
      return (
        <div className="space-y-5">
          {c.highlights.map((h, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={i}
                className={
                  "flex flex-col gap-5 overflow-hidden rounded-[28px] p-6 md:items-center md:gap-8 md:p-8 " +
                  (flip ? "md:flex-row-reverse" : "md:flex-row")
                }
                style={{ background: soft }}
              >
                {h.iconImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.iconImage}
                    alt=""
                    className="h-44 w-full shrink-0 rounded-2xl object-cover md:h-48 md:w-60"
                  />
                ) : (
                  <div
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-[22px] text-2xl font-black text-white"
                    style={{ background: primary }}
                  >
                    {pad2(i + 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[11px] font-black tracking-[0.2em]"
                    style={{ color: onDark ? "#fff" : primary }}
                  >
                    POINT {pad2(i + 1)}
                  </span>
                  <Editable
                    as="h3"
                    editing={editing}
                    {...tp("highlights.title")}
                    className="mt-2 text-xl font-black leading-snug md:text-[26px]"
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
                    className="mt-2.5 text-sm leading-relaxed opacity-70 md:text-[15px]"
                    value={h.desc}
                    onChange={(v) => {
                      const highlights = [...c.highlights];
                      highlights[i] = { ...h, desc: v };
                      set({ highlights });
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );

    case "checklist":
      return (
        <div className="rounded-[28px] p-7 md:p-10" style={{ background: soft }}>
          <div className="text-center">
            <Pill>Check List</Pill>
          </div>
          {heading(c.checklist.heading, "checklist.heading", (v) =>
            set({ checklist: { ...c.checklist, heading: v } }),
          )}
          <ul className="mx-auto mt-7 max-w-lg space-y-3">
            {c.checklist.items.map((it, i) => (
              <li
                key={i}
                className="flex items-center gap-3.5 rounded-2xl px-5 py-4"
                style={{ background: onDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-black text-white"
                  style={{ background: primary }}
                >
                  ✓
                </span>
                <Editable
                  as="span"
                  editing={editing}
                  {...tp("checklist.item")}
                  className="text-[15px] font-bold leading-relaxed"
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
        <div className="relative isolate overflow-hidden py-2 text-center">
          <Blob cls="left-1/2 -top-16 h-56 w-56 -translate-x-1/2" op={0.14} />
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("callout.text")}
            className="text-[26px] font-black leading-tight md:text-[40px]"
            value={c.callout.text}
            onChange={(v) => set({ callout: { ...c.callout, text: v } })}
          />
          {(c.callout.sub || editing) && (
            <div className="mt-5">
              <Editable
                as="span"
                editing={editing}
                {...tp("callout.sub")}
                className="inline-block rounded-full px-5 py-2 text-xs font-black tracking-wide text-white"
                style={{ background: primary }}
                value={c.callout.sub}
                onChange={(v) => set({ callout: { ...c.callout, sub: v } })}
              />
            </div>
          )}
        </div>
      );

    case "steps":
      return (
        <div>
          <div className="text-center">
            <Pill>Step</Pill>
          </div>
          {heading(c.steps.heading, "steps.heading", (v) =>
            set({ steps: { ...c.steps, heading: v } }),
          )}
          <div className="mt-8">
            {c.steps.items.map((st, i) => (
              <div key={i} className="flex gap-5 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-black text-white"
                    style={{ background: primary }}
                  >
                    {i + 1}
                  </div>
                  {i < c.steps.items.length - 1 && (
                    <div
                      className="mt-1 w-[3px] flex-1 rounded"
                      style={{ background: primary, opacity: 0.25 }}
                    />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("steps.title")}
                    className="text-lg font-black"
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
                    className="mt-1.5 text-sm leading-relaxed opacity-70"
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
          <div className="text-center">
            <Pill>Detail</Pill>
          </div>
          {heading(c.detail.heading, "detail.heading", (v) =>
            set({ detail: { ...c.detail, heading: v } }),
          )}
          <Editable
            as="p"
            multiline
            editing={editing}
            {...tp("detail.body")}
            className="mx-auto mt-4 max-w-xl text-center leading-relaxed opacity-75"
            value={c.detail.body}
            onChange={(v) => set({ detail: { ...c.detail, body: v } })}
          />
        </>
      );
      if (c.detail.mode === "text") return <div className="text-center">{head}</div>;
      if (c.detail.mode === "image")
        return (
          <div className="-mx-5">
            <SectionImage ctx={ctx} k="detail" natural imgClassName="" fallbackAspect="1/1" />
          </div>
        );
      return (
        <div>
          <div className="text-center">{head}</div>
          <div className="mt-9">
            <SectionImage
              ctx={ctx}
              k="detail"
              natural={false}
              imgClassName="w-full rounded-[28px] object-cover shadow-2xl"
              fallbackAspect="4/3"
            />
          </div>
        </div>
      );
    }

    case "specs":
      return (
        <div
          className="overflow-hidden rounded-[24px] border-2"
          style={{ borderColor: line }}
        >
          {c.specs.map((sp, i) => (
            <div
              key={i}
              className="flex justify-between px-6 py-4 text-sm"
              style={{
                background: i % 2 ? "transparent" : soft,
                borderBottom:
                  i < c.specs.length - 1 ? `1px solid ${line}` : undefined,
              }}
            >
              <Editable
                as="span"
                editing={editing}
                {...tp("specs.label")}
                className="font-black"
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
                className="opacity-70"
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
          <h2 className="text-center text-[24px] font-black md:text-[30px]">고객 후기</h2>
          <div className="mt-8 space-y-4">
            {c.reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-[24px] border-2 p-6"
                style={{ borderColor: line, background: soft }}
              >
                <Stars className="text-sm" />
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("reviews.text")}
                  className="mt-2.5 text-[15px] font-medium leading-relaxed"
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
                  className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                  style={{ background: alpha(primary, "1f"), color: onDark ? "#fff" : primary }}
                  value={r.name}
                  onChange={(v) => {
                    const reviews = [...c.reviews];
                    reviews[i] = { ...r, name: v };
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
          className="relative mx-auto max-w-md overflow-hidden rounded-[32px] border-2 p-9 text-center"
          style={{ borderColor: primary, background: soft }}
        >
          <div className="text-center">
            <Pill>특가</Pill>
          </div>
          <div className="mt-5 flex items-end justify-center gap-2.5">
            <Editable
              as="span"
              editing={editing}
              {...tp("pricing.price")}
              className="text-[46px] font-black leading-none"
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
            className="mt-3 text-sm opacity-70"
            value={c.pricing.note}
            onChange={(v) => set({ pricing: { ...c.pricing, note: v } })}
          />
          {!pricingCtaHidden && (
            <CtaLink
              ctx={ctx}
              className="mt-7 block rounded-full px-8 py-4 text-lg font-black text-white shadow-xl"
              style={{ background: primary }}
            />
          )}
        </div>
      );

    case "faq":
      return (
        <div>
          <h2 className="text-center text-[24px] font-black md:text-[30px]">자주 묻는 질문</h2>
          <div className="mx-auto mt-8 max-w-xl space-y-3">
            {c.faq.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 p-5"
                style={{ borderColor: line }}
              >
                <div className="flex gap-3">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-black text-white"
                    style={{ background: primary }}
                  >
                    Q
                  </span>
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("faq.q")}
                    className="font-black"
                    value={f.q}
                    onChange={(v) => {
                      const faq = [...c.faq];
                      faq[i] = { ...f, q: v };
                      set({ faq });
                    }}
                  />
                </div>
                <Editable
                  as="p"
                  multiline
                  editing={editing}
                  {...tp("faq.a")}
                  className="mt-2 pl-9 text-sm leading-relaxed opacity-70"
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
          {b.align === "center" && (
            <div className="mb-3">
              <Pill>Note</Pill>
            </div>
          )}
          <Editable
            as="h2"
            editing={editing}
            className="text-[22px] font-black md:text-[28px]"
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
            className="mt-3 leading-relaxed opacity-75"
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
          imgClassName="w-full rounded-[28px] object-cover shadow-2xl"
          fallbackAspect="4/3"
        />
      );
      if (b.mode === "text") return text;
      if (b.mode === "image") return <div className="-mx-5">{img}</div>;
      return (
        <div>
          {img}
          <div className="mt-6">{text}</div>
        </div>
      );
    }

    default:
      return null;
  }
}
