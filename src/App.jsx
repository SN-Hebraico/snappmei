import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import ResetPassword from "./components/ResetPassword";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRecovery = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash.includes("type=recovery");
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  // Agora sim: depois de carregar sessão, mostra ResetPassword
  if (isRecovery) return <ResetPassword />;

  return session ? <ProtectedApp /> : <Login />;
}
