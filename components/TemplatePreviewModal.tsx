"use client";

import { useMemo } from "react";
import { makePreset } from "@/lib/presets";
import { normalizeContent } from "@/lib/schema";
import { SECTION_LABELS } from "@/lib/schema";
import StoreProduct from "@/components/templates/StoreProduct";

type Props = {
  presetId: string;
  label: string;
  desc: string;
  busy?: boolean;
  onClose: () => void;
  onPick: () => void;
};

export default function TemplatePreviewModal({
  presetId,
  label,
  desc,
  busy,
  onClose,
  onPick,
}: Props) {
  const content = useMemo(
    () => normalizeContent(makePreset(presetId)),
    [presetId],
  );
  const flow = content.sections
    .filter((s) => s.enabled)
    .map((s) =>
      s.type === "block" ? s.block?.heading || "자유 블록" : SECTION_LABELS[s.type],
    );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/50 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
          <div className="min-w-0">
            <div className="truncate font-bold">{label}</div>
            <div className="truncate text-xs text-gray-500">{desc}</div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold"
            >
              닫기
            </button>
            <button
              onClick={onPick}
              disabled={busy}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {busy ? "만드는 중…" : "이 템플릿으로 시작"}
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-2.5">
          <div className="flex flex-wrap gap-1.5">
            {flow.map((name, i) => (
              <span
                key={i}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600"
              >
                {i + 1}. {name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="mx-auto w-full max-w-[1000px] overflow-hidden rounded-lg bg-white shadow">
            <StoreProduct content={content} editing={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
