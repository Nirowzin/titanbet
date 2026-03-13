import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoricoClient from '@/components/historico/HistoricoClient'

export default async function HistoricoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: transactions }, { data: bets }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('bets')
      .select(`*, games(name, emoji, category)`)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <HistoricoClient
      transactions={transactions || []}
      bets={bets || []}
    />
  )
}
