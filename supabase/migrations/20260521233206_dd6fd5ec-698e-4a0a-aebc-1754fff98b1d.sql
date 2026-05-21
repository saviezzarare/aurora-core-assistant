
create table if not exists public.prospected_companies (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  cidade text,
  estado text,
  segmento text,
  porte text,
  telefone text,
  email text,
  site text,
  fonte text,
  lead_score integer default 0,
  qualificacao text default 'pendente',
  observacoes text,
  raw jsonb,
  search_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prospection_searches (
  id uuid primary key default gen_random_uuid(),
  cidade text,
  estado text,
  segmento text,
  filtros jsonb,
  total_encontrado integer default 0,
  status text default 'concluida',
  created_at timestamptz not null default now()
);

create index if not exists idx_pc_cidade on public.prospected_companies(cidade);
create index if not exists idx_pc_segmento on public.prospected_companies(segmento);
create index if not exists idx_pc_search on public.prospected_companies(search_id);

alter table public.prospected_companies enable row level security;
alter table public.prospection_searches enable row level security;

create policy "Public access prospected_companies" on public.prospected_companies for all using (true) with check (true);
create policy "Public access prospection_searches" on public.prospection_searches for all using (true) with check (true);
