"use client";

import type { StoreContent, SectionRef } from "@/lib/schema";
import { clampStyle } from "@/lib/schema";
import type { Ctx } from "./parts";
import StripLayout from "./StripLayout";
import RailLayout from "./RailLayout";
import BentoLayout from "./BentoLayout";

type Props = {
  content: StoreContent;
  onChange?: (next: StoreContent) => void;
  editing: boolean;
  canResize?: boolean;
  selectedTextKey?: string | null;
  onSelectText?: (key: string) => void;
};

export default function StoreProduct({
  content,
  onChange,
  editing,
  canResize = false,
  selectedTextKey = null,
  onSelectText,
}: Props) {
  const c = content;
  const set = (patch: Partial<StoreContent>) => onChange?.({ ...c, ...patch });
  const setSection = (idx: number, patch: Partial<SectionRef>) => {
    const sections = c.sections.map((x, i) => (i === idx ? { ...x, ...patch } : x));
    onChange?.({ ...c, sections });
  };

  const ctx: Ctx = {
    c,
    set,
    setSection,
    editing,
    // 이미지/폭/여백/비율 드래그는 편집 모드면 항상 사용 가능
    canResize: editing || canResize,
    primary: c.theme.primary || "#111827",
    selectedTextKey,
    onSelectText,
  };

  const style = clampStyle(c.style);
  if (style === "editorial") return <RailLayout ctx={ctx} />;
  if (style === "showcase") return <BentoLayout ctx={ctx} />;
  return <StripLayout ctx={ctx} />;
}
