"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listProjects, createProject, deleteProject } from "@/lib/storage";
import type { Project } from "@/lib/schema";
import Header from "@/components/Header";
import { usePlan } from "@/lib/usePlan";

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { isPaid } = usePlan();
  const atFreeLimit = !isPaid && projects.length >= 1;

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (busy) return;
    if (atFreeLimit) {
      if (confirm("무료 플랜은 프로젝트 1개까지예요. 요금제 페이지로 갈까요?"))
        router.push("/pricing");
      return;
    }
    setBusy(true);
    try {
      const p = await createProject(title || "새 랜딩페이지");
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
        <p className="mt-1 text-sm text-gray-500">
          스토어 단일상품 템플릿 · 텍스트/이미지/색상을 클릭해서 수정하세요.
        </p>

      <div className="mt-8 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="프로젝트 이름 (예: 여름 텀블러 런칭)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={busy}
          className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {busy ? "생성 중…" : "새로 만들기"}
        </button>
      </div>

      {atFreeLimit && (
        <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          무료 플랜은 프로젝트 1개까지예요.{" "}
          <Link href="/pricing" className="font-semibold underline">
            Pro로 업그레이드
          </Link>{" "}
          하면 무제한 + 워터마크가 사라집니다.
        </div>
      )}

      <div className="mt-8 space-y-2">
        {loading && (
          <p className="p-8 text-center text-sm text-gray-400">불러오는 중…</p>
        )}
        {!loading && projects.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            아직 프로젝트가 없습니다. 위에서 하나 만들어보세요.
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
