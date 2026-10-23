-- Migration: Create akun_bank table for dynamic bank accounts and cash accounts
create table if not exists akun_bank (
  id text primary key,
  nama text not null,
  nomor text,
  atas_nama text,
  saldo_awal numeric not null default 0,
  spark jsonb default '[0, 0, 0]'::jsonb,
  spark_color text default '#3E8A2F',
  icon text default 'bank',
  rekonsiliasi text default '—',
  catatan text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table akun_bank enable row level security;

-- Allow all authenticated/anon for prototype/school system
drop policy if exists "Allow all access to akun_bank" on akun_bank;
create policy "Allow all access to akun_bank"
  on akun_bank for all
  using (true)
  with check (true);
