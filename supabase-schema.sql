-- Run this in the Supabase SQL editor to set up your database

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ratings
create table public.ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null check (category in ('movie','tv','sport','youtube','music','book','game','food','other')),
  score integer not null check (score >= 1 and score <= 10),
  review text,
  image_url text,
  created_at timestamptz default now()
);

alter table public.ratings enable row level security;

create policy "Ratings are viewable by everyone"
  on public.ratings for select using (true);

create policy "Users can insert their own ratings"
  on public.ratings for insert with check (auth.uid() = user_id);

create policy "Users can delete their own ratings"
  on public.ratings for delete using (auth.uid() = user_id);

-- Follows
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

-- Storage bucket for rating images
insert into storage.buckets (id, name, public) values ('rating-images', 'rating-images', true);

create policy "Anyone can view rating images"
  on storage.objects for select using (bucket_id = 'rating-images');

create policy "Authenticated users can upload rating images"
  on storage.objects for insert with check (
    bucket_id = 'rating-images' and auth.role() = 'authenticated'
  );

create policy "Users can delete their own rating images"
  on storage.objects for delete using (
    bucket_id = 'rating-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================
-- STORIES (add after initial schema)
-- =====================

create table public.stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  caption text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

alter table public.stories enable row level security;

create policy "Stories are viewable by everyone"
  on public.stories for select using (true);

create policy "Users can insert their own stories"
  on public.stories for insert with check (auth.uid() = user_id);

create policy "Users can delete their own stories"
  on public.stories for delete using (auth.uid() = user_id);

-- Track which stories a user has already seen
create table public.story_views (
  story_id uuid references public.stories(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamptz default now(),
  primary key (story_id, viewer_id)
);

alter table public.story_views enable row level security;

create policy "Story views are viewable by everyone"
  on public.story_views for select using (true);

create policy "Users can insert their own views"
  on public.story_views for insert with check (auth.uid() = viewer_id);

-- Storage bucket for story images
insert into storage.buckets (id, name, public) values ('story-images', 'story-images', true);

create policy "Anyone can view story images"
  on storage.objects for select using (bucket_id = 'story-images');

create policy "Authenticated users can upload story images"
  on storage.objects for insert with check (
    bucket_id = 'story-images' and auth.role() = 'authenticated'
  );
