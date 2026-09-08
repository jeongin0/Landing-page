"use client";

import { useRef } from "react";

type Props = {
  src: string;
  editing: boolean;
  widthPct?: number; // 20~100, 없으면 100
  aspect?: string; // 예: "4/3" 또는 "1.78" (숫자 문자열)
  imgClassName?: string;
  // pct = 폭 %, aspect = 가로세로 비율(w/h). 손잡이를 대각선으로 끌면 둘 다 바뀜.
  onResize?: (pct: number, aspect?: number) => void;
};

// 편집 모드에서 오른쪽 아래 손잡이를 드래그해 이미지 크기(폭 %)와 비율(가로세로)을 함께 조절.
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
    const parentRect = parent.getBoundingClientRect();

    const move = (ev: PointerEvent) => {
      // 폭: 이미지가 부모 안에서 가로 중앙 정렬 → xPct = (100 + pct) / 2
      const xPct = ((ev.clientX - parentRect.left) / parentRect.width) * 100;
      let nextPct = Math.round(2 * xPct - 100);
      nextPct = Math.max(20, Math.min(100, nextPct));

      // 비율: 박스 상단은 고정, 포인터 y 까지를 새 높이로 사용
      const top = boxRef.current?.getBoundingClientRect().top ?? parentRect.top;
      const widthPx = (parentRect.width * nextPct) / 100;
      const heightPx = Math.max(40, ev.clientY - top);
      let nextAspect = widthPx / heightPx;
      nextAspect = Math.max(0.3, Math.min(5, Math.round(nextAspect * 1000) / 1000));

      onResize(nextPct, nextAspect);
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
            title="드래그해서 이미지 크기·비율 조절"
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
