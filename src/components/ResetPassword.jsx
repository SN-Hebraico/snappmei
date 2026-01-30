import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    let alive = true;

    // dá tempo do Supabase processar o #access_token
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      if (!data.session) {
        setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
      }
      setReady(true);
    }, 200);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }

      setOk("Senha atualizada com sucesso! Você já pode fazer login.");
      // opcional: limpar hash da url
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

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
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!ready || loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirmar nova senha</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!ready || loading}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {ok && <p className="text-sm text-green-700 text-center">{ok}</p>}

          <button
            type="submit"
            disabled={!ready || loading}
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
