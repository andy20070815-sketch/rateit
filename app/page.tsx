import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Logged-in users go straight to feed; visitors see the landing page
  if (user) redirect('/feed')
  redirect('/feed')
}
