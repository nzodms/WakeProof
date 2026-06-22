-- =============================================================================
-- WakeProof — Schéma Supabase (Postgres)
-- Exécuter dans le SQL Editor Supabase. Inclut enums, tables, index, RLS.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type alarm_difficulty   as enum ('easy', 'strict', 'hardcore');
create type mission_type       as enum ('calc', 'qr_code', 'photo_proof', 'shake', 'steps', 'squats', 'wake_check');
create type attempt_status     as enum ('pending', 'in_progress', 'completed', 'failed', 'abandoned');
create type wake_status        as enum ('sleeping','alarm_ringing','mission_in_progress','wake_verified','snoozed','late','failed','wake_blast_received');
create type proof_share_mode   as enum ('validated_only','blurred','visible_24h','private');
create type friendship_status  as enum ('pending','accepted','blocked');
create type crew_role          as enum ('owner','admin','member');
create type wake_event_type    as enum ('wake_verified','mission_completed','photo_proof','snoozed','failed','wake_blast_sent','wake_blast_received','streak_lost','badge_earned','league_up','league_down');
create type blast_kind         as enum ('voice','tts_text','preset_sound','collective','vote');
create type blast_tone         as enum ('motivation','roast');
create type challenge_type     as enum ('duel_1v1','no_snooze_3d','wake_7d','team','club_6am','gym_morning','study_morning','work_mode');
create type challenge_status   as enum ('pending','active','completed','cancelled');
create type league_tier        as enum ('bronze','silver','gold','platinum','diamond','elite');
create type leaderboard_scope  as enum ('global','country','city','category','crew');
create type subscription_tier  as enum ('free','premium');

-- ----------------------------------------------------------------------------
-- PROFILES (1-1 avec auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  goal          text,                       -- work | gym | study | discipline | no_snooze
  country_code  text,
  city          text,
  timezone      text default 'UTC',
  current_streak int default 0,
  best_streak    int default 0,
  league_tier   league_tier default 'bronze',
  onboarding_completed boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- ALARMS + SCHEDULES
-- ----------------------------------------------------------------------------
create table alarms (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  label              text,
  time_local         text not null,             -- "07:00" heure locale
  difficulty         alarm_difficulty not null default 'strict',
  sound_id           text default 'default',
  snooze_allowed     boolean default false,
  max_snoozes        int default 0,
  mission_id         uuid,                       -- mission obligatoire (FK plus bas)
  crew_id            uuid,
  wake_blast_enabled boolean default false,
  wake_blast_delay_min int default 5,            -- délai avant éligibilité Wake Blast
  grace_period_min   int default 2,              -- fenêtre "à l'heure"
  is_active          boolean default true,
  notification_ids   text[] default '{}',        -- ids notifs locales planifiées
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index on alarms(user_id);

create table alarm_schedules (
  id          uuid primary key default gen_random_uuid(),
  alarm_id    uuid not null references alarms(id) on delete cascade,
  weekday     int not null check (weekday between 0 and 6),  -- 0=dimanche
  enabled     boolean default true,
  unique (alarm_id, weekday)
);
create index on alarm_schedules(alarm_id);

-- ----------------------------------------------------------------------------
-- MISSIONS (config réutilisable) + tentatives
-- ----------------------------------------------------------------------------
create table missions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  type        mission_type not null,
  config      jsonb not null default '{}',       -- ex: { "count": 3, "target": "café" }
  is_premium  boolean default false,
  created_at  timestamptz default now()
);
alter table alarms add constraint alarms_mission_fk
  foreign key (mission_id) references missions(id) on delete set null;

create table mission_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  alarm_id      uuid references alarms(id) on delete set null,
  mission_id    uuid references missions(id) on delete set null,
  mission_type  mission_type not null,
  status        attempt_status not null default 'in_progress',
  duration_ms   int,
  metadata      jsonb default '{}',
  started_at    timestamptz default now(),
  completed_at  timestamptz
);
create index on mission_attempts(user_id, started_at desc);

-- ----------------------------------------------------------------------------
-- WAKE LOGS + WAKE CHECKS
-- ----------------------------------------------------------------------------
create table wake_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  alarm_id       uuid references alarms(id) on delete set null,
  scheduled_at   timestamptz not null,
  woke_at        timestamptz,
  snooze_count   int default 0,
  late_minutes   int default 0,
  status         wake_status not null default 'sleeping',
  proof_url      text,
  proof_share    proof_share_mode default 'private',
  created_at     timestamptz default now()
);
create index on wake_logs(user_id, scheduled_at desc);

create table wake_checks (
  id           uuid primary key default gen_random_uuid(),
  wake_log_id  uuid not null references wake_logs(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  due_at       timestamptz not null,            -- 5/10 min après le réveil
  confirmed_at timestamptz,
  passed       boolean
);
create index on wake_checks(user_id);

-- ----------------------------------------------------------------------------
-- FRIENDSHIPS
-- ----------------------------------------------------------------------------
create table friendships (
  id          uuid primary key default gen_random_uuid(),
  requester   uuid not null references profiles(id) on delete cascade,
  addressee   uuid not null references profiles(id) on delete cascade,
  status      friendship_status not null default 'pending',
  created_at  timestamptz default now(),
  unique (requester, addressee),
  check (requester <> addressee)
);

-- ----------------------------------------------------------------------------
-- CREWS
-- ----------------------------------------------------------------------------
create table wake_crews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  avatar_url  text,
  owner_id    uuid not null references profiles(id) on delete cascade,
  invite_code text unique not null default encode(gen_random_bytes(6), 'hex'),
  category    text,                              -- students | entrepreneurs | gym ...
  hall_of_shame_enabled boolean default true,
  created_at  timestamptz default now()
);

create table wake_crew_members (
  crew_id     uuid not null references wake_crews(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        crew_role not null default 'member',
  joined_at   timestamptz default now(),
  primary key (crew_id, user_id)
);
create index on wake_crew_members(user_id);

-- ----------------------------------------------------------------------------
-- WAKE EVENTS (feed social) + WAKE SCORES
-- ----------------------------------------------------------------------------
create table wake_events (
  id          uuid primary key default gen_random_uuid(),
  crew_id     uuid references wake_crews(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  type        wake_event_type not null,
  payload     jsonb default '{}',                -- ex: { "snoozes": 4, "minutes": 7 }
  created_at  timestamptz default now()
);
create index on wake_events(crew_id, created_at desc);

create table wake_scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  date        date not null,
  score       int not null default 0,
  breakdown   jsonb default '{}',                -- détail du calcul (transparence)
  created_at  timestamptz default now(),
  unique (user_id, date)
);
create index on wake_scores(user_id, date desc);

-- ----------------------------------------------------------------------------
-- WAKE BLASTS + VOTES
-- ----------------------------------------------------------------------------
create table wake_blasts (
  id           uuid primary key default gen_random_uuid(),
  crew_id      uuid references wake_crews(id) on delete cascade,
  sender_id    uuid not null references profiles(id) on delete cascade,
  target_id    uuid not null references profiles(id) on delete cascade,
  kind         blast_kind not null,
  tone         blast_tone not null default 'motivation',
  audio_url    text,                              -- pour kind = voice
  text_content text,                              -- pour kind = tts_text
  preset_id    text,                              -- pour kind = preset_sound
  delivered    boolean default false,
  created_at   timestamptz default now(),
  check (sender_id <> target_id)
);
create index on wake_blasts(target_id, created_at desc);

create table wake_blast_votes (
  id          uuid primary key default gen_random_uuid(),
  crew_id     uuid not null references wake_crews(id) on delete cascade,
  target_id   uuid not null references profiles(id) on delete cascade,
  voter_id    uuid not null references profiles(id) on delete cascade,
  morning_date date not null default current_date,
  created_at  timestamptz default now(),
  unique (crew_id, target_id, voter_id, morning_date)
);

-- ----------------------------------------------------------------------------
-- CHALLENGES
-- ----------------------------------------------------------------------------
create table wake_challenges (
  id          uuid primary key default gen_random_uuid(),
  crew_id     uuid references wake_crews(id) on delete cascade,
  creator_id  uuid not null references profiles(id) on delete cascade,
  type        challenge_type not null,
  title       text not null,
  status      challenge_status not null default 'pending',
  starts_at   timestamptz,
  ends_at     timestamptz,
  rules       jsonb default '{}',
  created_at  timestamptz default now()
);

create table challenge_participants (
  challenge_id uuid not null references wake_challenges(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  score        int default 0,
  rank         int,
  joined_at    timestamptz default now(),
  primary key (challenge_id, user_id)
);

-- ----------------------------------------------------------------------------
-- LEADERBOARDS + LIGUES
-- ----------------------------------------------------------------------------
create table global_leaderboards (
  id          uuid primary key default gen_random_uuid(),
  scope       leaderboard_scope not null,
  scope_key   text,                              -- code pays / ville / catégorie / crew_id
  period      text not null,                     -- 'daily' | 'weekly' | 'monthly'
  user_id     uuid not null references profiles(id) on delete cascade,
  score       int not null default 0,
  rank        int,
  period_start date not null,
  updated_at  timestamptz default now(),
  unique (scope, scope_key, period, period_start, user_id)
);
create index on global_leaderboards(scope, scope_key, period, period_start, score desc);

create table league_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  tier        league_tier not null,
  week_start  date not null,
  points      int default 0,
  rank        int,
  promoted    boolean,
  unique (user_id, week_start)
);

-- ----------------------------------------------------------------------------
-- PRIVACY + SUBSCRIPTIONS
-- ----------------------------------------------------------------------------
create table social_privacy_settings (
  user_id              uuid primary key references profiles(id) on delete cascade,
  allow_wake_blasts    boolean default false,
  allow_voice_blasts   boolean default false,
  allowed_tone         blast_tone default 'motivation',
  blast_window_start   text default '06:00',     -- fenêtre horaire autorisée
  blast_window_end     text default '10:00',
  max_blasts_per_morning int default 5,
  show_in_hall_of_shame boolean default true,
  share_proofs         proof_share_mode default 'validated_only',
  blocked_user_ids     uuid[] default '{}',
  updated_at           timestamptz default now()
);

create table subscriptions (
  user_id        uuid primary key references profiles(id) on delete cascade,
  tier           subscription_tier not null default 'free',
  rc_app_user_id text,                           -- RevenueCat app user id
  expires_at     timestamptz,
  updated_at     timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------
-- Crée profil + privacy + subscription à l'inscription
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username)
  values (new.id, 'user_' || substr(new.id::text, 1, 8));
  insert into social_privacy_settings (user_id) values (new.id);
  insert into subscriptions (user_id) values (new.id);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Ajoute automatiquement le créateur comme owner du Crew
create or replace function handle_new_crew()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into wake_crew_members (crew_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end; $$;

drop trigger if exists on_crew_created on wake_crews;
create trigger on_crew_created
  after insert on wake_crews
  for each row execute function handle_new_crew();

-- ----------------------------------------------------------------------------
-- HELPER : appartenance à un crew (évite la récursion RLS)
-- ----------------------------------------------------------------------------
create or replace function is_crew_member(p_crew uuid, p_user uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from wake_crew_members where crew_id = p_crew and user_id = p_user
  );
$$;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table profiles                enable row level security;
alter table alarms                  enable row level security;
alter table alarm_schedules         enable row level security;
alter table missions                enable row level security;
alter table mission_attempts        enable row level security;
alter table wake_logs               enable row level security;
alter table wake_checks             enable row level security;
alter table friendships             enable row level security;
alter table wake_crews              enable row level security;
alter table wake_crew_members       enable row level security;
alter table wake_events             enable row level security;
alter table wake_scores             enable row level security;
alter table wake_blasts             enable row level security;
alter table wake_blast_votes        enable row level security;
alter table wake_challenges         enable row level security;
alter table challenge_participants  enable row level security;
alter table global_leaderboards     enable row level security;
alter table league_entries          enable row level security;
alter table social_privacy_settings enable row level security;
alter table subscriptions           enable row level security;

-- Profiles : lecture publique (classements), écriture self
create policy "profiles read"   on profiles for select using (true);
create policy "profiles update" on profiles for update using (auth.uid() = id);

-- Données strictement personnelles : owner only
create policy "alarms owner" on alarms for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "schedules owner" on alarm_schedules for all
  using (exists (select 1 from alarms a where a.id = alarm_id and a.user_id = auth.uid()))
  with check (exists (select 1 from alarms a where a.id = alarm_id and a.user_id = auth.uid()));
create policy "missions owner" on missions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attempts owner" on mission_attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wake_logs owner" on wake_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wake_checks owner" on wake_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scores owner read" on wake_scores for select using (auth.uid() = user_id);
create policy "scores owner write" on wake_scores for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "privacy owner" on social_privacy_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subs owner read" on subscriptions for select using (auth.uid() = user_id);

-- Friendships : visibles/éditables par les deux parties
create policy "friendships parties" on friendships for all
  using (auth.uid() in (requester, addressee))
  with check (auth.uid() in (requester, addressee));

-- Crews : visibles par les membres ; création par tout user authentifié
create policy "crews member read" on wake_crews for select
  using (is_crew_member(id, auth.uid()));
create policy "crews insert" on wake_crews for insert
  with check (auth.uid() = owner_id);
create policy "crews owner manage" on wake_crews for update
  using (auth.uid() = owner_id);

create policy "crew members read" on wake_crew_members for select
  using (is_crew_member(crew_id, auth.uid()));
create policy "crew members join" on wake_crew_members for insert
  with check (auth.uid() = user_id);
create policy "crew members leave" on wake_crew_members for delete
  using (auth.uid() = user_id);

-- Wake events / blasts / challenges : membres du crew
create policy "events crew read" on wake_events for select
  using (crew_id is null or is_crew_member(crew_id, auth.uid()));
create policy "events insert self" on wake_events for insert
  with check (auth.uid() = user_id);

create policy "blasts crew read" on wake_blasts for select
  using (auth.uid() in (sender_id, target_id));
create policy "blasts insert" on wake_blasts for insert
  with check (auth.uid() = sender_id);

create policy "blast votes crew" on wake_blast_votes for all
  using (is_crew_member(crew_id, auth.uid()))
  with check (auth.uid() = voter_id);

create policy "challenges crew read" on wake_challenges for select
  using (crew_id is null or is_crew_member(crew_id, auth.uid()));
create policy "challenges insert" on wake_challenges for insert
  with check (auth.uid() = creator_id);

create policy "challenge participants read" on challenge_participants for select
  using (true);
create policy "challenge participants self" on challenge_participants for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Leaderboards / ligues : lecture publique
create policy "leaderboards read" on global_leaderboards for select using (true);
create policy "leagues read" on league_entries for select using (true);
