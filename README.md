# rateit

Rate movies, games, food, music, sports & more. See what your friends think.

**Live:** [rateit-gamma.vercel.app](https://rateit-gamma.vercel.app)  
**Contact:** RateitAsk@gmail.com

---

## What it is

rateit is a social rating platform where you can rate anything — movies, games, music, food, sports, YouTube channels, TV shows, books — and see what people around you think. Every rating builds your taste profile. Follow people with great taste. Discover what's worth your time.

## Features

- Rate anything across 9 categories with a 1–10 score and optional review
- Social feed showing ratings from people you follow
- Explore page to discover new users and recent ratings
- Search for content or people by username
- Profile pages with Instagram-style rating grid
- Followers / Following lists
- Stories — auto-generated from your ratings, expire in 24h
- Onboarding to personalize your feed by category
- Google Sign-In + email/password auth
- Public profiles — shareable without an account
- Privacy Policy, Terms of Service, delete account

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database + Auth:** Supabase (PostgreSQL + RLS)
- **Storage:** Supabase Storage (rating images)
- **Deployment:** Vercel
- **Package manager:** pnpm

## Local development

```bash
pnpm install
pnpm dev
```

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OMDB_API_KEY=your_omdb_key
YOUTUBE_API_KEY=your_youtube_key
```

## Project structure

```
app/
  feed/          — main social feed
  explore/       — discover users + recent ratings
  search/        — search content and people
  rate/          — post a new rating
  profile/       — user profiles + followers/following
  content/       — content detail page with community score
  account/       — account settings + delete account
  onboarding/    — category preferences for new users
  privacy/       — Privacy Policy
  terms/         — Terms of Service
  app-store/     — App Store mockup page

components/
  RatingCard     — feed card with score, review, comments
  ProfileGrid    — Instagram-style rating thumbnail grid
  BottomNav      — mobile bottom navigation
  Sidebar        — desktop left sidebar
  SearchBar      — debounced search input
  FollowButton   — follow/unfollow with optimistic UI
```
