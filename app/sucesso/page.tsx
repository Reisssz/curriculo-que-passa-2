"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SucessoPage() {
  const supabase = createClient();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // Reload credits from DB after webhook should have fired
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Poll up to 5s for credits to update
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const { data } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();
        if (data?.credits) { setCredits(data.credits); break; }
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center page-enter">
        {/* Animated checkmark */}
        <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6
                        shadow-xl shadow-green-200 animate-pulse-green">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-3">
          Pagamento confirmado! 🎉
        </h1>
        <p className="text-gray-500 leading-relaxed mb-6">
          Seus créditos foram adicionados à sua conta.
          {credits !== null && (
            <span className="block mt-2 font-bold text-brand-green text-lg">
              Você agora tem {credits} crédito{credits !== 1 ? "s" : ""}
            </span>
          )}
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-4">O que fazer agora?</h2>
          <div className="space-y-3 text-left">
            {[
              { icon: "📋", text: "Cole a descrição de uma vaga que você quer" },
              { icon: "📄", text: "Insira seu currículo atual" },
              { icon: "🎯", text: "Receba o Score ATS e o currículo otimizado em segundos" },
              { icon: "📥", text: "Baixe o PDF profissional e candidate-se!" },
            ].map((s) => (
              <div key={s.text} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                {s.text}
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-brand-green text-white font-display font-bold
                     px-8 py-4 rounded-full shadow-lg shadow-green-200 hover:bg-green-600 transition-colors"
        >
          Fazer minha análise agora
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
