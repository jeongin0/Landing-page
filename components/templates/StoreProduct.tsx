"use client";

import type { StoreContent } from "@/lib/schema";
import { WIDTH_PX, PAD_PX, clampStyle } from "@/lib/schema";
import { type Ctx, isDarkHex } from "./parts";
import { renderBold } from "./BoldTemplate";
import { renderEditorial } from "./EditorialTemplate";
import { renderShowcase } from "./ShowcaseTemplate";

type Props = {
  content: StoreContent;
  onChange?: (next: StoreContent) => void;
  editing: boolean;
  canResize?: boolean;
  selectedTextKey?: string | null;
  onSelectText?: (key: string) => void;
};

const RENDERERS = {
  bold: renderBold,
  editorial: renderEditorial,
  showcase: renderShowcase,
} as const;

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
  const primary = c.theme.primary || "#2563eb";
  const style = clampStyle(c.style);
  const renderInner = RENDERERS[style];

  const ctx: Ctx = {
    c,
    set,
    editing,
    canResize,
    primary,
    selectedTextKey,
    onSelectText,
  };

  const maxW =
    c.layout.width === "custom"
      ? Math.max(320, c.layout.customPx || 720)
      : WIDTH_PX[c.layout.width as Exclude<typeof c.layout.width, "custom">];

  return (
    <div
      style={{ background: c.theme.bg, color: c.theme.text }}
      data-style={style}
    >
      {style === "editorial" && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
        />
      )}
      {c.sections.map((s, i) => {
        if (!s.enabled) return null;
        const hasBgImg = !!s.bgImage;
        const contain = s.bgFit === "contain";
        const onDark = isDarkHex(s.bg) || (hasBgImg && !contain);
        const inner = renderInner(s, i, onDark, ctx);
        if (!inner) return null;
        const pad = PAD_PX[s.pad ?? "normal"];
        const sw = s.w ? WIDTH_PX[s.w] : maxW;
        return (
          <section
            key={s.key || `${s.type}-${i}`}
            className="relative"
            style={{
              background: s.bg || undefined,
              color: onDark ? "#ffffff" : undefined,
              paddingTop: pad,
              paddingBottom: pad,
            }}
          >
            {hasBgImg && (
              <>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `url("${s.bgImage}")`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: contain ? "contain" : "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: s.bgFixed ? "fixed" : undefined,
                  }}
                />
                {!contain && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: s.bg || "rgba(0,0,0,.4)" }}
                  />
                )}
              </>
            )}
            <div className="relative mx-auto px-5" style={{ maxWidth: sw }}>
              {inner}
            </div>
          </section>
        );
      })}
    </div>
  );
}
