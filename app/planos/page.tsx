"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";

export default function PlanosPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setCredits(data?.credits ?? 0));
      }
    });
  }, []);

  async function handleBuy() {
    if (!user) { router.push("/login?redirect=/planos"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao criar cobrança");
      window.location.href = json.checkout_url;
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">CQ</span>
            </div>
            <span className="font-display font-bold text-gray-900">Currículo que Passa</span>
          </Link>
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Seus créditos:{" "}
              <span className="font-bold text-brand-green">{credits}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 page-enter">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange
                          font-bold text-sm px-4 py-2 rounded-full mb-6">
            🎯 Sem assinatura · Pague só o que usar
          </div>
          <h1 className="font-display font-extrabold text-4xl text-gray-900 mb-4">
            Compre créditos e continue analisando
          </h1>
          <p className="text-gray-500 text-lg">
            Sem mensalidade. Sem contrato. Um crédito = uma análise completa com PDF otimizado.
          </p>
        </div>

        {/* Single pack */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-brand-green overflow-hidden
                          relative">
            {/* Popular badge */}
            <div className="absolute top-0 left-0 right-0 bg-brand-green text-white text-center
                            text-sm font-bold py-2">
              ✨ Único pacote disponível · Melhor custo-benefício
            </div>

            <div className="pt-14 pb-8 px-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="font-display font-extrabold text-2xl text-gray-900 mb-2">
                Pacote 15 Créditos
              </h2>
              <div className="my-5">
                <div className="font-display font-extrabold text-5xl text-brand-green">
                  R$ 25
                  <span className="text-2xl font-bold text-gray-400">,00</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">= R$ 1,67 por análise</p>
              </div>

              {/* Features */}
              <ul className="text-left space-y-3 mb-8">
                {[
                  "15 análises completas de currículo",
                  "Score ATS com breakdown detalhado",
                  "Keywords faltando e presentes",
                  "Currículo reescrito com técnicas de RH",
                  "Export em PDF profissional",
                  "Dicas exclusivas de recrutadores",
                  "Créditos não expiram",
                  "PIX instantâneo ou Cartão de crédito",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-brand-green-pale flex-shrink-0
                                    flex items-center justify-center">
                      <svg className="w-3 h-3 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleBuy}
                disabled={loading}
                className="w-full bg-brand-green text-white font-display font-extrabold text-lg
                           py-4 rounded-2xl hover:bg-green-600 transition-all duration-200
                           shadow-lg shadow-green-200 hover:shadow-xl disabled:opacity-50
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Comprar agora
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagamento 100% seguro via AbacatePay
              </div>
            </div>
          </div>
        </div>

        {/* Free tier reminder */}
        <div className="mt-10 text-center bg-brand-green-pale rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-green-800 font-bold mb-1">🎁 Ainda não criou sua conta?</p>
          <p className="text-green-700 text-sm">
            Novos usuários recebem <strong>1 crédito grátis</strong> ao criar conta — sem cartão de crédito.
          </p>
          {!user && (
            <Link
              href="/login"
              className="inline-block mt-4 bg-brand-green text-white font-bold text-sm
                         px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
            >
              Criar conta grátis
            </Link>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4 max-w-2xl mx-auto">
          <h3 className="font-display font-bold text-xl text-gray-900 text-center mb-6">Perguntas frequentes</h3>
          {[
            {
              q: "Os créditos expiram?",
              a: "Não! Seus créditos ficam na conta até você usar. Sem prazo de validade.",
            },
            {
              q: "Posso pagar via PIX?",
              a: "Sim! Aceitamos PIX instantâneo e cartão de crédito, processado com segurança pelo AbacatePay.",
            },
            {
              q: "Quantas análises posso fazer por crédito?",
              a: "Cada crédito equivale a uma análise completa: Score ATS, keywords, currículo otimizado e export PDF.",
            },
            {
              q: "O currículo otimizado inventa informações?",
              a: "Não. A IA reescreve e reorganiza apenas as informações do seu currículo original, usando técnicas de RH para destacar o que você já tem.",
            },
          ].map((faq) => (
            <div key={faq.q} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="font-bold text-gray-900 text-sm mb-2">{faq.q}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
