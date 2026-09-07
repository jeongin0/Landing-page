// 스토어 단일상품 랜딩페이지 - 편집 가능한 콘텐츠 스키마
// 이 구조가 곧 DB의 projects.content (jsonb) 컬럼에 그대로 들어갑니다.

export type Highlight = { icon: string; title: string; desc: string };
export type Spec = { label: string; value: string };
export type Review = { name: string; text: string; rating: number };
export type Faq = { q: string; a: string };

export type StoreContent = {
  theme: {
    primary: string; // 버튼/포인트 색
    bg: string; // 배경색
    text: string; // 본문 글자색
  };
  brand: {
    name: string;
    ctaText: string;
    ctaHref: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
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
    ctaText: string;
  };
  faq: Faq[];
  footer: {
    text: string;
  };
};

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
  "store-01": "스토어 단일상품",
};
