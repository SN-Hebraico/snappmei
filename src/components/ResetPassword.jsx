import { useState } from "react";
import { supabase } from "../supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    setMsg("Senha definida com sucesso! Você já pode fazer login.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 text-center">
          Definir nova senha
        </h1>

        <form onSubmit={handleSetPassword} className="space-y-4 mt-6">
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

          {msg && <p className="text-sm text-center text-red-600">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
          >
            {loading ? "Salvando..." : "Salvar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
