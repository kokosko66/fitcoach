-- Run this in Supabase SQL editor to add onboarding flag
alter table profiles add column if not exists onboarded boolean default false not null;
