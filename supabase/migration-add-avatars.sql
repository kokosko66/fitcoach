-- Run this in Supabase SQL editor to add avatar support
-- (If you already have the profiles table)

-- Add avatar_url column
alter table profiles add column if not exists avatar_url text;

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict do nothing;

-- Allow authenticated users to upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view avatars (they're public)
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Allow users to delete their own avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
