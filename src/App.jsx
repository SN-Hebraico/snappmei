import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import ResetPassword from "./components/ResetPassword";

function getRouteFromHash() {
  if (typeof window === "undefined") return "app";
  const h = window.location.hash || "";

  // o hash do recovery vem cheio (access_token, type=recovery, etc.)
  if (h.includes("type=recovery")) return "recovery";

  // rota simples por hash para evitar config extra no Vercel
  if (h.startsWith("#/admin")) return "admin";

  return "app";
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [route, setRoute] = useState(getRouteFromHash());
  const isRecovery = route === "recovery";

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    // ouvir mudanças de hash (#/admin, etc.)
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      // evento oficial do Supabase para recovery
      if (event === "PASSWORD_RECOVERY") {
        setRoute("recovery");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // checar se o usuário logado é admin (via tabela public.admins com RLS)
  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      try {
        const { data, error } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // se der erro aqui, normalmente é RLS/policy mal aplicada
          console.error("Erro ao checar admin:", error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(!!data?.user_id);
      } finally {
        if (!cancelled) setCheckingAdmin(false);
      }
    }

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const isAdminRoute = useMemo(() => route === "admin", [route]);

  if (loading) return null;

  if (isRecovery) return <ResetPassword />;

  // se não está logado, sempre volta pro login (mesmo se tentar #/admin)
  if (!session) return <Login />;

  // se tentar rota admin e não for admin: bloqueia
  if (isAdminRoute && !checkingAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf4e2] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-2xl font-bold text-slate-900">Acesso negado</div>
          <p className="text-sm text-slate-600 mt-2">
            Seu usuário não possui permissão de administrador.
          </p>

          <button
            className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg transition"
            onClick={() => {
              window.location.hash = "#/";
            }}
          >
            Voltar
          </button>

          <button
            className="mt-3 w-full border border-slate-200 hover:bg-slate-50 text-slate-900 py-2 rounded-lg transition"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.hash = "#/";
            }}
          >
            Sair
          </button>

          <p className="text-xs text-gray-400 text-center mt-6">© SN Contabilidade</p>
        </div>
      </div>
    );
  }

  return <ProtectedApp isAdmin={isAdmin} checkingAdmin={checkingAdmin} route={route} />;
}
