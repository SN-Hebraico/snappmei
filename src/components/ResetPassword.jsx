import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

function parseHash(hash) {
  // hash vem assim: #access_token=...&refresh_token=...&type=recovery...
  const h = (hash || "").replace(/^#/, "");
  const params = new URLSearchParams(h);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    type: params.get("type"),
  };
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const hashData = useMemo(() => {
    if (typeof window === "undefined") return {};
    return parseHash(window.location.hash);
  }, []);

  useEffect(() => {
    const boot = async () => {
      setError("");

      // 1) Se tiver tokens no hash, cria a sessão explicitamente
      if (hashData?.access_token && hashData?.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: hashData.access_token,
          refresh_token: hashData.refresh_token,
        });

        if (error) {
          setError("Não foi possível validar o link de recuperação. Gere um novo link.");
          setReady(true);
          return;
        }
      }

      // 2) Confere se tem sessão
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
      }

      setReady(true);
    };

    boot();
  }, [hashData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // precisa existir sessão válida aqui
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }

      // opcional: encerra sessão e volta pro login
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao salvar a nova senha.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-700">Nova senha</div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Nova senha</label>
            <input
              type="password"
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirmar nova senha</label>
            <input
              type="password"
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">© SN Contabilidade</p>
      </div>
    </div>
  );
}
