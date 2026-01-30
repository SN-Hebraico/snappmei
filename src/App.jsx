// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase, isUserAdmin } from "./supabase";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import ResetPassword from "./components/ResetPassword";

function isRecoveryFlow() {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash || "";
  const search = window.location.search || "";

  const byHash = hash.includes("type=recovery") || hash.includes("access_token=");
  const params = new URLSearchParams(search);
  const byQueryType = params.get("type") === "recovery";
  const byCode = params.get("code"); // PKCE

  return Boolean(byHash || byQueryType || byCode);
}

function isAdminRoute() {
  if (typeof window === "undefined") return false;
  return window.location.pathname?.startsWith("/admin");
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-2xl font-bold text-red-600">Acesso negado</div>
        <p className="text-sm text-gray-600 mt-3">
          Esta área é exclusiva para administradores.
        </p>

        <button
          className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Voltar para o início
        </button>

        <button
          className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const recovery = isRecoveryFlow();
  const adminRoute = useMemo(() => isAdminRoute(), []);

  useEffect(() => {
    let alive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data?.session ?? null);
        setLoadingSession(false);
      })
      .catch((err) => {
        console.error("getSession error:", err);
        if (!alive) return;
        setSession(null);
        setLoadingSession(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // Checa Admin sempre que logar/trocar sessão
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }

      setLoadingAdmin(true);
      const ok = await isUserAdmin(session.user.id);
      if (!alive) return;

      setIsAdmin(ok);
      setLoadingAdmin(false);
    }

    run().catch((e) => {
      console.error("admin check crash:", e);
      setIsAdmin(false);
      setLoadingAdmin(false);
    });

    return () => {
      alive = false;
    };
  }, [session?.user?.id]);

  if (recovery) return <ResetPassword />;

  if (loadingSession) return null;

  // Sem sessão => login
  if (!session) return <Login />;

  // Se está em /admin, só admin entra
  if (adminRoute) {
    if (loadingAdmin) return null; // pode trocar por um loader bonito depois
    if (!isAdmin) return <AccessDenied />;
  }

  // Área padrão (cliente / app normal)
  return <ProtectedApp isAdmin={isAdmin} />;
}
