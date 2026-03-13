import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { game_id, bet_amount, win, win_amount, multiplier } = await req.json()

    if (!game_id || !bet_amount || bet_amount < 1) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Buscar saldo atual
    const { data: profile } = await admin
      .from('profiles')
      .select('balance, vip_points, total_wagered')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.balance < bet_amount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Calcular novo saldo
    let newBalance = profile.balance - bet_amount
    if (win && win_amount > 0) {
      newBalance += win_amount
    }

    // Pontos VIP: 1 ponto a cada R$10 apostado
    const pointsEarned = Math.floor(bet_amount / 10)
    const newVipPoints = profile.vip_points + pointsEarned

    // Calcular novo nível VIP
    let newVipLevel = 0
    const thresholds = [0, 500, 2000, 5000, 20000, 100000]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (newVipPoints >= thresholds[i]) {
        newVipLevel = i
        break
      }
    }

    // Atualizar perfil
    await admin.from('profiles').update({
      balance: newBalance,
      vip_points: newVipPoints,
      vip_level: newVipLevel,
      total_wagered: (profile.total_wagered || 0) + bet_amount,
      ...(win && win_amount > 0 ? { total_won: undefined } : {}),
    }).eq('id', user.id)

    // Registrar aposta
    await admin.from('bets').insert({
      user_id: user.id,
      game_id,
      amount: bet_amount,
      win_amount: win_amount || 0,
      multiplier: multiplier || 0,
      status: win ? 'win' : 'loss',
    })

    // Registrar transações
    await admin.from('transactions').insert([
      {
        user_id: user.id,
        type: 'bet',
        amount: bet_amount,
        status: 'completed',
        description: `Aposta no jogo`,
        metadata: { game_id },
      },
      ...(win && win_amount > 0 ? [{
        user_id: user.id,
        type: 'win',
        amount: win_amount,
        status: 'completed',
        description: `Ganho: ${multiplier}x`,
        metadata: { game_id, multiplier },
      }] : []),
    ])

    // Notificar level up
    if (newVipLevel > (profile as any).vip_level) {
      await admin.from('notifications').insert({
        user_id: user.id,
        title: '🎉 Level Up VIP!',
        message: `Parabéns! Você subiu para o nível VIP ${newVipLevel}!`,
        type: 'success',
      })
    }

    return NextResponse.json({
      success: true,
      win,
      win_amount: win_amount || 0,
      new_balance: newBalance,
      points_earned: pointsEarned,
      new_vip_points: newVipPoints,
    })
  } catch (error: any) {
    console.error('Erro na aposta:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
