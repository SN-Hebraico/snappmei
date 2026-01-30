import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    // Quando abre pelo link, o supabase precisa enxergar a sessão
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      setHasSession(!!data?.session);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => sub.subscription.unsubscribe();
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
      setError("A confirmação de senha não confere.");
      return;
    }
    if (!hasSession) {
      setError("Sessão de autenticação ausente. Abra o link de reset novamente (sem copiar/colar) no mesmo navegador.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }

      setOk("Senha alterada com sucesso! Faça login com a nova senha.");
      // (opcional, mas recomendado) encerra sessão do recovery e volta pro login
      await supabase.auth.signOut();
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-700">SN Contabilidade</div>
          <p className="text-sm text-gray-500 mt-1">Definir nova senha</p>
        </div>

        {checking ? (
          <p className="text-center text-gray-600">Carregando...</p>
        ) : (
          <>
            {!hasSession && (
              <p className="text-sm text-red-600 text-center mb-4">
                Sessão de autenticação ausente. Abra o link do e-mail novamente.
              </p>
            )}

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
                <label className="text-sm text-gray-600">Confirmar senha</label>
                <input
                  type="password"
                  required
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              {ok && <p className="text-sm text-green-700 text-center">{ok}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
              >
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">© SN Contabilidade</p>
      </div>
    </div>
  );
}
