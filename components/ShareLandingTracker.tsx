'use client'
import { useEffect } from 'react'
import { track } from '../lib/analytics'

export default function ShareLandingTracker({ rid, source }: { rid: string; source: string }) {
  useEffect(() => {
    track('share_landed', { rid, source })
  }, [rid, source])
  return null
}
