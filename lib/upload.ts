"use client";

import { supabaseBrowser } from "./supabase/client";
import { ensureUserId } from "./storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// 이미지 파일 -> Supabase Storage 업로드 -> 공개 URL 반환
export async function uploadImage(file: File, projectId: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있어요.");
  if (file.size > MAX_BYTES) throw new Error("5MB 이하 이미지만 올릴 수 있어요.");

  const sb = supabaseBrowser();
  const userId = await ensureUserId();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${projectId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await sb.storage.from("assets").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = sb.storage.from("assets").getPublicUrl(path);
  return data.publicUrl;
}
