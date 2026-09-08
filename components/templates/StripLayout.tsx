"use client";

import type { SectionRef } from "@/lib/schema";
import Editable from "@/components/Editable";
import {
  type Ctx,
  tpOf,
  alpha,
  pad2,
  isDarkHex,
  sectionPad,
  EditFrame,
  PadHandles,
  SectionImage,
  FlexImage,
  CtaLink,
  Stars,
} from "./parts";

// ════════════════════════════════════════════════════════════
// STRIP — 풀블리드 세로 스트립. max-width 없음, 섹션 간격 0,
// 텍스트를 이미지 위에 얹음, 거대 고스트 숫자, 하단 고정 구매바.
// 카드 · 테두리 · 둥근모서리 전혀 없음.
// ════════════════════════════════════════════════════════════

const COL = 620; // 본문 텍스트 컬럼 기본 폭

export default function StripLayout({ ctx }: { ctx: Ctx }) {
  const { c, set, editing, primary } = ctx;
  const tp = tpOf(ctx);
  const heroCtaHidden = c.hero.ctaHidden ?? c.cta.hidden ?? false;
  const pricingCtaHidden = c.pricing.ctaHidden ?? c.cta.hidden ?? false;

  // 오버레이 텍스트 블록 (이미지 위)
  const Overlay = ({
    children,
    align = "left",
  }: {
    children: React.ReactNode;
    align?: "left" | "right" | "center";
  }) => (
    <div
      className={
        "absolute inset-x-0 bottom-0 px-6 pb-10 pt-24 md:px-14 md:pb-14 " +
        (align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left")
      }
      style={{
        background:
          "linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,0) 100%)",
      }}
    >
      <div
        className={
          "mx-0 max-w-2xl " +
          (align === "right" ? "ml-auto" : align === "center" ? "mx-auto" : "")
        }
      >
        {children}
      </div>
    </div>
  );

  const Ghost = ({ n, right }: { n: number; right?: boolean }) => (
    <div
      aria-hidden
      className={
        "pointer-events-none absolute -top-6 select-none font-black leading-none text-white/15 " +
        (right ? "-right-3" : "-left-3")
      }
      style={{ fontSize: "min(34vw, 260px)" }}
    >
      {pad2(n)}
    </div>
  );

  const renderSection = (s: SectionRef, i: number): React.ReactNode => {
    switch (s.type) {
      // ── HERO : 풀블리드 이미지 + 하단 오버레이 ──────────────
      case "hero": {
        const txt = (
          <>
            {c.hero.badge && (
              <Editable
                as="span"
                editing={editing}
                value={c.hero.badge}
                {...tp("hero.badge")}
                className="inline-block bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-black"
                onChange={(v) => set({ hero: { ...c.hero, badge: v } })}
              />
            )}
            <Editable
              as="h1"
              multiline
              editing={editing}
              {...tp("hero.title")}
              className="mt-4 text-[34px] font-black leading-[1.05] tracking-tight text-white md:text-[64px]"
              value={c.hero.title}
              onChange={(v) => set({ hero: { ...c.hero, title: v } })}
            />
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("hero.subtitle")}
              className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/80 md:text-base"
              value={c.hero.subtitle}
              onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
            />
          </>
        );
        if (c.hero.mode === "text") {
          return (
            <div className="px-6 py-20 text-center md:py-28" style={{ background: primary }}>
              <div className="mx-auto max-w-3xl">
                <div className="text-white">{txt}</div>
              </div>
            </div>
          );
        }
        if (c.hero.mode === "image")
          return (
            <SectionImage
              ctx={ctx}
              k="hero"
              natural
              imgClassName="w-full object-cover"
              fallbackAspect="3/4"
            />
          );
        return (
          <div className="relative h-[78vh] min-h-[440px] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.hero.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center" }}
              draggable={false}
            />
            <Overlay align="left">{txt}</Overlay>
          </div>
        );
      }

      // ── HIGHLIGHTS : 강점마다 풀블리드 밴드 + 고스트 숫자 ────
      case "highlights":
        return (
          <div>
            {c.highlights.map((h, hi) => {
              const right = hi % 2 === 1;
              return (
                <div key={hi} className="relative">
                  {h.iconImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.iconImage}
                      alt=""
                      className="h-[62vh] max-h-[560px] min-h-[360px] w-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-[52vh] max-h-[460px] min-h-[320px] w-full"
                      style={{ background: right ? alpha(primary, "e6") : primary }}
                    />
                  )}
                  <Ghost n={hi + 1} right={right} />
                  <Overlay align={right ? "right" : "left"}>
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
                      Point {pad2(hi + 1)}
                    </div>
                    <Editable
                      as="h3"
                      editing={editing}
                      {...tp("highlights.title")}
                      className="mt-2 text-[24px] font-black leading-tight text-white md:text-[38px]"
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
                      className="mt-2 text-[13px] leading-relaxed text-white/80 md:text-[15px]"
                      value={h.desc}
                      onChange={(v) => {
                        const highlights = [...c.highlights];
                        highlights[hi] = { ...h, desc: v };
                        set({ highlights });
                      }}
                    />
                  </Overlay>
                </div>
              );
            })}
          </div>
        );

      // ── CHECKLIST : 어두운 밴드, 큰 리스트 ────────────────────
      case "checklist":
        return (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6">
            <Editable
              as="h2"
              editing={editing}
              {...tp("checklist.heading")}
              className="text-[24px] font-black leading-tight md:text-[34px]"
              value={c.checklist.heading}
              onChange={(v) => set({ checklist: { ...c.checklist, heading: v } })}
            />
            <ul className="mt-8">
              {c.checklist.items.map((it, ii) => (
                <li
                  key={ii}
                  className="flex items-start gap-4 border-t border-current/15 py-4 first:border-t-0"
                >
                  <span className="mt-1 text-lg font-black" style={{ color: primary }}>
                    ✓
                  </span>
                  <Editable
                    as="span"
                    editing={editing}
                    {...tp("checklist.item")}
                    className="flex-1 text-[15px] font-bold leading-relaxed md:text-[17px]"
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
          </EditFrame>
        );

      // ── CALLOUT : 컬러 밴드, 거대 중앙 텍스트 ────────────────
      case "callout":
        return (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={860} className="px-6 text-center">
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("callout.text")}
              className="text-[28px] font-black leading-[1.1] md:text-[46px]"
              value={c.callout.text}
              onChange={(v) => set({ callout: { ...c.callout, text: v } })}
            />
            {(c.callout.sub || editing) && (
              <Editable
                as="p"
                editing={editing}
                {...tp("callout.sub")}
                className="mx-auto mt-5 max-w-md text-sm font-bold uppercase tracking-[0.2em] opacity-70"
                value={c.callout.sub}
                onChange={(v) => set({ callout: { ...c.callout, sub: v } })}
              />
            )}
          </EditFrame>
        );

      // ── STEPS : 밴드, 큰 숫자 세로 ───────────────────────────
      case "steps":
        return (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6">
            <Editable
              as="h2"
              editing={editing}
              {...tp("steps.heading")}
              className="text-[24px] font-black leading-tight md:text-[34px]"
              value={c.steps.heading}
              onChange={(v) => set({ steps: { ...c.steps, heading: v } })}
            />
            <div className="mt-8">
              {c.steps.items.map((st, si) => (
                <div key={si} className="flex gap-5 border-t border-current/15 py-6 first:border-t-0">
                  <div
                    className="text-[40px] font-black leading-none tabular-nums"
                    style={{ color: primary }}
                  >
                    {pad2(si + 1)}
                  </div>
                  <div className="flex-1 pt-1">
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("steps.title")}
                      className="text-lg font-black md:text-xl"
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
                      className="mt-1.5 text-sm leading-relaxed opacity-70"
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
          </EditFrame>
        );

      // ── DETAIL : 풀블리드 이미지 + 오버레이 제목, 아래 본문 밴드
      case "detail": {
        const head = (
          <Editable
            as="h2"
            editing={editing}
            {...tp("detail.heading")}
            className="text-[26px] font-black leading-tight text-white md:text-[42px]"
            value={c.detail.heading}
            onChange={(v) => set({ detail: { ...c.detail, heading: v } })}
          />
        );
        const body = (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6 pt-10">
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("detail.body")}
              className="text-[15px] leading-[1.9] opacity-80 md:text-[17px]"
              value={c.detail.body}
              onChange={(v) => set({ detail: { ...c.detail, body: v } })}
            />
          </EditFrame>
        );
        if (c.detail.mode === "text")
          return (
            <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6">
              <Editable
                as="h2"
                editing={editing}
                {...tp("detail.heading")}
                className="text-[24px] font-black leading-tight md:text-[34px]"
                value={c.detail.heading}
                onChange={(v) => set({ detail: { ...c.detail, heading: v } })}
              />
              <Editable
                as="p"
                multiline
                editing={editing}
                {...tp("detail.body")}
                className="mt-5 text-[15px] leading-[1.9] opacity-80 md:text-[17px]"
                value={c.detail.body}
                onChange={(v) => set({ detail: { ...c.detail, body: v } })}
              />
            </EditFrame>
          );
        if (c.detail.mode === "image")
          return (
            <SectionImage
              ctx={ctx}
              k="detail"
              natural
              imgClassName="w-full object-cover"
              fallbackAspect="3/2"
            />
          );
        return (
          <div>
            <div className="relative">
              <SectionImage
                ctx={ctx}
                k="detail"
                natural={false}
                imgClassName="w-full object-cover"
                fallbackAspect="16/10"
              />
              <Overlay align="left">{head}</Overlay>
            </div>
            {body}
          </div>
        );
      }

      // ── SPECS : 밴드, 얇은 구분선 행 ─────────────────────────
      case "specs":
        return (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6">
            {c.specs.map((sp, si) => (
              <div
                key={si}
                className="flex justify-between border-t border-current/15 py-4 text-sm first:border-t-0 md:text-base"
              >
                <Editable
                  as="span"
                  editing={editing}
                  {...tp("specs.label")}
                  className="font-black uppercase tracking-wide"
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
                  className="opacity-70"
                  value={sp.value}
                  onChange={(v) => {
                    const specs = [...c.specs];
                    specs[si] = { ...sp, value: v };
                    set({ specs });
                  }}
                />
              </div>
            ))}
          </EditFrame>
        );

      // ── REVIEWS : 가로 스크롤 스냅 스트립 ────────────────────
      case "reviews":
        return (
          <div>
            <div className="px-6 pb-6 md:px-14">
              <h2 className="text-[24px] font-black md:text-[34px]">고객 후기</h2>
            </div>
            <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto">
              {c.reviews.map((r, ri) => (
                <div
                  key={ri}
                  className="w-[85vw] shrink-0 snap-start border-l border-current/15 px-6 py-8 first:border-l-0 md:w-[440px] md:px-10"
                >
                  <Stars className="text-base" />
                  <Editable
                    as="p"
                    multiline
                    editing={editing}
                    {...tp("reviews.text")}
                    className="mt-3 text-[16px] font-bold leading-relaxed md:text-[19px]"
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
                    className="mt-5 text-xs font-black uppercase tracking-[0.18em] opacity-50"
                    value={r.name}
                    onChange={(v) => {
                      const reviews = [...c.reviews];
                      reviews[ri] = { ...r, name: v };
                      set({ reviews });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      // ── PRICING : 컬러 밴드, 거대 가격 ──────────────────────
      case "pricing":
        return (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={720} className="px-6 text-center">
            <div className="flex items-end justify-center gap-3">
              <Editable
                as="span"
                editing={editing}
                {...tp("pricing.price")}
                className="text-[52px] font-black leading-none md:text-[72px]"
                value={c.pricing.price}
                onChange={(v) => set({ pricing: { ...c.pricing, price: v } })}
              />
              <Editable
                as="span"
                editing={editing}
                {...tp("pricing.compareAt")}
                className="pb-2 text-lg line-through opacity-40"
                value={c.pricing.compareAt}
                onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })}
              />
            </div>
            <Editable
              as="p"
              editing={editing}
              {...tp("pricing.note")}
              className="mt-3 text-sm font-bold uppercase tracking-[0.16em] opacity-70"
              value={c.pricing.note}
              onChange={(v) => set({ pricing: { ...c.pricing, note: v } })}
            />
            {!pricingCtaHidden && (
              <CtaLink
                ctx={ctx}
                className="mt-8 inline-block bg-white px-12 py-4 text-base font-black uppercase tracking-[0.14em] text-black"
              />
            )}
          </EditFrame>
        );

      // ── FAQ : 밴드, 얇은 구분선 Q/A ─────────────────────────
      case "faq":
        return (
          <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6">
            <h2 className="text-[24px] font-black md:text-[34px]">자주 묻는 질문</h2>
            <div className="mt-8">
              {c.faq.map((f, fi) => (
                <div key={fi} className="border-t border-current/15 py-5 first:border-t-0">
                  <Editable
                    as="div"
                    editing={editing}
                    {...tp("faq.q")}
                    className="text-[16px] font-black md:text-[18px]"
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
                    className="mt-2 text-sm leading-relaxed opacity-70"
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
          </EditFrame>
        );

      // ── BLOCK ──────────────────────────────────────────────
      case "block": {
        if (!s.block) return null;
        const b = s.block;
        const setBlock = (patch: Partial<typeof b>) =>
          ctx.setSection(i, { block: { ...b, ...patch } });
        const heading = (
          <Editable
            as="h2"
            editing={editing}
            className="text-[24px] font-black leading-tight text-white md:text-[38px]"
            value={b.heading}
            styleKey={`block.${s.key}.heading`}
            textStyle={c.textStyles?.[`block.${s.key}.heading`]}
            selected={ctx.selectedTextKey === `block.${s.key}.heading`}
            onSelect={ctx.onSelectText}
            onChange={(v) => setBlock({ heading: v })}
          />
        );
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
        if (b.mode === "text")
          return (
            <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6">
              <Editable
                as="h2"
                editing={editing}
                className="text-[22px] font-black md:text-[30px]"
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
                className="mt-4 text-[15px] leading-[1.9] opacity-80"
                value={b.body}
                styleKey={`block.${s.key}.body`}
                textStyle={c.textStyles?.[`block.${s.key}.body`]}
                selected={ctx.selectedTextKey === `block.${s.key}.body`}
                onSelect={ctx.onSelectText}
                onChange={(v) => setBlock({ body: v })}
              />
            </EditFrame>
          );
        return (
          <div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt="" className="w-full object-cover" style={{ aspectRatio: "16/10" }} />
              <Overlay align="left">{heading}</Overlay>
            </div>
            <EditFrame ctx={ctx} idx={i} s={s} baseW={COL} className="px-6 pt-10">
              <Editable
                as="p"
                multiline
                editing={editing}
                className="text-[15px] leading-[1.9] opacity-80"
                value={b.body}
                styleKey={`block.${s.key}.body`}
                textStyle={c.textStyles?.[`block.${s.key}.body`]}
                selected={ctx.selectedTextKey === `block.${s.key}.body`}
                onSelect={ctx.onSelectText}
                onChange={(v) => setBlock({ body: v })}
              />
            </EditFrame>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // 이미지/오버레이 섹션은 자체 배경, 그 외 밴드는 s.bg (없으면 어둡게/밝게 번갈아)
  const imageLike = (s: SectionRef) =>
    (s.type === "hero" && c.hero.mode !== "text") ||
    s.type === "highlights" ||
    (s.type === "detail" && c.detail.mode !== "text") ||
    (s.type === "block" && s.block?.mode !== "text");

  const enabled = c.sections.filter((s) => s.enabled);

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {enabled.map((s) => {
        const i = c.sections.indexOf(s);
        const inner = renderSection(s, i);
        if (!inner) return null;
        if (imageLike(s)) {
          return (
            <section key={s.key || `${s.type}-${i}`} className="relative">
              {inner}
            </section>
          );
        }
        const bg = s.bg || c.theme.bg || "#ffffff";
        const onDark = isDarkHex(bg);
        const pad = sectionPad(s);
        return (
          <section
            key={s.key || `${s.type}-${i}`}
            className="relative"
            style={{
              background: bg,
              color: onDark ? "#fff" : undefined,
              paddingTop: pad,
              paddingBottom: pad,
            }}
          >
            {s.bgImage && (
              <div
                className="pointer-events-none absolute inset-0 opacity-100"
                style={{
                  backgroundImage: `url("${s.bgImage}")`,
                  backgroundSize: s.bgFit === "contain" ? "contain" : "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
            {inner}
            <PadHandles ctx={ctx} idx={i} s={s} />
          </section>
        );
      })}

      {!(heroCtaHidden && pricingCtaHidden) && (
        <div className="sticky bottom-0 z-40 flex items-center justify-between gap-4 border-t border-white/10 bg-black px-5 py-3 text-white md:px-10">
          <div className="min-w-0">
            <div className="truncate text-sm font-black md:text-base">
              {c.pricing.price}
              <span className="ml-2 text-xs font-normal line-through opacity-50">
                {c.pricing.compareAt}
              </span>
            </div>
          </div>
          <CtaLink
            ctx={ctx}
            className="shrink-0 px-7 py-3 text-sm font-black uppercase tracking-[0.12em]"
            style={{ background: primary }}
          />
        </div>
      )}
    </div>
  );
}
