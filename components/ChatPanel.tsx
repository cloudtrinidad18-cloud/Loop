"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";

export default function ChatPanel({ me, other, onClose }: any) {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText]         = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("messages")
      .select("*")
      .or(`and(sender_id.eq.${me.id},receiver_id.eq.${other.id}),and(sender_id.eq.${other.id},receiver_id.eq.${me.id})`)
      .order("created_at")
      .then(({ data }) => setMessages(data || []));

    supabase.from("messages").update({ read: true })
      .eq("receiver_id", me.id).eq("sender_id", other.id).eq("read", false);

    const channel = supabase.channel(`chat:${[me.id,other.id].sort().join("_")}`)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" }, payload => {
        const msg = payload.new as any;
        if ([me.id, other.id].includes(msg.sender_id) && [me.id, other.id].includes(msg.receiver_id)) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [me.id, other.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior:"smooth" });
  }, [messages]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText("");
    await supabase.from("messages").insert({ sender_id: me.id, receiver_id: other.id, content: t });
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.52)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }} onClick={onClose}>
      <div style={{ background:C.cream, width:"100%", maxWidth:480, height:"88vh", borderRadius:"20px 20px 0 0", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", padding:"14px 16px", borderBottom:`1px solid ${C.line}`, flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:6 }}>
            <ChevronLeft size={20} color={C.ink} />
          </button>
          <div style={{ width:38, height:38, borderRadius:"50%", background:C.denim, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Oswald',sans-serif", fontSize:16, marginLeft:8 }}>
            {other.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ marginLeft:10, fontSize:15, color:C.ink, fontWeight:500 }}>@{other.username}</div>
        </div>

        <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:"center", color:C.inkFaint, fontSize:13, marginTop:40 }}>Say hi to @{other.username} 👋</div>
          )}
          {messages.map((m, i) => {
            const isMe = m.sender_id === me.id;
            return (
              <div key={i} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", marginBottom:8 }}>
                <div style={{ background:isMe?C.clay:C.tan, color:isMe?"#fff":C.ink, padding:"9px 14px",
                  borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  maxWidth:"76%", fontSize:14, lineHeight:1.45 }}>
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", gap:8, padding:"12px 14px", borderTop:`1px solid ${C.line}`, flexShrink:0 }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key==="Enter" && send()}
            placeholder="Message…"
            style={{ flex:1, padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, background:"#fff", fontSize:14, color:C.ink }} />
          <button onClick={send} style={{ background:C.clay, border:"none", borderRadius:"50%", width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
