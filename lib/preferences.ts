import type { Category } from './types'

const PREFS_KEY = 'rateit_preferred_categories'
const ONBOARDED_KEY = 'rateit_onboarded'

export function getPreferredCategories(): Category[] {
  if (typeof window === 'undefined') return []
  try {
    const val = localStorage.getItem(PREFS_KEY)
    return val ? (JSON.parse(val) as Category[]) : []
  } catch {
    return []
  }
}

export function setPreferredCategories(cats: Category[]): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(cats))
  localStorage.setItem(ONBOARDED_KEY, '1')
}

export function hasOnboarded(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDED_KEY) === '1'
}
