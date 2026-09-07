"use client";

import { createElement, useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
  multiline?: boolean;
  editing: boolean;
};

// 클릭해서 바로 고치는 텍스트. editing=false면 그냥 표시만.
export default function Editable({
  value,
  onChange,
  className,
  as = "div",
  multiline = false,
  editing,
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
      : "");

  return createElement(
    as,
    {
      ref,
      className: cls,
      contentEditable: editing,
      suppressContentEditableWarning: true,
      style: { whiteSpace: multiline ? "pre-wrap" : undefined },
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
