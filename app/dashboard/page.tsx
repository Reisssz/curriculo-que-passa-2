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
      <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#D4EDDA] border-t-[#2D6A4F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium tracking-wide">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F5]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        .page-enter { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .textarea-focus:focus {
          outline: none;
          border-color: #2D6A4F;
          box-shadow: 0 0 0 4px rgba(45,106,79,0.08);
        }

        .btn-primary {
          background: #2D6A4F;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          border-radius: 14px;
          padding: 12px 24px;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 2px 12px rgba(45,106,79,0.18);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1f4f3a;
          box-shadow: 0 4px 20px rgba(45,106,79,0.28);
          transform: translateY(-1px);
        }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-ghost {
          color: #888;
          font-size: 14px;
          display: inline-flex; align-items: center; gap: 6px;
          transition: color 0.15s;
          background: none; border: none; cursor: pointer;
        }
        .btn-ghost:hover { color: #333; }

        .credit-chip-ok {
          background: #D4EDDA; color: #1B5E35;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px;
          padding: 6px 14px; border-radius: 100px;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .credit-chip-empty {
          background: #FEE4D4; color: #B34800;
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px;
          padding: 6px 14px; border-radius: 100px;
          display: inline-flex; align-items: center; gap: 6px;
        }

        .card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04);
        }

        .step-dot-active { background: #2D6A4F; color: #fff; }
        .step-dot-done   { background: #2D6A4F; color: #fff; }
        .step-dot-idle   { background: #E8EAE6; color: #aaa; }

        .loading-dots span { animation: blink 1.4s infinite; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }

        .buy-btn {
          background: #F47C3C;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 13px;
          padding: 8px 18px;
          border-radius: 100px;
          transition: background 0.15s, transform 0.12s;
          white-space: nowrap;
        }
        .buy-btn:hover { background: #d96828; transform: translateY(-1px); }

        .score-badge {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 22px;
          color: #2D6A4F;
        }

        /* Mobile refinements */
        @media (max-width: 640px) {
          .card { padding: 20px !important; border-radius: 16px !important; }
          .main-title { font-size: 20px !important; }
          .sub-title  { font-size: 13px !important; }
          .score-badge { font-size: 18px; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          padding: "0 20px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span className="font-display" style={{
              fontWeight: 700, fontSize: 15, color: "#1a1a1a",
              display: "none",
            }} id="logo-text">Currículo que Passa</span>
          </Link>

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={credits > 0 ? "credit-chip-ok" : "credit-chip-empty"}>
              {credits > 0 ? "🎯" : "⚠️"}
              <span>{credits} crédito{credits !== 1 ? "s" : ""}</span>
            </span>

            {credits === 0 && (
              <Link href="/planos" className="buy-btn" style={{ textDecoration: "none" }}>
                Comprar
              </Link>
            )}

            <button onClick={handleLogout} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#bbb", fontSize: 13, fontWeight: 500,
              transition: "color 0.15s", padding: "4px 2px",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#555")}
              onMouseLeave={e => (e.currentTarget.style.color = "#bbb")}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Make logo text visible on sm+ */}
        <style>{`@media(min-width:480px){#logo-text{display:block!important}}`}</style>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 60px" }} className="page-enter">

        {/* No-credits banner */}
        {credits === 0 && (
          <div style={{
            background: "linear-gradient(100deg,#FFF3EB,#FEE4D4)",
            border: "1px solid #F9C49A",
            borderRadius: 16, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-display" style={{ fontWeight: 700, color: "#8C3A00", fontSize: 14, margin: 0 }}>
                Você ficou sem créditos
              </p>
              <p style={{ color: "#B35A1A", fontSize: 12, margin: "2px 0 0" }}>
                15 créditos por R$ 25,00 — continue analisando agora.
              </p>
            </div>
            <Link href="/planos" className="buy-btn" style={{ textDecoration: "none", flexShrink: 0 }}>
              Comprar
            </Link>
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
          {[1, 2].map((s) => {
            const isActive = step === s;
            const isDone = step > s;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className={isDone ? "step-dot-done" : isActive ? "step-dot-active" : "step-dot-idle"}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontFamily: "Sora,sans-serif", fontWeight: 700,
                      flexShrink: 0,
                      transition: "background 0.25s",
                    }}>
                    {isDone ? "✓" : s}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: isActive || isDone ? 600 : 400,
                    color: isActive || isDone ? "#1a1a1a" : "#bbb",
                    fontFamily: "Sora,sans-serif",
                    whiteSpace: "nowrap",
                  }}>
                    {s === 1 ? "Descrição da vaga" : "Seu currículo"}
                  </span>
                </div>
                {s < 2 && (
                  <div style={{
                    width: 32, height: 2,
                    background: step > 1 ? "#2D6A4F" : "#E8EAE6",
                    margin: "0 10px",
                    borderRadius: 2,
                    transition: "background 0.3s",
                    flexShrink: 0,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="card page-enter" style={{ padding: 32 }}>
            {/* Icon + heading */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#EAF4EE", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>📋</div>
              <div>
                <h2 className="font-display main-title" style={{ fontWeight: 800, fontSize: 22, color: "#111", margin: 0, lineHeight: 1.2 }}>
                  Cole a descrição da vaga
                </h2>
                <p className="sub-title" style={{ color: "#888", fontSize: 14, margin: "6px 0 0", lineHeight: 1.5 }}>
                  Copie todo o texto da vaga — quanto mais detalhado, melhor a análise.
                </p>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Ex: Buscamos um Desenvolvedor React Sênior com 3+ anos de experiência em React, TypeScript, Node.js..."
              rows={10}
              className="textarea-focus"
              style={{
                width: "100%", boxSizing: "border-box",
                border: "2px solid #E8EAE6",
                borderRadius: 14, padding: "14px 16px",
                fontSize: 14, lineHeight: 1.65,
                resize: "vertical", color: "#333",
                background: "#FAFAF9",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: Math.min(100, Math.round((jobDescription.length / 100) * 100)),
                  height: 4, borderRadius: 2,
                  background: jobDescription.length >= 100 ? "#2D6A4F" : "#F47C3C",
                  transition: "width 0.2s, background 0.2s",
                  minWidth: 4,
                  maxWidth: 80,
                }} />
                <span style={{
                  fontSize: 12,
                  color: jobDescription.length < 100 ? "#F47C3C" : "#2D6A4F",
                  fontWeight: 600,
                }}>
                  {jobDescription.length < 100
                    ? `${jobDescription.length}/100 mínimo`
                    : `${jobDescription.length} caracteres ✓`}
                </span>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={jobDescription.trim().length < 100}
                className="btn-primary"
              >
                Continuar
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="card page-enter" style={{ padding: 32 }}>
            <button onClick={() => setStep(1)} className="btn-ghost" style={{ marginBottom: 20 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#EAF4EE", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>📄</div>
              <div>
                <h2 className="font-display main-title" style={{ fontWeight: 800, fontSize: 22, color: "#111", margin: 0, lineHeight: 1.2 }}>
                  Cole seu currículo
                </h2>
                <p className="sub-title" style={{ color: "#888", fontSize: 14, margin: "6px 0 0", lineHeight: 1.5 }}>
                  A IA vai comparar com a vaga, calcular seu Score ATS e reescrever com técnicas de RH.
                </p>
              </div>
            </div>

            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder={"Nome: João Silva\nEmail: joao@email.com\n\nEXPERIÊNCIA PROFISSIONAL\nDesenvolvedor Front-end | Empresa XYZ | 2022–2024\n- Desenvolveu interfaces em React..."}
              rows={13}
              className="textarea-focus"
              style={{
                width: "100%", boxSizing: "border-box",
                border: "2px solid #E8EAE6",
                borderRadius: 14, padding: "14px 16px",
                fontSize: 14, lineHeight: 1.65,
                resize: "vertical", color: "#333",
                background: "#FAFAF9",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: Math.min(80, Math.round((resume.length / 100) * 80)),
                  height: 4, borderRadius: 2,
                  background: resume.length >= 100 ? "#2D6A4F" : "#F47C3C",
                  transition: "width 0.2s, background 0.2s",
                  minWidth: 4,
                }} />
                <span style={{
                  fontSize: 12,
                  color: resume.length < 100 ? "#F47C3C" : "#2D6A4F",
                  fontWeight: 600,
                }}>
                  {resume.length < 100
                    ? `${resume.length}/100 mínimo`
                    : `${resume.length} caracteres ✓`}
                </span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={resume.trim().length < 100 || analyzing || credits <= 0}
                className="btn-primary"
                style={{ minWidth: 190, justifyContent: "center" }}
              >
                {analyzing ? (
                  <>
                    <div style={{
                      width: 15, height: 15,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Analisando
                    <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                  </>
                ) : (
                  <>
                    🎯 Analisar currículo
                    <span style={{
                      background: "rgba(255,255,255,0.18)",
                      fontSize: 11, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 100,
                    }}>
                      −1 crédito
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Analyzing status card */}
            {analyzing && (
              <div style={{
                marginTop: 18,
                background: "linear-gradient(100deg,#EAF4EE,#D4EDDA)",
                border: "1px solid #A8D8BC",
                borderRadius: 14, padding: "14px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 14, height: 14,
                    border: "2px solid #52b788",
                    borderTopColor: "#1B5E35",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  <span className="font-display" style={{ fontWeight: 700, color: "#1B5E35", fontSize: 13 }}>
                    Analisando com IA...
                  </span>
                </div>
                <p style={{ color: "#2D6A4F", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  Comparando keywords, calculando Score ATS e reescrevendo seu currículo. Aguarde 15–30 segundos.
                </p>
              </div>
            )}

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ── History ── */}
        <HistorySection userId={user?.id} />
      </main>
    </div>
  );
}

/* ── History Section ── */
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

  type LabelKey = "Excelente" | "Bom" | "Regular";
  const labelStyle: Record<LabelKey, React.CSSProperties> = {
    Excelente: { color: "#1B5E35", background: "#D4EDDA" },
    Bom:       { color: "#1A4A8A", background: "#DCEEFF" },
    Regular:   { color: "#7A5700", background: "#FFF3CD" },
  };
  const defaultLabel: React.CSSProperties = { color: "#8B1A1A", background: "#FDDEDE" };

  return (
    <div style={{ marginTop: 32 }}>
      <h3 className="font-display" style={{ fontWeight: 700, fontSize: 16, color: "#222", marginBottom: 14 }}>
        Análises recentes
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {analyses.map((a) => (
          <div key={a.id} style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 14,
            padding: "12px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 3px 16px rgba(0,0,0,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)")}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontWeight: 600, fontSize: 14, color: "#222",
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {a.job_title || "Análise"}
              </p>
              <p style={{ fontSize: 12, color: "#aaa", margin: "3px 0 0" }}>
                {new Date(a.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span className="score-badge">{a.match_score}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: "3px 10px", borderRadius: 100,
                fontFamily: "Sora,sans-serif",
                ...(labelStyle[a.score_label as LabelKey] ?? defaultLabel),
              }}>
                {a.score_label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}