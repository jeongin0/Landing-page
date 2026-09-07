import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://landing-page-jeongin2.vercel.app"),
  title: "랜딩페이지 빌더",
  description: "스토어 단일상품 랜딩페이지를 클릭 편집으로 빠르게",
  openGraph: {
    title: "랜딩페이지 빌더",
    description: "상세페이지 본문을 클릭 편집으로 완성. 코드 몰라도 됩니다.",
    url: "https://landing-page-jeongin2.vercel.app",
    siteName: "랜딩페이지 빌더",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "랜딩페이지 빌더",
    description: "상세페이지 본문을 클릭 편집으로 완성. 코드 몰라도 됩니다.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
