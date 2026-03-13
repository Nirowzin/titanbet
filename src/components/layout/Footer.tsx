import Link from 'next/link'
import { Trophy, Shield, Zap, HeadphonesIcon, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#070710] border-t border-[#1e1e2e] mt-16">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-[#1a0a00] via-[#1a1a0a] to-[#001a0a] border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap gap-6 justify-center sm:justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#f5a623]" />
            <div>
              <p className="text-sm font-bold text-white">Jogo Responsável</p>
              <p className="text-xs text-gray-500">Aposte com responsabilidade. +18 anos.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#f5a623]" />
            <div>
              <p className="text-sm font-bold text-white">PIX Instantâneo</p>
              <p className="text-xs text-gray-500">Saque em até 15 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HeadphonesIcon className="w-8 h-8 text-[#f5a623]" />
            <div>
              <p className="text-sm font-bold text-white">Suporte 24/7</p>
              <p className="text-xs text-gray-500">Atendimento via chat e WhatsApp</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#f5a623]" />
            <div>
              <p className="text-sm font-bold text-white">Licença Verificada</p>
              <p className="text-xs text-gray-500">Plataforma regulamentada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-titan-gold rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-extrabold text-titan-gold">TitanBet</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              A casa de apostas dos campeões. Segurança, variedade e as melhores odds do mercado.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg flex items-center justify-center hover:border-[#f5a623] transition-colors">
                <Instagram className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="w-9 h-9 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg flex items-center justify-center hover:border-[#f5a623] transition-colors">
                <Youtube className="w-4 h-4 text-gray-400" />
              </a>
              {/* WhatsApp */}
              <a href="#" className="w-9 h-9 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg flex items-center justify-center hover:border-[#f5a623] transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Cassino */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Cassino</h3>
            <ul className="space-y-2.5">
              {['Slots', 'Crash Games', 'Cassino ao Vivo', 'Jogos Originais', 'Jogos de Mesa', 'Novidades'].map(item => (
                <li key={item}>
                  <Link href="/cassino" className="text-sm text-gray-500 hover:text-[#f5a623] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Promoções */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Promoções</h3>
            <ul className="space-y-2.5">
              {['Bônus de Boas-Vindas', 'Recarga Semanal', 'Cashback VIP', 'Giros Grátis', 'Programa de Afiliados', 'Clube VIP'].map(item => (
                <li key={item}>
                  <Link href="/bonus" className="text-sm text-gray-500 hover:text-[#f5a623] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Suporte</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Central de Ajuda', href: '/ajuda' },
                { label: 'Termos de Uso', href: '/termos' },
                { label: 'Política de Privacidade', href: '/privacidade' },
                { label: 'Jogo Responsável', href: '/responsavel' },
                { label: 'KYC / Verificação', href: '/verificacao' },
                { label: 'Contato', href: '/contato' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-[#f5a623] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Métodos de pagamento */}
        <div className="border-t border-[#1e1e2e] pt-8 mb-6">
          <p className="text-xs text-gray-600 text-center mb-4 uppercase tracking-wider">Métodos de Pagamento Aceitos</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['PIX', 'Boleto', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência'].map(method => (
              <span key={method} className="px-3 py-1.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-md text-xs text-gray-400">
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Aviso legal */}
        <div className="border-t border-[#1e1e2e] pt-6">
          <p className="text-xs text-gray-600 text-center leading-relaxed mb-3">
            ⚠️ <strong className="text-gray-500">JOGO RESPONSÁVEL:</strong> Apostas só devem ser realizadas por maiores de 18 anos. 
            O jogo pode ser viciante — jogue com responsabilidade. Se você tiver um problema com jogo, contate <strong className="text-gray-400">0800-999-0000</strong>.
          </p>
          <p className="text-xs text-gray-700 text-center">
            © {currentYear} TitanBet. Todos os direitos reservados. CNPJ 00.000.000/0001-00
          </p>
        </div>
      </div>
    </footer>
  )
}
