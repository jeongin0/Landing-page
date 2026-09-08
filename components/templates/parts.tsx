"use client";

import { useRef } from "react";
import type { StoreContent, SectionRef } from "@/lib/schema";
import { PAD_PX, clampSectionPx, clampPadPx, clampSplitPct } from "@/lib/schema";
import Editable from "@/components/Editable";
import ResizableImage from "@/components/ResizableImage";

// 템플릿 렌더러들이 공유하는 편집 컨텍스트
export type Ctx = {
  c: StoreContent;
  set: (patch: Partial<StoreContent>) => void;
  setSection: (idx: number, patch: Partial<SectionRef>) => void;
  editing: boolean;
  canResize: boolean;
  primary: string;
  selectedTextKey: string | null;
  onSelectText?: (key: string) => void;
};

export const tpOf =
  (ctx: Ctx) =>
  (key: string) => ({
    styleKey: key,
    textStyle: ctx.c.textStyles?.[key],
    selected: ctx.selectedTextKey === key,
    onSelect: ctx.onSelectText,
  });

export function isDarkHex(hex?: string): boolean {
  if (!hex) return false;
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

export const alpha = (hex: string, hh: string) => {
  const m = /^#?([0-9a-fA-F]{6})/.exec(hex || "");
  return m ? "#" + m[1] + hh : hex;
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

// ── 드래그 공용 ─────────────────────────────────────────────
export function startDrag(
  e: React.PointerEvent,
  onMove: (dx: number, dy: number, ev: PointerEvent) => void,
) {
  e.preventDefault();
  e.stopPropagation();
  const sx = e.clientX;
  const sy = e.clientY;
  const mv = (ev: PointerEvent) => onMove(ev.clientX - sx, ev.clientY - sy, ev);
  const up = () => {
    window.removeEventListener("pointermove", mv);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", mv);
  window.addEventListener("pointerup", up);
}

const HANDLE =
  "absolute z-30 touch-none rounded-full border-2 border-white bg-gray-900 shadow-md";

// 섹션 상하 여백 드래그 (섹션 <section> 안에 절대배치)
export function PadHandles({
  ctx,
  idx,
  s,
}: {
  ctx: Ctx;
  idx: number;
  s: SectionRef;
}) {
  if (!ctx.editing) return null;
  const base = PAD_PX[s.pad ?? "normal"];
  const cur = s.padPx ?? base;
  return (
    <>
      <span
        title="드래그해서 위쪽 여백 조절"
        onPointerDown={(e) => {
          const start = cur;
          startDrag(e, (_dx, dy) =>
            ctx.setSection(idx, { padPx: clampPadPx(start + dy) }),
          );
        }}
        className={HANDLE + " left-1/2 top-1 h-2.5 w-10 -translate-x-1/2 cursor-ns-resize rounded-sm"}
      />
      <span
        title="드래그해서 아래쪽 여백 조절"
        onPointerDown={(e) => {
          const start = cur;
          startDrag(e, (_dx, dy) =>
            ctx.setSection(idx, { padPx: clampPadPx(start - dy) }),
          );
        }}
        className={HANDLE + " bottom-1 left-1/2 h-2.5 w-10 -translate-x-1/2 cursor-ns-resize rounded-sm"}
      />
    </>
  );
}

// 섹션 콘텐츠 폭 드래그 프레임. baseW = 이 레이아웃의 기본 폭.
export function EditFrame({
  ctx,
  idx,
  s,
  baseW,
  className = "",
  style,
  children,
}: {
  ctx: Ctx;
  idx: number;
  s: SectionRef;
  baseW: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const w = s.wPx ?? baseW;
  return (
    <div
      className={"relative mx-auto " + className}
      style={{ maxWidth: w, ...style }}
    >
      {children}
      {ctx.editing && (
        <span
          title="드래그해서 섹션 폭 조절"
          onPointerDown={(e) => {
            const start = w;
            startDrag(e, (dx) =>
              ctx.setSection(idx, { wPx: clampSectionPx(start + dx * 2) }),
            );
          }}
          className={
            HANDLE +
            " right-0 top-1/2 h-12 w-2.5 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-sm"
          }
        />
      )}
    </div>
  );
}

// 이미지 / 텍스트 사이 드래그 구분자 (splitPct 갱신)
export function SplitDivider({
  ctx,
  idx,
  s,
}: {
  ctx: Ctx;
  idx: number;
  s: SectionRef;
}) {
  if (!ctx.editing) return null;
  return (
    <span
      title="드래그해서 이미지 : 텍스트 비율 조절"
      onPointerDown={(e) => {
        const parent = (e.currentTarget as HTMLElement).parentElement;
        const pw = parent?.getBoundingClientRect().width || 800;
        const start = s.splitPct ?? 50;
        startDrag(e, (dx) =>
          ctx.setSection(idx, {
            splitPct: clampSplitPct(start + (dx / pw) * 100),
          }),
        );
      }}
      className={
        HANDLE +
        " left-1/2 top-1/2 h-14 w-2.5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-sm"
      }
    />
  );
}

// 통이미지(자르지 않음) / 비율고정 이미지 공용
export function FlexImage({
  src,
  widthPct,
  aspect,
  natural,
  editing,
  canResize,
  onResize,
  imgClassName,
  fallbackAspect,
}: {
  src: string;
  widthPct?: number;
  aspect?: number;
  natural: boolean;
  editing: boolean;
  canResize: boolean;
  onResize?: (pct: number, aspect?: number) => void;
  imgClassName: string;
  fallbackAspect: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const w = Math.max(20, Math.min(100, widthPct ?? 100));

  if (!natural) {
    return (
      <ResizableImage
        src={src}
        editing={editing}
        widthPct={w}
        aspect={aspect ? String(aspect) : fallbackAspect}
        imgClassName={imgClassName}
        onResize={canResize ? onResize : undefined}
      />
    );
  }

  return (
    <div ref={wrapRef} className="relative mx-auto" style={{ width: `${w}%` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={"block w-full " + imgClassName} draggable={false} />
      {editing && canResize && onResize && (
        <span
          onPointerDown={(e) => {
            const base = wrapRef.current?.parentElement?.getBoundingClientRect();
            const start = w;
            const bw = base?.width || 1;
            startDrag(e, (dx) =>
              onResize(Math.max(20, Math.min(100, Math.round(start + (dx / bw) * 200)))),
            );
          }}
          title="드래그해서 이미지 폭 조절"
          className="absolute -bottom-2 -right-2 z-10 h-6 w-6 cursor-ew-resize touch-none rounded-full border-2 border-white bg-gray-900 shadow-md"
        />
      )}
    </div>
  );
}

// hero / detail 이미지
export function SectionImage({
  ctx,
  k,
  natural,
  imgClassName,
  fallbackAspect,
}: {
  ctx: Ctx;
  k: "hero" | "detail";
  natural: boolean;
  imgClassName: string;
  fallbackAspect: string;
}) {
  const cur = ctx.c[k];
  return (
    <FlexImage
      src={cur.image}
      widthPct={cur.imageW}
      aspect={cur.imageAspect}
      natural={natural}
      editing={ctx.editing}
      canResize={ctx.canResize}
      imgClassName={imgClassName}
      fallbackAspect={fallbackAspect}
      onResize={(p, a) =>
        ctx.set({
          [k]: { ...cur, imageW: p, ...(a != null ? { imageAspect: a } : {}) },
        } as Partial<StoreContent>)
      }
    />
  );
}

export function CtaLink({
  ctx,
  className,
  style,
}: {
  ctx: Ctx;
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <a href={ctx.c.cta.href || "#"} className={className} style={style}>
      <Editable
        as="span"
        editing={ctx.editing}
        value={ctx.c.cta.text}
        styleKey="cta.text"
        textStyle={ctx.c.textStyles?.["cta.text"]}
        selected={ctx.selectedTextKey === "cta.text"}
        onSelect={ctx.onSelectText}
        onChange={(v) => ctx.set({ cta: { ...ctx.c.cta, text: v } })}
      />
    </a>
  );
}

export const Stars = ({ className = "" }: { className?: string }) => (
  <div className={"tracking-[0.15em] text-amber-400 " + className}>★★★★★</div>
);

// 섹션 상하 여백값 (px)
export const sectionPad = (s: SectionRef) => s.padPx ?? PAD_PX[s.pad ?? "normal"];
