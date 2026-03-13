import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminTransacoesClient from '@/components/admin/AdminTransacoesClient'

export default async function AdminTransacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: transactions } = await admin
    .from('transactions')
    .select('*, profiles(username, email)')
    .order('created_at', { ascending: false })
    .limit(200)

  return <AdminTransacoesClient transactions={transactions || []} />
}
