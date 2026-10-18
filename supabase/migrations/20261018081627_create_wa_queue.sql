-- WhatsApp notification queue
-- Pesan tidak pernah dikirim langsung — selalu lewat queue ini
-- untuk mencegah rate-limit / ban dari Meta.

create type wa_status as enum ('pending', 'sending', 'sent', 'failed', 'cancelled');
create type wa_jenis  as enum ('absensi', 'pembayaran', 'tagihan', 'tunggakan', 'custom');

create table wa_queue (
  id            uuid        primary key default gen_random_uuid(),
  status        wa_status   not null default 'pending',
  phone         text        not null,
  nama_penerima text        not null,
  pesan         text        not null,
  jenis         wa_jenis    not null,
  ref_id        text,
  priority      int         not null default 2,
  scheduled_at  timestamptz not null default now(),
  sent_at       timestamptz,
  attempts      int         not null default 0,
  last_error    text,
  created_by    text        not null,
  created_at    timestamptz not null default now()
);

-- Queue processor hanya ambil pending yang sudah waktunya dan belum 3x gagal
create index wa_queue_processor_idx
  on wa_queue (priority asc, scheduled_at asc)
  where status = 'pending';

-- Untuk halaman monitoring: filter by status
create index wa_queue_status_idx
  on wa_queue (status, created_at desc);

-- RLS
alter table wa_queue enable row level security;

-- Authenticated user bisa insert & baca
create policy "authenticated_insert"
  on wa_queue for insert
  to authenticated
  with check (true);

create policy "authenticated_select"
  on wa_queue for select
  to authenticated
  using (true);

-- Hanya bisa cancel pesan yang masih pending
create policy "authenticated_cancel"
  on wa_queue for update
  to authenticated
  using (status = 'pending')
  with check (status = 'cancelled');

-- service_role (Edge Function) melewati RLS otomatis — tidak perlu policy khusus
