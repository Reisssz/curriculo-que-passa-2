import Link from "next/link";

// Add the contents of homepage.css to your globals.css

export default function HomePage() {
  return (
    <div className="hp-root">
      {/* ── Nav ── */}
      <nav className="hp-nav">
        <Link href="/" className="hp-wordmark">Currículo que Passa</Link>
        <div className="hp-nav-right">
          <Link href="/login" className="hp-nav-link">Entrar</Link>
          <Link href="/login" className="hp-nav-cta">Começar grátis</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-orb hp-orb-1" />
        <div className="hp-orb hp-orb-2" />

        <div className="hp-hero-inner">
          <div className="hp-badge hp-enter-1">
            <span className="hp-badge-dot" />
            Powered by IA · 1 análise grátis para novos usuários
          </div>

          <h1 className="hp-headline hp-enter-2">
            Seu currículo{" "}
            <span className="hp-headline-accent">passa pelo ATS</span>
            <br />
            ou vai pro lixo?
          </h1>

          <p className="hp-hero-sub hp-enter-3">
            Nossa IA compara sua candidatura com a vaga, calcula o{" "}
            <strong className="hp-hero-strong">Score ATS</strong>, aponta
            palavras-chave ausentes e entrega uma versão reescrita com técnicas
            de RH — em menos de 30 segundos.
          </p>

          <div className="hp-enter-4">
            <Link href="/login" className="hp-cta-btn">
              Analisar meu currículo agora
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <p className="hp-cta-sub hp-enter-4">
            Sem cartão de crédito · 1 análise grátis ao criar conta
          </p>

          <div className="hp-stats hp-enter-5">
            <div className="hp-stat">
              <div className="hp-stat-num">2.800+</div>
              <div className="hp-stat-label">Currículos analisados</div>
            </div>
            <div className="hp-stats-divider" />
            <div className="hp-stat">
              <div className="hp-stat-num">87%</div>
              <div className="hp-stat-label">Taxa de aprovação ATS</div>
            </div>
            <div className="hp-stats-divider" />
            <div className="hp-stat">
              <div className="hp-stat-num">&lt;30s</div>
              <div className="hp-stat-label">Análise completa</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="hp-section hp-section-alt">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <p className="hp-section-label">Como funciona</p>
            <h2 className="hp-section-title">Três passos, resultado real</h2>
          </div>
          <div className="hp-steps-grid">
            {[
              { step: "PASSO 01", title: "Cole a descrição da vaga", desc: "Copie o texto completo da vaga que deseja conquistar. Quanto mais detalhe, melhor.", icon: "📋" },
              { step: "PASSO 02", title: "Insira seu currículo atual", desc: "Cole o texto do seu currículo. Qualquer formato funciona — a IA faz o trabalho.", icon: "📄" },
              { step: "PASSO 03", title: "Receba análise + currículo otimizado", desc: "Score ATS, keywords faltando, recomendações de melhoria e currículo reescrito com técnicas de RH.", icon: "✅" },
            ].map((item) => (
              <div key={item.step} className="hp-step-card">
                <div className="hp-step-icon">{item.icon}</div>
                <div className="hp-step-num">{item.step}</div>
                <h3 className="hp-step-title">{item.title}</h3>
                <p className="hp-step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <p className="hp-section-label">Resultados reais</p>
            <h2 className="hp-section-title">O que dizem nossos usuários</h2>
          </div>
          <div className="hp-tgrid">
            {[
              { text: "Fiz a análise, adicionei as keywords sugeridas e consegui entrevista em menos de uma semana!", name: "Mariana S.", role: "Analista de Marketing", score: "94%" },
              { text: "O currículo otimizado foi completamente diferente. As métricas e verbos de ação fizeram toda a diferença.", name: "Rafael P.", role: "Desenvolvedor Full Stack", score: "89%" },
              { text: "Não sabia que meu currículo estava tão mal otimizado para ATS. Agora tenho 91% de match!", name: "Carla M.", role: "Gerente de Projetos", score: "91%" },
            ].map((t) => (
              <div key={t.name} className="hp-tcard">
                <div className="hp-tcard-top">
                  <div className="hp-stars">
                    {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <span className="hp-tscore">{t.score}</span>
                </div>
                <p className="hp-ttext">"{t.text}"</p>
                <div className="hp-tauthor">
                  <div className="hp-tavatar">{t.name[0]}</div>
                  <div>
                    <div className="hp-tname">{t.name}</div>
                    <div className="hp-trole">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="hp-pricing">
        <div className="hp-pricing-ring hp-pricing-ring-1" />
        <div className="hp-pricing-ring hp-pricing-ring-2" />
        <div className="hp-pricing-inner">
          <p className="hp-section-label hp-section-label-inv">Planos</p>
          <h2 className="hp-pricing-title">Precisa de mais análises?</h2>
          <p className="hp-pricing-sub">Sem assinatura, sem mensalidade. Pague só o que usar.</p>
          <div className="hp-pricing-card">
            <div className="hp-pricing-emoji">🎯</div>
            <div className="hp-pricing-credits">15 créditos</div>
            <div className="hp-pricing-price">R$&nbsp;25</div>
            <div className="hp-pricing-note">= R$ 1,67 por análise · PIX ou Cartão</div>
            <Link href="/login" className="hp-pricing-cta">Criar conta e comprar</Link>
            <p className="hp-pricing-secure">🔒 Pagamento seguro via AbacatePay</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <Link href="/" className="hp-wordmark hp-wordmark-sm">Currículo que Passa</Link>
          <div className="hp-footer-links">
            <Link href="#" className="hp-footer-link">Privacidade</Link>
            <Link href="#" className="hp-footer-link">Termos</Link>
            <Link href="#" className="hp-footer-link">Contato</Link>
          </div>
          <p className="hp-footer-copy">© 2025 Currículo que Passa</p>
        </div>
      </footer>
    </div>
  );
}