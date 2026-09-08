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
  FlexImage,
  Stars,
} from "./parts";

// ════════════════════════════════════════════════════════════
// STRIP — 한국형 상세페이지. 긴 통이미지와 컬러 텍스트 밴드가
// 번갈아 흐름. POINT 라벨, 두꺼운 헤드라인. 구매 버튼 없음.
// ════════════════════════════════════════════════════════════

const COL = 620;

export default function StripLayout({ ctx }: { ctx: Ctx }) {
  const { c, set, editing, primary } = ctx;
  const tp = tpOf(ctx);

  const Pill = ({ children, onDark }: { children: React.ReactNode; onDark: boolean }) => (
    <span
      className="inline-block rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em]"
      style={
        onDark
          ? { background: "#fff", color: "#111" }
          : { background: primary, color: "#fff" }
      }
    >
      {children}
    </span>
  );

  // 긴 통이미지 (자르지 않음, 화면 끝까지)
  const LongImage = ({
    src,
    widthPct,
    onResize,
  }: {
    src: string;
    widthPct?: number;
    onResize?: (p: number) => void;
  }) => (
    <FlexImage
      src={src}
      widthPct={widthPct}
      natural
      editing={editing}
      canResize={ctx.canResize}
      imgClassName=""
      fallbackAspect="1/1"
      onResize={onResize}
    />
  );

  // 컬러 텍스트 밴드
  const Band = ({
    s,
    i,
    onDark,
    children,
    narrow = COL,
  }: {
    s: SectionRef;
    i: number;
    onDark: boolean;
    children: React.ReactNode;
    narrow?: number;
  }) => {
    const pad = sectionPad(s);
    return (
      <section
        className="relative"
        style={{
          background: s.bg || c.theme.bg || "#ffffff",
          color: onDark ? "#fff" : undefined,
          paddingTop: pad,
          paddingBottom: pad,
        }}
      >
        <EditFrame ctx={ctx} idx={i} s={s} baseW={narrow} className="px-6 text-center">
          {children}
        </EditFrame>
        <PadHandles ctx={ctx} idx={i} s={s} />
      </section>
    );
  };

  const onDarkOf = (s: SectionRef) => isDarkHex(s.bg);

  const renderSection = (s: SectionRef, i: number): React.ReactNode => {
    const onDark = onDarkOf(s);

    switch (s.type) {
      case "hero": {
        const txt = (
          <>
            {c.hero.badge && (
              <div className="mb-5">
                <Editable
                  as="span"
                  editing={editing}
                  value={c.hero.badge}
                  {...tp("hero.badge")}
                  className="inline-block rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em]"
                  style={onDark ? { background: "#fff", color: "#111" } : { background: primary, color: "#fff" }}
                  onChange={(v) => set({ hero: { ...c.hero, badge: v } })}
                />
              </div>
            )}
            <Editable
              as="h1"
              multiline
              editing={editing}
              {...tp("hero.title")}
              className="text-[32px] font-black leading-[1.15] tracking-tight md:text-[54px]"
              value={c.hero.title}
              onChange={(v) => set({ hero: { ...c.hero, title: v } })}
            />
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("hero.subtitle")}
              className="mx-auto mt-5 max-w-lg text-[14px] leading-relaxed md:text-base"
              style={{ opacity: onDark ? 0.85 : 0.62 }}
              value={c.hero.subtitle}
              onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
            />
          </>
        );
        if (c.hero.mode === "image")
          return (
            <section className="relative">
              <LongImage
                src={c.hero.image}
                widthPct={c.hero.imageW}
                onResize={(p) => set({ hero: { ...c.hero, imageW: p } })}
              />
            </section>
          );
        if (c.hero.mode === "text")
          return (
            <Band s={s} i={i} onDark={onDark} narrow={860}>
              {txt}
            </Band>
          );
        return (
          <>
            <Band s={s} i={i} onDark={onDark} narrow={860}>
              {txt}
            </Band>
            <section className="relative">
              <LongImage
                src={c.hero.image}
                widthPct={c.hero.imageW}
                onResize={(p) => set({ hero: { ...c.hero, imageW: p } })}
              />
            </section>
          </>
        );
      }

      // 강점: [POINT 라벨 + 제목 + 설명 밴드] → [긴 이미지] 반복
      case "highlights":
        return (
          <>
            {c.highlights.map((h, hi) => {
              const bandBg =
                hi % 2 === 0 ? s.bg || c.theme.bg || "#fff" : alpha(primary, "0f");
              const d = isDarkHex(bandBg);
              const pad = sectionPad(s);
              return (
                <div key={hi}>
                  <section
                    className="relative"
                    style={{
                      background: bandBg,
                      color: d ? "#fff" : undefined,
                      paddingTop: pad,
                      paddingBottom: h.iconImage ? Math.round(pad * 0.55) : pad,
                    }}
                  >
                    <div className="mx-auto max-w-[620px] px-6 text-center">
                      <Pill onDark={d}>Point {pad2(hi + 1)}</Pill>
                      <Editable
                        as="h3"
                        editing={editing}
                        {...tp("highlights.title")}
                        className="mt-4 text-[24px] font-black leading-tight md:text-[34px]"
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
                        className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed md:text-[15px]"
                        style={{ opacity: d ? 0.85 : 0.66 }}
                        value={h.desc}
                        onChange={(v) => {
                          const highlights = [...c.highlights];
                          highlights[hi] = { ...h, desc: v };
                          set({ highlights });
                        }}
                      />
                    </div>
                  </section>
                  {h.iconImage && (
                    <section className="relative" style={{ background: bandBg }}>
                      <div className="mx-auto" style={{ maxWidth: 900 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={h.iconImage} alt="" className="block w-full" draggable={false} />
                      </div>
                    </section>
                  )}
                </div>
              );
            })}
          </>
        );

      case "callout":
        return (
          <Band s={s} i={i} onDark={onDark} narrow={880}>
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("callout.text")}
              className="text-[28px] font-black leading-[1.15] md:text-[44px]"
              value={c.callout.text}
              onChange={(v) => set({ callout: { ...c.callout, text: v } })}
            />
            {(c.callout.sub || editing) && (
              <Editable
                as="p"
                editing={editing}
                {...tp("callout.sub")}
                className="mx-auto mt-5 max-w-md text-sm font-bold uppercase tracking-[0.2em]"
                style={{ opacity: 0.7 }}
                value={c.callout.sub}
                onChange={(v) => set({ callout: { ...c.callout, sub: v } })}
              />
            )}
          </Band>
        );

      case "checklist":
        return (
          <Band s={s} i={i} onDark={onDark}>
            <Pill onDark={onDark}>Check</Pill>
            <Editable
              as="h2"
              editing={editing}
              {...tp("checklist.heading")}
              className="mt-4 text-[24px] font-black leading-tight md:text-[34px]"
              value={c.checklist.heading}
              onChange={(v) => set({ checklist: { ...c.checklist, heading: v } })}
            />
            <ul className="mx-auto mt-8 max-w-md text-left">
              {c.checklist.items.map((it, ii) => (
                <li
                  key={ii}
                  className="flex items-start gap-4 border-t border-current/15 py-4 first:border-t-0"
                >
                  <span className="mt-0.5 text-lg font-black" style={{ color: onDark ? "#fff" : primary }}>
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
          </Band>
        );

      case "steps":
        return (
          <Band s={s} i={i} onDark={onDark}>
            <Pill onDark={onDark}>Step</Pill>
            <Editable
              as="h2"
              editing={editing}
              {...tp("steps.heading")}
              className="mt-4 text-[24px] font-black leading-tight md:text-[34px]"
              value={c.steps.heading}
              onChange={(v) => set({ steps: { ...c.steps, heading: v } })}
            />
            <div className="mx-auto mt-8 max-w-lg text-left">
              {c.steps.items.map((st, si) => (
                <div
                  key={si}
                  className="flex gap-5 border-t border-current/15 py-6 first:border-t-0"
                >
                  <div
                    className="text-[36px] font-black leading-none tabular-nums"
                    style={{ color: onDark ? "#fff" : primary, opacity: onDark ? 0.9 : 1 }}
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
                      className="mt-1.5 text-sm leading-relaxed"
                      style={{ opacity: 0.7 }}
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
          </Band>
        );

      case "detail": {
        if (c.detail.mode === "image")
          return (
            <section className="relative">
              <LongImage
                src={c.detail.image}
                widthPct={c.detail.imageW}
                onResize={(p) => set({ detail: { ...c.detail, imageW: p } })}
              />
            </section>
          );
        const head = (
          <>
            <Pill onDark={onDark}>Detail</Pill>
            <Editable
              as="h2"
              editing={editing}
              {...tp("detail.heading")}
              className="mt-4 text-[24px] font-black leading-tight md:text-[34px]"
              value={c.detail.heading}
              onChange={(v) => set({ detail: { ...c.detail, heading: v } })}
            />
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("detail.body")}
              className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.9] md:text-[17px]"
              style={{ opacity: 0.78 }}
              value={c.detail.body}
              onChange={(v) => set({ detail: { ...c.detail, body: v } })}
            />
          </>
        );
        if (c.detail.mode === "text")
          return (
            <Band s={s} i={i} onDark={onDark}>
              {head}
            </Band>
          );
        return (
          <>
            <Band s={s} i={i} onDark={onDark}>
              {head}
            </Band>
            <section className="relative" style={{ background: s.bg || c.theme.bg }}>
              <LongImage
                src={c.detail.image}
                widthPct={c.detail.imageW}
                onResize={(p) => set({ detail: { ...c.detail, imageW: p } })}
              />
            </section>
          </>
        );
      }

      case "specs":
        return (
          <Band s={s} i={i} onDark={onDark}>
            <Pill onDark={onDark}>제품 정보</Pill>
            <div className="mx-auto mt-6 max-w-md text-left">
              {c.specs.map((sp, si) => (
                <div
                  key={si}
                  className="flex justify-between border-t border-current/15 py-4 text-sm first:border-t-0 md:text-base"
                >
                  <Editable
                    as="span"
                    editing={editing}
                    {...tp("specs.label")}
                    className="font-black"
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
                    style={{ opacity: 0.7 }}
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
          </Band>
        );

      case "reviews":
        return (
          <Band s={s} i={i} onDark={onDark} narrow={720}>
            <Pill onDark={onDark}>Review</Pill>
            <div className="mx-auto mt-7 max-w-xl text-left">
              {c.reviews.map((r, ri) => (
                <div
                  key={ri}
                  className="border-t border-current/15 py-6 first:border-t-0"
                >
                  <Stars className="text-sm" />
                  <Editable
                    as="p"
                    multiline
                    editing={editing}
                    {...tp("reviews.text")}
                    className="mt-2 text-[15px] font-bold leading-relaxed md:text-[17px]"
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
                    className="mt-3 text-xs font-black uppercase tracking-[0.18em]"
                    style={{ opacity: 0.5 }}
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
          </Band>
        );

      case "pricing":
        return (
          <Band s={s} i={i} onDark={onDark} narrow={620}>
            <div className="flex items-end justify-center gap-3">
              <Editable
                as="span"
                editing={editing}
                {...tp("pricing.price")}
                className="text-[46px] font-black leading-none md:text-[64px]"
                value={c.pricing.price}
                onChange={(v) => set({ pricing: { ...c.pricing, price: v } })}
              />
              <Editable
                as="span"
                editing={editing}
                {...tp("pricing.compareAt")}
                className="pb-2 text-lg line-through"
                style={{ opacity: 0.4 }}
                value={c.pricing.compareAt}
                onChange={(v) => set({ pricing: { ...c.pricing, compareAt: v } })}
              />
            </div>
            <Editable
              as="p"
              editing={editing}
              {...tp("pricing.note")}
              className="mt-3 text-sm font-bold uppercase tracking-[0.14em]"
              style={{ opacity: 0.7 }}
              value={c.pricing.note}
              onChange={(v) => set({ pricing: { ...c.pricing, note: v } })}
            />
          </Band>
        );

      case "faq":
        return (
          <Band s={s} i={i} onDark={onDark} narrow={720}>
            <Pill onDark={onDark}>FAQ</Pill>
            <div className="mx-auto mt-7 max-w-xl text-left">
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
                    className="mt-2 text-sm leading-relaxed"
                    style={{ opacity: 0.7 }}
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
          </Band>
        );

      case "block": {
        if (!s.block) return null;
        const b = s.block;
        const setBlock = (patch: Partial<typeof b>) =>
          ctx.setSection(i, { block: { ...b, ...patch } });
        if (b.mode === "image")
          return (
            <section className="relative" style={{ background: s.bg || c.theme.bg }}>
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
              <PadHandles ctx={ctx} idx={i} s={s} />
            </section>
          );
        const text = (
          <>
            <Editable
              as="h2"
              editing={editing}
              className="text-[22px] font-black leading-tight md:text-[32px]"
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
              className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.9]"
              style={{ opacity: 0.78 }}
              value={b.body}
              styleKey={`block.${s.key}.body`}
              textStyle={c.textStyles?.[`block.${s.key}.body`]}
              selected={ctx.selectedTextKey === `block.${s.key}.body`}
              onSelect={ctx.onSelectText}
              onChange={(v) => setBlock({ body: v })}
            />
          </>
        );
        if (b.mode === "text")
          return (
            <Band s={s} i={i} onDark={onDark}>
              {text}
            </Band>
          );
        return (
          <>
            <Band s={s} i={i} onDark={onDark}>
              {text}
            </Band>
            <section className="relative" style={{ background: s.bg || c.theme.bg }}>
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
            </section>
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {c.sections.map((s) => {
        if (!s.enabled) return null;
        const i = c.sections.indexOf(s);
        const inner = renderSection(s, i);
        if (!inner) return null;
        return <div key={s.key || `${s.type}-${i}`}>{inner}</div>;
      })}
    </div>
  );
}
