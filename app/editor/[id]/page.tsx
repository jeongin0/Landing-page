"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getProject, saveProject } from "@/lib/storage";
import type { Project, StoreContent } from "@/lib/schema";
import StoreProduct from "@/components/templates/StoreProduct";
import GenerateModal from "@/components/GenerateModal";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const p = getProject(id);
    if (!p) setNotFound(true);
    else setProject(p);
  }, [id]);

  // 변경 시 0.6초 후 자동 저장
  const update = (content: StoreContent) => {
    if (!project) return;
    const next = { ...project, content };
    setProject(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProject(next);
      setSavedAt(new Date().toLocaleTimeString("ko-KR"));
    }, 600);
  };

  const patchTheme = (k: keyof StoreContent["theme"], v: string) => {
    if (!project) return;
    update({ ...project.content, theme: { ...project.content.theme, [k]: v } });
  };

  const handleExport = async () => {
    if (!project) return;
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: project.content }),
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
          <button
            onClick={handleExport}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white"
          >
            HTML 내보내기
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드 패널 */}
        {editing && (
          <aside className="w-64 shrink-0 space-y-5 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 text-sm">
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
              <h3 className="mb-2 font-bold text-gray-700">이미지 주소</h3>
              <label className="mb-1 block text-gray-600">히어로 이미지</label>
              <input
                value={project.content.hero.image}
                onChange={(e) =>
                  update({
                    ...project.content,
                    hero: { ...project.content.hero, image: e.target.value },
                  })
                }
                className="mb-3 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              />
              <label className="mb-1 block text-gray-600">상세 이미지</label>
              <input
                value={project.content.detail.image}
                onChange={(e) =>
                  update({
                    ...project.content,
                    detail: { ...project.content.detail, image: e.target.value },
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              />
              <p className="mt-2 text-xs text-gray-400">
                이미지 파일 업로드는 다음 버전(클라우드 저장)에서 지원됩니다. 지금은 URL을 넣어주세요.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              💡 페이지의 <b>글자를 직접 클릭</b>하면 바로 수정됩니다. 수정 내용은 자동 저장돼요.
            </div>
          </aside>
        )}

        {/* 미리보기 */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
            <StoreProduct content={project.content} onChange={update} editing={editing} />
          </div>
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
    </div>
  );
}
