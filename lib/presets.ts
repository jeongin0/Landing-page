import type { StoreContent } from "./schema";
import { defaultStoreContent } from "./defaultContent";

export type PresetId = "store" | "course" | "local";

export const PRESETS: {
  id: PresetId;
  label: string;
  desc: string;
  make: () => StoreContent;
}[] = [
  {
    id: "store",
    label: "스토어 상품 상세",
    desc: "스마트스토어·쿠팡 단일상품 상세페이지",
    make: () => defaultStoreContent(),
  },
  {
    id: "course",
    label: "강의 · 전자책",
    desc: "온라인 강의, PDF/전자책 판매 페이지",
    make: () => {
      const c = defaultStoreContent();
      c.sections = [
        { type: "hero", enabled: true },
        { type: "highlights", enabled: true },
        { type: "detail", enabled: true },
        { type: "reviews", enabled: true },
        { type: "pricing", enabled: true },
        { type: "faq", enabled: true },
        { type: "specs", enabled: false },
      ];
      c.cta.text = "지금 수강 신청";
      c.hero = {
        badge: "3기 모집",
        title: "비전공자도 4주 만에\n첫 랜딩페이지 완성",
        subtitle:
          "매주 라이브 강의 + 과제 피드백. 수강 후 바로 포트폴리오 1개가 남습니다.",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      };
      c.highlights = [
        { icon: "🎥", title: "라이브 강의 4주", desc: "녹화본 평생 제공. 놓쳐도 다시 보기." },
        { icon: "✍️", title: "과제 첨삭", desc: "매주 제출 → 1:1 피드백으로 실력 확인." },
        { icon: "💬", title: "커뮤니티", desc: "수강생 전용 채널에서 질문·취업 정보 공유." },
      ];
      c.detail = {
        heading: "커리큘럼",
        body: "1주차: HTML/CSS 기초와 레이아웃\n2주차: 반응형과 컴포넌트\n3주차: 실전 랜딩페이지 제작\n4주차: 배포와 포트폴리오 정리",
        image:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
      };
      c.reviews = [
        { name: "수강생 A", text: "4주 만에 제 사업 랜딩페이지를 직접 만들었어요.", rating: 5 },
        { name: "수강생 B", text: "과제 피드백이 정말 꼼꼼합니다. 강추.", rating: 5 },
        { name: "수강생 C", text: "비전공자인데 따라갈 만했어요.", rating: 4 },
      ];
      c.pricing = { price: "149,000원", compareAt: "220,000원", note: "3기 얼리버드 · 환불 규정 별도" };
      c.faq = [
        { q: "완전 초보도 가능한가요?", a: "네, 1주차는 기초부터 시작합니다." },
        { q: "녹화본은 언제까지 보나요?", a: "평생 제공됩니다." },
        { q: "환불 되나요?", a: "1주차 강의 전까지 100% 환불 가능합니다." },
      ];
      return c;
    },
  },
  {
    id: "local",
    label: "로컬 서비스",
    desc: "학원·병원·카페·공방 등 지역 사업",
    make: () => {
      const c = defaultStoreContent();
      c.sections = [
        { type: "hero", enabled: true },
        { type: "highlights", enabled: true },
        { type: "detail", enabled: true },
        { type: "reviews", enabled: true },
        { type: "faq", enabled: true },
        { type: "specs", enabled: false },
        { type: "pricing", enabled: false },
      ];
      c.cta.text = "상담 예약하기";
      c.theme.primary = "#0f766e";
      c.hero = {
        badge: "신규 오픈",
        title: "동네에서 가장 친절한\n1:1 맞춤 요가 스튜디오",
        subtitle: "첫 방문 무료 체험. 소수 정예 수업으로 자세 하나하나 봐드립니다.",
        image:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
      };
      c.highlights = [
        { icon: "🧘", title: "소수 정예", desc: "회당 최대 6명. 개인별 자세 교정." },
        { icon: "📍", title: "역 3분", desc: "2호선 OO역 2번 출구 도보 3분." },
        { icon: "🕐", title: "새벽·야간반", desc: "출근 전·퇴근 후 시간대 운영." },
      ];
      c.detail = {
        heading: "이용 안내",
        body: "운영시간: 평일 06:00–22:00 / 주말 09:00–18:00\n주소: 서울시 OO구 OO로 00\n주차: 건물 지하 2시간 무료\n문의: 010-0000-0000",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80",
      };
      c.reviews = [
        { name: "김**", text: "선생님이 자세를 계속 봐주셔서 확실히 달라요.", rating: 5 },
        { name: "이**", text: "새벽반 있어서 출근 전에 다닙니다.", rating: 5 },
        { name: "박**", text: "동네에 이런 곳이 생겨서 좋아요.", rating: 4 },
      ];
      c.faq = [
        { q: "첫 방문 체험은 어떻게 하나요?", a: "아래 버튼으로 예약 후 방문하시면 됩니다." },
        { q: "운동복 대여 되나요?", a: "매트는 무료 제공, 운동복은 대여 3,000원입니다." },
        { q: "환불 규정은요?", a: "등록 후 7일 이내, 수업 3회 미만 시 전액 환불." },
      ];
      return c;
    },
  },
];

export const makePreset = (id: string): StoreContent =>
  (PRESETS.find((p) => p.id === id) || PRESETS[0]).make();
