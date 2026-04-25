"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      setCredits(profile?.credits ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleAnalyze() {
    if (credits <= 0) {
      toast.error("Sem créditos! Compre um pacote para continuar.");
      router.push("/planos");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, resume }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error("Créditos insuficientes!");
          router.push("/planos");
          return;
        }
        throw new Error(json.error || "Erro na análise");
      }

      // Save result to sessionStorage for result page
      sessionStorage.setItem("cqp_result", JSON.stringify(json.data));
      setCredits(c => c - 1);
      toast.success("Análise concluída!");
      router.push("/resultado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao analisar. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-green-pale border-t-brand-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">CQ</span>
            </div>
            <span className="font-display font-bold text-gray-900 hidden sm:block">Currículo que Passa</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Credits badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold
              ${credits > 0 ? "bg-brand-green-pale text-green-800" : "bg-red-50 text-red-700"}`}>
              <span className="text-base">{credits > 0 ? "🎯" : "⚠️"}</span>
              {credits} crédito{credits !== 1 ? "s" : ""}
            </div>

            {credits === 0 && (
              <Link
                href="/planos"
                className="bg-brand-orange text-white text-sm font-bold px-4 py-1.5 rounded-full
                           hover:bg-orange-500 transition-colors"
              >
                Comprar créditos
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 page-enter">
        {/* No credits banner */}
        {credits === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-orange-800 text-sm">Você ficou sem créditos</p>
              <p className="text-orange-600 text-xs mt-0.5">
                Compre 15 créditos por apenas R$ 25,00 e continue analisando.
              </p>
            </div>
            <Link
              href="/planos"
              className="bg-brand-orange text-white font-bold text-sm px-4 py-2 rounded-xl
                         hover:bg-orange-500 transition-colors whitespace-nowrap"
            >
              Comprar agora
            </Link>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= s ? "bg-brand-green text-white" : "bg-gray-200 text-gray-400"}`}>
                {step > s ? "✓" : s}
              </div>
              <span className={`text-sm ${step >= s ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                {s === 1 ? "Descrição da vaga" : "Seu currículo"}
              </span>
              {s < 2 && <div className="w-8 h-0.5 bg-gray-200 ml-1" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="page-enter">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                Cole a descrição da vaga
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Copie todo o texto da vaga que você quer se candidatar — quanto mais detalhado, melhor a análise.
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Ex: Buscamos um Desenvolvedor React Sênior com 3+ anos de experiência em React, TypeScript, Node.js..."
                rows={10}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm resize-none
                           transition-all duration-200 font-body leading-relaxed"
              />
              <div className="flex items-center justify-between mt-4">
                <span className={`text-xs ${jobDescription.length < 100 ? "text-red-400" : "text-gray-400"}`}>
                  {jobDescription.length} chars {jobDescription.length < 100 ? "(mínimo 100)" : "✓"}
                </span>
                <button
                  onClick={() => setStep(2)}
                  disabled={jobDescription.trim().length < 100}
                  className="bg-brand-green text-white font-display font-bold px-6 py-2.5 rounded-xl
                             hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                             flex items-center gap-2"
                >
                  Continuar
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="page-enter">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>

              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                Cole seu currículo atual
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Cole o texto do seu currículo. Pode ser em qualquer formato — a IA vai analisar e reescrever com técnicas de RH.
              </p>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Nome: João Silva&#10;Email: joao@email.com&#10;&#10;EXPERIÊNCIA PROFISSIONAL&#10;Desenvolvedor Front-end | Empresa XYZ | 2022-2024&#10;- Desenvolveu interfaces em React..."
                rows={14}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm resize-none
                           transition-all duration-200 font-body leading-relaxed"
              />

              <div className="flex items-center justify-between mt-4">
                <span className={`text-xs ${resume.length < 100 ? "text-red-400" : "text-gray-400"}`}>
                  {resume.length} chars {resume.length < 100 ? "(mínimo 100)" : "✓"}
                </span>

                <button
                  onClick={handleAnalyze}
                  disabled={resume.trim().length < 100 || analyzing || credits <= 0}
                  className="bg-brand-green text-white font-display font-bold px-6 py-2.5 rounded-xl
                             hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                             flex items-center gap-2 min-w-[180px] justify-center"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Analisando<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                    </>
                  ) : (
                    <>
                      🎯 Analisar currículo
                      <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">-1 crédito</span>
                    </>
                  )}
                </button>
              </div>

              {analyzing && (
                <div className="mt-6 bg-brand-green-pale rounded-xl p-4 text-sm text-green-800">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <div className="w-4 h-4 border-2 border-green-400 border-t-green-700 rounded-full animate-spin" />
                    Analisando com IA...
                  </div>
                  <p className="text-green-700 text-xs">
                    Comparando keywords, calculando Score ATS e reescrevendo seu currículo com técnicas de RH. Aguarde 15-30 segundos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent analyses */}
        <HistorySection userId={user?.id} />
      </main>
    </div>
  );
}

function HistorySection({ userId }: { userId: string }) {
  const supabase = createClient();
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("analyses")
      .select("id, match_score, score_label, job_title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setAnalyses(data || []));
  }, [userId]);

  if (!analyses.length) return null;

  const scoreColor = (s: string) =>
    s === "Excelente" ? "text-green-700 bg-green-50" :
    s === "Bom" ? "text-blue-700 bg-blue-50" :
    s === "Regular" ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50";

  return (
    <div className="mt-8">
      <h3 className="font-display font-bold text-lg text-gray-900 mb-4">Análises recentes</h3>
      <div className="space-y-2">
        {analyses.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 px-5 py-3
                                     flex items-center justify-between shadow-sm">
            <div>
              <p className="font-medium text-sm text-gray-800 truncate max-w-xs">{a.job_title || "Análise"}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(a.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "short", year: "numeric"
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display font-extrabold text-2xl text-brand-green">
                {a.match_score}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${scoreColor(a.score_label)}`}>
                {a.score_label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
