type Props = Record<string, string | number | boolean | undefined>

export function track(event: string, props?: Props) {
  if (typeof window === 'undefined') return
  // Swap for real analytics: import { track as va } from '@vercel/analytics'; va(event, props)
  console.log('[analytics]', event, props)
}
