// ── 저장소 레이어 (Supabase) ─────────────────────────────
// 로그인한 사용자만 프로젝트를 만들고 볼 수 있습니다.
// 로그인 세션이 없으면 ensureUserId 가 LOGIN_REQUIRED 로 throw 합니다.

import type { Project } from "./schema";
import { normalizeContent } from "./schema";
import { makePreset } from "./presets";
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
  templateId: r.template_id || "store",
  content: normalizeContent(r.content),
  published: !!r.published,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export class LoginRequiredError extends Error {
  constructor() {
    super("LOGIN_REQUIRED");
    this.name = "LoginRequiredError";
  }
}

// 로그인 세션의 user_id 반환. 없으면 LoginRequiredError.
export async function ensureUserId(): Promise<string> {
  const sb = supabaseBrowser();
  const { data } = await sb.auth.getSession();
  if (data.session?.user) return data.session.user.id;
  throw new LoginRequiredError();
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

export async function createProject(
  title: string,
  templateId: string = "store",
): Promise<Project> {
  const sb = supabaseBrowser();
  const userId = await ensureUserId();
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    title: title.trim() || "제목 없는 페이지",
    templateId,
    content: normalizeContent(makePreset(templateId)),
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
