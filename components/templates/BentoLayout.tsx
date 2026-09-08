"use client";

import type { SectionRef } from "@/lib/schema";
import { WIDTH_PX } from "@/lib/schema";
import Editable from "@/components/Editable";
import {
  type Ctx,
  tpOf,
  alpha,
  isDarkHex,
  sectionPad,
  EditFrame,
  PadHandles,
  SplitDivider,
  SectionBgImage,
  SectionImage,
  FlexImage,
  Stars,
} from "./parts";

// ════════════════════════════════════════════════════════════
// BENTO — 카드 그리드. 상단 내비 없음. 테두리 없음(섀도우만).
// 히어로 아래 통계 스트립. 균일한 카드로 정렬. 버튼 없음.
// ════════════════════════════════════════════════════════════

export default function BentoLayout({ ctx }: { ctx: Ctx }) {
  const { c, set, editing, primary } = ctx;
  const tp = tpOf(ctx);
  // 본문 폭 — 편집기 "본문 폭" 설정값. 섹션별 wPx 가 우선.
  const pageW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 720)
      : WIDTH_PX[c.layout.width];

  // 테두리 없음 — 배경 + 부드러운 섀도우만
  const card = "rounded-[28px] bg-white shadow-[0_6px_30px_rgba(0,0,0,0.07)]";
  const chip = alpha(primary, "14");
  const pageBg = "#eef0f5";

  const H2 = (
    text: string,
    key: string,
    onChange: (v: string) => void,
    cls = "text-[24px] font-extrabold leading-tight md:text-[30px]",
  ) => (
    <Editable
      as="h2"
      editing={editing}
      {...tp(key)}
      className={cls}
      value={text}
      onChange={onChange}
    />
  );

  const renderSection = (s: SectionRef, i: number): React.ReactNode => {
    switch (s.type) {
      case "hero": {
        const stats = c.specs.slice(0, 3);
        const txt = (
          <div>
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
              className="mt-5 text-[30px] font-extrabold leading-[1.14] md:text-[46px]"
              value={c.hero.title}
              onChange={(v) => set({ hero: { ...c.hero, title: v } })}
            />
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("hero.subtitle")}
              className="mt-4 max-w-md text-[15px] leading-relaxed opacity-65"
              value={c.hero.subtitle}
              onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
            />
          </div>
        );
        return (
          <div>
            <div className={card + " overflow-hidden p-7 md:p-12"}>
              {c.hero.mode === "text" ? (
                txt
              ) : (
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                  {txt}
                  <SectionImage
                    ctx={ctx}
                    k="hero"
                    natural={c.hero.mode === "image"}
                    imgClassName="w-full rounded-2xl object-cover"
                    fallbackAspect="4/3"
                  />
                </div>
              )}
            </div>
            {stats.length === 3 && (
              <div className="relative z-10 mx-auto -mt-9 grid max-w-[92%] grid-cols-3 gap-3 md:max-w-[80%]">
                {stats.map((sp, si) => (
                  <div key={si} className={card + " px-4 py-5 text-center"}>
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("specs.value")}
                      className="break-keep text-[15px] font-extrabold leading-tight md:text-2xl"
                      value={sp.value}
                      onChange={(v) => {
                        const specs = [...c.specs];
                        specs[si] = { ...sp, value: v };
                        set({ specs });
                      }}
                    />
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("specs.label")}
                      className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-45"
                      value={sp.label}
                      onChange={(v) => {
                        const specs = [...c.specs];
                        specs[si] = { ...sp, label: v };
                        set({ specs });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // 균일한 3열 카드 (빈 큰 카드 없음)
      case "highlights": {
        const n = c.highlights.length;
        const cols = n === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : n === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
        return (
          <div className={"grid gap-4 " + cols}>
            {c.highlights.map((h, hi) => (
              <div key={hi} className={card + " flex flex-col p-7"}>
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl text-2xl"
                  style={{ background: chip }}
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
                  className="mt-5 text-[17px] font-bold leading-snug"
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
                  className="mt-2 text-[13.5px] leading-relaxed opacity-60"
                  value={h.desc}
                  onChange={(v) => {
                    const highlights = [...c.highlights];
                    highlights[hi] = { ...h, desc: v };
                    set({ highlights });
                  }}
                />
              </div>
            ))}
          </div>
        );
      }

      case "checklist":
        return (
          <div className={card + " p-8 md:p-12"}>
            {H2(c.checklist.heading, "checklist.heading", (v) =>
              set({ checklist: { ...c.checklist, heading: v } }),
            )}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {c.checklist.items.map((it, ii) => (
                <div
                  key={ii}
                  className="flex items-start gap-3 rounded-2xl px-4 py-4"
                  style={{ background: alpha(primary, "0d") }}
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
                      items[ii] = { text: v };
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
            className="rounded-[28px] px-8 py-16 text-center text-white shadow-[0_10px_36px_rgba(0,0,0,0.14)] md:py-20"
            style={{ background: `linear-gradient(135deg, ${primary}, ${alpha(primary, "cc")})` }}
          >
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("callout.text")}
              className="mx-auto max-w-2xl text-[24px] font-extrabold leading-snug md:text-[34px]"
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
          </div>
        );

      case "steps":
        return (
          <div className={card + " p-8 text-center md:p-12"}>
            {H2(c.steps.heading, "steps.heading", (v) => set({ steps: { ...c.steps, heading: v } }))}
            <div className="relative mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-3">
              {c.steps.items.length > 1 && (
                <div
                  className="absolute top-5 hidden h-0.5 sm:block"
                  style={{
                    left: `${100 / c.steps.items.length / 2}%`,
                    right: `${100 / c.steps.items.length / 2}%`,
                    background: alpha(primary, "33"),
                  }}
                />
              )}
              {c.steps.items.map((st, si) => (
                <div key={si} className="relative flex flex-col items-center">
                  <div
                    className="relative z-10 grid h-10 w-10 place-items-center rounded-full text-sm font-black text-white"
                    style={{ background: primary }}
                  >
                    {si + 1}
                  </div>
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("steps.title")}
                    className="mt-4 font-bold"
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
                    className="mt-1.5 max-w-[240px] text-[13px] leading-relaxed opacity-60"
                    value={st.desc}
                    onChange={(v) => {
                      const items = [...c.steps.items];
                      items[si] = { ...st, desc: v };
                      set({ steps: { ...c.steps, items } });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "detail": {
        const text = (
          <div>
            {H2(c.detail.heading, "detail.heading", (v) => set({ detail: { ...c.detail, heading: v } }))}
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
          return <div className={card + " p-8 md:p-12"}>{text}</div>;
        if (c.detail.mode === "image")
          return (
            <div className={card + " overflow-hidden"}>
              <SectionImage
                ctx={ctx}
                k="detail"
                natural
                imgClassName="w-full object-cover"
                fallbackAspect="16/9"
              />
            </div>
          );
        const pct = s.splitPct ?? 50;
        return (
          <div className={card + " relative overflow-hidden p-6 md:p-8"}>
            <div className="flex flex-wrap items-center gap-8 md:flex-nowrap md:gap-0">
              <div style={{ flex: `1 1 ${pct}%` }} className="md:pr-8">
                <SectionImage
                  ctx={ctx}
                  k="detail"
                  natural={false}
                  imgClassName="w-full rounded-2xl object-cover"
                  fallbackAspect="4/3"
                />
              </div>
              <div style={{ flex: `1 1 ${100 - pct}%` }} className="md:pl-8">
                {text}
              </div>
            </div>
            <SplitDivider ctx={ctx} idx={i} s={s} />
          </div>
        );
      }

      case "specs":
        return (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {c.specs.map((sp, si) => (
              <div key={si} className={card + " px-5 py-5"}>
                <Editable
                  as="div"
                  editing={editing}
                  {...tp("specs.value")}
                  className="text-lg font-extrabold leading-none"
                  value={sp.value}
                  onChange={(v) => {
                    const specs = [...c.specs];
                    specs[si] = { ...sp, value: v };
                    set({ specs });
                  }}
                />
                <Editable
                  as="div"
                  editing={editing}
                  {...tp("specs.label")}
                  className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-45"
                  value={sp.label}
                  onChange={(v) => {
                    const specs = [...c.specs];
                    specs[si] = { ...sp, label: v };
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
            <h2 className="mb-7 text-center text-[24px] font-extrabold md:text-[30px]">고객 후기</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {c.reviews.map((r, ri) => (
                <div key={ri} className={card + " p-6"}>
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
                          reviews[ri] = { ...r, name: v };
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
                      reviews[ri] = { ...r, text: v };
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
          <div className={card + " mx-auto max-w-md p-10 text-center"}>
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
          </div>
        );

      case "faq":
        return (
          <div className={card + " p-8 md:p-12"}>
            <h2 className="text-center text-[24px] font-extrabold md:text-[30px]">자주 묻는 질문</h2>
            <div className="mx-auto mt-7 max-w-2xl">
              {c.faq.map((f, fi) => (
                <div key={fi} className="border-t border-black/[0.07] py-5 first:border-t-0">
                  <div className="flex items-start justify-between gap-3">
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("faq.q")}
                      className="font-bold"
                      value={f.q}
                      onChange={(v) => {
                        const faq = [...c.faq];
                        faq[fi] = { ...f, q: v };
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
          <div className={b.align === "center" ? "text-center" : ""}>
            <Editable
              as="h2"
              editing={editing}
              className="text-[22px] font-extrabold md:text-[28px]"
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
        if (b.mode === "image")
          return (
            <div className={card + " overflow-hidden"}>
              <FlexImage
                src={b.image}
                widthPct={b.imageW}
                natural
                editing={editing}
                canResize={ctx.canResize}
                imgClassName=""
                fallbackAspect="1/1"
                onResize={(p) => setBlock({ imageW: p })}
              />
            </div>
          );
        if (b.mode === "text") return <div className={card + " p-8 md:p-10"}>{text}</div>;
        return (
          <div className={card + " grid items-center gap-8 p-6 md:grid-cols-2 md:p-8"}>
            <FlexImage
              src={b.image}
              widthPct={b.imageW}
              aspect={b.imageAspect}
              natural={false}
              editing={editing}
              canResize={ctx.canResize}
              imgClassName="w-full rounded-2xl object-cover"
              fallbackAspect="4/3"
              onResize={(p, a) => setBlock({ imageW: p, ...(a != null ? { imageAspect: a } : {}) })}
            />
            {text}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ background: pageBg, color: c.theme.text }}>
      <div
        className="mx-auto px-4 py-6 md:px-8 md:py-10"
        style={{ maxWidth: pageW + 40 }}
      >
        {c.sections.map((s) => {
          if (!s.enabled) return null;
          const i = c.sections.indexOf(s);
          const inner = renderSection(s, i);
          if (!inner) return null;
          const p = Math.round(sectionPad(s) / 2.4);
          const bgImgDark = !!s.bgImage && s.bgFit !== "contain";
          const onDark = isDarkHex(s.bg) || bgImgDark;
          return (
            <section
              key={s.key || `${s.type}-${i}`}
              className="relative"
              style={{
                paddingTop: p,
                paddingBottom: p,
                background: s.bgImage ? undefined : s.bg || undefined,
                color: onDark ? "#fff" : undefined,
              }}
            >
              <SectionBgImage s={s} />
              <div className="relative">
                <EditFrame ctx={ctx} idx={i} s={s} baseW={pageW}>
                  {inner}
                </EditFrame>
              </div>
              <PadHandles ctx={ctx} idx={i} s={s} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
