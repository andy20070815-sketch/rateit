import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { createClient } from '../../lib/supabase/server'
import Navbar from '../../components/Navbar'
import SignOutButton from '../../components/SignOutButton'
import DeleteAccountButton from '../../components/DeleteAccountButton'
import LocaleSwitch from '../../components/LocaleSwitch'
import AvatarUpload from '../../components/AvatarUpload'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const [
    { count: ratingsCount },
    { count: followersCount },
    { count: followingCount },
  ] = await Promise.all([
    supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
  ])

  const t = await getTranslations('account')
  const locale = await getLocale()

  const memberSince = new Date(user.created_at).toLocaleDateString(
    locale === 'zh-TW' ? 'zh-TW' : 'en-US',
    { month: 'long', year: 'numeric' }
  )

  return (
    <>
      <Navbar username={profile?.username ?? ''} />
      <main className="max-w-lg mx-auto px-4 py-8 space-y-8">

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <AvatarUpload
            currentUrl={profile?.avatar_url ?? null}
            username={profile?.username || user.email?.split('@')[0] || 'U'}
          />
          <div className="text-center">
            <p className="text-2xl font-black">@{profile?.username}</p>
            {profile?.full_name && (
              <p className="text-zinc-500 mt-0.5">{profile.full_name}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 py-4 border-y border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-2xl font-black">{ratingsCount ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{t('ratings')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{followersCount ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{t('followers')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{followingCount ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{t('following')}</p>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{t('bio')}</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Language */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{t('languageLabel')}</p>
          <LocaleSwitch />
        </div>

        {/* Account info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{t('sectionAccount')}</p>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-zinc-500">{t('username')}</span>
              <span className="text-sm font-semibold">@{profile?.username}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-zinc-500">{t('email')}</span>
              <span className="text-sm font-semibold">{user.email}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-zinc-500">{t('memberSince')}</span>
              <span className="text-sm font-semibold">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{t('sectionActivity')}</p>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800">
            <Link href={`/profile/${profile?.username}`} className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-t-2xl">
              <span className="text-sm font-medium">{t('myRatings')}</span>
              <span className="text-zinc-400 text-sm">›</span>
            </Link>
            <Link href="/rate" className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-b-2xl">
              <span className="text-sm font-medium">{t('rateNew')}</span>
              <span className="text-zinc-400 text-sm">›</span>
            </Link>
          </div>
        </div>

        {/* Sign out */}
        <SignOutButton />

        {/* Legal */}
        <div className="flex justify-center gap-4 text-xs text-zinc-400">
          <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms of Service</Link>
        </div>

        {/* Delete account */}
        <div className="pb-12 flex flex-col items-center gap-3">
          <DeleteAccountButton />
        </div>

      </main>
    </>
  )
}
