import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { amount } = await req.json()

    if (!amount || amount < 10 || amount > 50000) {
      return NextResponse.json({ error: 'Valor inválido. Mínimo R$10, máximo R$50.000' }, { status: 400 })
    }

    // Buscar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, cpf')
      .eq('id', user.id)
      .single()

    const admin = createAdminClient()
    const externalReference = `titanbet_dep_${user.id}_${Date.now()}`

    // Criar transação pendente
    const { data: transaction, error: txError } = await admin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount,
        status: 'pending',
        payment_method: 'pix',
        external_reference: externalReference,
        description: `Depósito PIX - R$${amount}`,
      })
      .select()
      .single()

    if (txError) {
      console.error('Erro ao criar transação:', txError)
      return NextResponse.json({ error: 'Erro ao processar depósito' }, { status: 500 })
    }

    // Integração Mercado Pago
    const accessToken = process.env.MP_ACCESS_TOKEN

    if (!accessToken || accessToken === 'seu_access_token_aqui') {
      // Modo de desenvolvimento: retornar QR Code fictício
      return NextResponse.json({
        qr_code: `00020126580014br.gov.bcb.pix0136${externalReference}5204000053039865802BR5925TITANBET PAGAMENTOS LTDA6009SAO PAULO62070503***63049B2C`,
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?data=titanbet_pix_demo&size=200x200',
        external_reference: externalReference,
        transaction_id: transaction.id,
        amount,
        mode: 'development',
      })
    }

    const mp = new MercadoPagoConfig({ accessToken })
    const payment = new Payment(mp)

    const pixPayment = await payment.create({
      body: {
        transaction_amount: amount,
        description: `Depósito TitanBet`,
        payment_method_id: 'pix',
        payer: {
          email: user.email || profile?.email || 'payer@titanbet.com',
          first_name: profile?.full_name?.split(' ')[0] || 'Usuário',
          last_name: profile?.full_name?.split(' ')[1] || 'TitanBet',
          identification: {
            type: 'CPF',
            number: profile?.cpf?.replace(/\D/g, '') || '',
          },
        },
        external_reference: externalReference,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pagamentos/webhook`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    })

    const qrCode = pixPayment.point_of_interaction?.transaction_data?.qr_code || ''
    const qrCodeUrl = pixPayment.point_of_interaction?.transaction_data?.qr_code_url || ''

    // Atualizar transação com ID do MP
    await admin
      .from('transactions')
      .update({ external_reference: pixPayment.id?.toString() || externalReference })
      .eq('id', transaction.id)

    return NextResponse.json({
      qr_code: qrCode,
      qr_code_url: qrCodeUrl,
      external_reference: externalReference,
      transaction_id: transaction.id,
      amount,
    })
  } catch (error: any) {
    console.error('Erro no depósito:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar depósito' },
      { status: 500 }
    )
  }
}
