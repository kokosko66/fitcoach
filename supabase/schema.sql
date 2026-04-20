-- FitCoach Database Schema
-- Run this in your Supabase SQL editor

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('coach', 'client')),
  full_name text not null,
  avatar_url text,
  onboarded boolean default false not null,
  created_at timestamptz default now() not null
);

-- Coach-client relationships
create table coach_clients (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references profiles(id) on delete cascade not null,
  client_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (coach_id, client_id)
);

-- Workout programs
create table programs (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  created_at timestamptz default now() not null
);

-- Days within a program (e.g., "Day 1 - Push", "Day 2 - Pull")
create table program_days (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  day_number int not null,
  name text not null
);

-- Exercises within a program day
create table exercises (
  id uuid default gen_random_uuid() primary key,
  program_day_id uuid references program_days(id) on delete cascade not null,
  name text not null,
  sets int not null,
  reps text not null, -- text to allow ranges like "8-12"
  rest_seconds int,
  notes text,
  order_index int not null default 0
);

-- Program assignments to clients
create table program_assignments (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  client_id uuid references profiles(id) on delete cascade not null,
  assigned_at timestamptz default now() not null,
  active boolean default true not null
);

-- Workout logs (one per completed session)
create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade not null,
  program_day_id uuid references program_days(id) on delete cascade not null,
  completed_at timestamptz default now() not null
);

-- Individual exercise logs within a workout
create table exercise_logs (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid references workout_logs(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number int not null,
  reps_done int not null,
  weight_used decimal,
  notes text
);

-- Row Level Security policies

alter table profiles enable row level security;
alter table coach_clients enable row level security;
alter table programs enable row level security;
alter table program_days enable row level security;
alter table exercises enable row level security;
alter table program_assignments enable row level security;
alter table workout_logs enable row level security;
alter table exercise_logs enable row level security;

-- Profiles: users can read their own profile, coaches can read their clients' profiles
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Coaches can read their clients profiles"
  on profiles for select using (
    id in (
      select client_id from coach_clients where coach_id = auth.uid()
    )
  );

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Coach-clients: coaches see their relationships, clients see theirs
create policy "Coaches see their clients"
  on coach_clients for select using (coach_id = auth.uid());

create policy "Clients see their coach"
  on coach_clients for select using (client_id = auth.uid());

create policy "Coaches can add clients"
  on coach_clients for insert with check (coach_id = auth.uid());

create policy "Coaches can remove clients"
  on coach_clients for delete using (coach_id = auth.uid());

-- Programs: coaches manage their own programs, clients can read assigned programs
create policy "Coaches manage own programs"
  on programs for all using (coach_id = auth.uid());

create policy "Clients can read assigned programs"
  on programs for select using (
    id in (
      select program_id from program_assignments
      where client_id = auth.uid() and active = true
    )
  );

-- Program days: follow program access
create policy "Access program days via program"
  on program_days for select using (
    program_id in (
      select id from programs where coach_id = auth.uid()
      union
      select program_id from program_assignments
      where client_id = auth.uid() and active = true
    )
  );

create policy "Coaches manage program days"
  on program_days for all using (
    program_id in (select id from programs where coach_id = auth.uid())
  );

-- Exercises: follow program day access
create policy "Access exercises via program"
  on exercises for select using (
    program_day_id in (
      select pd.id from program_days pd
      join programs p on pd.program_id = p.id
      where p.coach_id = auth.uid()
      union
      select pd.id from program_days pd
      join program_assignments pa on pd.program_id = pa.program_id
      where pa.client_id = auth.uid() and pa.active = true
    )
  );

create policy "Coaches manage exercises"
  on exercises for all using (
    program_day_id in (
      select pd.id from program_days pd
      join programs p on pd.program_id = p.id
      where p.coach_id = auth.uid()
    )
  );

-- Program assignments: coaches assign, clients read their own
create policy "Coaches manage assignments"
  on program_assignments for all using (
    program_id in (select id from programs where coach_id = auth.uid())
  );

create policy "Clients see own assignments"
  on program_assignments for select using (client_id = auth.uid());

-- Workout logs: clients create their own, coaches can read their clients' logs
create policy "Clients manage own workout logs"
  on workout_logs for all using (client_id = auth.uid());

create policy "Coaches read client workout logs"
  on workout_logs for select using (
    client_id in (
      select client_id from coach_clients where coach_id = auth.uid()
    )
  );

-- Exercise logs: follow workout log access
create policy "Clients manage own exercise logs"
  on exercise_logs for all using (
    workout_log_id in (
      select id from workout_logs where client_id = auth.uid()
    )
  );

create policy "Coaches read client exercise logs"
  on exercise_logs for select using (
    workout_log_id in (
      select wl.id from workout_logs wl
      join coach_clients cc on wl.client_id = cc.client_id
      where cc.coach_id = auth.uid()
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
