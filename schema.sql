-- Grant Memory Relay v1 schema
create table if not exists public.memory_notes (
  id uuid primary key default gen_random_uuid(),
  note_text text not null,
  captured_at timestamptz not null default now(),
  source text not null default 'manual',
  category text,
  due_date date,
  priority text not null default 'medium',
  status text not null default 'open',
  snoozed_until timestamptz,
  owner_email text not null default 'atlasemail286@gmail.com',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_memory_notes_status_due on public.memory_notes(status, due_date);
create index if not exists idx_memory_notes_captured_at on public.memory_notes(captured_at desc);
create index if not exists idx_memory_notes_owner on public.memory_notes(owner_email);
