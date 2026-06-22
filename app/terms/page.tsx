import Link from 'next/link'
import Navbar from '../../components/Navbar'

export const metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <>
      <Navbar username="" />
      <main className="max-w-lg mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Terms of Service</h1>
          <p className="text-zinc-400 text-xs">Last updated: June 2025</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Using rateit</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            rateit is a platform for sharing your opinions on movies, games, music, food, sports, and more. By creating an account, you agree to these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Your content</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You own the ratings and reviews you post. By posting them, you give rateit permission to display them on the platform. Your ratings are public by default — anyone can see them.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Rules</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-1">You agree not to:</p>
          <ul className="space-y-1 list-disc list-inside text-zinc-600 dark:text-zinc-400">
            <li>Impersonate other people or create fake accounts</li>
            <li>Post spam, hate speech, or harassment</li>
            <li>Use the platform for any illegal purpose</li>
            <li>Attempt to scrape or automate access to the platform</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Account termination</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We reserve the right to suspend or delete accounts that violate these terms. You can delete your own account at any time from Account Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Disclaimer</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            rateit is provided as-is. We do not guarantee uptime or accuracy of content. Ratings reflect community opinions, not professional reviews.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Changes</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            We may update these terms as the platform grows. Continued use of rateit after changes means you accept the new terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-zinc-900 dark:text-white">Contact</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Questions? Email{' '}
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
