import type { Category } from './types'

export const CATEGORY_LABELS: Record<Category, string> = {
  movie: 'Movie',
  tv: 'TV Show',
  sport: 'Sport',
  youtube: 'YouTube',
  music: 'Music',
  book: 'Book',
  game: 'Game',
  food: 'Food',
  other: 'Other',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  movie: '🎬',
  tv: '📺',
  sport: '⚽',
  youtube: '▶️',
  music: '🎵',
  book: '📚',
  game: '🎮',
  food: '🍽️',
  other: '⭐',
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]
