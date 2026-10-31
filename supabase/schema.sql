-- ============================================================
--  Atletica Iriense — schema Supabase per la Collection "Articoli"
--  Eseguire in Supabase Studio → SQL Editor (una volta sola).
-- ============================================================

-- Estensione per gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabella articoli
-- ------------------------------------------------------------
create table if not exists public.articoli (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,              -- usato nell'URL: /risultati/<slug>
  title       text not null,
  date_iso    date,                              -- per ordinamento
  date_label  text,                              -- etichetta mostrata, es. "15 lug 2026"
  category    text not null default 'Altre gare',
  excerpt     text,
  body        text,                              -- HTML prodotto dall'editor
  images      text[] not null default '{}',      -- URL pubblici nel bucket articoli-foto
  caption     text,
  caption2    text,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Categorie ammesse (allineate al front-end)
alter table public.articoli drop constraint if exists articoli_category_check;
alter table public.articoli add constraint articoli_category_check
  check (category in ('Assoluti','Amatori','Giovanile','Gare organizzate','Comunicazioni','Altre gare'));

-- Indici richiesti
create index if not exists articoli_date_iso_idx on public.articoli (date_iso desc);
create index if not exists articoli_category_idx on public.articoli (category);
-- Utile per l'elenco pubblico (solo pubblicati, ordinati per data)
create index if not exists articoli_published_date_idx on public.articoli (published, date_iso desc);

-- updated_at automatico
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists articoli_set_updated_at on public.articoli;
create trigger articoli_set_updated_at
  before update on public.articoli
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
--   · chiunque legge gli articoli pubblicati
--   · solo gli utenti autenticati (admin) scrivono
-- ------------------------------------------------------------
alter table public.articoli enable row level security;

drop policy if exists "articoli_select_pubblici" on public.articoli;
create policy "articoli_select_pubblici" on public.articoli
  for select using (published = true);

drop policy if exists "articoli_select_admin" on public.articoli;
create policy "articoli_select_admin" on public.articoli
  for select to authenticated using (true);

drop policy if exists "articoli_insert_admin" on public.articoli;
create policy "articoli_insert_admin" on public.articoli
  for insert to authenticated with check (true);

drop policy if exists "articoli_update_admin" on public.articoli;
create policy "articoli_update_admin" on public.articoli
  for update to authenticated using (true) with check (true);

drop policy if exists "articoli_delete_admin" on public.articoli;
create policy "articoli_delete_admin" on public.articoli
  for delete to authenticated using (true);

-- ------------------------------------------------------------
-- Storage: bucket pubblico per le foto degli articoli
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('articoli-foto', 'articoli-foto', true)
on conflict (id) do nothing;

drop policy if exists "foto_lettura_pubblica" on storage.objects;
create policy "foto_lettura_pubblica" on storage.objects
  for select using (bucket_id = 'articoli-foto');

drop policy if exists "foto_upload_admin" on storage.objects;
create policy "foto_upload_admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'articoli-foto');

drop policy if exists "foto_update_admin" on storage.objects;
create policy "foto_update_admin" on storage.objects
  for update to authenticated using (bucket_id = 'articoli-foto');

drop policy if exists "foto_delete_admin" on storage.objects;
create policy "foto_delete_admin" on storage.objects
  for delete to authenticated using (bucket_id = 'articoli-foto');

-- ============================================================
--  Gallery: foto caricate dall'area riservata
-- ============================================================
create table if not exists public.gallery_foto (
  id          uuid primary key default gen_random_uuid(),
  src         text not null,
  title       text not null default '',
  cat         text not null default 'Altre gare',
  year        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists gallery_foto_created_idx on public.gallery_foto (created_at desc);

alter table public.gallery_foto enable row level security;
drop policy if exists "gallery_lettura_pubblica" on public.gallery_foto;
create policy "gallery_lettura_pubblica" on public.gallery_foto for select using (true);
drop policy if exists "gallery_scrittura_admin" on public.gallery_foto;
create policy "gallery_scrittura_admin" on public.gallery_foto for all to authenticated using (true) with check (true);

-- Foto degli articoli da non mostrare in gallery (restano nel loro articolo)
create table if not exists public.gallery_nascoste (
  src         text primary key,
  created_at  timestamptz not null default now()
);

alter table public.gallery_nascoste enable row level security;
drop policy if exists "nascoste_lettura_pubblica" on public.gallery_nascoste;
create policy "nascoste_lettura_pubblica" on public.gallery_nascoste for select using (true);
drop policy if exists "nascoste_scrittura_admin" on public.gallery_nascoste;
create policy "nascoste_scrittura_admin" on public.gallery_nascoste for all to authenticated using (true) with check (true);

-- ============================================================
--  Modulo contatti e newsletter
--  Chiunque può inserire (dal sito); solo l'area riservata legge.
-- ============================================================
create table if not exists public.messaggi (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null check (char_length(nome) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  messaggio   text not null check (char_length(messaggio) between 1 and 5000),
  created_at  timestamptz not null default now()
);

alter table public.messaggi enable row level security;
drop policy if exists "messaggi_invio_pubblico" on public.messaggi;
create policy "messaggi_invio_pubblico" on public.messaggi for insert to anon, authenticated with check (true);
drop policy if exists "messaggi_lettura_admin" on public.messaggi;
create policy "messaggi_lettura_admin" on public.messaggi for select to authenticated using (true);
drop policy if exists "messaggi_eliminazione_admin" on public.messaggi;
create policy "messaggi_eliminazione_admin" on public.messaggi for delete to authenticated using (true);

create table if not exists public.newsletter (
  email       text primary key check (char_length(email) between 3 and 200),
  created_at  timestamptz not null default now()
);

alter table public.newsletter enable row level security;
drop policy if exists "newsletter_iscrizione_pubblica" on public.newsletter;
create policy "newsletter_iscrizione_pubblica" on public.newsletter for insert to anon, authenticated with check (true);
drop policy if exists "newsletter_lettura_admin" on public.newsletter;
create policy "newsletter_lettura_admin" on public.newsletter for select to authenticated using (true);
drop policy if exists "newsletter_eliminazione_admin" on public.newsletter;
create policy "newsletter_eliminazione_admin" on public.newsletter for delete to authenticated using (true);
