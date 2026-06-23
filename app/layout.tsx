import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rateit-gamma.vercel.app'),
  title: {
    default: 'rateit',
    template: '%s | rateit',
  },
  description: 'Rate movies, games, food, music, sports & more. See what your friends think.',
  openGraph: {
    title: 'rateit',
    description: 'Rate movies, games, food, music, sports & more. See what your friends think.',
    url: 'https://rateit-gamma.vercel.app',
    siteName: 'rateit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rateit',
    description: 'Rate movies, games, food, music, sports & more. See what your friends think.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {/* Desktop sidebar — hidden on mobile */}
          <Sidebar />
          {/* Content shifts right on desktop to clear sidebar; bottom padding on mobile for bottom nav */}
          <div className="flex-1 md:ml-60 pb-16 md:pb-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}>
            {children}
            <footer className="max-w-lg md:max-w-2xl mx-auto px-4 py-6 flex justify-center gap-6 text-xs text-zinc-400">
              <a href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-zinc-600 transition-colors">Terms of Service</a>
              <a href="mailto:RateitAsk@gmail.com" className="hover:text-zinc-600 transition-colors">Contact</a>
            </footer>
          </div>
          {/* Bottom nav — hidden on desktop */}
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
