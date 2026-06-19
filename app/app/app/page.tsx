"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import LoginScreen from "@/components/LoginScreen";
import App from "@/components/App";

export default function Page() {
  const [session, setSession] = useState<any>(undefined); // undefined = loading
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
      <span className="font-display" style={{ fontSize: 42, letterSpacing: 2, color: "#1C1A17" }}>loop</span>
    </div>
  );

  if (!session) return <LoginScreen />;
  return <App session={session} />;
}
