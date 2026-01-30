import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [sessionOk, setSessionOk] = useState(false);

  useEffect(() => {
    const init = async () => {
      setMsg("");

      // 1) tenta pegar sessão do storage
      const { data: s1 } = await supabase.auth.getSession();
      if (s1?.session) {
        setSessionOk(true);
        return;
      }

      // 2) se não tiver, tenta importar do HASH do link (#access_token=...&refresh_token=...&type=recovery)
      const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);

      const type = params.get("type");
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (type === "recovery" && access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          setSessionOk(false);
          setMsg("Não foi possível validar o link de recuperação. Gere um novo link.");
          return;
        }

        // limpa o hash por segurança/estética
        window.history.replaceState({}, document.title, window.location.pathname);

        setSessionOk(true);
        return;
      }

      setSessionOk(false);
      setMsg("Sessão de autenticação ausente. Gere um novo link de recuperação.");
    };

    init();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!sessionOk) {
      setMsg("Sessão de autenticação ausente. Gere um novo link de recuperação.");
      return;
    }

    if (password.length < 6) {
      setMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setMsg("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMsg(error.message);
        return;
      }

      setMsg("Senha atualizada com sucesso! Você já pode entrar.");
      // opcional: deslogar depois de resetar
      await supabase.auth.signOut();
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
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirmar nova senha</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
          </div>

          {msg && <p className="text-sm text-red-600 text-center">{msg}</p>}

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
