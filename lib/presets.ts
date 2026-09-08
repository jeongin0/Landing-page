import type { StoreContent, SectionRef } from "./schema";
import { defaultStoreContent } from "./defaultContent";

export type PresetId = "classic" | "spotlight" | "editorial";

// 상세페이지 흐름 + 섹션별 배경 밴드
const band = (
  type: SectionRef["type"],
  bg: string | undefined,
  enabled = true,
): SectionRef => ({ type, enabled, pad: "loose", ...(bg ? { bg } : {}) });

export const PRESETS: {
  id: PresetId;
  label: string;
  desc: string;
  make: () => StoreContent;
}[] = [
  {
    id: "classic",
    label: "커머스 (제품)",
    desc: "제품 판매용. 밝은 밴드 + 어두운 강조 밴드가 번갈아 나오는 정석 상세페이지.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "classic";
      return c;
    },
  },
  {
    id: "spotlight",
    label: "강의 · 클래스",
    desc: "강의/부트캠프용. 큰 히어로 + 추천 대상 + 커리큘럼(진행 순서) 강조.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "spotlight";
      c.theme.primary = "#4f46e5";
      c.sections = [
        { type: "hero", enabled: true, pad: "loose", bg: "#0f172a" },
        band("checklist", "#ffffff"),
        band("highlights", "#f5f5ff"),
        band("callout", "#4f46e5"),
        band("steps", "#ffffff"),
        band("detail", "#f5f5ff"),
        band("reviews", "#ffffff"),
        band("pricing", "#0f172a"),
        band("faq", "#f5f5ff"),
        band("specs", undefined, false),
      ];
      c.cta.text = "지금 수강 신청";
      c.hero = {
        ...c.hero,
        badge: "3기 모집",
        badgeBg: "#4f46e533",
        badgeText: "#c7d2fe",
        title: "비전공자도 4주 만에\n첫 랜딩페이지 완성",
        subtitle:
          "매주 라이브 강의 + 과제 피드백. 수강 후 바로 포트폴리오 1개가 남습니다.",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=80",
        mode: "split",
      };
      c.highlights = [
        { icon: "🎥", title: "라이브 강의 4주", desc: "녹화본 평생 제공. 놓쳐도 다시 보기." },
        { icon: "✍️", title: "과제 첨삭", desc: "매주 제출 → 1:1 피드백으로 실력 확인." },
        { icon: "💬", title: "커뮤니티", desc: "수강생 전용 채널에서 질문·정보 공유." },
      ];
      c.checklist = {
        heading: "이런 분께 추천합니다",
        items: [
          { text: "포트폴리오가 없어 지원을 못 하고 있는 분" },
          { text: "강의만 듣고 끝나는 게 아니라 결과물이 필요한 분" },
          { text: "혼자 하다 매번 중간에 멈췄던 분" },
        ],
      };
      c.callout = { text: "4주 뒤, 포트폴리오 1개가 남습니다", sub: "3기 얼리버드 마감 임박" };
      c.steps = {
        heading: "커리큘럼",
        items: [
          { title: "1주차 · 기초", desc: "HTML/CSS와 레이아웃의 원리" },
          { title: "2주차 · 반응형", desc: "컴포넌트와 모바일 대응" },
          { title: "3주차 · 실전", desc: "내 주제로 랜딩페이지 제작" },
          { title: "4주차 · 배포", desc: "배포와 포트폴리오 정리" },
        ],
      };
      c.detail = {
        heading: "수업은 이렇게 진행돼요",
        body: "매주 화요일 저녁 라이브 강의 2시간, 주말까지 과제 제출. 다음 강의 전에 1:1 피드백을 드립니다.",
        image:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80",
        mode: "split",
      };
      c.reviews = [
        { name: "수강생 A", text: "4주 만에 제 사업 랜딩페이지를 직접 만들었어요.", rating: 5 },
        { name: "수강생 B", text: "과제 피드백이 정말 꼼꼼합니다.", rating: 5 },
        { name: "수강생 C", text: "비전공자인데 따라갈 만했어요.", rating: 5 },
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
    id: "editorial",
    label: "로컬 · 서비스",
    desc: "매장/스튜디오/서비스 안내용. 담백한 톤 + 세리프 제목 + 이용 안내 중심.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "editorial";
      c.theme.primary = "#0f766e";
      c.sections = [
        band("hero", "#f4f7f6"),
        band("highlights", "#ffffff"),
        band("checklist", "#0f2e2b"),
        band("detail", "#ffffff"),
        band("steps", "#f4f7f6"),
        band("reviews", "#ffffff"),
        band("callout", "#0f766e"),
        band("faq", "#f4f7f6"),
        band("specs", undefined, false),
        band("pricing", undefined, false),
      ];
      c.cta.text = "상담 예약하기";
      c.hero = {
        ...c.hero,
        badge: "신규 오픈",
        badgeBg: "#0f766e1f",
        badgeText: "#0f766e",
        title: "동네에서 가장 친절한\n1:1 맞춤 요가 스튜디오",
        subtitle: "첫 방문 무료 체험. 소수 정예 수업으로 자세 하나하나 봐드립니다.",
        image:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80",
        mode: "split",
      };
      c.highlights = [
        { icon: "🧘", title: "소수 정예", desc: "회당 최대 6명. 개인별 자세 교정." },
        { icon: "📍", title: "역 3분", desc: "2호선 OO역 2번 출구 도보 3분." },
        { icon: "🕐", title: "새벽·야간반", desc: "출근 전·퇴근 후 시간대 운영." },
      ];
      c.checklist = {
        heading: "이런 분께 딱 맞아요",
        items: [
          { text: "큰 헬스장 그룹수업이 부담스러운 분" },
          { text: "자세가 맞는지 봐줄 사람이 필요한 분" },
          { text: "출근 전·퇴근 후에 다니고 싶은 분" },
        ],
      };
      c.callout = { text: "첫 방문, 무료로 체험해보세요", sub: "아래 버튼으로 예약 후 방문" };
      c.steps = {
        heading: "체험 신청 방법",
        items: [
          { title: "01 · 예약", desc: "아래 버튼으로 원하는 시간대 선택" },
          { title: "02 · 방문", desc: "편한 옷차림으로 오시면 매트는 무료 제공" },
          { title: "03 · 상담", desc: "수업 후 목표에 맞는 수강 플랜 안내" },
        ],
      };
      c.detail = {
        heading: "이용 안내",
        body: "운영시간: 평일 06:00–22:00 / 주말 09:00–18:00\n주소: 서울시 OO구 OO로 00\n주차: 건물 지하 2시간 무료\n문의: 010-0000-0000",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80",
        mode: "split",
      };
      c.reviews = [
        { name: "김**", text: "선생님이 자세를 계속 봐주셔서 확실히 달라요.", rating: 5 },
        { name: "이**", text: "새벽반 있어서 출근 전에 다닙니다.", rating: 5 },
        { name: "박**", text: "동네에 이런 곳이 생겨서 좋아요.", rating: 5 },
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
