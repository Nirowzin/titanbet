import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data } = body

    console.log('Webhook MP recebido:', JSON.stringify(body))

    // Apenas processar notificações de pagamento
    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken || accessToken === 'seu_access_token_aqui') {
      console.log('Webhook em modo dev, ignorando...')
      return NextResponse.json({ received: true })
    }

    const mp = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(mp)

    // Buscar detalhes do pagamento no MP
    const payment = await paymentClient.get({ id: data.id })

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    const admin = createAdminClient()

    // Encontrar transação pelo external_reference
    const { data: transaction } = await admin
      .from('transactions')
      .select('*')
      .or(`external_reference.eq.${payment.external_reference},external_reference.eq.${payment.id}`)
      .single()

    if (!transaction) {
      console.log('Transação não encontrada para ref:', payment.external_reference)
      return NextResponse.json({ received: true })
    }

    if (transaction.status !== 'pending') {
      // Já processada
      return NextResponse.json({ received: true })
    }

    const mpStatus = payment.status

    if (mpStatus === 'approved') {
      // Pagamento aprovado — creditar saldo
      const { data: profile } = await admin
        .from('profiles')
        .select('balance, total_deposited')
        .eq('id', transaction.user_id)
        .single()

      if (profile) {
        const isFirstDeposit = profile.total_deposited === 0

        // Atualizar saldo e total depositado
        await admin
          .from('profiles')
          .update({
            balance: profile.balance + transaction.amount,
            total_deposited: (profile.total_deposited || 0) + transaction.amount,
          })
          .eq('id', transaction.user_id)

        // Marcar transação como completa
        await admin
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', transaction.id)

        // Bônus de primeiro depósito
        if (isFirstDeposit) {
          const bonusAmount = Math.min(transaction.amount * 2, 500)

          await admin.from('transactions').insert({
            user_id: transaction.user_id,
            type: 'bonus',
            amount: bonusAmount,
            status: 'completed',
            description: 'Bônus de 200% no primeiro depósito',
          })

          await admin.from('profiles').select('bonus_balance').eq('id', transaction.user_id).single().then(async ({ data: p }) => {
            if (p) {
              await admin.from('profiles').update({
                bonus_balance: (p.bonus_balance || 0) + bonusAmount
              }).eq('id', transaction.user_id)
            }
          })

          // Criar bônus record
          const rolloverTarget = bonusAmount * 30
          await admin.from('bonuses').insert({
            user_id: transaction.user_id,
            type: 'deposit_bonus',
            amount: bonusAmount,
            rollover_required: rolloverTarget,
            rollover_completed: 0,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
        }

        // Notificação
        await admin.from('notifications').insert({
          user_id: transaction.user_id,
          title: 'Depósito confirmado! 🎉',
          message: `Seu depósito de R$${transaction.amount.toFixed(2).replace('.', ',')} foi confirmado com sucesso.`,
          type: 'success',
        })
      }
    } else if (['rejected', 'cancelled', 'refunded'].includes(mpStatus || '')) {
      await admin
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Verificação de ownership do webhook (GET)
export async function GET() {
  return NextResponse.json({ status: 'TitanBet webhook endpoint active' })
}
