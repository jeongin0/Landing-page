"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getProject, saveProject, setPublished } from "@/lib/storage";
import type { Project, StoreContent, SectionMode, SectionRef } from "@/lib/schema";
import {
  SECTION_LABELS,
  SECTION_MODE_LABELS,
  newBlock,
  newImageBlock,
  duplicateSectionRef,
} from "@/lib/schema";
import type { WidthPreset } from "@/lib/schema";
import StoreProduct from "@/components/templates/StoreProduct";
import GenerateModal from "@/components/GenerateModal";
import AuthWidget from "@/components/AuthWidget";
import ImageField from "@/components/ImageField";
import { FONTS, googleFontsHref } from "@/lib/fonts";

// 편집기에서 폰트를 고를 수 있는 텍스트 블록 라벨
const TEXT_LABELS: Record<string, string> = {
  "hero.badge": "메인 라벨(뱃지)",
  "hero.title": "메인 제목",
  "hero.subtitle": "메인 부제목",
  "detail.heading": "상세 제목",
  "detail.body": "상세 본문",
  "highlights.title": "강점 제목 (전체)",
  "highlights.desc": "강점 설명 (전체)",
  "reviews.text": "후기 내용 (전체)",
  "reviews.name": "후기 작성자 (전체)",
  "specs.label": "스펙 항목명 (전체)",
  "specs.value": "스펙 값 (전체)",
  "faq.q": "FAQ 질문 (전체)",
  "faq.a": "FAQ 답변 (전체)",
  "pricing.price": "가격",
  "pricing.compareAt": "정가(취소선)",
  "pricing.note": "가격 설명",
  "checklist.heading": "추천 대상 제목",
  "checklist.item": "추천 대상 항목 (전체)",
  "callout.text": "강조 문구",
  "callout.sub": "강조 문구 보조설명",
  "steps.heading": "진행 순서 제목",
  "steps.title": "단계 제목 (전체)",
  "steps.desc": "단계 설명 (전체)",
};
import { usePlan } from "@/lib/usePlan";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabaseBrowser } from "@/lib/supabase/client";

// <input type=color> 는 6자리 hex만 받음 (#RRGGBBAA -> #RRGGBB)
const hexOnly = (v: string) => {
  const m = /^#?([0-9a-fA-F]{6})/.exec(v || "");
  return m ? "#" + m[1] : "#000000";
};

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { checked } = useRequireAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selText, setSelText] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const { isPaid } = usePlan();

  useEffect(() => {
    if (!checked) return;
    getProject(id)
      .then((p) => {
        if (!p) setNotFound(true);
        else setProject(p);
      })
      .catch((e) => {
        console.error(e);
        setNotFound(true);
      });
  }, [id, checked]);

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

  // 선택한 텍스트 블록의 폰트/크기 오버라이드 갱신
  const setTextStyle = (key: string, patch: { font?: string; size?: number }) => {
    if (!project) return;
    const cur = project.content.textStyles ?? {};
    const merged: { font?: string; size?: number } = { ...cur[key], ...patch };
    if (merged.font === "system" || !merged.font) delete merged.font;
    if (!merged.size) delete merged.size;
    const next = { ...cur };
    if (merged.font || merged.size) next[key] = merged;
    else delete next[key];
    update({ ...project.content, textStyles: next });
  };

  // 강점/후기 항목 개수를 n개로 맞춤 (늘리면 빈 항목 추가, 줄이면 뒤에서 잘라냄)
  const BLANK = {
    highlights: { icon: "✨", title: "새 강점", desc: "설명을 입력하세요." },
    reviews: { name: "고객", text: "후기를 입력하세요.", rating: 5 },
  } as const;
  const resizeItems = (key: "highlights" | "reviews", n: number) => {
    const arr = project!.content[key] as Array<
      StoreContent["highlights"][number] | StoreContent["reviews"][number]
    >;
    if (n <= arr.length) return arr.slice(0, n);
    return [...arr, ...Array.from({ length: n - arr.length }, () => ({ ...BLANK[key] }))];
  };

  const updateSection = (index: number, patch: Partial<SectionRef>) => {
    if (!project) return;
    const arr = project.content.sections.map((s, i) =>
      i === index ? { ...s, ...patch } : s,
    );
    update({ ...project.content, sections: arr });
  };

  const addBlock = () => {
    if (!project) return;
    update({
      ...project.content,
      sections: [...project.content.sections, newBlock()],
    });
  };

  const addImageBlock = () => {
    if (!project) return;
    update({
      ...project.content,
      sections: [...project.content.sections, newImageBlock()],
    });
  };

  // 섹션 복제해서 바로 아래에 추가
  const duplicateSection = (index: number) => {
    if (!project) return;
    const arr = [...project.content.sections];
    arr.splice(index + 1, 0, duplicateSectionRef(arr[index]));
    update({ ...project.content, sections: arr });
  };

  // block 은 삭제, 기본 섹션은 비활성으로
  const removeSection = (index: number) => {
    if (!project) return;
    const s = project.content.sections[index];
    if (s.type === "block") {
      update({
        ...project.content,
        sections: project.content.sections.filter((_, i) => i !== index),
      });
    } else {
      updateSection(index, { enabled: false });
    }
  };

  const setSectionWidth = (index: number, w: string) => {
    updateSection(index, {
      w: w === "inherit" ? undefined : (w as NonNullable<SectionRef["w"]>),
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
      try {
        await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
      } catch {}
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
    const { data: sess } = await supabaseBrowser().auth.getSession();
    const token = sess.session?.access_token;
    const res = await fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

  const usedFontsHref = googleFontsHref(
    Object.values(project.content.textStyles ?? {}).map((s) => s.font),
  );

  return (
    <div className="flex h-screen flex-col">
      {usedFontsHref && <link rel="stylesheet" href={usedFontsHref} />}
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
          <AuthWidget hideSignOut />
          <button
            onClick={() => {
              if (!isPaid) {
                alert("AI 카피 생성은 Pro 이상 플랜에서 이용할 수 있습니다.");
                location.href = "/pricing";
                return;
              }
              setShowGenerate(true);
            }}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white"
          >
            ✨ AI로 카피 생성{!isPaid && " (Pro)"}
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold"
          >
            {editing ? "미리보기" : "편집하기"}
          </button>
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
          <aside className="w-[340px] shrink-0 space-y-5 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 text-sm">
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <h3 className="mb-2 font-bold text-violet-900">글자 스타일</h3>
              {selText ? (
                <>
                  <div className="mb-2 text-xs font-semibold text-violet-800">
                    {TEXT_LABELS[selText] ?? selText}
                  </div>
                  <label className="mb-2 flex items-center justify-between text-gray-600">
                    <span>폰트</span>
                    <select
                      value={project.content.textStyles?.[selText]?.font ?? "system"}
                      onChange={(e) => setTextStyle(selText, { font: e.target.value })}
                      className="w-40 rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {Object.entries(FONTS).map(([k, f]) => (
                        <option key={k} value={k}>{f.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center justify-between text-gray-600">
                    <span>크기(px)</span>
                    <input
                      type="number"
                      min={8}
                      max={120}
                      placeholder="자동"
                      value={project.content.textStyles?.[selText]?.size ?? ""}
                      onChange={(e) =>
                        setTextStyle(selText, {
                          size: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-40 rounded border border-gray-300 px-2 py-1 text-xs"
                    />
                  </label>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setTextStyle(selText, { font: undefined, size: undefined })}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                    >
                      기본값으로
                    </button>
                    <button
                      onClick={() => setSelText(null)}
                      className="rounded px-2 py-1 text-xs text-gray-400"
                    >
                      선택 해제
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-violet-700">
                  미리보기에서 <b>바꾸고 싶은 글자를 클릭</b>하면 여기서 폰트·크기를 조절할 수 있어요.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">라벨 (뱃지) 색</h3>
              <label className="mb-2 flex items-center justify-between">
                <span className="text-gray-600">배경</span>
                <input type="color" value={hexOnly(project.content.hero.badgeBg)}
                  onChange={(e) => update({ ...project.content, hero: { ...project.content.hero, badgeBg: e.target.value } })}
                  className="h-7 w-12 rounded border border-gray-300" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-600">글자</span>
                <input type="color" value={hexOnly(project.content.hero.badgeText)}
                  onChange={(e) => update({ ...project.content, hero: { ...project.content.hero, badgeText: e.target.value } })}
                  className="h-7 w-12 rounded border border-gray-300" />
              </label>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">섹션 (순서 · 배경 · 이미지)</h3>
              <div className="space-y-1.5">
                {project.content.sections.map((s, i) => (
                  <div key={s.key || s.type} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={s.enabled}
                        onChange={() => updateSection(i, { enabled: !s.enabled })}
                      />
                      <span className={"flex-1 truncate " + (s.enabled ? "" : "text-gray-400 line-through")}>
                        {s.type === "block"
                          ? s.block?.heading || "자유 블록"
                          : SECTION_LABELS[s.type]}
                      </span>
                      <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                        className="px-1 text-gray-400 disabled:opacity-30">▲</button>
                      <button onClick={() => moveSection(i, 1)} disabled={i === project.content.sections.length - 1}
                        className="px-1 text-gray-400 disabled:opacity-30">▼</button>
                      <button onClick={() => duplicateSection(i)}
                        title="이 섹션 복제"
                        className="px-1 text-gray-400 hover:text-gray-900">⧉</button>
                      <button onClick={() => removeSection(i)}
                        title={s.type === "block" ? "삭제" : "숨기기"}
                        className="px-1 text-gray-300 hover:text-red-500">✕</button>
                    </div>
                    {s.enabled && (
                      <div className="mt-1.5 space-y-1.5 border-t border-gray-100 pt-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="w-9 shrink-0">배경</span>
                          <input
                            type="color"
                            value={hexOnly(s.bg || "#ffffff")}
                            onChange={(e) => updateSection(i, { bg: e.target.value })}
                            className="h-6 w-9 rounded border border-gray-300"
                          />
                          {s.bg && (
                            <button onClick={() => updateSection(i, { bg: undefined })}
                              className="underline">없음</button>
                          )}
                          <select
                            value={s.pad || "normal"}
                            onChange={(e) => updateSection(i, { pad: e.target.value as SectionRef["pad"] })}
                            className="ml-auto rounded border border-gray-200 px-1 py-0.5"
                          >
                            <option value="tight">여백 좁게</option>
                            <option value="normal">여백 보통</option>
                            <option value="loose">여백 넓게</option>
                          </select>
                        </div>
                        <div className="text-[11px] text-gray-500">
                          <div className="mb-0.5">배경 이미지</div>
                          <ImageField
                            value={s.bgImage || ""}
                            projectId={project.id}
                            onChange={(url) => updateSection(i, { bgImage: url || undefined })}
                          />
                          {s.bgImage && (
                            <div className="mt-1 flex items-center gap-2">
                              <select
                                value={s.bgFit || "cover"}
                                onChange={(e) => updateSection(i, { bgFit: e.target.value as SectionRef["bgFit"] })}
                                className="rounded border border-gray-200 px-1 py-0.5"
                              >
                                <option value="cover">채우기(잘림)</option>
                                <option value="contain">원본 비율(안잘림)</option>
                              </select>
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={!!s.bgFixed}
                                  onChange={(e) => updateSection(i, { bgFixed: e.target.checked || undefined })}
                                />
                                고정
                              </label>
                            </div>
                          )}
                          {s.bgImage && s.bgFit !== "contain" && (
                            <p className="mt-0.5 text-[10px] text-gray-400">
                              배경 이미지 위에는 위 배경색이 반투명 오버레이로 깔립니다.
                            </p>
                          )}
                        </div>
                        {(s.type === "hero" || s.type === "detail" || s.type === "block") && (
                          <select
                            value={
                              s.type === "block"
                                ? s.block?.mode || "text"
                                : project.content[s.type].mode ?? "split"
                            }
                            onChange={(e) => {
                              const m = e.target.value as SectionMode;
                              if (s.type === "block")
                                updateSection(i, { block: { ...s.block!, mode: m } });
                              else
                                update({
                                  ...project.content,
                                  [s.type]: { ...project.content[s.type], mode: m },
                                });
                            }}
                            className="w-full rounded border border-gray-200 px-1 py-0.5 text-[11px] text-gray-500"
                          >
                            {(Object.keys(SECTION_MODE_LABELS) as SectionMode[]).map((m) => (
                              <option key={m} value={m}>{SECTION_MODE_LABELS[m]}</option>
                            ))}
                          </select>
                        )}
                        {s.type === "block" && s.block?.mode !== "text" && (
                          <ImageField
                            value={s.block?.image || ""}
                            projectId={project.id}
                            onChange={(url) =>
                              updateSection(i, { block: { ...s.block!, image: url } })
                            }
                          />
                        )}
                        {s.type === "hero" && project.content.hero.mode !== "text" && (
                          <div className="text-[11px] text-gray-500">
                            <div className="mb-0.5">메인 이미지</div>
                            <ImageField
                              value={project.content.hero.image}
                              projectId={project.id}
                              onChange={(url) =>
                                update({ ...project.content, hero: { ...project.content.hero, image: url } })
                              }
                            />
                          </div>
                        )}
                        {s.type === "detail" && project.content.detail.mode !== "text" && (
                          <div className="text-[11px] text-gray-500">
                            <div className="mb-0.5">상세 이미지</div>
                            <ImageField
                              value={project.content.detail.image}
                              projectId={project.id}
                              onChange={(url) =>
                                update({ ...project.content, detail: { ...project.content.detail, image: url } })
                              }
                            />
                          </div>
                        )}
                        {s.type === "highlights" && (
                          <div className="text-[11px] text-gray-500">
                            <div className="mb-1">강점 이미지 (비우면 이모지·번호)</div>
                            {project.content.highlights.map((h, hi) => (
                              <div key={hi} className="mb-1.5">
                                <div className="text-[10px] text-gray-400">
                                  {hi + 1}. {h.title || "강점"}
                                </div>
                                <ImageField
                                  value={h.iconImage || ""}
                                  projectId={project.id}
                                  onChange={(url) => {
                                    const highlights = [...project.content.highlights];
                                    highlights[hi] = { ...h, iconImage: url || undefined };
                                    update({ ...project.content, highlights });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <select
                          value={s.w || "inherit"}
                          onChange={(e) => setSectionWidth(i, e.target.value)}
                          className="w-full rounded border border-gray-200 px-1 py-0.5 text-[11px] text-gray-500"
                        >
                          <option value="inherit">폭: 전체 설정 따름</option>
                          <option value="mobile">폭: 모바일 (640)</option>
                          <option value="narrow">폭: 좁게 (720)</option>
                          <option value="normal">폭: 보통 (960)</option>
                          <option value="wide">폭: 넓게 (1280)</option>
                          <option value="full">폭: 최대 (1920)</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-1.5">
                <button
                  onClick={addBlock}
                  className="flex-1 rounded-lg border border-dashed border-gray-300 py-1.5 text-xs font-semibold text-gray-500 hover:border-gray-500"
                >
                  + 텍스트 블록
                </button>
                <button
                  onClick={addImageBlock}
                  className="flex-1 rounded-lg border border-dashed border-gray-300 py-1.5 text-xs font-semibold text-gray-500 hover:border-gray-500"
                >
                  + 통이미지 블록
                </button>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                ⧉ 로 섹션을 복제할 수 있어요. 통이미지 블록을 여러 개 넣어 이미지·텍스트를 번갈아 배치하세요.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-gray-700">항목 개수</h3>
              {([
                ["highlights", "강점"],
                ["reviews", "후기"],
              ] as const).map(([key, label]) => (
                <label key={key} className="mb-2 flex items-center justify-between text-gray-600">
                  <span>{label}</span>
                  <select
                    value={Math.min(4, Math.max(2, project.content[key].length))}
                    onChange={(e) =>
                      update({
                        ...project.content,
                        [key]: resizeItems(key, Number(e.target.value)),
                      })
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    <option value={2}>2개</option>
                    <option value={3}>3개</option>
                    <option value={4}>4개</option>
                  </select>
                </label>
              ))}
              <p className="text-[11px] text-gray-400">개수를 늘리면 빈 항목이 추가돼요.</p>
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
                <option value="mobile">모바일 상세페이지 (640px)</option>
                <option value="narrow">좁게 (720px)</option>
                <option value="normal">보통 (960px)</option>
                <option value="wide">넓게 (1280px)</option>
                <option value="full">전체 (1920px)</option>
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

            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              💡 페이지의 <b>글자를 직접 클릭</b>하면 바로 수정됩니다. 이미지 크기·비율·여백은 미리보기에서 손잡이를 <b>드래그</b>해 조절해요. 자동 저장됩니다.
            </div>
          </aside>
        )}

        {/* 미리보기 (PC 전용) */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div
            ref={previewRef}
            className="mx-auto w-full max-w-[1920px] overflow-hidden rounded-lg bg-white shadow-xl"
          >
            <StoreProduct
              content={project.content}
              onChange={update}
              editing={editing}
              canResize={isPaid}
              selectedTextKey={selText}
              onSelectText={setSelText}
            />
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

      {/* 이미지 캡처 전용 (화면 밖, 고정 1280px) */}
      <div
        aria-hidden
        style={{ position: "absolute", left: -99999, top: 0, width: 1920 }}
      >
        <div ref={captureRef} style={{ width: 1920 }}>
          <StoreProduct content={project.content} editing={false} />
        </div>
      </div>
    </div>
  );
}
