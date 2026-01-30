// src/components/ResetPassword.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [sessionOk, setSessionOk] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const primary = "bg-[#1B2A41]";
  const bg = "bg-[#FEF8E5]";
  const accent = "text-[#d4af37]";

  const urlInfo = useMemo(() => {
    if (typeof window === "undefined") return { code: null, hash: "" };
    const params = new URLSearchParams(window.location.search || "");
    return {
      code: params.get("code"), // PKCE
      hash: window.location.hash || "",
    };
  }, []);

  const cleanUrl = () => {
    try {
      const clean = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, clean);
    } catch (_) {}
  };

  useEffect(() => {
    let alive = true;

    async function initRecoverySession() {
      setError("");
      setMsg("");

      try {
        // 1) tenta pegar session existente (se o Supabase já detectou a sessão via URL)
        const s1 = await supabase.auth.getSession();
        if (s1?.data?.session) {
          if (!alive) return;
          setSessionOk(true);
          setReady(true);
          return;
        }

        // 2) Se veio com ?code=... (PKCE), troca o code por session
        if (urlInfo.code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(urlInfo.code);
          if (exErr) {
            console.error("exchangeCodeForSession error:", exErr);
          }

          const s2 = await supabase.auth.getSession();
          if (!alive) return;

          if (s2?.data?.session) {
            setSessionOk(true);
            setReady(true);
            cleanUrl(); // remove ?code=...
            return;
          }
        }

        // 3) Fallback para links antigos: #access_token=...&refresh_token=...
        if (urlInfo.hash.includes("access_token=") && urlInfo.hash.includes("refresh_token=")) {
          const params = new URLSearchParams(urlInfo.hash.replace("#", ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (setErr) {
              console.error("setSession error:", setErr);
            }

            const s3 = await supabase.auth.getSession();
            if (!alive) return;

            if (s3?.data?.session) {
              setSessionOk(true);
              setReady(true);
              cleanUrl(); // remove tokens do hash
              return;
            }
          }
        }

        // Se chegou aqui, não conseguiu validar sessão
        if (!alive) return;
        setSessionOk(false);
        setReady(true);
      } catch (err) {
        console.error("initRecoverySession unexpected:", err);
        if (!alive) return;
        setSessionOk(false);
        setReady(true);
      }
    }

    initRecoverySession();

    return () => {
      alive = false;
    };
  }, [urlInfo.code, urlInfo.hash]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!sessionOk) {
      setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
      return;
    }

    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password });

      if (upErr) {
        console.error("updateUser error:", upErr);
        setError(upErr.message || "Não foi possível atualizar a senha.");
        return;
      }

      setMsg("Senha atualizada com sucesso! Faça login novamente.");

      // Por segurança, encerra a sessão de recovery e volta ao login
      await supabase.auth.signOut();
      cleanUrl();

      // opcional: limpar campos
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao salvar a nova senha.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg} p-4`}>
        <div className="bg-white rounded-2xl shadow p-6 text-slate-600">
          Carregando recuperação...
        </div>
      </div>
    );
  }

  if (!sessionOk) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg} p-4`}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div className="text-center mb-4">
            <div className={`mx-auto w-16 h-16 ${primary} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
              SN
            </div>
            <h1 className="mt-3 text-xl font-bold text-[#1B2A41]">SN Contabilidade</h1>
            <p className={`text-sm ${accent} font-semibold`}>Recuperação de senha</p>
          </div>

          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
            Sessão de autenticação ausente. Gere um novo link de recuperação.
          </div>

          <div className="text-xs text-slate-500 mt-4">
            Dica: clique novamente em “Esqueci minha senha” e use o link mais recente do e-mail.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${bg} p-4`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className={`mx-auto w-16 h-16 ${primary} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
            SN
          </div>
          <h1 className="mt-3 text-xl font-bold text-[#1B2A41]">SN Contabilidade</h1>
          <p className={`text-sm ${accent} font-semibold`}>Defina sua nova senha</p>
        </div>

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

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Nova senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
              placeholder="mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Confirmar nova senha</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
              placeholder="repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${primary} hover:opacity-95 text-white py-3 rounded-lg transition font-bold disabled:opacity-60`}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">© SN Contabilidade</p>
      </div>
    </div>
  );
}
