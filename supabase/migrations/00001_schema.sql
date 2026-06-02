-- ============================================================
-- ESQUEMA RED VECINAL
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLA: alertas
-- ============================================================
create table if not exists public.alertas (
  id            uuid primary key default gen_random_uuid(),
  lat           float not null,
  lng           float not null,
  severity      text not null check (severity in ('sospechoso','tension','agresion_verbal','riesgo_fisico','emergencia')),
  description   text not null default '',
  num_people    int,
  direction     text default '',
  appearance    text default '',
  duration      text not null check (duration in ('min15','hour1','hours6','hours24')),
  expires_at    timestamptz not null,
  fingerprint_hash text not null,
  status        text not null default 'active' check (status in ('active','cleared','false_alarm')),
  assists_count int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_alertas_expires on public.alertas(expires_at);
create index if not exists idx_alertas_status on public.alertas(status);
create index if not exists idx_alertas_location on public.alertas using gist (ll_to_earth(lat, lng));

-- ============================================================
-- TABLA: assists (vouchers / "Voy")
-- ============================================================
create table if not exists public.assists (
  id              uuid primary key default gen_random_uuid(),
  alert_id        uuid not null references public.alertas(id) on delete cascade,
  fingerprint_hash text not null,
  created_at      timestamptz not null default now(),
  unique(alert_id, fingerprint_hash)
);

create index if not exists idx_assists_alert on public.assists(alert_id);

-- ============================================================
-- AUTO-LIMPIEZA: borrar alertas expiradas cada hora
-- ============================================================
create or replace function public.clean_expired_alerts()
returns void
language sql
as $$
  delete from public.alertas where expires_at < now();
$$;

select cron.schedule('clean-expired-alerts', '0 * * * *', 'select public.clean_expired_alerts();');

-- ============================================================
-- AUTO-CONTEO: trigger para mantener assists_count
-- ============================================================
create or replace function public.update_assists_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.alertas set assists_count = assists_count + 1 where id = new.alert_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.alertas set assists_count = assists_count - 1 where id = old.alert_id;
    return old;
  end if;
end;
$$;

create trigger trg_assists_count
  after insert or delete on public.assists
  for each row
  execute function public.update_assists_count();

-- ============================================================
-- RLS: SEGURIDAD
-- ============================================================
alter table public.alertas enable row level security;
alter table public.assists enable row level security;

-- Todos pueden LEER alertas activas
create policy "alertas_select_active"
  on public.alertas for select
  using (status = 'active' and expires_at > now());

-- Todos pueden INSERTAR alertas (con rate-limit vía aplicación)
create policy "alertas_insert"
  on public.alertas for insert
  with check (true);

-- Todos pueden LEER asists
create policy "assists_select"
  on public.assists for select
  using (true);

-- Todos pueden INSERTAR asists
create policy "assists_insert"
  on public.assists for insert
  with check (true);

-- ============================================================
-- FUNCIÓN: rate-limit por fingerprint
-- ============================================================
create or replace function public.can_create_alert(fp_hash text)
returns boolean
language plpgsql
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.alertas
  where fingerprint_hash = fp_hash
    and created_at > now() - interval '5 minutes';
  return recent_count < 2;
end;
$$;
