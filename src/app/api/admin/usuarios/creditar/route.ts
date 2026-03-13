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

    const { user_id, amount } = await req.json()

    if (!user_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { data: targetProfile } = await admin
      .from('profiles')
      .select('balance')
      .eq('id', user_id)
      .single()

    if (!targetProfile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await admin.from('profiles').update({
      balance: targetProfile.balance + amount,
    }).eq('id', user_id)

    await admin.from('transactions').insert({
      user_id,
      type: 'bonus',
      amount,
      status: 'completed',
      description: `Crédito manual pelo administrador`,
      metadata: { admin_id: user.id },
    })

    await admin.from('notifications').insert({
      user_id,
      title: '🎁 Saldo creditado!',
      message: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)} foram adicionados à sua conta pelo administrador.`,
      type: 'success',
    })

    return NextResponse.json({ success: true, new_balance: targetProfile.balance + amount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
