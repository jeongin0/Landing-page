// ── 저장소 레이어 (v1: localStorage) ──────────────────────────────
// v2에서 이 파일의 함수 본문만 Supabase 호출로 교체하면 됩니다.
// 나머지 코드(에디터, 렌더러)는 이 인터페이스만 사용합니다.

import type { Project } from "./schema";
import { defaultStoreContent } from "./defaultContent";

const INDEX_KEY = "lpb:index";
const projectKey = (id: string) => `lpb:project:${id}`;

function readIndex(): string[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
  } catch {
    /* 저장 실패는 조용히 무시 (시크릿 모드 등) */
  }
}

export function listProjects(): Project[] {
  return readIndex()
    .map((id) => getProject(id))
    .filter((p): p is Project => p !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(id: string): Project | null {
  try {
    const raw = localStorage.getItem(projectKey(id));
    return raw ? (JSON.parse(raw) as Project) : null;
  } catch {
    return null;
  }
}

export function saveProject(project: Project): void {
  const next = { ...project, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(projectKey(next.id), JSON.stringify(next));
    const ids = readIndex();
    if (!ids.includes(next.id)) writeIndex([next.id, ...ids]);
  } catch {
    /* 무시 */
  }
}

export function deleteProject(id: string): void {
  try {
    localStorage.removeItem(projectKey(id));
    writeIndex(readIndex().filter((x) => x !== id));
  } catch {
    /* 무시 */
  }
}

export function createProject(title: string): Project {
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    title: title.trim() || "제목 없는 페이지",
    templateId: "store-01",
    content: defaultStoreContent(),
    createdAt: now,
    updatedAt: now,
  };
  saveProject(project);
  return project;
}
