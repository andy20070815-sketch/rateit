import Link from 'next/link'
import Navbar from '../../components/Navbar'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar username="" />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Privacy Policy</h1>
          <p className="text-zinc-400 text-xs">Last updated: June 2025</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">What we collect</h2>
          <ul className="space-y-1 list-disc list-inside text-zinc-600 dark:text-zinc-400">
            <li>Your email address (used for sign-in only)</li>
            <li>Your username and display name</li>
            <li>The ratings and reviews you post</li>
            <li>Who you follow and who follows you</li>
            <li>Your profile avatar (if you sign in with Google, we use your Google photo)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">What we do not collect</h2>
          <ul className="space-y-1 list-disc list-inside text-zinc-600 dark:text-zinc-400">
            <li>Your location</li>
            <li>Your contacts or address book</li>
            <li>Browsing history outside of rateit</li>
            <li>Any payment information</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">How we use your data</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We use your data only to run rateit — to show your ratings to others, power your feed, and let you follow people. We do not sell your data, run ads, or share your information with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">What is public</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your username, ratings, reviews, and follower/following counts are public and visible to anyone — logged in or not. Your email address is never shown publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Data storage</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your data is stored securely via Supabase, hosted on AWS. We use industry-standard encryption in transit and at rest.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Deleting your account</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You can delete your account at any time from{' '}
            <Link href="/account" className="underline text-zinc-900 dark:text-white">Account Settings</Link>.
            Deleting your account permanently removes your profile, ratings, and all associated data. This cannot be undone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Contact</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Questions? Email us at{' '}
            <a href="mailto:RateitAsk@gmail.com" className="underline text-zinc-900 dark:text-white">
              RateitAsk@gmail.com
            </a>
          </p>
        </section>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            Back to rateit
          </Link>
        </div>

      </main>
    </>
  )
}
