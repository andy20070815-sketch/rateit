export function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase().split('?')[0]
  return ['.mp4', '.mov', '.webm', '.m4v', '.avi'].some(ext => lower.endsWith(ext))
}

export function formatDistanceToNow(dateString: string, locale = 'en'): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (locale === 'zh-TW') {
    if (seconds < 60) return '剛才'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`
    return date.toLocaleDateString('zh-TW')
  }

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
