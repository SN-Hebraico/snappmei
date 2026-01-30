// src/components/Login.jsx
import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message || "Falha ao entrar. Verifique e-mail e senha.");
        return;
      }

      // Se logou, App.jsx detecta a session e troca pra <ProtectedApp />
      setMsg("Login realizado! Carregando...");
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/`; // App.jsx detecta recovery automaticamente
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo }
      );

      if (error) {
        setError(error.message || "Não foi possível enviar o e-mail.");
        return;
      }

      setMsg("E-mail de redefinição enviado. Verifique sua caixa de entrada e spam.");
      setShowForgot(false);
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao enviar redefinição.");
    } finally {
      setLoading(false);
    }
  };

  // Paleta SN (similar ao seu app)
  const bg = "bg-[#FEF8E5]";
  const primary = "bg-[#1B2A41]";
  const accent = "text-[#d4af37]";

  return (
    <div className={`min-h-screen flex items-center justify-center ${bg} p-4`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        {/* Logo / Marca */}
        <div className="text-center mb-6">
          <div className={`mx-auto w-20 h-20 ${primary} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow`}>
            SN
          </div>
          <h1 className="mt-3 text-2xl font-bold text-[#1B2A41]">SN Contabilidade</h1>
          <p className={`text-sm ${accent} font-semibold`}>Acesso do cliente</p>
        </div>

        {/* Mensagens */}
        {msg && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Form login */}
        {!showForgot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input
                type="email"
                required
                className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="ex: comercial@sncontabilidade.net"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <input
                type="password"
                required
                className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${primary} hover:opacity-95 text-white py-3 rounded-lg transition font-bold disabled:opacity-60`}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgot(true);
                setForgotEmail(email || "");
                setMsg("");
                setError("");
              }}
              className="w-full text-sm font-semibold text-[#1B2A41] hover:underline"
            >
              Esqueci minha senha
            </button>
          </form>
        ) : (
          // Form "Esqueci a senha"
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="text-sm text-slate-600">
              Informe seu e-mail para receber o link de redefinição.
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input
                type="email"
                required
                className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${primary} hover:opacity-95 text-white py-3 rounded-lg transition font-bold disabled:opacity-60`}
            >
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgot(false);
                setMsg("");
                setError("");
              }}
              className="w-full text-sm font-semibold text-slate-500 hover:underline"
            >
              Voltar para login
            </button>
          </form>
        )}

        <p className="text-xs text-slate-400 text-center mt-6">© SN Contabilidade</p>
      </div>
    </div>
  );
}
