import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import ResetPassword from "./components/ResetPassword";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRecovery =
    typeof window !== "undefined" &&
    window.location.hash.includes("type=recovery");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  if (isRecovery) return <ResetPassword />;

  return session ? <ProtectedApp /> : <Login />;
}
