import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">CQ</span>
          </div>
          <span className="font-display font-bold text-lg text-gray-900">Currículo que Passa</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold bg-brand-green text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center page-enter">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-green-pale border border-brand-green-light
                        text-green-800 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          Powered by IA Groq · 1 análise grátis para novos usuários
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-gray-900 leading-tight mb-6">
          Coloque a descrição
          <br />
          <span className="text-gradient">da vaga aqui!</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Nossa IA analisa seu currículo, calcula o <strong className="text-gray-700">Score ATS</strong>,
          identifica palavras-chave e gera uma versão otimizada com técnicas de RH —
          tudo em segundos.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-3 bg-brand-green text-white
                     font-display font-bold text-lg px-8 py-4 rounded-full
                     shadow-lg shadow-green-200 hover:shadow-xl hover:bg-green-600
                     transition-all duration-300 animate-pulse-green"
        >
          Analisar meu currículo agora
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="text-sm text-gray-400 mt-4">Sem cartão de crédito · 1 análise grátis ao criar conta</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20">
          {[
            { num: "2.800+", label: "Currículos analisados" },
            { num: "87%",    label: "Taxa de aprovação ATS" },
            { num: "< 30s",  label: "Análise completa com IA" },
          ].map((s) => (
            <div key={s.num} className="text-center">
              <div className="font-display font-extrabold text-3xl text-brand-green">{s.num}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display font-bold text-3xl text-center text-gray-900 mb-4">
            Como funciona
          </h2>
          <p className="text-center text-gray-500 mb-12">Três passos simples para turbinar seu currículo</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Cole a descrição da vaga",
                desc: "Copie e cole o texto completo da vaga que você quer se candidatar.",
                icon: "📋",
              },
              {
                step: "02",
                title: "Insira seu currículo",
                desc: "Cole o texto do seu currículo atual. Não precisa ter formato especial.",
                icon: "📄",
              },
              {
                step: "03",
                title: "Receba a análise + PDF otimizado",
                desc: "Score ATS, keywords faltando, recomendações e currículo reescrito com técnicas de RH.",
                icon: "✅",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-brand-green-pale rounded-2xl p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="font-display font-bold text-sm text-brand-green mb-2">Passo {item.step}</div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="font-display font-bold text-3xl text-center text-gray-900 mb-12">
          O que dizem nossos usuários
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              text: "Fiz a análise, adicionei as keywords sugeridas e consegui entrevista em menos de uma semana!",
              name: "Mariana S.",
              role: "Analista de Marketing",
            },
            {
              text: "O currículo otimizado foi completamente diferente. As métricas e verbos de ação fizeram toda a diferença.",
              name: "Rafael P.",
              role: "Desenvolvedor Full Stack",
            },
            {
              text: "Não sabia que meu currículo estava tão mal otimizado para ATS. Agora tenho 91% de match!",
              name: "Carla M.",
              role: "Gerente de Projetos",
            },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-brand-orange">★</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-brand-green py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Precisa de mais análises?
          </h2>
          <p className="text-green-100 mb-8">
            Compre um pacote de créditos. Sem assinatura, sem mensalidade.
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-xl inline-block">
            <div className="text-5xl mb-2">🎯</div>
            <div className="font-display font-extrabold text-4xl text-brand-green">15 créditos</div>
            <div className="font-display font-bold text-2xl text-gray-900 mt-2">R$ 25,00</div>
            <div className="text-gray-400 text-sm mt-1">= R$ 1,67 por análise · PIX ou Cartão</div>
            <Link
              href="/login"
              className="mt-6 block bg-brand-green text-white font-bold py-3 px-8 rounded-full
                         hover:bg-green-600 transition-colors"
            >
              Criar conta e comprar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-green flex items-center justify-center">
              <span className="text-white font-bold text-xs">CQ</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Currículo que Passa</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-gray-700 transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-gray-700 transition-colors">Termos</Link>
            <Link href="#" className="hover:text-gray-700 transition-colors">Contato</Link>
          </div>
          <p className="text-xs text-gray-400">
            Pagamento seguro via AbacatePay · PIX e Cartão
          </p>
        </div>
      </footer>
    </div>
  );
}
