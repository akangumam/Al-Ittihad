-- Create template_tagihan table
create table if not exists public.template_tagihan (
  id bigint primary key,
  nama text not null,
  tipe text not null,
  target text not null,
  komponen jsonb not null default '[]'::jsonb,
  total bigint not null default 0,
  jatuh_tempo_default text,
  kelas text,
  tahun_ajaran text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.template_tagihan enable row level security;

-- Allow read & write to authenticated and anon (same policy pattern as other tables)
create policy "Allow all read template_tagihan"
  on public.template_tagihan for select
  using (true);

create policy "Allow all insert template_tagihan"
  on public.template_tagihan for insert
  with check (true);

create policy "Allow all update template_tagihan"
  on public.template_tagihan for update
  using (true);

create policy "Allow all delete template_tagihan"
  on public.template_tagihan for delete
  using (true);
