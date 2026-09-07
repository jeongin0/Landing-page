// ── 저장소 레이어 (v2: Supabase) ─────────────────────────────
// 로그인 전에는 익명 세션(anonymous auth)으로 동작하고,
// 나중에 이메일 로그인하면 같은 user_id 가 그대로 이어집니다.

import type { Project } from "./schema";
import { defaultStoreContent } from "./defaultContent";
import { supabaseBrowser } from "./supabase/client";

type Row = {
  id: string;
  title: string;
  template_id: string;
  content: Project["content"];
  published: boolean | null;
  created_at: string;
  updated_at: string;
};

const rowToProject = (r: Row): Project => ({
  id: r.id,
  title: r.title,
  templateId: "store-01",
  content: r.content,
  published: !!r.published,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// 세션이 없으면 익명 세션을 만든다. user_id 를 반환.
export async function ensureUserId(): Promise<string> {
  const sb = supabaseBrowser();
  const { data } = await sb.auth.getSession();
  if (data.session?.user) return data.session.user.id;
  const { data: anon, error } = await sb.auth.signInAnonymously();
  if (error || !anon.user) throw new Error("세션 생성 실패: " + error?.message);
  return anon.user.id;
}

export async function listProjects(): Promise<Project[]> {
  const sb = supabaseBrowser();
  await ensureUserId();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const sb = supabaseBrowser();
  await ensureUserId();
  const { data, error } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProject(data as Row) : null;
}

export async function saveProject(project: Project): Promise<void> {
  const sb = supabaseBrowser();
  const userId = await ensureUserId();
  const { error } = await sb.from("projects").upsert({
    id: project.id,
    user_id: userId,
    title: project.title,
    template_id: project.templateId,
    content: project.content,
  });
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const sb = supabaseBrowser();
  await ensureUserId();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const sb = supabaseBrowser();
  await ensureUserId();
  const { error } = await sb.from("projects").update({ published }).eq("id", id);
  if (error) throw error;
}

export async function createProject(title: string): Promise<Project> {
  const sb = supabaseBrowser();
  const userId = await ensureUserId();
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    title: title.trim() || "제목 없는 페이지",
    templateId: "store-01",
    content: defaultStoreContent(),
    published: false,
    createdAt: now,
    updatedAt: now,
  };
  const { error } = await sb.from("projects").insert({
    id: project.id,
    user_id: userId,
    title: project.title,
    template_id: project.templateId,
    content: project.content,
  });
  if (error) throw error;
  return project;
}
