"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import { AnalysisResult } from "@/types";
import toast from "react-hot-toast";

export default function ResultadoPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("cqp_result");
    if (!raw) { router.push("/dashboard"); return; }
    setResult(JSON.parse(raw));
  }, []);

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generateResumePDF } = await import("@/lib/pdf/generator");
      await generateResumePDF(result.improved_resume);
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF. Tente copiar o texto.");
    } finally {
      setPdfLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.improved_resume);
    setCopied(true);
    toast.success("Currículo copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-green-pale border-t-brand-green rounded-full animate-spin" />
      </div>
    );
  }

  const scoreColor =
    result.match_score >= 80 ? "#5CBF15" :
    result.match_score >= 60 ? "#3B82F6" :
    result.match_score >= 40 ? "#F59E0B" : "#EF4444";

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
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-green
                       font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova análise
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6 page-enter">

        {/* Score hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreRing score={result.match_score} label={result.score_label} size={180} />
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display font-extrabold text-3xl text-gray-900 mb-2">
                Score ATS: <span style={{ color: scoreColor }}>{result.match_score}/100</span>
              </h1>
              <p className="text-gray-500 leading-relaxed mb-5">
                Compatibilidade do seu currículo com a vaga analisada.
                {result.match_score < 60 && " Seu currículo otimizado abaixo irá melhorar significativamente essa pontuação."}
              </p>

              {/* Top Recommendation */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <div>
                  <p className="font-bold text-amber-800 text-sm mb-0.5">Recomendação principal</p>
                  <p className="text-amber-700 text-sm leading-relaxed">{result.top_recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">✅</span> Pontos fortes para esta vaga
            </h3>
            <ul className="space-y-2">
              {result.summary_strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-brand-green-pale text-green-800 flex-shrink-0
                                   flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">⚠️</span> Lacunas identificadas
            </h3>
            <ul className="space-y-2">
              {result.summary_gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex-shrink-0
                                   flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-display font-bold text-lg text-gray-900 mb-5">Análise de Palavras-chave</h3>
          <div className="space-y-5">
            {result.missing_keywords.length > 0 && (
              <div>
                <p className="text-sm font-bold text-red-600 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Ausentes no seu currículo ({result.missing_keywords.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw) => (
                    <span key={kw} className="badge bg-red-50 text-red-700 border border-red-200">
                      ✕ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.present_keywords.length > 0 && (
              <div>
                <p className="text-sm font-bold text-green-700 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-green" />
                  Já presentes ({result.present_keywords.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.present_keywords.map((kw) => (
                    <span key={kw} className="badge bg-brand-green-pale text-green-800 border border-brand-green-light">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ATS Tips */}
        {result.ats_tips?.length > 0 && (
          <div className="bg-gradient-to-br from-brand-green-pale to-white rounded-2xl border border-brand-green-light p-6">
            <h3 className="font-display font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Dicas de RH para ir ainda mais longe
            </h3>
            <div className="space-y-3">
              {result.ats_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-6 h-6 rounded-lg bg-brand-green text-white flex-shrink-0
                                  flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimized Resume */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900">Currículo Otimizado com IA</h3>
              <p className="text-xs text-gray-400 mt-0.5">Reescrito com técnicas de RH · Pronto para ATS</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700
                           text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? "✓ Copiado!" : "📋 Copiar"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 bg-brand-green hover:bg-green-600 text-white
                           text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {pdfLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                Baixar PDF
              </button>
            </div>
          </div>

          <div className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed
                            bg-gray-50 rounded-xl p-5 max-h-[500px] overflow-y-auto border border-gray-100">
              {result.improved_resume}
            </pre>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-brand-green text-white font-display font-bold
                       px-8 py-3 rounded-full hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
          >
            🎯 Analisar outra vaga
          </Link>
        </div>
      </main>
    </div>
  );
}
