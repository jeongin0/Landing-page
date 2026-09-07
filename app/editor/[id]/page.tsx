"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getProject, saveProject, setPublished } from "@/lib/storage";
import type { Project, StoreContent, SectionType } from "@/lib/schema";
import { SECTION_LABELS } from "@/lib/schema";
import type { WidthPreset } from "@/lib/schema";
import { exportHtml } from "@/lib/exportHtml";
import StoreProduct from "@/components/templates/StoreProduct";
import GenerateModal from "@/components/GenerateModal";
import AuthWidget from "@/components/AuthWidget";
import ImageField from "@/components/ImageField";
import { usePlan } from "@/lib/usePlan";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const { isPaid } = usePlan();

  useEffect(() => {
    getProject(id)
      .then((p) => {
        if (!p) setNotFound(true);
        else setProject(p);
      })
      .catch((e) => {
        console.error(e);
        setNotFound(true);
      });
  }, [id]);

  // 변경 시 0.6초 후 자동 저장
  const update = (content: StoreContent) => {
    if (!project) return;
    const next = { ...project, content };
    setProject(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProject(next)
        .then(() => setSavedAt(new Date().toLocaleTimeString("ko-KR")))
        .catch((e) => setSavedAt("저장 실패: " + (e?.message ?? "")));
    }, 600);
  };

  const patchTheme = (k: keyof StoreContent["theme"], v: string) => {
    if (!project) return;
    update({ ...project.content, theme: { ...project.content.theme, [k]: v } });
  };

  const toggleSection = (type: SectionType) => {
    if (!project) return;
    update({
      ...project.content,
      sections: project.content.sections.map((s) =>
        s.type === type ? { ...s, enabled: !s.enabled } : s,
      ),
    });
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    if (!project) return;
    const arr = [...project.content.sections];
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    update({ ...project.content, sections: arr });
  };

  const [pubBusy, setPubBusy] = useState(false);
  const publicUrl =
    typeof window !== "undefined" ? `${location.origin}/p/${id}` : "";

  const handleShare = async () => {
    if (!project || pubBusy) return;
    setPubBusy(true);
    try {
      if (!project.published) {
        await setPublished(id, true);
        setProject({ ...project, published: true });
      }
      await navigator.clipboard?.writeText(publicUrl).catch(() => {});
      alert("공유 링크가 복사되었습니다:\n" + publicUrl);
    } catch (e) {
      alert("실패: " + (e instanceof Error ? e.message : ""));
    } finally {
      setPubBusy(false);
    }
  };

  const makePrivate = async () => {
    if (!project) return;
    await setPublished(id, false);
    setProject({ ...project, published: false });
  };

  const [imgBusy, setImgBusy] = useState(false);
  const handleImage = async (fmt: "png" | "jpeg" | "webp") => {
    if (!captureRef.current || imgBusy) return;
    setImgBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 300)); // 캡처용 렌더 + 이미지 로드 대기
      const lib = await import("html-to-image");
      const node = captureRef.current;
      const w = node.scrollWidth;
      const h = node.scrollHeight;
      const opts = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: w,
        height: h,
        style: { margin: "0", transform: "none" },
      };
      let dataUrl: string;
      if (fmt === "png") dataUrl = await lib.toPng(node, opts);
      else if (fmt === "jpeg")
        dataUrl = await lib.toJpeg(node, { ...opts, quality: 0.95 });
      else {
        const canvas = await lib.toCanvas(node, opts);
        dataUrl = canvas.toDataURL("image/webp", 0.95);
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${project?.title || "landing"}.${fmt}`;
      a.click();
    } catch (e) {
      alert("이미지 저장 실패: " + (e instanceof Error ? e.message : ""));
    } finally {
      setImgBusy(false);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: project.content, paid: isPaid }),
    });
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "landing"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (notFound)
    return (
      <div className="p-10">
        <p>프로젝트를 찾을 수 없습니다.</p>
        <Link href="/" className="text-blue-600 underline">
          홈으로
        </Link>
      </div>
    );
  if (!project) return <div className="p-10 text-gray-400">불러오는 중…</div>;

  return (
    <div className="flex h-screen flex-col">
      {/* 툴바 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← 목록
          </Link>
          <span className="font-semibold">{project.title}</span>
          {savedAt && <span className="text-xs text-gray-400">저장됨 {savedAt}</span>}
        </div>
        <div className="flex items-center gap-2">
          {!isPaid && (
            <Link
              href="/pricing"
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800"
            >
              업그레이드
            </Link>
          )}
          <AuthWidget />
          <button
            onClick={() => setShowGenerate(true)}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white"
          >
            ✨ AI로 카피 생성
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold"
          >
            {editing ? "미리보기" : "편집하기"}
          </button>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm">
            <button onClick={() => setDevice("desktop")}
              className={"px-2.5 py-1.5 " + (device === "desktop" ? "bg-gray-900 text-white" : "")}>💻</button>
            <button onClick={() => setDevice("mobile")}
              className={"px-2.5 py-1.5 " + (device === "mobile" ? "bg-gray-900 text-white" : "")}>📱</button>
          </div>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold">
              {imgBusy ? "저장 중…" : "내보내기 ▾"}
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg">
              <button onClick={handleExport} className="block w-full rounded px-3 py-1.5 text-left hover:bg-gray-100">
                HTML 파일
              </button>
              <button onClick={() => handleImage("png")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-gray-100">
                PNG 이미지
              </button>
              <button onClick={() => handleImage("jpeg")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-gray-100">
                JPEG 이미지
              </button>
              <button onClick={() => handleImage("webp")} className="block w-full rounded px-3 py-1.5 text-left hover:bg-gray-100">
                WEBP 이미지
              </button>
            </div>
          </details>
          {project.published && (
            <>
              <a href={publicUrl} target="_blank" className="text-xs text-blue-600 underline">
                링크 ↗
              </a>
              <button onClick={makePrivate} className="text-xs text-gray-400 hover:underline">
                비공개
              </button>
            </>
          )}
          <button
            onClick={handleShare}
            disabled={pubBusy}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {pubBusy ? "…" : "공유"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드 패널 */}
        {editing && (
          <aside className="w-64 shrink-0 space-y-5 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 text-sm">
            <div>
              <h3 className="mb-2 font-bold text-gray-700">섹션 (순서 · 표시)</h3>
              <div className="space-y-1">
                {project.content.sections.map((s, i) => (
                  <div key={s.type} className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={() => toggleSection(s.type)}
                    />
                    <span className={"flex-1 " + (s.enabled ? "" : "text-gray-400 line-through")}>
                      {SECTION_LABELS[s.type]}
                    </span>
                    <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                      className="px-1 text-gray-400 disabled:opacity-30">▲</button>
                    <button onClick={() => moveSection(i, 1)} disabled={i === project.content.sections.length - 1}
                      className="px-1 text-gray-400 disabled:opacity-30">▼</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">본문 폭</h3>
              <select
                value={project.content.layout.width}
                onChange={(e) =>
                  update({
                    ...project.content,
                    layout: {
                      ...project.content.layout,
                      width: e.target.value as WidthPreset,
                    },
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="narrow">좁게 (720px)</option>
                <option value="normal">보통 (960px)</option>
                <option value="wide">넓게 (1200px)</option>
                <option value="full">전체 (100%)</option>
                <option value="custom">직접 지정</option>
              </select>
              {project.content.layout.width === "custom" && (
                <input
                  type="number"
                  value={project.content.layout.customPx}
                  onChange={(e) =>
                    update({
                      ...project.content,
                      layout: {
                        ...project.content.layout,
                        customPx: Number(e.target.value) || 960,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                  placeholder="px"
                />
              )}
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">구매 버튼</h3>
              <label className="mb-1 block text-gray-600">링크 주소 (구매/신청 페이지)</label>
              <input
                value={project.content.cta.href}
                onChange={(e) =>
                  update({
                    ...project.content,
                    cta: { ...project.content.cta, href: e.target.value },
                  })
                }
                placeholder="https://smartstore.naver.com/..."
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              />
              <p className="mt-1 text-xs text-gray-400">버튼 문구는 페이지에서 직접 클릭해 수정</p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">테마 색상</h3>
              {(["primary", "bg", "text"] as const).map((k) => (
                <label key={k} className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600">
                    {k === "primary" ? "포인트" : k === "bg" ? "배경" : "글자"}
                  </span>
                  <input
                    type="color"
                    value={project.content.theme[k]}
                    onChange={(e) => patchTheme(k, e.target.value)}
                    className="h-7 w-12 rounded border border-gray-300"
                  />
                </label>
              ))}
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">이미지</h3>
              <label className="mb-1 block text-gray-600">히어로 이미지</label>
              <ImageField
                value={project.content.hero.image}
                projectId={project.id}
                onChange={(url) =>
                  update({
                    ...project.content,
                    hero: { ...project.content.hero, image: url },
                  })
                }
              />
              <label className="mb-1 mt-3 block text-gray-600">상세 이미지</label>
              <ImageField
                value={project.content.detail.image}
                projectId={project.id}
                onChange={(url) =>
                  update({
                    ...project.content,
                    detail: { ...project.content.detail, image: url },
                  })
                }
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              💡 페이지의 <b>글자를 직접 클릭</b>하면 바로 수정됩니다. 수정 내용은 자동 저장돼요.
            </div>
          </aside>
        )}

        {/* 미리보기 */}
        <div className="flex-1 overflow-y-auto bg-gray-100 py-6">
          {device === "mobile" ? (
            <iframe
              title="모바일 미리보기"
              srcDoc={exportHtml(project.content)}
              className="mx-auto h-[780px] w-[390px] rounded-[28px] border-8 border-gray-800 bg-white"
            />
          ) : (
            <div
              ref={previewRef}
              className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-lg bg-white shadow-xl"
            >
              <StoreProduct content={project.content} onChange={update} editing={editing} />
            </div>
          )}
        </div>
      </div>

      {showGenerate && (
        <GenerateModal
          onClose={() => setShowGenerate(false)}
          onApply={(content) => {
            update(content);
            setShowGenerate(false);
          }}
          current={project.content}
        />
      )}

      {/* 이미지 캡처 전용 (화면 밖, 고정 1280px) */}
      <div
        aria-hidden
        style={{ position: "absolute", left: -99999, top: 0, width: 1280 }}
      >
        <div ref={captureRef} style={{ width: 1280 }}>
          <StoreProduct content={project.content} editing={false} />
        </div>
      </div>
    </div>
  );
}
