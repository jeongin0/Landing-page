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
export type ChecklistItem = { text: string };
export type Step = { title: string; desc: string };

export type SectionType =
  | "hero"
  | "highlights"
  | "detail"
  | "checklist"
  | "callout"
  | "steps"
  | "specs"
  | "reviews"
  | "pricing"
  | "faq"
  | "block"; // 자유 블록 (여러 개 가능)

// 히어로·상세 영역 구성 방식
export type SectionMode = "split" | "text" | "image";
export const SECTION_MODE_LABELS: Record<SectionMode, string> = {
  split: "이미지 + 텍스트",
  text: "텍스트만",
  image: "통이미지 (원본 비율)",
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

// 자유 블록 내용 (type === "block" 일 때만)
export type FreeBlock = {
  heading: string;
  body: string;
  image: string;
  mode: SectionMode; // split / text / image
  align?: "left" | "center";
  imageAspect?: number;
  imageW?: number;
};

export type SectionRef = {
  type: SectionType;
  enabled: boolean;
  w?: Exclude<WidthPreset, "custom">; // 섹션별 폭 프리셋 (없으면 전체 본문 폭 상속)
  wPx?: number; // 섹션별 폭 직접값(px). 드래그로 조절. 있으면 w 보다 우선
  bg?: string; // 섹션 배경색 (hex). 없으면 페이지 기본 배경
  bgImage?: string; // 섹션 배경 이미지 URL
  bgFit?: "cover" | "contain"; // 배경 이미지 채우기 방식 (기본 cover)
  bgFixed?: boolean; // 배경 고정(parallax 느낌)
  pad?: "tight" | "normal" | "loose"; // 상하 여백 프리셋
  padPx?: number; // 상하 여백 직접값(px). 드래그로 조절. 있으면 pad 보다 우선
  splitPct?: number; // split 레이아웃에서 이미지 열 비율 % (20~80). 드래그로 조절
  key?: string; // 자유 블록 식별용 (여러 개일 때)
  block?: FreeBlock; // type === "block" 일 때 내용
};

// 섹션 폭(px) 정규화 (320~1920)
export const clampSectionPx = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(320, Math.min(1920, Math.round(n)));
};
// 섹션 상하여백(px) 정규화 (0~240)
export const clampPadPx = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(240, Math.round(n)));
};
// split 비율 % 정규화 (20~80)
export const clampSplitPct = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(20, Math.min(80, Math.round(n)));
};

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "메인 (제목·이미지)",
  highlights: "강점",
  detail: "상세 설명",
  checklist: "이런 분께 추천 (체크리스트)",
  callout: "강조 문구",
  steps: "진행 순서",
  specs: "스펙 표",
  reviews: "고객 후기",
  pricing: "가격 · 구매",
  faq: "자주 묻는 질문",
  block: "자유 블록",
};

export const DEFAULT_SECTIONS: SectionRef[] = [
  { type: "hero", enabled: true },
  { type: "highlights", enabled: true },
  { type: "checklist", enabled: false },
  { type: "detail", enabled: true },
  { type: "callout", enabled: false },
  { type: "steps", enabled: false },
  { type: "specs", enabled: true },
  { type: "reviews", enabled: true },
  { type: "pricing", enabled: true },
  { type: "faq", enabled: true },
];

export const PAD_PX: Record<"tight" | "normal" | "loose", number> = {
  tight: 32,
  normal: 64,
  loose: 104,
};

export type WidthPreset = "mobile" | "narrow" | "normal" | "wide" | "full" | "custom";

export const WIDTH_PX: Record<Exclude<WidthPreset, "custom">, number> = {
  mobile: 640, // 상세페이지(모바일 기준)
  narrow: 720,
  normal: 960,
  wide: 1280,
  full: 1920,
};

// 레이아웃 스타일 — 템플릿마다 레이아웃·타이포·구성이 완전히 다름
export type LayoutStyle = "bold" | "editorial" | "showcase";

export const LAYOUT_STYLE_LABELS: Record<LayoutStyle, string> = {
  bold: "스트립 · 풀블리드 밴드 + 텍스트 오버레이 + 하단 고정 구매바",
  editorial: "레일 · 좌측 고정 인덱스 + 우측 본문 2단 + 세리프",
  showcase: "벤토 · 카드 그리드 + 상단 필내비 + 겹침 통계카드",
};

// 예전 style 값 → 새 style 값 매핑 (DB 하위호환)
const STYLE_ALIAS: Record<string, LayoutStyle> = {
  classic: "bold",
  spotlight: "showcase",
  editorial: "editorial",
  bold: "bold",
  showcase: "showcase",
};
export const clampStyle = (v: unknown): LayoutStyle =>
  (typeof v === "string" && STYLE_ALIAS[v]) || "bold";

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
  checklist: { heading: string; items: ChecklistItem[] };
  callout: { text: string; sub: string };
  steps: { heading: string; items: Step[] };
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

let blockKeySeq = 0;
const genKey = () =>
  `b${Date.now().toString(36)}${(blockKeySeq++).toString(36)}`;

// 섹션 목록 보정: 새로 생긴 타입 뒤에 추가, block 은 key 보장
function normalizeSections(raw: unknown): SectionRef[] {
  const arr: SectionRef[] = Array.isArray(raw) && raw.length
    ? (raw as SectionRef[]).map((s) => ({ ...s }))
    : DEFAULT_SECTIONS.map((s) => ({ ...s }));
  // block 이 아닌 기본 타입 중 목록에 없는 건 뒤에 (비활성으로) 붙임
  for (const d of DEFAULT_SECTIONS) {
    if (d.type !== "block" && !arr.some((s) => s.type === d.type)) {
      arr.push({ ...d, enabled: false });
    }
  }
  return arr.map((raw) => {
    const s: SectionRef = {
      ...raw,
      wPx: clampSectionPx(raw.wPx),
      padPx: clampPadPx(raw.padPx),
      splitPct: clampSplitPct(raw.splitPct),
    };
    if (s.type === "block") {
      return {
        ...s,
        key: s.key || genKey(),
        block: {
          heading: s.block?.heading ?? "",
          body: s.block?.body ?? "",
          image: s.block?.image ?? "",
          mode: clampMode(s.block?.mode) ?? "text",
          align: s.block?.align === "center" ? "center" : "left",
        },
      };
    }
    return s;
  });
}

// 예전 데이터 보정 (없는 필드 채우기)
export function normalizeContent(c: unknown): StoreContent {
  const raw = (c || {}) as Record<string, unknown> & Partial<StoreContent>;
  const legacyBrand = (raw as { brand?: { ctaText?: string; ctaHref?: string } })
    .brand;
  const legacyHero = (raw as { hero?: { ctaText?: string } }).hero;
  const primary = raw.theme?.primary || "#111827";
  const rawLayout = raw.layout as StoreContent["layout"] | undefined;
  return {
    ...(raw as StoreContent),
    style: clampStyle(raw.style),
    layout: {
      width: rawLayout?.width || "narrow",
      customPx: rawLayout?.customPx || 720,
    },
    sections: normalizeSections(raw.sections),
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
    checklist: {
      heading: raw.checklist?.heading ?? "이런 분께 추천합니다",
      items:
        Array.isArray(raw.checklist?.items) && raw.checklist!.items.length
          ? raw.checklist!.items
          : [
              { text: "첫 번째 추천 대상을 적어주세요" },
              { text: "두 번째 추천 대상을 적어주세요" },
              { text: "세 번째 추천 대상을 적어주세요" },
            ],
    },
    callout: {
      text: raw.callout?.text ?? "한 줄로 핵심을 강조하세요",
      sub: raw.callout?.sub ?? "",
    },
    steps: {
      heading: raw.steps?.heading ?? "진행 순서",
      items:
        Array.isArray(raw.steps?.items) && raw.steps!.items.length
          ? raw.steps!.items
          : [
              { title: "1단계", desc: "설명을 입력하세요" },
              { title: "2단계", desc: "설명을 입력하세요" },
              { title: "3단계", desc: "설명을 입력하세요" },
            ],
    },
  };
}

// 새 자유 블록 하나 생성
export function newBlock(): SectionRef {
  return {
    type: "block",
    enabled: true,
    key: genKey(),
    block: { heading: "새 블록 제목", body: "내용을 입력하세요.", image: "", mode: "text", align: "left" },
  };
}

// 통이미지 전용 블록 (긴 이미지 한 장)
export function newImageBlock(): SectionRef {
  return {
    type: "block",
    enabled: true,
    key: genKey(),
    block: { heading: "", body: "", image: "", mode: "image", align: "left" },
  };
}

// 섹션 복제 (block 은 새 key, 나머지는 얕은 복사)
export function duplicateSectionRef(s: SectionRef): SectionRef {
  if (s.type === "block") {
    return { ...s, key: genKey(), block: { ...(s.block as FreeBlock) } };
  }
  return { ...s };
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
