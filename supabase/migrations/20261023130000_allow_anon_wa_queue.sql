-- Supabase Migration: Allow anon role to insert and select from wa_queue
-- This ensures that local dev, offline mode, and unauthenticated clients
-- can insert WhatsApp notification queues without RLS violation (error 42501).

create policy "anon_insert"
  on wa_queue for insert
  to anon
  with check (true);

create policy "anon_select"
  on wa_queue for select
  to anon
  using (true);
