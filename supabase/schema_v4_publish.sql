-- v4: 게시(publish). SQL Editor 에서 실행.

alter table public.projects
  add column if not exists published boolean not null default false;

-- 게시된 프로젝트는 누구나 읽기 가능 (공개 페이지용)
drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public" on public.projects
  for select using (published = true);
