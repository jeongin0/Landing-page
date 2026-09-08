"use client";

import { createElement, useEffect, useRef } from "react";
import { fontStack } from "@/lib/fonts";
import type { TextStyle } from "@/lib/schema";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
  multiline?: boolean;
  editing: boolean;
  // 폰트/크기 오버라이드용
  styleKey?: string;
  textStyle?: TextStyle;
  selected?: boolean;
  onSelect?: (key: string) => void;
};

// 클릭해서 바로 고치는 텍스트. editing=false면 그냥 표시만.
export default function Editable({
  value,
  onChange,
  className,
  as = "div",
  multiline = false,
  editing,
  styleKey,
  textStyle,
  selected,
  onSelect,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  // 포커스 중이 아닐 때만 외부 값 -> DOM 반영 (커서 튐 방지)
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  const cls =
    (className || "") +
    (editing
      ? " outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-sm hover:bg-blue-50/60 cursor-text transition"
      : "") +
    (editing && selected ? " ring-2 ring-violet-500 ring-offset-1" : "");

  const style: React.CSSProperties = {
    whiteSpace: multiline ? "pre-wrap" : undefined,
    fontFamily: fontStack(textStyle?.font),
    fontSize: textStyle?.size ? `${textStyle.size}px` : undefined,
  };

  return createElement(
    as,
    {
      // eslint-disable-next-line react-hooks/refs -- createElement 로 ref 전달 (false positive)
      ref,
      className: cls,
      contentEditable: editing,
      suppressContentEditableWarning: true,
      style,
      onClick:
        editing && styleKey && onSelect
          ? () => onSelect(styleKey)
          : undefined,
      onFocus:
        editing && styleKey && onSelect
          ? () => onSelect(styleKey)
          : undefined,
      onBlur: (e: React.FocusEvent<HTMLElement>) =>
        onChange(e.currentTarget.innerText),
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      },
    },
    value,
  );
}
