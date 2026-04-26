"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase injeta a sessão automaticamente via URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Erro ao redefinir senha. O link pode ter expirado.");
    } else {
      toast.success("Senha redefinida com sucesso!");
      router.push("/dashboard");
    }
    setLoading(false);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-10 h-10 border-4 border-brand-green-pale border-t-brand-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Validando link...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="font-display font-bold text-2xl text-gray-900">Nova senha</h1>
          <p className="text-gray-500 text-sm mt-2">Digite sua nova senha abaixo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
              ) : "Redefinir senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}