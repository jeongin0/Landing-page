-- v5: AI 카피 생성 사용량 제한. SQL Editor 에서 실행.
-- 생성 1회 = 1 row. 서버(service_role)만 기록/조회.

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ai_generations_user_time_idx
  on public.ai_generations(user_id, created_at);

alter table public.ai_generations enable row level security;
-- 정책 없음 = 일반 사용자 접근 불가. service_role 은 RLS 무시.
