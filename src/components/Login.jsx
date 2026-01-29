import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN DATA:", data);
    console.log("LOGIN ERROR:", error);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    // Se o App.jsx estiver ouvindo sessão (onAuthStateChange),
    // ele vai trocar automaticamente para o app após logar.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF8E5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        {/* LOGO */}
        <div className="text-center mb-6">
          <div className="text-3xl font-extrabold text-[#1B2A41]">
            SN Contabilidade
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Acesso exclusivo do cliente
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">E-mail</label>
            <input
              type="email"
              required
              className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@dominio.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">Senha</label>
            <input
              type="password"
              required
              className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A41]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center font-semibold">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B2A41] hover:opacity-90 text-white py-3 rounded-lg transition font-bold"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          © SN Contabilidade
        </p>
      </div>
    </div>
  );
}
