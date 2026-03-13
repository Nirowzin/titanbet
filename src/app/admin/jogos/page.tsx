import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminJogosClient from '@/components/admin/AdminJogosClient'

export default async function AdminJogosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: games } = await admin
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminJogosClient games={games || []} />
}
