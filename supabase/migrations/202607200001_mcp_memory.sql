-- Relay MCP 2.0 — registry + AI memory / approvals

create type public.memory_scope as enum ('personal', 'company', 'conversation');
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'executed');

create table public.mcp_servers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  version text not null default '1.0.0',
  descriptor jsonb not null,
  health text not null default 'healthy',
  updated_at timestamptz not null default now()
);

create table public.ai_memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  scope public.memory_scope not null,
  key text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scope, key)
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  server text not null,
  tool text not null,
  arguments jsonb not null,
  description text not null,
  status public.approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_memories_user_scope_idx on public.ai_memories (user_id, scope);
create index ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);
create index ai_approvals_user_status_idx on public.ai_approvals (user_id, status);

alter table public.mcp_servers enable row level security;
alter table public.ai_memories enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_approvals enable row level security;

-- Service-role / backend access expected for orchestrator writes.
-- Authenticated users may read their own memory rows when wired through Supabase Auth.
create policy "ai_memories_own_read" on public.ai_memories
  for select using (auth.uid()::text = user_id);
create policy "ai_conversations_own" on public.ai_conversations
  for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
create policy "ai_messages_via_conversation" on public.ai_messages
  for all using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()::text
    )
  );
create policy "ai_approvals_own" on public.ai_approvals
  for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
