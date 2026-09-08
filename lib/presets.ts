import type { StoreContent, SectionRef } from "./schema";
import { defaultStoreContent } from "./defaultContent";

export type PresetId = "bold" | "editorial" | "showcase";

const band = (
  type: SectionRef["type"],
  bg: string | undefined,
  enabled = true,
): SectionRef => ({ type, enabled, pad: "loose", ...(bg ? { bg } : {}) });

const U = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80`;

export const PRESETS: {
  id: PresetId;
  label: string;
  desc: string;
  make: () => StoreContent;
}[] = [
  // ── 1. STRIP (bold) ─────────────────────────────────────
  {
    id: "bold",
    label: "스트립 (상품 상세)",
    desc: "긴 통이미지와 컬러 텍스트 밴드가 번갈아 흐르는 정통 상세페이지. POINT 라벨. 구매 버튼 없음.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "bold";
      c.theme = { primary: "#e23744", bg: "#ffffff", text: "#111111" };
      c.layout = { width: "narrow", customPx: 720 };
      const imgBlock = (image: string, key: string): SectionRef => ({
        type: "block",
        enabled: true,
        key,
        pad: "normal",
        block: { heading: "", body: "", image, mode: "image", align: "left" },
      });
      c.sections = [
        band("hero", undefined),
        band("callout", "#e23744"),
        band("highlights", undefined),
        imgBlock(U("photo-1600271886742-f049cd451bba", 1400), "pb1"),
        band("checklist", "#111111"),
        band("detail", undefined),
        band("steps", "#f7f2f2"),
        band("specs", "#f3f3f4"),
        band("reviews", "#ffffff"),
        band("pricing", "#111111"),
        band("faq", "#f3f3f4"),
      ];
      c.cta = { text: "", href: "" };
      c.hero = {
        ...c.hero,
        badge: "신제품 출시",
        title: "하루 종일 온도를 지키는\n스테인리스 텀블러",
        subtitle: "6시간 보온, 12시간 보냉. 한 손에 잡히는 350ml.",
        image: U("photo-1523362628745-0c100150b504", 1600),
        mode: "split",
      };
      c.highlights = [
        {
          icon: "🔥",
          iconImage: U("photo-1517705008128-361805f42e86"),
          title: "6시간 보온, 아침 커피를 점심까지",
          desc: "진공 2중 스테인리스 구조로 온도를 오래 붙잡습니다.",
        },
        {
          icon: "❄️",
          iconImage: U("photo-1600271886742-f049cd451bba"),
          title: "12시간 보냉, 얼음이 한나절",
          desc: "여름 운동·등산·캠핑에 하나. 오후 내내 시원하게.",
        },
        {
          icon: "🧼",
          iconImage: U("photo-1602143407151-7111542de6e8"),
          title: "입구가 넓어 손이 들어가는 세척",
          desc: "안쪽 코팅이 없어 냄새가 배지 않고 식기세척기 사용 가능.",
        },
      ];
      c.callout = { text: "하루의 온도, 이 한 병으로", sub: "무료배송 · 7일 무조건 환불" };
      c.detail = {
        ...c.detail,
        heading: "왜 이 텀블러일까요",
        body:
          "18/8 식품용 스테인리스만 사용했습니다. 안쪽 코팅 없이 원료 그대로라 냄새가 배지 않고, 밀폐 뚜껑은 거꾸로 들어도 새지 않습니다. 바닥의 미끄럼 방지 실리콘이 책상에서 넘어지는 것을 막아줍니다.",
        image: U("photo-1610824352934-c10d87b700cc", 1600),
        mode: "split",
      };
      return c;
    },
  },

  // ── 2. RAIL (editorial) ─────────────────────────────────
  {
    id: "editorial",
    label: "레일 (브랜드 · 미니멀)",
    desc: "세리프 대형 제목과 넓은 여백, 화면 끝까지 차는 긴 이미지로 흐르는 미니멀 브랜드 소개형. 무채색. 구매 버튼 없음.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "editorial";
      c.theme = { primary: "#1b1a17", bg: "#f7f5f1", text: "#1b1a17" };
      c.layout = { width: "normal", customPx: 960 };
      c.sections = [
        { type: "hero", enabled: true, pad: "loose", splitPct: 55 },
        band("highlights", undefined),
        { type: "detail", enabled: true, pad: "loose", splitPct: 42 },
        band("callout", undefined),
        band("checklist", undefined),
        band("reviews", undefined),
        band("specs", undefined),
        band("pricing", undefined),
        band("faq", undefined),
        band("steps", undefined, false),
      ];
      c.cta = { text: "제품 보러 가기", href: "#" };
      c.hero = {
        ...c.hero,
        badge: "New — Eau de Parfum",
        title: "피부에 머무는\n담백한 나무의 잔향",
        subtitle:
          "합성 머스크를 덜어내고 시더우드와 베티버를 중심에 둔 미니멀 시그니처.",
        image: U("photo-1615634260167-c8cdede054de", 1600),
        mode: "split",
      };
      c.highlights = [
        { icon: "01", title: "8시간 지속", desc: "가벼운 시작, 오래 남는 마무리. 은은한 잔향으로 이어집니다." },
        { icon: "02", title: "비건 포뮬러", desc: "동물성 원료를 쓰지 않고 재활용 유리병에 담았습니다." },
        { icon: "03", title: "무착색", desc: "인공 색소 없이 원액 그대로. 옷에 묻어도 자국이 남지 않습니다." },
      ];
      c.detail = {
        heading: "하나의 노트에서 시작합니다",
        body:
          "버지니아산 시더우드를 베이스로, 상단에 베르가못과 핑크페퍼를 얹었습니다. 시간이 지나며 우디한 잔향과 화이트 머스크가 피부 위에 남습니다.",
        image: U("photo-1592945403244-b3fbafd7f539", 1400),
        mode: "split",
      };
      c.callout = { text: "향은 결국, 오래 곁에 두고 싶은지로 정해집니다", sub: "30ml · 50ml · 리필" };
      c.checklist = {
        heading: "이런 분께 어울립니다",
        items: [
          { text: "강한 향이 부담스러워 가벼운 향수를 찾는 분" },
          { text: "우디·머스크 계열을 좋아하는 분" },
          { text: "매일 뿌릴 데일리 시그니처가 필요한 분" },
        ],
      };
      c.reviews = [
        { name: "정◦◦", text: "과하지 않아서 사무실에서도 부담 없이 쓸 수 있어요. 잔향이 특히 좋습니다.", rating: 5 },
        { name: "이◦◦", text: "우디 계열을 여러 개 써봤는데 이건 담백하면서도 깊이가 있어요.", rating: 5 },
        { name: "한◦◦", text: "재활용 유리병도 마음에 들고, 리필이 있어서 계속 씁니다.", rating: 5 },
      ];
      c.specs = [
        { label: "용량", value: "30ml / 50ml" },
        { label: "부향률", value: "Eau de Parfum" },
        { label: "탑 노트", value: "베르가못 · 핑크페퍼" },
        { label: "베이스", value: "시더우드 · 베티버 · 머스크" },
      ];
      c.pricing = { price: "68,000원", compareAt: "", note: "무료 각인 · 리필 구매 가능" };
      c.faq = [
        { q: "잔향은 얼마나 가나요?", a: "체질에 따라 다르지만 옷에 뿌리면 하루가 지나도 옅게 남습니다." },
        { q: "리필로만 살 수 있나요?", a: "본품 구매 이력이 있으면 리필(50ml) 단독 구매가 가능합니다." },
        { q: "테스터가 있나요?", a: "1.5ml 샘플 3종 세트를 별도로 판매합니다." },
      ];
      return c;
    },
  },

  // ── 3. BENTO (showcase) ─────────────────────────────────
  {
    id: "showcase",
    label: "벤토 (서비스 · 앱 소개)",
    desc: "균일한 라운드 카드 그리드(테두리 없이 섀도우만)로 짜인 SaaS·서비스 소개형. 히어로 아래 겹치는 통계 카드. 구매 버튼 없음.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "showcase";
      c.theme = { primary: "#4f46e5", bg: "#ffffff", text: "#1f2937" };
      c.layout = { width: "wide", customPx: 1120 };
      c.sections = [
        { type: "hero", enabled: true, pad: "loose", splitPct: 48 },
        band("highlights", undefined),
        band("checklist", undefined),
        band("steps", undefined),
        { type: "detail", enabled: true, pad: "loose", splitPct: 55 },
        band("reviews", undefined),
        band("callout", undefined),
        band("pricing", undefined),
        band("faq", undefined),
        band("specs", undefined, false),
      ];
      c.cta = { text: "무료로 시작하기", href: "#" };
      c.hero = {
        ...c.hero,
        badge: "베타 오픈 · 카드 등록 없이",
        badgeBg: "#4f46e514",
        badgeText: "#4f46e5",
        title: "예약부터 정산까지\n한 화면에서",
        subtitle:
          "흩어진 예약 문자와 엑셀을 하나로 모았습니다. 팀이 같은 일정을 보고, 노쇼는 자동으로 줄어듭니다.",
        image: U("photo-1552581234-26160f608093", 1500),
        mode: "split",
      };
      c.specs = [
        { label: "누적 예약", value: "48만+" },
        { label: "노쇼 감소", value: "-31%" },
        { label: "평균 세팅", value: "3분" },
      ];
      c.highlights = [
        { icon: "📅", title: "통합 캘린더", desc: "네이버·전화·워크인 예약을 한 캘린더에서 확인하고 관리합니다." },
        { icon: "🔔", title: "자동 알림", desc: "예약 확정·리마인드·노쇼 확인 문자를 자동으로 보냅니다." },
        { icon: "📊", title: "매출 리포트", desc: "일·주·월 매출과 재방문율을 자동으로 집계합니다." },
      ];
      c.checklist = {
        heading: "이런 팀에 잘 맞습니다",
        items: [
          { text: "예약 문자를 사람이 일일이 확인하고 있는 매장" },
          { text: "직원마다 다른 캘린더를 쓰고 있는 팀" },
          { text: "노쇼 때문에 매출 예측이 어려운 곳" },
          { text: "엑셀로 매출을 정리하는 데 시간을 쓰는 사장님" },
        ],
      };
      c.steps = {
        heading: "3분이면 시작합니다",
        items: [
          { title: "가입", desc: "이메일만으로 가입. 카드 등록이 필요 없습니다." },
          { title: "연동", desc: "쓰던 예약 채널을 연결하면 기존 예약을 그대로 가져옵니다." },
          { title: "초대", desc: "팀원을 초대하면 같은 일정을 실시간으로 함께 봅니다." },
        ],
      };
      c.detail = {
        heading: "노쇼를 줄이는 건 결국 타이밍입니다",
        body:
          "예약 24시간 전과 2시간 전에 자동으로 리마인드를 보냅니다. 고객이 링크로 방문·취소를 선택하면 빈 자리는 대기 명단에 자동으로 안내됩니다.",
        image: U("photo-1517245386807-bb43f82c33c4", 1400),
        mode: "split",
      };
      c.callout = {
        text: "이번 달 노쇼, 몇 건인지 바로 답할 수 있나요?",
        sub: "지금 연동하면 지난 예약까지 함께 분석해 드립니다",
      };
      c.reviews = [
        { name: "김소연", text: "캘린더 하나로 합치니까 전화 확인 시간이 확 줄었어요.", rating: 5 },
        { name: "박준호", text: "자동 리마인드 켜고 노쇼가 눈에 띄게 줄었습니다.", rating: 5 },
        { name: "이지민", text: "월말 정산이 클릭 한 번이라 회계사한테 그냥 넘깁니다.", rating: 5 },
      ];
      c.pricing = {
        price: "월 29,000원",
        compareAt: "39,000원",
        note: "베타 기간 한정가 · 언제든 해지",
      };
      c.faq = [
        { q: "기존 예약 데이터를 옮길 수 있나요?", a: "채널을 연동하면 지난 3개월 예약을 자동으로 가져옵니다." },
        { q: "직원 수 제한이 있나요?", a: "베타 기간에는 인원 제한 없이 초대할 수 있습니다." },
        { q: "해지하면 데이터는요?", a: "해지 후 30일간 보관하며 언제든 CSV로 내보낼 수 있습니다." },
      ];
      return c;
    },
  },
];

export const makePreset = (id: string): StoreContent =>
  (PRESETS.find((p) => p.id === id) || PRESETS[0]).make();
