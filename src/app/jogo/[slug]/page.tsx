import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GamePlayer from '@/components/casino/GamePlayer'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ demo?: string }>
}

export default async function JogoPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { demo } = await searchParams

  const supabase = await createClient()

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!game) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('balance, bonus_balance, vip_level')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Buscar jogos similares
  const { data: similarGames } = await supabase
    .from('games')
    .select('id, name, slug, category, emoji, rtp')
    .eq('category', game.category)
    .neq('id', game.id)
    .eq('is_active', true)
    .limit(6)

  return (
    <GamePlayer
      game={game}
      profile={profile}
      user={user}
      isDemo={demo === '1' || !user}
      similarGames={similarGames || []}
    />
  )
}
