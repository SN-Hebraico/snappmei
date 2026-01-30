import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

function parseHash() {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const params = new URLSearchParams(hash);
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
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const hashData = useMemo(() => parseHash(), []);

  useEffect(() => {
    // Garante sessão a partir do hash (recovery link)
    (async () => {
      setError("");
      setStatus("");

      if (hashData.type !== "recovery") return;

      // Se já tiver sessão ok, não precisa setar
      const { data: s1 } = await supabase.auth.getSession();
      if (s1?.session) return;

      // Se tiver tokens no hash, seta sessão manualmente
      if (hashData.access_token && hashData.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: hashData.access_token,
          refresh_token: hashData.refresh_token,
        });

        if (error) {
          setError("Não foi possível validar o link de recuperação. Gere um novo link.");
        }
      } else {
        setError("Link de recuperação inválido ou incompleto. Gere um novo link.");
      }
    })();
  }, [hashData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (password.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      if (!s?.session) {
        setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }

      setStatus("Senha atualizada com sucesso! Redirecionando...");
      // limpa o hash e volta pro login
      window.location.hash = "";
      setTimeout(() => window.location.replace("/"), 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-blue-700">Nova senha</div>
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
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {status && <p className="text-sm text-green-700 text-center">{status}</p>}

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
