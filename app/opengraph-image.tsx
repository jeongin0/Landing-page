import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "상세페이지 빌더 — 상세페이지, 직접 만드세요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets/Pretendard-Regular.otf")),
    readFile(join(process.cwd(), "assets/Pretendard-Bold.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "80px",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "999px",
              background: "#f3f4f6",
              padding: "10px 22px",
              fontSize: 26,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            개발자 · 외주 없이
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            상세페이지, 직접 만드세요
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>스마트스토어·강의·지역 사업용 상세페이지 본문을</span>
            <span>클릭 편집으로 완성. 코드 몰라도 됩니다.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#111827",
              }}
            />
            <div
              style={{
                marginLeft: 16,
                fontSize: 30,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              상세페이지 빌더
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 400, color: "#9ca3af" }}>
            landing-page-jeongin2.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
