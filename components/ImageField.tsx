"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";

type Props = {
  value: string;
  projectId: string;
  onChange: (url: string) => void;
};

// 이미지: 파일 업로드 + URL 직접입력 둘 다 지원
export default function ImageField({ value, projectId, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = async (file: File) => {
    setUploading(true);
    setErr(null);
    try {
      const url = await uploadImage(file, projectId);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {value && (
        <img
          src={value}
          alt=""
          className="mb-1 h-16 w-full rounded border border-gray-200 object-cover"
        />
      )}
      <div className="flex gap-1">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
        >
          {uploading ? "올리는 중…" : "파일 올리기"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="또는 이미지 URL 붙여넣기"
        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
      />
      {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
    </div>
  );
}
