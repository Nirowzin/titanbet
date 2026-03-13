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

    const gameData = await req.json()

    const { data: game, error } = await admin
      .from('games')
      .insert({
        name: gameData.name,
        slug: gameData.slug,
        provider: gameData.provider,
        category: gameData.category,
        emoji: gameData.emoji || '🎮',
        rtp: gameData.rtp || 96,
        description: gameData.description,
        is_featured: gameData.is_featured || false,
        is_hot: gameData.is_hot || false,
        is_new: gameData.is_new || true,
        is_active: true,
        min_bet: 1,
        max_bet: 1000,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Já existe um jogo com esse nome/slug' }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, game })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
