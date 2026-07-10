create extension if not exists pgcrypto;

create type public.email_provider as enum ('gmail', 'outlook', 'imap', 'smtp', 'exchange');
create type public.message_kind as enum ('email', 'chat', 'audio', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider public.email_provider not null,
  email text not null,
  display_name text,
  encrypted_access_token bytea,
  encrypted_refresh_token bytea,
  token_expires_at timestamptz,
  sync_cursor text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, provider, email)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.connected_accounts(id) on delete set null,
  external_id text,
  subject text,
  snippet text,
  unread boolean not null default true,
  starred boolean not null default false,
  archived boolean not null default false,
  labels text[] not null default '{}',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  external_id text,
  kind public.message_kind not null default 'email',
  sender_name text,
  sender_email text,
  body_text text,
  body_html text,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index conversations_owner_date_idx
  on public.conversations (owner_id, last_message_at desc);
create index messages_conversation_date_idx
  on public.messages (conversation_id, sent_at);
create index files_owner_date_idx on public.files (owner_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.files enable row level security;
alter table public.device_tokens enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "accounts_own" on public.connected_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversations_own" on public.conversations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "messages_via_conversation" on public.messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.owner_id = auth.uid()
    )
  );
create policy "files_own" on public.files
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "device_tokens_own" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', false, 26214400)
on conflict (id) do nothing;

create policy "attachments_own" on storage.objects
  for all using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );

alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
