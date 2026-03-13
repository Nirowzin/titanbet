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

    const { user_id, ban } = await req.json()

    await admin.from('profiles').update({ is_banned: ban }).eq('id', user_id)

    if (ban) {
      await admin.from('notifications').insert({
        user_id,
        title: '⛔ Conta suspensa',
        message: 'Sua conta foi suspensa. Entre em contato com o suporte.',
        type: 'error',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
