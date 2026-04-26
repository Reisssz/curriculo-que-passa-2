"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error("Digite seu e-mail primeiro."); return; }
    setLoading(true);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    // Sempre mostra sucesso por segurança (não revela se email existe ou não)
    // mas a mensagem deixa claro o que acontece se existir
    setResetSent(true);
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
    if (error) {
      toast.error("Erro ao entrar com Google. Tente novamente.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (mode === "signup") {
      // Tenta login primeiro para verificar se email já existe
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: "check-only-fake-password-123",
      });

      // Se o erro for de credenciais inválidas (não "invalid email"), o email existe
      if (loginError?.message.includes("Invalid login credentials")) {
        toast.error("Este e-mail já possui uma conta. Faça login.");
        setMode("login");
        setLoading(false);
        return;
      }

      // Email não existe, pode criar
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });

      if (error) {
        toast.error("Erro ao criar conta. Tente novamente.");
      } else {
        setEmailSent(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(
          error.message.includes("Invalid login")
            ? "E-mail ou senha incorretos."
            : "Erro ao fazer login. Tente novamente."
        );
      } else {
        toast.success("Login realizado!");
        router.push(redirectTo);
        router.refresh();
      }
    }
    setLoading(false);
  }
  if (resetMode) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4">
        <div className="w-full max-w-md page-enter">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center">
                <span className="text-white font-display font-bold">CQ</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-900">Currículo que Passa</span>
            </Link>
            <h1 className="font-display font-bold text-2xl text-gray-900">Redefinir senha</h1>
            <p className="text-gray-500 text-sm mt-2">Digite seu e-mail para receber o link</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                            transition-all duration-200 focus:border-brand-green"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green text-white font-display font-bold py-3.5 rounded-xl
                          hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center
                          justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : "Enviar link de redefinição"}
              </button>
            </form>
            <button
              onClick={() => setResetMode(false)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              ← Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (emailSent) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center page-enter">
          <div className="w-16 h-16 bg-brand-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">Confirme seu e-mail</h2>
          <p className="text-gray-500 leading-relaxed">
            Enviamos um link de confirmação para{" "}
            <strong className="text-gray-700">{email}</strong>.
            <br />Clique no link para ativar sua conta e receber seu <strong className="text-brand-green">crédito grátis</strong>.
          </p>
          <p className="text-sm text-gray-400 mt-4">Não recebeu? Verifique o spam.</p>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-6 text-sm text-brand-green font-medium hover:underline"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }
  if (resetSent) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center page-enter">
          <div className="w-16 h-16 bg-brand-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">
            Verifique seu e-mail
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Se existe uma conta cadastrada com{" "}
            <strong className="text-gray-700">{email}</strong>,
            você receberá um link para redefinir sua senha nos próximos minutos.
          </p>
          <div className="mt-5 bg-brand-green-pale rounded-xl p-4 text-sm text-green-800 text-left space-y-1">
            <p>✅ Verifique sua caixa de entrada</p>
            <p>✅ Verifique a pasta de spam</p>
            <p>✅ O link expira em 1 hora</p>
          </div>
          <button
            onClick={() => { setResetSent(false); setResetMode(false); }}
            className="mt-6 text-sm text-brand-green font-medium hover:underline"
          >
            ← Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-md page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center">
              <span className="text-white font-display font-bold">CQ</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900">Currículo que Passa</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            {mode === "login" ? "Bem-vindo de volta!" : "Crie sua conta grátis"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {mode === "login"
              ? "Entre para continuar suas análises"
              : "1 crédito grátis ao criar sua conta"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-4 font-display font-bold text-sm transition-colors ${
                  mode === m
                    ? "text-brand-green border-b-2 border-brand-green bg-brand-green-pale/30"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200
                         rounded-xl py-3 font-medium text-gray-700 hover:border-brand-green
                         hover:bg-brand-green-pale/20 transition-all duration-200 mb-6 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-green rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continuar com Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">ou continue com e-mail</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                             transition-all duration-200 focus:border-brand-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                             transition-all duration-200 focus:border-brand-green"
                />
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-2 bg-brand-green-pale rounded-xl p-3">
                  <span className="text-lg">🎁</span>
                  <p className="text-xs text-green-800">
                    Ao criar conta, você recebe <strong>1 crédito grátis</strong>.
                    Verifique seu e-mail para ativar a conta.
                  </p>
                </div>
              )}

              {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-xs text-brand-green hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green text-white font-display font-bold py-3.5 rounded-xl
                           hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center
                           justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Ao continuar, você concorda com nossos{" "}
          <Link href="#" className="text-brand-green hover:underline">Termos de Uso</Link>
          {" "}e{" "}
          <Link href="#" className="text-brand-green hover:underline">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}
