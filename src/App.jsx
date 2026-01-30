import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import ResetPassword from "./components/ResetPassword";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Se veio de link de recovery, mostra tela de reset
  const isRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isRecovery) return <ResetPassword />;
  if (loading) return null;

  return session ? <ProtectedApp /> : <Login />;
}
