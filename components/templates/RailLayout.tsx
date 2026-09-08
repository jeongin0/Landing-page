"use client";

import type { SectionRef } from "@/lib/schema";
import Editable from "@/components/Editable";
import {
  type Ctx,
  tpOf,
  pad2,
  sectionPad,
  EditFrame,
  PadHandles,
  SplitDivider,
  SectionBgImage,
  SectionImage,
  FlexImage,
} from "./parts";

// ════════════════════════════════════════════════════════════
// RAIL — 풀스크린 미니멀 브랜드. 세리프 대형 제목, 넓은 여백,
// 헤어라인, 화면 끝까지 차는 긴 이미지. 사이드바 없음. 버튼 없음.
// ════════════════════════════════════════════════════════════

const SERIF: React.CSSProperties = {
  fontFamily: "'Nanum Myeongjo', ui-serif, Georgia, 'Times New Roman', serif",
};
const COL = 940;

export default function RailLayout({ ctx }: { ctx: Ctx }) {
  const { c, set, editing } = ctx;
  const tp = tpOf(ctx);
  const hair = "border-black/12";

  const H2 = (text: string, key: string, cls = "text-[28px] font-medium leading-[1.15] md:text-[40px]") => (
    <Editable
      as="h2"
      editing={editing}
      {...tp(key)}
      style={SERIF}
      className={cls}
      value={text}
      onChange={(v) => {
        if (key === "checklist.heading") set({ checklist: { ...c.checklist, heading: v } });
        else if (key === "steps.heading") set({ steps: { ...c.steps, heading: v } });
        else if (key === "detail.heading") set({ detail: { ...c.detail, heading: v } });
      }}
    />
  );

  const FullImage = ({
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

  const Text = ({
    s,
    i,
    children,
    center = true,
    narrow = COL,
  }: {
    s: SectionRef;
    i: number;
    children: React.ReactNode;
    center?: boolean;
    narrow?: number;
  }) => {
    const pad = sectionPad(s);
    const bgImgDark = !!s.bgImage && s.bgFit !== "contain";
    return (
      <section
        className="relative"
        style={{
          background: s.bgImage ? undefined : s.bg || undefined,
          color: bgImgDark ? "#fff" : undefined,
          paddingTop: pad,
          paddingBottom: pad,
        }}
      >
        <SectionBgImage s={s} />
        <EditFrame
          ctx={ctx}
          idx={i}
          s={s}
          baseW={narrow}
          className={"px-6 " + (center ? "text-center" : "")}
        >
          {children}
        </EditFrame>
        <PadHandles ctx={ctx} idx={i} s={s} />
      </section>
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
            className="mb-7 text-[11px] font-semibold uppercase tracking-[0.34em] opacity-45"
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
            className="mx-auto max-w-4xl text-[42px] font-medium leading-[1.05] tracking-[-0.01em] md:text-[76px]"
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
            className="mx-auto mt-7 max-w-md text-[14px] leading-[1.9] opacity-60"
            value={c.hero.subtitle}
            onChange={(v) => set({ hero: { ...c.hero, subtitle: v } })}
          />
        );
        return (
          <>
            <section
              className="relative px-6 text-center"
              style={{ paddingTop: sectionPad(s), paddingBottom: Math.round(sectionPad(s) * 0.7) }}
            >
              {eyebrow}
              {title}
              {c.hero.mode !== "image" && sub}
              <PadHandles ctx={ctx} idx={i} s={s} />
            </section>
            {c.hero.mode !== "text" && (
              <section className="relative">
                <FullImage
                  src={c.hero.image}
                  widthPct={c.hero.imageW}
                  onResize={(p) => set({ hero: { ...c.hero, imageW: p } })}
                />
              </section>
            )}
          </>
        );
      }

      case "highlights":
        return (
          <Text s={s} i={i} center={false}>
            <div className="flex flex-col md:flex-row">
              {c.highlights.map((h, hi) => (
                <div
                  key={hi}
                  className={
                    "flex-1 py-8 first:pt-0 last:pb-0 md:px-10 md:py-0 md:first:pl-0 md:last:pr-0 " +
                    (hi > 0 ? "border-t md:border-t-0 md:border-l " + hair : "")
                  }
                >
                  <div className="text-3xl opacity-25 md:text-5xl" style={SERIF}>
                    {pad2(hi + 1)}
                  </div>
                  <Editable
                    as="h3"
                    editing={editing}
                    {...tp("highlights.title")}
                    style={SERIF}
                    className="mt-4 text-[20px] font-medium md:text-[24px]"
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
                    className="mt-3 text-[13px] leading-[1.8] opacity-55"
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
          </Text>
        );

      case "checklist":
        return (
          <Text s={s} i={i}>
            {H2(c.checklist.heading, "checklist.heading", "text-[28px] font-medium md:text-[36px]")}
            <ul className="mx-auto mt-10 max-w-lg text-left">
              {c.checklist.items.map((it, ii) => (
                <li
                  key={ii}
                  className={
                    "flex gap-4 py-4 text-[14px] leading-[1.8] opacity-80 " +
                    (ii > 0 ? "border-t " + hair : "")
                  }
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
          </Text>
        );

      case "callout":
        return (
          <Text s={s} i={i}>
            <div className="mx-auto h-px w-12 bg-current opacity-30" />
            <Editable
              as="p"
              multiline
              editing={editing}
              {...tp("callout.text")}
              style={SERIF}
              className="mx-auto mt-8 max-w-2xl text-[28px] font-medium italic leading-[1.35] md:text-[44px]"
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
            <div className="mx-auto mt-8 h-px w-12 bg-current opacity-30" />
          </Text>
        );

      case "steps":
        return (
          <Text s={s} i={i}>
            {H2(c.steps.heading, "steps.heading", "text-[28px] font-medium md:text-[36px]")}
            <div className="mx-auto mt-10 max-w-2xl text-left">
              {c.steps.items.map((st, si) => (
                <div
                  key={si}
                  className={
                    "grid grid-cols-[56px_1fr] gap-6 py-7 " + (si > 0 ? "border-t " + hair : "")
                  }
                >
                  <div className="text-3xl opacity-25 md:text-4xl" style={SERIF}>
                    {pad2(si + 1)}
                  </div>
                  <div>
                    <Editable
                      as="div"
                      editing={editing}
                      {...tp("steps.title")}
                      style={SERIF}
                      className="text-[18px] font-medium md:text-[21px]"
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
                      className="mt-2 text-[13px] leading-[1.8] opacity-55"
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
          </Text>
        );

      case "detail": {
        if (c.detail.mode === "image")
          return (
            <section className="relative">
              <FullImage
                src={c.detail.image}
                widthPct={c.detail.imageW}
                onResize={(p) => set({ detail: { ...c.detail, imageW: p } })}
              />
            </section>
          );
        const text = (
          <>
            {H2(c.detail.heading, "detail.heading", "text-[26px] font-medium md:text-[34px]")}
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
        if (c.detail.mode === "text")
          return (
            <Text s={s} i={i} center={false} narrow={680}>
              {text}
            </Text>
          );
        const pct = s.splitPct ?? 50;
        return (
          <section
            className="relative"
            style={{ paddingTop: sectionPad(s), paddingBottom: sectionPad(s) }}
          >
            <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-6 md:flex-nowrap md:gap-0">
              <div style={{ flex: `1 1 ${pct}%` }} className="md:pr-12">
                <SectionImage
                  ctx={ctx}
                  k="detail"
                  natural={false}
                  imgClassName="w-full object-cover"
                  fallbackAspect="4/5"
                />
              </div>
              <div style={{ flex: `1 1 ${100 - pct}%` }} className="md:pl-12">
                {text}
              </div>
              <SplitDivider ctx={ctx} idx={i} s={s} />
            </div>
            <PadHandles ctx={ctx} idx={i} s={s} />
          </section>
        );
      }

      case "specs":
        return (
          <Text s={s} i={i} center={false} narrow={680}>
            <div>
              {c.specs.map((sp, si) => (
                <div
                  key={si}
                  className={
                    "flex items-baseline justify-between gap-8 py-4 " +
                    (si > 0 ? "border-t " + hair : "")
                  }
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
          </Text>
        );

      case "reviews":
        return (
          <Text s={s} i={i}>
            <div className="mx-auto max-w-2xl">
              {c.reviews.map((r, ri) => (
                <figure
                  key={ri}
                  className={"py-12 first:pt-0 " + (ri > 0 ? "border-t " + hair : "")}
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
                    className="mx-auto mt-2 max-w-xl text-[21px] font-medium leading-[1.55] md:text-[26px]"
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
          </Text>
        );

      case "pricing":
        return (
          <Text s={s} i={i}>
            <div className="flex items-baseline justify-center gap-4">
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
          </Text>
        );

      case "faq":
        return (
          <Text s={s} i={i} center={false} narrow={760}>
            <h2 className="text-center text-[28px] font-medium md:text-[36px]" style={SERIF}>
              자주 묻는 질문
            </h2>
            <div className="mt-10">
              {c.faq.map((f, fi) => (
                <div key={fi} className={"py-5 " + (fi > 0 ? "border-t " + hair : "")}>
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
          </Text>
        );

      case "block": {
        if (!s.block) return null;
        const b = s.block;
        const setBlock = (patch: Partial<typeof b>) =>
          ctx.setSection(i, { block: { ...b, ...patch } });
        if (b.mode === "image")
          return (
            <section className="relative">
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
              style={SERIF}
              className="text-[26px] font-medium md:text-[34px]"
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
        if (b.mode === "text")
          return (
            <Text s={s} i={i} center={b.align === "center"} narrow={680}>
              {text}
            </Text>
          );
        return (
          <>
            <Text s={s} i={i} center={b.align === "center"} narrow={680}>
              {text}
            </Text>
            <section className="relative">
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
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
      />
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
