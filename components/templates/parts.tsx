"use client";

import { useRef } from "react";
import type { StoreContent } from "@/lib/schema";
import Editable from "@/components/Editable";
import ResizableImage from "@/components/ResizableImage";

// 템플릿 렌더러들이 공유하는 편집 컨텍스트
export type Ctx = {
  c: StoreContent;
  set: (patch: Partial<StoreContent>) => void;
  editing: boolean;
  canResize: boolean;
  primary: string;
  selectedTextKey: string | null;
  onSelectText?: (key: string) => void;
};

// Editable 에 넘길 폰트/선택 관련 props 묶음
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

// 8자리 hex 방지 + primary 에 알파 붙이기
export const alpha = (hex: string, hh: string) => {
  const m = /^#?([0-9a-fA-F]{6})/.exec(hex || "");
  return m ? "#" + m[1] + hh : hex;
};

// 통이미지(자르지 않음) / 비율고정 이미지 공용 컴포넌트.
// natural=true → 원본 비율 그대로, 폭만 드래그로 조절.
// natural=false → ResizableImage(폭·비율 동시 조절).
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

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const base = wrapRef.current?.parentElement;
    if (!base || !onResize) return;
    const rect = base.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const xPct = ((ev.clientX - rect.left) / rect.width) * 100;
      onResize(Math.max(20, Math.min(100, Math.round(2 * xPct - 100))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div ref={wrapRef} className="relative mx-auto" style={{ width: `${w}%` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={"block w-full " + imgClassName} draggable={false} />
      {editing && canResize && (
        <span
          onPointerDown={startDrag}
          title="드래그해서 이미지 폭 조절"
          className="absolute -bottom-2 -right-2 z-10 h-6 w-6 cursor-ew-resize touch-none rounded-full border-2 border-white bg-gray-900 shadow-md"
        />
      )}
    </div>
  );
}

// hero / detail 이미지 (schema 의 image / imageW / imageAspect / mode 사용)
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

// CTA 링크 (문구는 클릭 편집)
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

export const pad2 = (n: number) => String(n).padStart(2, "0");
