import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { amount, pix_key, pix_key_type } = await req.json()

    if (!amount || amount < 20) {
      return NextResponse.json({ error: 'Valor mínimo de saque é R$20,00' }, { status: 400 })
    }

    if (!pix_key || !pix_key_type) {
      return NextResponse.json({ error: 'Chave PIX obrigatória' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verificar saldo
    const { data: profile } = await admin
      .from('profiles')
      .select('balance, kyc_status')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.balance < amount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Em saque de alto valor, verificar KYC
    if (amount > 500 && profile.kyc_status !== 'approved') {
      return NextResponse.json(
        { error: 'Verificação de identidade necessária para saques acima de R$500' },
        { status: 400 }
      )
    }

    // Verificar saques pendentes (máximo 1 ao mesmo tempo)
    const { count: pendingWithdrawals } = await admin
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'withdrawal')
      .eq('status', 'pending')

    if ((pendingWithdrawals || 0) > 0) {
      return NextResponse.json(
        { error: 'Você já tem um saque pendente. Aguarde o processamento.' },
        { status: 400 }
      )
    }

    const externalReference = `titanbet_saque_${user.id}_${Date.now()}`

    // Debitar saldo imediatamente (evitar double spend)
    const { error: debitError } = await admin.rpc('debit_balance', {
      user_id: user.id,
      debit_amount: amount,
    })

    if (debitError) {
      // RPC não existe ainda — fallback manual
      const { error: updateError } = await admin
        .from('profiles')
        .update({ balance: profile.balance - amount })
        .eq('id', user.id)
        .gte('balance', amount)

      if (updateError) {
        return NextResponse.json({ error: 'Saldo insuficiente ou erro ao processar' }, { status: 400 })
      }
    }

    // Salvar chave PIX no perfil (upsert)
    await admin.from('pix_keys').upsert({
      user_id: user.id,
      key_type: pix_key_type,
      key_value: pix_key,
      is_default: true,
    }, { onConflict: 'user_id,key_value' })

    // Criar transação de saque
    await admin.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      payment_method: 'pix',
      external_reference: externalReference,
      description: `Saque PIX - Chave ${pix_key_type}: ${pix_key}`,
      metadata: { pix_key, pix_key_type },
    })

    return NextResponse.json({
      success: true,
      message: 'Saque solicitado com sucesso! Será processado em até 24h.',
      reference: externalReference,
    })
  } catch (error: any) {
    console.error('Erro no saque:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar saque' },
      { status: 500 }
    )
  }
}
