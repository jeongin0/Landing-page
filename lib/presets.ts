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
  // ── 1. BOLD ─────────────────────────────────────────────
  {
    id: "bold",
    label: "볼드 커머스 (상품 상세)",
    desc: "채도 높은 컬러블록 + POINT 라벨 + 풀블리드 사진이 좌우로 교차하는 정통 상세페이지.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "bold";
      c.theme.primary = "#2563eb";
      c.layout = { width: "narrow", customPx: 720 };
      c.sections = [
        band("hero", "#eef2ff"),
        band("highlights", "#ffffff"),
        band("checklist", "#0f172a"),
        band("detail", "#ffffff"),
        band("callout", "#2563eb"),
        band("steps", "#f5f7fb"),
        band("specs", "#f5f7fb"),
        band("reviews", "#ffffff"),
        band("pricing", "#0f172a"),
        band("faq", "#f5f7fb"),
      ];
      c.highlights = [
        {
          icon: "🔥",
          iconImage: U("photo-1517705008128-361805f42e86"),
          title: "6시간 보온, 아침 커피를 점심까지",
          desc: "진공 2중 스테인리스 구조로 온도를 오래 붙잡습니다. 미지근한 커피는 이제 그만.",
        },
        {
          icon: "❄️",
          iconImage: U("photo-1523362628745-0c100150b504"),
          title: "12시간 보냉, 얼음이 한나절을 버팁니다",
          desc: "여름 운동, 등산, 캠핑에 하나. 오후 내내 시원한 물을 마실 수 있어요.",
        },
        {
          icon: "🧼",
          iconImage: U("photo-1602143407151-7111542de6e8"),
          title: "입구가 넓어 손이 들어가는 세척",
          desc: "안쪽 코팅이 없어 냄새가 배지 않고, 식기세척기도 사용할 수 있습니다.",
        },
      ];
      c.callout = {
        text: "하루의 온도, 이 한 병으로",
        sub: "지금 주문 시 무료배송 + 7일 무조건 환불",
      };
      return c;
    },
  },

  // ── 2. EDITORIAL ────────────────────────────────────────
  {
    id: "editorial",
    label: "에디토리얼 (브랜드 · 미니멀)",
    desc: "세리프 대형 제목과 넓은 여백, 얇은 헤어라인으로 흐르는 럭셔리 브랜드 소개형.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "editorial";
      c.theme = { primary: "#1b1a17", bg: "#f7f5f1", text: "#1b1a17" };
      c.layout = { width: "normal", customPx: 960 };
      c.sections = [
        band("hero", undefined),
        band("highlights", undefined),
        band("detail", undefined),
        band("callout", undefined),
        band("checklist", undefined),
        band("reviews", undefined),
        band("specs", undefined),
        band("faq", undefined),
        band("steps", undefined, false),
        band("pricing", undefined, false),
      ];
      c.cta = { text: "제품 보러 가기", href: "#" };
      c.hero = {
        ...c.hero,
        badge: "New — Eau de Parfum",
        badgeBg: "transparent",
        badgeText: "#1b1a17",
        title: "피부에 머무는\n담백한 나무의 잔향",
        subtitle:
          "합성 머스크를 덜어내고 시더우드와 베티버를 중심에 둔 미니멀 시그니처. 하루가 지나도 옅게 남습니다.",
        image: U("photo-1615634260167-c8cdede054de", 1600),
        mode: "split",
      };
      c.highlights = [
        { icon: "01", title: "8시간 지속", desc: "가벼운 시작, 오래 남는 마무리. 은은한 잔향으로 이어집니다." },
        { icon: "02", title: "비건 포뮬러", desc: "동물성 원료를 쓰지 않고, 재활용 유리병에 담았습니다." },
        { icon: "03", title: "무착색", desc: "인공 색소 없이 원액 그대로. 옷에 묻어도 자국이 남지 않습니다." },
      ];
      c.detail = {
        heading: "하나의 노트에서 시작합니다",
        body:
          "버지니아산 시더우드를 베이스로, 상단에 베르가못과 핑크페퍼를 얹었습니다. 시간이 지나며 우디한 잔향과 화이트 머스크가 피부 위에 남습니다. 30ml / 50ml.",
        image: U("photo-1592945403244-b3fbafd7f539", 1400),
        mode: "split",
      };
      c.callout = {
        text: "향은 결국, 오래 곁에 두고 싶은지로 정해집니다",
        sub: "30ml · 50ml · 리필",
      };
      c.checklist = {
        heading: "이런 분께 어울립니다",
        items: [
          { text: "강한 향이 부담스러워 가벼운 향수를 찾는 분" },
          { text: "우디·머스크 계열을 좋아하는 분" },
          { text: "데일리로 매일 뿌릴 시그니처가 필요한 분" },
        ],
      };
      c.reviews = [
        { name: "정◦◦", text: "과하지 않아서 사무실에서도 부담 없이 쓸 수 있어요. 잔향이 특히 좋습니다.", rating: 5 },
        { name: "이◦◦", text: "우디 계열을 여러 개 써봤는데 이건 담백하면서도 깊이가 있어요.", rating: 5 },
        { name: "한◦◦", text: "재활용 유리병에 담긴 것도 마음에 들고, 리필이 있어서 계속 씁니다.", rating: 5 },
      ];
      c.specs = [
        { label: "용량", value: "30ml / 50ml" },
        { label: "부향률", value: "Eau de Parfum" },
        { label: "탑 노트", value: "베르가못 · 핑크페퍼" },
        { label: "베이스", value: "시더우드 · 베티버 · 머스크" },
      ];
      c.faq = [
        { q: "잔향은 얼마나 가나요?", a: "체질에 따라 다르지만 옷에 뿌리면 하루가 지나도 옅게 남습니다." },
        { q: "리필로만 구매할 수 있나요?", a: "본품 구매 이력이 있으면 리필(50ml)만 단독 구매할 수 있습니다." },
        { q: "테스터가 있나요?", a: "1.5ml 샘플 3종 세트를 별도로 판매합니다." },
      ];
      return c;
    },
  },

  // ── 3. SHOWCASE ─────────────────────────────────────────
  {
    id: "showcase",
    label: "쇼케이스 (서비스 · 앱 소개)",
    desc: "라운드 카드 그리드와 아이콘칩, 소프트 섀도우로 정리한 SaaS·서비스 소개형.",
    make: () => {
      const c = defaultStoreContent();
      c.style = "showcase";
      c.theme = { primary: "#4f46e5", bg: "#ffffff", text: "#1f2937" };
      c.layout = { width: "normal", customPx: 960 };
      c.sections = [
        band("hero", "#f6f7fb"),
        band("highlights", "#ffffff"),
        band("checklist", "#ffffff"),
        band("steps", "#f6f7fb"),
        band("detail", "#ffffff"),
        band("reviews", "#f6f7fb"),
        band("callout", undefined),
        band("pricing", "#ffffff"),
        band("faq", "#f6f7fb"),
        band("specs", "#ffffff", false),
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
      c.highlights = [
        { icon: "📅", title: "통합 캘린더", desc: "네이버·전화·워크인 예약을 한 캘린더에서 확인하고 관리합니다." },
        { icon: "🔔", title: "자동 알림", desc: "예약 확정·리마인드·노쇼 확인 문자를 자동으로 보냅니다." },
        { icon: "📊", title: "매출 리포트", desc: "일·주·월 매출과 재방문율을 자동으로 집계해 보여줍니다." },
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
          { title: "01 · 가입", desc: "이메일만으로 가입. 카드 등록이 필요 없습니다." },
          { title: "02 · 연동", desc: "쓰던 예약 채널을 연결하면 기존 예약을 그대로 가져옵니다." },
          { title: "03 · 초대", desc: "팀원을 초대하면 같은 일정을 실시간으로 함께 봅니다." },
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
        { name: "김소연", text: "캘린더 하나로 합치니까 전화 확인하는 시간이 확 줄었어요.", rating: 5 },
        { name: "박준호", text: "자동 리마인드 켜고 노쇼가 눈에 띄게 줄었습니다.", rating: 5 },
        { name: "이지민", text: "월말 정산이 클릭 한 번이라 회계사한테 그냥 넘깁니다.", rating: 5 },
      ];
      c.pricing = {
        price: "월 29,000원",
        compareAt: "39,000원",
        note: "베타 기간 한정가 · 언제든 해지",
        ctaHidden: false,
      };
      c.faq = [
        { q: "기존 예약 데이터를 옮길 수 있나요?", a: "채널을 연동하면 지난 3개월 예약을 자동으로 가져옵니다." },
        { q: "직원 수 제한이 있나요?", a: "베타 기간에는 인원 제한 없이 초대할 수 있습니다." },
        { q: "해지하면 데이터는요?", a: "해지 후 30일간 보관하며, 언제든 CSV로 내보낼 수 있습니다." },
      ];
      return c;
    },
  },
];

export const makePreset = (id: string): StoreContent =>
  (PRESETS.find((p) => p.id === id) || PRESETS[0]).make();
