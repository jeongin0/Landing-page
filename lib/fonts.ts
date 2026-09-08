// 선택 가능한 폰트 목록. 시스템 폰트 1종 + 한글 웹폰트(구글폰트).
// 웹폰트만 쓰므로 HTML·이미지·공개페이지 어디서 열어도 동일하게 보인다.

export type FontDef = { label: string; stack: string; google?: string };

export const FONTS: Record<string, FontDef> = {
  system: {
    label: "시스템 기본",
    stack:
      "-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',sans-serif",
  },
  notoSansKr: {
    label: "본고딕 (Noto Sans KR)",
    stack: "'Noto Sans KR',sans-serif",
    google: "Noto+Sans+KR:wght@400;500;700;900",
  },
  nanumGothic: {
    label: "나눔고딕",
    stack: "'Nanum Gothic',sans-serif",
    google: "Nanum+Gothic:wght@400;700;800",
  },
  nanumMyeongjo: {
    label: "나눔명조 (세리프)",
    stack: "'Nanum Myeongjo',serif",
    google: "Nanum+Myeongjo:wght@400;700;800",
  },
  gothicA1: {
    label: "고딕 A1",
    stack: "'Gothic A1',sans-serif",
    google: "Gothic+A1:wght@300;400;500;700;900",
  },
  ibmPlexSansKr: {
    label: "IBM Plex Sans KR",
    stack: "'IBM Plex Sans KR',sans-serif",
    google: "IBM+Plex+Sans+KR:wght@400;500;700",
  },
  doHyeon: {
    label: "도현 (제목용)",
    stack: "'Do Hyeon',sans-serif",
    google: "Do+Hyeon",
  },
  jua: {
    label: "주아 (둥근 제목)",
    stack: "'Jua',sans-serif",
    google: "Jua",
  },
  blackHanSans: {
    label: "검은고딕 (강한 제목)",
    stack: "'Black Han Sans',sans-serif",
    google: "Black+Han+Sans",
  },
  gaegu: {
    label: "개구 (손글씨)",
    stack: "'Gaegu',cursive",
    google: "Gaegu:wght@400;700",
  },
  nanumPenScript: {
    label: "나눔손글씨 펜",
    stack: "'Nanum Pen Script',cursive",
    google: "Nanum+Pen+Script",
  },
};

export const fontStack = (key?: string): string | undefined =>
  key && FONTS[key] ? FONTS[key].stack : undefined;

// 사용된 폰트 키들 -> 구글폰트 stylesheet URL (없으면 null)
export function googleFontsHref(keys: Iterable<string | undefined>): string | null {
  const fams = [...new Set(keys)]
    .map((k) => (k ? FONTS[k]?.google : undefined))
    .filter((g): g is string => !!g);
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams
    .map((f) => `family=${f}`)
    .join("&")}&display=swap`;
}
