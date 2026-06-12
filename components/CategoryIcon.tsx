import { Film, Tv, Trophy, PlayCircle, Music, BookOpen, Gamepad2, Utensils, MoreHorizontal } from 'lucide-react'
import type { Category } from '../lib/types'

const icons: Record<Category, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  movie: Film,
  tv: Tv,
  sport: Trophy,
  youtube: PlayCircle,
  music: Music,
  book: BookOpen,
  game: Gamepad2,
  food: Utensils,
  other: MoreHorizontal,
}

export default function CategoryIcon({
  category,
  size = 16,
  className = '',
  strokeWidth = 2,
}: {
  category: Category
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const Icon = icons[category]
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />
}
