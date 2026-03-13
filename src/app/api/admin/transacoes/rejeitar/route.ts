import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { transaction_id } = await req.json()

    const { data: tx } = await admin
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (!tx || tx.status !== 'pending' || tx.type !== 'withdrawal') {
      return NextResponse.json({ error: 'Transação inválida' }, { status: 400 })
    }

    // Marcar como falha
    await admin.from('transactions').update({ status: 'failed' }).eq('id', transaction_id)

    // Estornar saldo
    const { data: userProfile } = await admin.from('profiles').select('balance').eq('id', tx.user_id).single()
    if (userProfile) {
      await admin.from('profiles').update({ balance: userProfile.balance + tx.amount }).eq('id', tx.user_id)
    }

    // Registrar estorno
    await admin.from('transactions').insert({
      user_id: tx.user_id,
      type: 'refund',
      amount: tx.amount,
      status: 'completed',
      description: `Estorno de saque rejeitado`,
    })

    await admin.from('notifications').insert({
      user_id: tx.user_id,
      title: '❌ Saque rejeitado',
      message: `Seu saque de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)} foi rejeitado. O valor foi devolvido ao seu saldo.`,
      type: 'error',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
