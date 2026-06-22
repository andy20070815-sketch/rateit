export type Category =
  | 'movie'
  | 'tv'
  | 'sport'
  | 'youtube'
  | 'music'
  | 'book'
  | 'game'
  | 'food'
  | 'person'
  | 'other'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Rating {
  id: string
  user_id: string
  title: string
  category: Category
  score: number
  review: string | null
  image_url: string | null
  created_at: string
  profiles?: Profile
}

export interface Follow {
  follower_id: string
  following_id: string
}

export interface Story {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  rating_id: string | null
  created_at: string
  expires_at: string
  profiles?: Profile
  rating?: Rating
}

export interface StoryGroup {
  profile: Profile
  stories: Story[]
  hasUnseen: boolean
}
