// src/App.jsx
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import ResetPassword from "./components/ResetPassword";

function isRecoveryFlow() {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash || "";
  const search = window.location.search || "";

  // Recovery antigo (hash)
  const byHash = hash.includes("type=recovery") || hash.includes("access_token=");

  // Recovery novo (query) e PKCE
  const params = new URLSearchParams(search);
  const byQueryType = params.get("type") === "recovery";
  const byCode = params.get("code"); // quando Supabase manda link com ?code=...

  return Boolean(byHash || byQueryType || byCode);
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const recovery = isRecoveryFlow();

  useEffect(() => {
    let alive = true;

    // 1) carrega sessão atual (se existir)
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data?.session ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("getSession error:", err);
        if (!alive) return;
        setSession(null);
        setLoading(false);
      });

    // 2) escuta mudanças
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ IMPORTANTE: se for recovery, renderiza ResetPassword mesmo durante loading
  if (recovery) return <ResetPassword />;

  if (loading) return null;

  return session ? <ProtectedApp /> : <Login />;
}
