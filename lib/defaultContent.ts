import type { StoreContent } from "./schema";

// 새 프로젝트 생성 시 기본값 (샘플: 휴대용 텀블러)
export const defaultStoreContent = (): StoreContent => ({
  theme: {
    primary: "#111827",
    bg: "#ffffff",
    text: "#1f2937",
  },
  brand: {
    name: "브랜드명",
    ctaText: "지금 구매하기",
    ctaHref: "#pricing",
  },
  hero: {
    badge: "신제품 출시",
    title: "하루 종일 온도를 지키는\n스테인리스 텀블러",
    subtitle: "6시간 보온, 12시간 보냉. 한 손에 잡히는 350ml 사이즈로 출근길부터 퇴근길까지.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&q=80",
    ctaText: "지금 구매하기",
  },
  highlights: [
    { icon: "🔥", title: "6시간 보온", desc: "진공 2중 구조로 아침에 담은 커피를 점심까지 따뜻하게." },
    { icon: "❄️", title: "12시간 보냉", desc: "얼음이 한나절을 버팁니다. 여름 운동 필수템." },
    { icon: "🧼", title: "간편 세척", desc: "입구가 넓어 손이 들어가고, 식기세척기 사용 가능." },
  ],
  detail: {
    heading: "왜 이 텀블러일까요?",
    body: "18/8 식품용 스테인리스만 사용했습니다. 안쪽 코팅 없이 원료 그대로라 냄새가 배지 않고, 밀폐 뚜껑은 거꾸로 들어도 새지 않습니다. 바닥에는 미끄럼 방지 실리콘이 있어 책상에서 넘어지지 않습니다.",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1200&q=80",
  },
  specs: [
    { label: "용량", value: "350ml" },
    { label: "무게", value: "290g" },
    { label: "소재", value: "스테인리스 304" },
    { label: "구성", value: "본체, 밀폐뚜껑, 세척솔" },
  ],
  reviews: [
    { name: "김**", text: "출근길에 담은 아메리카노가 점심까지 뜨거워요. 재구매합니다.", rating: 5 },
    { name: "이**", text: "디자인이 깔끔하고 손에 딱 잡혀요. 선물용으로도 좋아요.", rating: 5 },
    { name: "박**", text: "뚜껑이 정말 안 새요. 가방에 그냥 넣고 다닙니다.", rating: 4 },
  ],
  pricing: {
    price: "24,900원",
    compareAt: "32,000원",
    note: "무료배송 · 7일 이내 무조건 교환/환불",
    ctaText: "지금 구매하기",
  },
  faq: [
    { q: "식기세척기에 넣어도 되나요?", a: "본체와 뚜껑 모두 식기세척기 사용 가능합니다. 단, 고온 건조는 실리콘 수명을 줄일 수 있어 자연 건조를 권장합니다." },
    { q: "배송은 얼마나 걸리나요?", a: "평일 오후 2시 이전 주문 시 당일 출고되며, 보통 1~2일 내 도착합니다." },
    { q: "교환/환불이 가능한가요?", a: "수령 후 7일 이내 단순 변심에도 무료로 교환/환불해 드립니다." },
  ],
  footer: {
    text: "© 2026 브랜드명 · 사업자등록번호 000-00-00000 · 문의 help@example.com",
  },
});
