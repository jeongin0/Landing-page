"use client";

import { useRef } from "react";
import type { StoreContent, SectionType } from "@/lib/schema";
import { WIDTH_PX } from "@/lib/schema";
import Editable from "@/components/Editable";
import ResizableImage from "@/components/ResizableImage";

type Props = {
  content: StoreContent;
  onChange?: (next: StoreContent) => void;
  editing: boolean;
  /** 이미지 크기 조절 허용 (Pro 이상). 기본 false */
  canResize?: boolean;
};

export default function StoreProduct({ content, onChange, editing, canResize = false }: Props) {
  const c = content;
  const set = (patch: Partial<StoreContent>) => onChange?.({ ...c, ...patch });
  const style = c.style || "classic";

  // 2열 레이아웃(클래식 히어로·상세): 이미지 열이 차지하는 비율(%)을 드래그로 조절
  const heroRowRef = useRef<HTMLDivElement>(null);
  const detailRowRef = useRef<HTMLDivElement>(null);
  const heroSplit = c.hero.splitPct ?? 50;
  const detailSplit = c.detail.splitPct ?? 50;

  const makeSplitDrag =
    (
      rowRef: React.RefObject<HTMLDivElement | null>,
      imageSide: "left" | "right",
      apply: (pct: number) => void,
    ) =>
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const row = rowRef.current;
      if (!row || !onChange) return;
      const rect = row.getBoundingClientRect();
      const move = (ev: PointerEvent) => {
        const raw =
          imageSide === "right"
            ? ((rect.right - ev.clientX) / rect.width) * 100
            : ((ev.clientX - rect.left) / rect.width) * 100;
        apply(Math.max(30, Math.min(75, Math.round(raw))));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };

  const startHeroSplit = makeSplitDrag(heroRowRef, "right", (p) =>
    set({ hero: { ...c.hero, splitPct: p } }),
  );
  const startDetailSplit = makeSplitDrag(detailRowRef, "left", (p) =>
    set({ detail: { ...c.detail, splitPct: p } }),
  );

  // 열 경계에 놓는 세로 드래그 손잡이
  const splitHandle = (
    onDown: (e: React.PointerEvent) => void,
    side: "left" | "right",
  ) =>
    editing && canResize ? (
      <span
        onPointerDown={onDown}
        title="드래그해서 이미지 영역 넓히기 / 좁히기"
        className={
          "absolute top-1/2 z-10 hidden h-16 w-2.5 -translate-y-1/2 cursor-ew-resize touch-none rounded-full bg-gray-900/70 md:block " +
          (side === "left" ? "-left-5" : "-right-5")
        }
      />
    ) : null;

  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 960)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];
  const wrap = "w-full px-5";

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

  const heroImg = (extra: string, aspect: string) => (
    <div className={extra}>
      <ResizableImage
        src={c.hero.image}
        editing={editing}
        widthPct={c.hero.imageW ?? 100}
        aspect={c.hero.imageAspect ? String(c.hero.imageAspect) : aspect}
        imgClassName="w-full rounded-2xl object-cover shadow-lg"
        onResize={
          canResize
            ? (p, a) =>
                set({
                  hero: { ...c.hero, imageW: p, ...(a != null ? { imageAspect: a } : {}) },
                })
            : undefined
        }
      />
    </div>
  );
  const detailImg = (extra: string, aspect: string) => (
    <div className={extra}>
      <ResizableImage
        src={c.detail.image}
        editing={editing}
        widthPct={c.detail.imageW ?? 100}
        aspect={c.detail.imageAspect ? String(c.detail.imageAspect) : aspect}
        imgClassName="w-full rounded-2xl object-cover shadow-lg"
        onResize={
          canResize
            ? (p, a) =>
                set({
                  detail: { ...c.detail, imageW: p, ...(a != null ? { imageAspect: a } : {}) },
                })
            : undefined
        }
      />
    </div>
  );

  // ── HERO ── 스타일별로 완전히 다르게
  const hero =
    style === "spotlight" ? (
      <section className={wrap + " py-16 text-center"}>
        {heroImg("mb-10", "16/9")}
        {badge}
        {heroTitle}
        {heroSub}
        <div className="mt-8">{ctaBtn(true)}</div>
      </section>
    ) : style === "editorial" ? (
      <section className={wrap + " py-14"}>
        {badge}
        {heroTitle}
        {heroSub}
        <div className="mt-6">{ctaBtn()}</div>
        {heroImg("mt-10", "21/9")}
      </section>
    ) : (
      <section className={wrap + " py-14"}>
        <div
          ref={heroRowRef}
          className="md:grid md:items-center md:gap-10"
          style={{ gridTemplateColumns: `${100 - heroSplit}fr ${heroSplit}fr` }}
        >
          <div>
            {badge}
            {heroTitle}
            {heroSub}
            <div className="mt-6">{ctaBtn()}</div>
          </div>
          <div className="relative mt-8 md:mt-0">
            {splitHandle(startHeroSplit, "left")}
            {heroImg("", "4/3")}
          </div>
        </div>
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
      <section className={wrap + " py-12"}>
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
      <section className={wrap + " py-12"}>
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
      <section className={wrap + " py-10"}>
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
      <section className={wrap + " py-14"}>
        <Editable as="h2" editing={editing}
          className={`text-center text-2xl font-extrabold ${headingFont}`}
          value={c.detail.heading}
          onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
        {detailImg("my-8", "16/9")}
        <Editable as="p" multiline editing={editing} className="opacity-80"
          value={c.detail.body}
          onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
      </section>
    ) : (
      <section className={wrap + " py-14"}>
        <div
          ref={detailRowRef}
          className="md:grid md:items-center md:gap-10"
          style={{ gridTemplateColumns: `${detailSplit}fr ${100 - detailSplit}fr` }}
        >
          <div className="relative">
            {splitHandle(startDetailSplit, "right")}
            {detailImg("", "4/3")}
          </div>
          <div className="mt-8 md:mt-0">
            <Editable as="h2" editing={editing} className={"text-2xl font-extrabold " + headingFont}
              value={c.detail.heading}
              onChange={(v) => set({ detail: { ...c.detail, heading: v } })} />
            <Editable as="p" multiline editing={editing} className="mt-4 opacity-80"
              value={c.detail.body}
              onChange={(v) => set({ detail: { ...c.detail, body: v } })} />
          </div>
        </div>
      </section>
    );

  const specs = (
    <section className={wrap + " py-10"}>
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
  );

  const reviews = (
    <section className={wrap + " py-10"}>
      <h2 className={`mb-6 text-center text-2xl font-extrabold ${headingFont}`}>고객 후기</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {c.reviews.map((r, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-black/5 p-6 shadow-sm">
            <div className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <Editable as="p" multiline editing={editing} className="mt-2 flex-1 text-sm" value={r.text}
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
    <section id="pricing" className={wrap + " py-14 text-center"}>
      <div className="rounded-3xl border border-black/5 p-10 shadow-sm">
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
    <section className={wrap + " py-10"}>
      <h2 className={`mb-6 text-2xl font-extrabold ${headingFont}`}>자주 묻는 질문</h2>
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
  );

  const map: Record<SectionType, React.ReactNode> = {
    hero, highlights, detail, specs, reviews, pricing, faq,
  };

  return (
    <div style={{ background: c.theme.bg, color: c.theme.text }}>
      {c.sections
        .filter((s) => s.enabled)
        .map((s, i) => (
          <div
            key={s.type + i}
            style={{ maxWidth: s.w ? WIDTH_PX[s.w] : maxW, margin: "0 auto" }}
          >
            {map[s.type]}
          </div>
        ))}
    </div>
  );
}
