import Link from "next/link";
import Header from "@/components/Header";

const features = [
  {
    icon: "🧩",
    title: "본문만 만듭니다",
    desc: "헤더·푸터는 쓰던 사이트(스마트스토어·카페24 등) 그대로. 그 안에 들어갈 상세페이지 본문만.",
  },
  {
    icon: "🖱️",
    title: "클릭해서 수정",
    desc: "글자를 클릭하면 바로 고쳐집니다. 색상·이미지·섹션 순서도 패널에서 몇 번 클릭.",
  },
  {
    icon: "✨",
    title: "AI가 초안 작성",
    desc: "상품 정보만 넣으면 제목·강점·상세·후기·FAQ 문구를 자동으로 채워줍니다.",
  },
  {
    icon: "📤",
    title: "링크·HTML·이미지로 내보내기",
    desc: "공유 링크 하나로 게시하거나, HTML/이미지 파일로 받아서 어디든 붙여넣기.",
  },
];

const steps = [
  "템플릿 선택 (스토어 / 강의 / 로컬 서비스)",
  "글자·이미지 클릭해서 내 내용으로 교체",
  "필요 없는 섹션 끄고 순서 조정",
  "공유 링크 복사 또는 HTML·이미지로 내보내기",
];

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* 히어로 */}
        <section className="mx-auto max-w-3xl px-5 py-20 text-center">
          <span className="inline-block rounded-full bg-gray-900/5 px-3 py-1 text-xs font-semibold">
            개발자 · 외주 없이
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            상세페이지, 직접 만드세요
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            스마트스토어·강의·지역 사업용 상세페이지 본문을 클릭 편집으로 완성.
            디자인 감각 없어도, 코드 몰라도 됩니다.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/projects"
              className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold"
            >
              요금제 보기
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-400">가입 없이 바로 만들어볼 수 있어요</p>
        </section>

        {/* 기능 */}
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="mx-auto grid max-w-4xl gap-6 px-5 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="text-2xl">{f.icon}</div>
                <div className="mt-3 font-bold">{f.title}</div>
                <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 사용 순서 */}
        <section className="mx-auto max-w-2xl px-5 py-16">
          <h2 className="text-center text-2xl font-extrabold">4단계면 끝</h2>
          <ol className="mt-6 space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-gray-200 p-4">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="border-t border-gray-100 py-16 text-center">
          <h2 className="text-2xl font-extrabold">지금 하나 만들어보세요</h2>
          <p className="mt-2 text-sm text-gray-500">무료 플랜으로 프로젝트 3개까지 무료</p>
          <Link
            href="/projects"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-8 py-3 font-semibold text-white"
          >
            시작하기
          </Link>
        </section>

        <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
          © 2026 랜딩페이지 빌더
        </footer>
      </main>
    </>
  );
}
