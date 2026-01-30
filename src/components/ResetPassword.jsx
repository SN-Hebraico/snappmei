import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // IMPORTANTÍSSIMO: isso “captura” a sessão vinda do link do email (#access_token)
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("RESET getSession:", data, error);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("RESET onAuthStateChange session:", session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setError(
        "Sessão de autenticação ausente. Abra novamente o link do email (recovery) e confirme se o Redirect URL está correto no Supabase."
      );
      setLoading(false);
      return;
    }

    const { error: updError } = await supabase.auth.updateUser({ password });

    if (updError) {
      setError(updError.message);
      setLoading(false);
      return;
    }

    setOk(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-700">nova senha</div>
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
          {ok && <p className="text-sm text-green-700 text-center">Senha alterada com sucesso. Faça login.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // IMPORTANTÍSSIMO: isso “captura” a sessão vinda do link do email (#access_token)
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("RESET getSession:", data, error);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("RESET onAuthStateChange session:", session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setError(
        "Sessão de autenticação ausente. Abra novamente o link do email (recovery) e confirme se o Redirect URL está correto no Supabase."
      );
      setLoading(false);
      return;
    }

    const { error: updError } = await supabase.auth.updateUser({ password });

    if (updError) {
      setError(updError.message);
      setLoading(false);
      return;
    }

    setOk(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-700">nova senha</div>
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
          {ok && <p className="text-sm text-green-700 text-center">Senha alterada com sucesso. Faça login.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
