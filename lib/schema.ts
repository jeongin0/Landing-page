// 상세페이지(본문 블록) 빌더 - 편집 가능한 콘텐츠 스키마
// 헤더/푸터/네비는 호스트 사이트가 제공. 우리는 본문만.
// 이 구조가 곧 DB의 projects.content (jsonb) 컬럼에 그대로 들어갑니다.

export type Highlight = {
  icon: string; // 이모지 (iconImage 없을 때 표시)
  iconImage?: string; // 아이콘 이미지 URL (있으면 우선)
  title: string;
  desc: string;
};
export type Spec = { label: string; value: string };
export type Review = { name: string; text: string; rating: number };
export type Faq = { q: string; a: string };

export type SectionType =
  | "hero"
  | "highlights"
  | "detail"
  | "specs"
  | "reviews"
  | "pricing"
  | "faq";

// 히어로·상세 영역 구성 방식
export type SectionMode = "split" | "text" | "image";
export const SECTION_MODE_LABELS: Record<SectionMode, string> = {
  split: "이미지 + 텍스트",
  text: "텍스트만",
  image: "통이미지",
};
export const clampMode = (v: unknown): SectionMode | undefined =>
  v === "split" || v === "text" || v === "image" ? v : undefined;

// 텍스트 블록 스타일 오버라이드
export type TextStyle = { font?: string; size?: number };

export const clampTextStyles = (
  v: unknown,
): Record<string, TextStyle> | undefined => {
  if (!v || typeof v !== "object") return undefined;
  const out: Record<string, TextStyle> = {};
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    const s = (raw || {}) as TextStyle;
    const ns: TextStyle = {};
    if (typeof s.font === "string" && s.font && s.font !== "system") ns.font = s.font;
    if (typeof s.size === "number" && Number.isFinite(s.size))
      ns.size = Math.max(8, Math.min(120, Math.round(s.size)));
    if (ns.font || ns.size) out[k] = ns;
  }
  return Object.keys(out).length ? out : undefined;
};

export type SectionRef = {
  type: SectionType;
  enabled: boolean;
  w?: Exclude<WidthPreset, "custom">; // 섹션별 폭 (없으면 전체 본문 폭 상속)
};

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "메인 (제목·이미지)",
  highlights: "강점 3가지",
  detail: "상세 설명",
  specs: "스펙 표",
  reviews: "고객 후기",
  pricing: "가격 · 구매",
  faq: "자주 묻는 질문",
};

export const DEFAULT_SECTIONS: SectionRef[] = [
  { type: "hero", enabled: true },
  { type: "highlights", enabled: true },
  { type: "detail", enabled: true },
  { type: "specs", enabled: true },
  { type: "reviews", enabled: true },
  { type: "pricing", enabled: true },
  { type: "faq", enabled: true },
];

export type WidthPreset = "narrow" | "normal" | "wide" | "full" | "custom";

export const WIDTH_PX: Record<Exclude<WidthPreset, "custom">, number> = {
  narrow: 720,
  normal: 960,
  wide: 1280,
  full: 1920,
};

// 레이아웃 스타일 — 템플릿마다 시각적으로 다르게
export type LayoutStyle = "classic" | "spotlight" | "editorial";

export const LAYOUT_STYLE_LABELS: Record<LayoutStyle, string> = {
  classic: "클래식 (텍스트·이미지 좌우 배치)",
  spotlight: "스포트라이트 (큰 이미지 + 중앙 정렬)",
  editorial: "에디토리얼 (세로로 흐르는 매거진형)",
};

export type StoreContent = {
  style: LayoutStyle;
  theme: {
    primary: string; // 버튼/포인트 색
    bg: string; // 배경색
    text: string; // 본문 글자색
  };
  layout: {
    width: WidthPreset;
    customPx: number; // width === "custom" 일 때만 사용
  };
  sections: SectionRef[]; // 섹션 순서 + 표시 여부
  highlightsCols?: number; // (구버전) 강점 열 개수 — 지금은 항목 수로 결정
  reviewsCols?: number; // (구버전) 후기 열 개수
  // 텍스트 블록별 폰트/크기 오버라이드. key 예: "hero.title", "highlights.title"
  textStyles?: Record<string, TextStyle>;
  cta: {
    text: string; // 버튼 문구
    href: string; // 버튼 링크
    hidden?: boolean; // (구버전) 전체 숨김 — 지금은 hero.ctaHidden / pricing.ctaHidden 로 개별 제어
  };
  hero: {
    badge: string;
    badgeBg: string; // 라벨 배경색
    badgeText: string; // 라벨 글자색
    title: string;
    subtitle: string;
    image: string;
    imageW?: number; // 이미지 폭 % (20~100). 없으면 100
    imageAspect?: number; // 이미지 가로세로 비율 (w/h). 없으면 스타일 기본값
    splitPct?: number; // 클래식 스타일에서 이미지 열이 차지하는 비율 % (30~75). 없으면 50
    mode?: SectionMode; // 영역 구성: 이미지+텍스트 / 텍스트만 / 통이미지
    ctaHidden?: boolean; // 메인(히어로) 구매 버튼 숨김
  };
  highlights: Highlight[];
  detail: {
    heading: string;
    body: string;
    image: string;
    imageW?: number; // 이미지 폭 % (20~100). 없으면 100
    imageAspect?: number; // 이미지 가로세로 비율 (w/h). 없으면 스타일 기본값
    splitPct?: number; // 클래식 스타일에서 이미지 열이 차지하는 비율 % (30~75). 없으면 50
    mode?: SectionMode; // 영역 구성: 이미지+텍스트 / 텍스트만 / 통이미지
  };
  specs: Spec[];
  reviews: Review[];
  pricing: {
    price: string;
    compareAt: string;
    note: string;
    ctaHidden?: boolean; // 가격 섹션 구매 버튼 숨김
  };
  faq: Faq[];
};

// 이미지 폭 % 정규화 (20~100, 정수). 값이 없으면 undefined = 100%
export const clampImageW = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(20, Math.min(100, Math.round(n)));
};

// 이미지 가로세로 비율 정규화 (0.3~5). 없으면 undefined = 스타일 기본값
export const clampAspect = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.max(0.3, Math.min(5, Math.round(n * 1000) / 1000));
};

// 클래식 히어로 이미지 열 비율 % (30~75). 없으면 undefined = 50
export const clampSplit = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(30, Math.min(75, Math.round(n)));
};

// 그리드 열 개수 (2~4). 없으면 undefined = 3
export const clampCols = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(2, Math.min(4, Math.round(n)));
};

// 예전 데이터 보정 (없는 필드 채우기)
export function normalizeContent(c: unknown): StoreContent {
  const raw = (c || {}) as Record<string, unknown> & Partial<StoreContent>;
  const legacyBrand = (raw as { brand?: { ctaText?: string; ctaHref?: string } })
    .brand;
  const legacyHero = (raw as { hero?: { ctaText?: string } }).hero;
  const primary = raw.theme?.primary || "#111827";
  return {
    ...(raw as StoreContent),
    style: raw.style || "classic",
    layout: raw.layout || { width: "normal", customPx: 960 },
    sections:
      Array.isArray(raw.sections) && raw.sections.length
        ? (raw.sections as SectionRef[])
        : DEFAULT_SECTIONS.map((s) => ({ ...s })),
    highlightsCols: clampCols(raw.highlightsCols),
    reviewsCols: clampCols(raw.reviewsCols),
    textStyles: clampTextStyles(raw.textStyles),
    cta: raw.cta || {
      text: legacyBrand?.ctaText || legacyHero?.ctaText || "지금 구매하기",
      href: legacyBrand?.ctaHref || "#pricing",
    },
    hero: {
      badge: raw.hero?.badge ?? "",
      badgeBg: raw.hero?.badgeBg || primary + "1a",
      badgeText: raw.hero?.badgeText || primary,
      title: raw.hero?.title ?? "",
      subtitle: raw.hero?.subtitle ?? "",
      image: raw.hero?.image ?? "",
      imageW: clampImageW(raw.hero?.imageW),
      imageAspect: clampAspect(raw.hero?.imageAspect),
      splitPct: clampSplit(raw.hero?.splitPct),
      mode: clampMode(raw.hero?.mode),
    },
    detail: {
      ...(raw.detail as StoreContent["detail"]),
      imageW: clampImageW(raw.detail?.imageW),
      imageAspect: clampAspect(raw.detail?.imageAspect),
      splitPct: clampSplit(raw.detail?.splitPct),
      mode: clampMode(raw.detail?.mode),
    },
  };
}

export type Project = {
  id: string;
  title: string;
  templateId: string;
  content: StoreContent;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
