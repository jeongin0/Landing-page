// 상세페이지(본문 블록) 빌더 - 편집 가능한 콘텐츠 스키마
// 헤더/푸터/네비는 호스트 사이트가 제공. 우리는 본문만.
// 이 구조가 곧 DB의 projects.content (jsonb) 컬럼에 그대로 들어갑니다.

export type Highlight = { icon: string; title: string; desc: string };
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

export type SectionRef = { type: SectionType; enabled: boolean };

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

export const WIDTH_PX: Record<Exclude<WidthPreset, "custom">, number | null> = {
  narrow: 720,
  normal: 960,
  wide: 1200,
  full: null, // 100%
};

export type StoreContent = {
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
  cta: {
    text: string; // 버튼 문구
    href: string; // 버튼 링크
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    image: string;
  };
  highlights: Highlight[];
  detail: {
    heading: string;
    body: string;
    image: string;
  };
  specs: Spec[];
  reviews: Review[];
  pricing: {
    price: string;
    compareAt: string;
    note: string;
  };
  faq: Faq[];
};

// 예전 데이터(sections/cta 없음) 보정
export function normalizeContent(c: unknown): StoreContent {
  const raw = (c || {}) as Record<string, unknown> & Partial<StoreContent>;
  const legacyBrand = (raw as { brand?: { ctaText?: string; ctaHref?: string } })
    .brand;
  const legacyHero = (raw as { hero?: { ctaText?: string } }).hero;
  return {
    ...(raw as StoreContent),
    layout: raw.layout || { width: "normal", customPx: 960 },
    sections:
      Array.isArray(raw.sections) && raw.sections.length
        ? (raw.sections as SectionRef[])
        : DEFAULT_SECTIONS.map((s) => ({ ...s })),
    cta: raw.cta || {
      text: legacyBrand?.ctaText || legacyHero?.ctaText || "지금 구매하기",
      href: legacyBrand?.ctaHref || "#pricing",
    },
  };
}

export type Project = {
  id: string;
  title: string;
  templateId: "store-01";
  content: StoreContent;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export const TEMPLATE_LABELS: Record<Project["templateId"], string> = {
  "store-01": "스토어 상세페이지",
};
