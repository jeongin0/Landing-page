-- Supabase SQL Editor 에 붙여넣고 실행하세요.
-- (대시보드 왼쪽 "SQL Editor" → New query → 붙여넣기 → Run)

-- ── projects: 랜딩페이지 1개 = 1 row ──────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '제목 없는 페이지',
  template_id text not null default 'store-01',
  content jsonb not null,
  published_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);

-- ── RLS: 본인 프로젝트만 접근 ────────────────────────────────
alter table public.projects enable row level security;

drop policy if exists "own projects - select" on public.projects;
create policy "own projects - select" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "own projects - insert" on public.projects;
create policy "own projects - insert" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "own projects - update" on public.projects;
create policy "own projects - update" on public.projects
  for update using (auth.uid() = user_id);

drop policy if exists "own projects - delete" on public.projects;
create policy "own projects - delete" on public.projects
  for delete using (auth.uid() = user_id);

-- ── updated_at 자동 갱신 ────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ── Storage: 업로드 이미지 버킷 ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

drop policy if exists "assets - public read" on storage.objects;
create policy "assets - public read" on storage.objects
  for select using (bucket_id = 'assets');

drop policy if exists "assets - auth upload" on storage.objects;
create policy "assets - auth upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'assets');

drop policy if exists "assets - auth delete own" on storage.objects;
create policy "assets - auth delete own" on storage.objects
  for delete to authenticated using (bucket_id = 'assets' and owner = auth.uid());
