import { useState } from "react";
import { supabase } from "../supabase"; // se seu arquivo for src/supabase.js e exportar "supabase", ok

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        setError(error.message);
        return;
      }

      // Se deu certo, o App.jsx deve receber a session via onAuthStateChange
      // e renderizar <ProtectedApp />
    } catch (err) {
      console.error("LOGIN EXCEPTION:", err);
      setError("Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-700">SN Contabilidade</div>
          <p className="text-sm text-gray-500 mt-1">Acesso exclusivo do cliente</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">© SN Contabilidade</p>
      </div>
    </div>
  );
}
