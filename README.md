# Currículo que Passa 🎯

SaaS brasileiro para análise e otimização de currículos com IA, usando Score ATS, técnicas de RH e export em PDF.

## Stack

| Camada       | Tecnologia                    |
|-------------|-------------------------------|
| Framework    | Next.js 14 (App Router)       |
| UI           | TailwindCSS + Framer Motion   |
| Auth + DB    | Supabase (Auth + PostgreSQL)  |
| IA           | Groq (llama-3.3-70b)          |
| Email        | Resend                        |
| Pagamento    | AbacatePay (PIX + Cartão)     |
| Deploy       | Vercel (sem VPS)              |

## Modelo de créditos

- 1 crédito grátis ao criar conta
- 1 crédito = 1 análise completa (Score ATS + currículo otimizado + PDF)
- Pacote: 15 créditos por R$ 25,00

---

## Setup completo

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute todo o conteúdo de `supabase-schema.sql`
3. Em **Authentication > Providers**, habilite **Google** (configure OAuth no Google Cloud Console)
4. Em **Authentication > URL Configuration**, adicione:
   - Site URL: `https://seu-dominio.com`
   - Redirect URLs: `https://seu-dominio.com/auth/callback`
5. Copie as chaves em **Settings > API**

### 2. Groq

1. Crie conta em [console.groq.com](https://console.groq.com)
2. Gere uma API Key
3. O modelo usado é `llama-3.3-70b-versatile` (gratuito com generoso rate limit)

### 3. Resend

1. Crie conta em [resend.com](https://resend.com)
2. Adicione e verifique seu domínio de envio
3. Gere uma API Key
4. Configure o `RESEND_FROM_EMAIL` com um email do seu domínio verificado

> ⚠️ **Importante**: No Supabase, desative o envio de email padrão e configure o Resend como provider SMTP, ou use a opção de email customizado via webhook. Alternativamente, configure o Supabase para usar seu domínio SMTP Resend em **Settings > Auth > SMTP**.

### 4. AbacatePay

1. Crie conta em [abacatepay.com](https://abacatepay.com)
2. Pegue a API Key do painel
3. Configure o webhook URL: `https://seu-dominio.com/api/payment/webhook`
4. Copie o Webhook Secret

### 5. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GROQ_API_KEY=gsk_...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@seudominio.com.br

ABACATEPAY_API_KEY=abacate_...
ABACATEPAY_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=https://seudominio.com.br

CREDITS_PACK_15_PRICE=2500
CREDITS_PACK_15_AMOUNT=15
```

### 6. Rodar local

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### 7. Deploy Vercel

```bash
# Instale a CLI
npm i -g vercel

# Deploy
vercel

# Configure as env vars no dashboard Vercel
# Settings > Environment Variables
```

Ou conecte o repositório GitHub diretamente no [vercel.com](https://vercel.com) para deploy automático.

**Região recomendada:** `gru1` (São Paulo) — já configurado no `vercel.json`.

---

## Fluxo do usuário

```
Landing page
    ↓
Login/Cadastro (Google OAuth ou e-mail + senha)
    ↓ [email de verificação via Resend]
Dashboard (1 crédito grátis disponível)
    ↓
Cola descrição da vaga → Cola currículo → Analisa (-1 crédito)
    ↓ [Groq AI: análise ATS + reescrita com técnicas de RH]
Página de Resultado
  • Score ATS animado
  • Keywords faltando / presentes
  • Pontos fortes e lacunas
  • Dicas de RH
  • Currículo otimizado
  • Baixar PDF profissional
    ↓ (sem créditos?)
Página de Planos → Comprar 15 créditos R$25
    ↓ [AbacatePay: PIX ou Cartão]
Webhook confirma → Créditos adicionados → Email de confirmação (Resend)
    ↓
Página de Sucesso
```

---

## Estrutura do projeto

```
cqp/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Estilos globais
│   ├── login/page.tsx            # Login + cadastro + Google OAuth
│   ├── dashboard/page.tsx        # Análise principal + histórico
│   ├── resultado/page.tsx        # Resultado completo + PDF
│   ├── planos/page.tsx           # Compra de créditos
│   ├── sucesso/page.tsx          # Confirmação de pagamento
│   ├── auth/callback/route.ts    # OAuth callback
│   └── api/
│       ├── analyze/route.ts      # POST /api/analyze
│       └── payment/
│           ├── create/route.ts   # POST /api/payment/create
│           └── webhook/route.ts  # POST /api/payment/webhook
├── components/
│   └── ScoreRing.tsx             # Anel de score animado
├── lib/
│   ├── supabase/                 # Client, server, middleware
│   ├── groq/ats-engine.ts        # IA + prompt de RH
│   ├── resend/emails.ts          # Templates de email
│   ├── abacatepay/service.ts     # Pagamento
│   └── pdf/generator.ts          # Export PDF client-side
├── types/index.ts
├── middleware.ts                  # Auth guard
├── supabase-schema.sql           # Schema completo do banco
├── vercel.json                   # Deploy config
└── .env.example
```

---

## Troubleshooting

**Login Google não funciona**
→ Configure Authorized Redirect URIs no Google Cloud: `https://xxxx.supabase.co/auth/v1/callback`

**Webhook não atualiza créditos**
→ Verifique se o `ABACATEPAY_WEBHOOK_SECRET` bate com o configurado no painel AbacatePay

**PDF não gera**
→ jsPDF roda client-side. Verifique se está importando dinamicamente (`await import(...)`)

**Groq timeout**
→ Aumente o `maxDuration` em `vercel.json` para rotas de API (Vercel Pro: até 300s)

---

## Licença

MIT — Desenvolvido para o mercado brasileiro 🇧🇷
