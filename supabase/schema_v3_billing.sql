-- v3: 결제/요금제. SQL Editor 에서 실행.

-- 사용자별 요금제 상태
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',          -- free | pro | lifetime
  ls_customer_id text,
  ls_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile - select" on public.profiles;
create policy "own profile - select" on public.profiles
  for select using (auth.uid() = id);

-- 본인 프로필 행 자동 생성 (없으면)
drop policy if exists "own profile - insert" on public.profiles;
create policy "own profile - insert" on public.profiles
  for insert with check (auth.uid() = id);

-- plan 변경은 서버(webhook, service_role)만. 일반 사용자는 update 불가.

-- 결제 이벤트 로그 (webhook 원본)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ls_event text,
  ls_order_id text,
  status text,
  raw jsonb,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
-- payments 는 서버만 접근 (정책 없음 = 일반 사용자 접근 불가, service_role 은 RLS 무시)

-- 가입 시 profiles 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
