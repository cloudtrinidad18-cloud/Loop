"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";

export default function LoginScreen() {
  const supabase = createClient();
  const [mode, setMode]         = useState<"login"|"signup">("login");
  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const usernameClean = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const canSubmit = email.includes("@") && password.length >= 6 &&
    (mode === "login" || (usernameClean.length >= 2 && confirm === password));

  async function submit() {
    if (!canSubmit) return;
    setLoading(true); setError("");

    if (mode === "signup") {
      const { data: taken } = await supabase.from("profiles").select("id").eq("username", usernameClean).single();
      if (taken) { setError("Username already taken — choose another."); setLoading(false); return; }

      const { error: signUpErr } = await supabase.auth.signUp({
        email, password,
        options: { data: { username: usernameClean } },
      });
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
      setCheckEmail(true);
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) { setError("Wrong email or password."); setLoading(false); return; }
    }
    setLoading(false);
  }

  function switchMode(m: "login"|"signup") { setMode(m); setError(""); setPassword(""); setConfirm(""); }

  const inp: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, background:"#fff", fontSize:14, color:C.ink, display:"block", marginBottom:4 };
  const lbl: React.CSSProperties = { display:"block", fontSize:11, color:C.inkSoft, fontWeight:600, letterSpacing:0.3, textTransform:"uppercase", margin:"12px 0 5px" };

  if (checkEmail) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, background:C.cream }}>
      <div className="font-display" style={{ fontSize:52, color:C.ink, letterSpacing:2 }}>loop</div>
      <div style={{ marginTop:32, background:"#fff", borderRadius:16, padding:28, maxWidth:320, textAlign:"center", border:`1px solid ${C.line}` }}>
        <div style={{ fontSize:32, marginBottom:12 }}>📬</div>
        <div className="font-display" style={{ fontSize:20, color:C.ink, marginBottom:8 }}>Check your email</div>
        <div style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.6 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back here and log in.
        </div>
        <button onClick={() => { setCheckEmail(false); setMode("login"); }}
          style={{ marginTop:20, background:C.ink, color:C.cream, border:"none", borderRadius:10, padding:"11px 0", width:"100%", fontWeight:600, fontSize:14, cursor:"pointer" }}>
          Back to log in
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, background:C.cream }}>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div className="font-display" style={{ fontSize:52, color:C.ink, letterSpacing:2, lineHeight:1 }}>loop</div>
        <div style={{ fontSize:13, color:C.inkSoft, marginTop:6 }}>buy & sell with your people</div>
      </div>

      <div style={{ display:"flex", background:C.tan, borderRadius:12, padding:4, marginBottom:28, width:"100%", maxWidth:320 }}>
        {(["login","signup"] as const).map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{
            flex:1, padding:"9px 0", borderRadius:9, border:"none", cursor:"pointer",
            fontWeight:600, fontSize:14,
            background: mode===m ? "#fff" : "transparent",
            color: mode===m ? C.ink : C.inkSoft,
            boxShadow: mode===m ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            transition:"all 0.15s",
          }}>{m === "login" ? "Log in" : "Sign up"}</button>
        ))}
      </div>

      <div style={{ width:"100%", maxWidth:320 }}>
        {mode === "signup" && (
          <>
            <label style={lbl}>Username</label>
            <input value={username} onChange={e => { setUsername(e.target.value); setError(""); }}
              placeholder="e.g. thriftqueen" autoCapitalize="none" autoCorrect="off" style={inp} />
            {username && username !== usernameClean && (
              <div style={{ fontSize:11, color:C.inkFaint, marginBottom:6 }}>Saved as: <strong>{usernameClean}</strong></div>
            )}
          </>
        )}

        <label style={lbl}>Email</label>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="you@email.com" autoCapitalize="none" style={inp} />

        <label style={lbl}>Password {mode==="signup" && <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(min. 6 chars)</span>}</label>
        <div style={{ position:"relative", marginBottom:10 }}>
          <input type={showPw ? "text" : "password"} value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && !confirm && submit()}
            placeholder="Password" style={{ ...inp, marginBottom:0, paddingRight:50 }} />
          <button onClick={() => setShowPw(p => !p)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.inkSoft }}>
            {showPw ? "hide" : "show"}
          </button>
        </div>

        {mode === "signup" && (
          <>
            <label style={lbl}>Confirm password</label>
            <input type={showPw ? "text" : "password"} value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Same password again"
              style={{ ...inp, borderColor: confirm && confirm!==password ? "#C0392B" : C.line }} />
            {confirm && confirm!==password && (
              <div style={{ fontSize:11.5, color:"#C0392B", marginBottom:6 }}>Passwords don't match</div>
            )}
          </>
        )}

        {error && (
          <div style={{ background:C.errorBg, border:`1px solid ${C.errorBorder}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.error, marginBottom:14, lineHeight:1.4 }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={!canSubmit || loading}
          style={{ background:C.clay, color:"#fff", border:"none", borderRadius:10, padding:"14px 0", width:"100%", fontWeight:600, fontSize:15, cursor:"pointer", marginTop:6, opacity: canSubmit&&!loading ? 1 : 0.4 }}>
          {loading ? "…" : mode==="login" ? "Log in →" : "Create account →"}
        </button>

        <div style={{ fontSize:11.5, color:C.inkFaint, marginTop:18, textAlign:"center", lineHeight:1.65 }}>
          {mode==="login" ? "Passwords are handled securely by Supabase Auth." : "Your username is public. Your email stays private."}
        </div>
      </div>
    </div>
  );
}
