"use client";

import { useRef } from "react";

type Props = {
  src: string;
  editing: boolean;
  widthPct?: number; // 20~100, 없으면 100
  aspect?: string; // 예: "4/3"
  imgClassName?: string;
  onResize?: (pct: number) => void;
};

// 편집 모드에서 오른쪽 아래 손잡이를 드래그해 이미지 폭(%)을 조절.
// 폭이 100 미만이면 가로 중앙 정렬.
export default function ResizableImage({
  src,
  editing,
  widthPct = 100,
  aspect,
  imgClassName,
  onResize,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const pct = Math.max(20, Math.min(100, widthPct || 100));

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = boxRef.current?.parentElement;
    if (!parent || !onResize) return;
    const rect = parent.getBoundingClientRect();

    const move = (ev: PointerEvent) => {
      // 이미지가 부모 안에서 가로 중앙 정렬이므로
      // 포인터의 부모 대비 x비율(xPct)과 폭의 관계: xPct = (100 + pct) / 2
      const xPct = ((ev.clientX - rect.left) / rect.width) * 100;
      let next = Math.round(2 * xPct - 100);
      next = Math.max(20, Math.min(100, next));
      onResize(next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={boxRef}
      className="relative mx-auto"
      style={{ width: `${pct}%` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={imgClassName}
        style={aspect ? { aspectRatio: aspect } : undefined}
        draggable={false}
      />
      {editing && onResize && (
        <>
          <span
            onPointerDown={startDrag}
            title="드래그해서 이미지 크기 조절"
            className="absolute -bottom-2 -right-2 z-10 h-6 w-6 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-gray-900 shadow-md"
          />
          <span className="pointer-events-none absolute right-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {pct}%
          </span>
        </>
      )}
    </div>
  );
}
