// src/components/ResetPassword.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [checking, setChecking] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    // Espera o Supabase "consumir" o hash do link (#access_token=...)
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setError("Sessão de autenticação ausente. Gere um novo link de recuperação.");
      }
      setChecking(false);
    }, 300);

    return () => clearTimeout(t);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
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

      setOk("Senha atualizada com sucesso! Você já pode entrar.");
      // opcional: jogar pro login
      window.location.href = "/";
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
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={checking || loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirmar nova senha</label>
            <input
              type="password"
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={checking || loading}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {ok && <p className="text-sm text-green-700 text-center">{ok}</p>}

          <button
            type="submit"
            disabled={checking || loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">© SN Contabilidade</p>
      </div>
    </div>
  );
}
