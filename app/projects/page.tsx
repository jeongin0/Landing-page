"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listProjects, createProject, deleteProject } from "@/lib/storage";
import type { Project } from "@/lib/schema";
import Header from "@/components/Header";
import { usePlan } from "@/lib/usePlan";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { PRESETS } from "@/lib/presets";

export default function ProjectsPage() {
  const router = useRouter();
  const { checked } = useRequireAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { isPaid } = usePlan();
  const FREE_MAX = 3;
  const atFreeLimit = !isPaid && projects.length >= FREE_MAX;

  useEffect(() => {
    if (!checked) return;
    listProjects()
      .then(setProjects)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [checked]);

  if (!checked)
    return <p className="p-10 text-center text-sm text-gray-400">불러오는 중…</p>;

  const handleCreate = async (presetId: string) => {
    if (busy) return;
    if (atFreeLimit) {
      if (confirm(`무료 플랜은 프로젝트 ${FREE_MAX}개까지예요. 요금제 페이지로 갈까요?`))
        router.push("/pricing");
      return;
    }
    setBusy(true);
    try {
      const label = PRESETS.find((p) => p.id === presetId)?.label || "새 페이지";
      const p = await createProject(label, presetId);
      router.push(`/editor/${p.id}`);
    } catch (e) {
      alert("생성 실패: " + (e instanceof Error ? e.message : ""));
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 프로젝트를 삭제할까요?")) return;
    await deleteProject(id);
    setProjects(await listProjects());
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-2xl font-extrabold">내 프로젝트</h1>

        <h2 className="mt-8 text-sm font-bold text-gray-700">템플릿 선택해서 새로 만들기</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleCreate(p.id)}
              disabled={busy}
              className="rounded-xl border border-gray-200 p-4 text-left hover:border-gray-900 disabled:opacity-40"
            >
              <div className="font-semibold">{p.label}</div>
              <div className="mt-1 text-xs text-gray-500">{p.desc}</div>
            </button>
          ))}
        </div>

        {atFreeLimit && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            무료 플랜은 프로젝트 {FREE_MAX}개까지예요.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Pro로 업그레이드
            </Link>{" "}
            하면 무제한 + 워터마크가 사라집니다.
          </div>
        )}

        <div className="mt-10 space-y-2">
          {loading && <p className="p-8 text-center text-sm text-gray-400">불러오는 중…</p>}
          {!loading && projects.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
              아직 프로젝트가 없습니다. 위에서 템플릿을 골라 시작하세요.
            </p>
          )}
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <Link href={`/editor/${p.id}`} className="font-semibold hover:underline">
                  {p.title}
                </Link>
                <div className="text-xs text-gray-400">
                  수정: {new Date(p.updatedAt).toLocaleString("ko-KR")}
                  {p.published && " · 게시됨"}
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/editor/${p.id}`} className="text-blue-600 hover:underline">
                  편집
                </Link>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
