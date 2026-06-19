"use client";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";
import EmptyState from "./EmptyState";

export default function MessagesHub({ me, onOpenChat }: any) {
  const supabase = createClient();
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(id,username), receiver:profiles!messages_receiver_id_fkey(id,username)")
        .or(`sender_id.eq.${me.id},receiver_id.eq.${me.id}`)
        .order("created_at", { ascending: false });

      const seen = new Set<string>();
      const grouped: any[] = [];
      for (const msg of data || []) {
        const other = msg.sender_id === me.id ? msg.receiver : msg.sender;
        if (!seen.has(other.id)) {
          seen.add(other.id);
          grouped.push({ other, last: msg });
        }
      }
      setThreads(grouped);
    })();
  }, [me.id]);

  if (threads.length === 0) return <EmptyState icon="💬" title="No messages yet" subtitle="Message a seller from any listing — conversations appear here." />;

  return (
    <div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24, color:C.ink, marginBottom:16 }}>Messages</div>
      {threads.map(t => (
        <button key={t.other.id} onClick={() => onOpenChat(t.other)}
          style={{ display:"flex", alignItems:"center", width:"100%", padding:"13px 0", borderBottom:`1px solid ${C.line}`, background:"none", border:"none", borderBottom:`1px solid ${C.line}`, cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:C.denim, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Oswald',sans-serif", fontSize:16, flexShrink:0 }}>
            {t.other.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1, marginLeft:12, textAlign:"left", minWidth:0 }}>
            <div style={{ fontSize:14, color:C.ink, fontWeight:500 }}>@{t.other.username}</div>
            <div style={{ fontSize:12.5, color:C.inkFaint, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {t.last.sender_id === me.id ? "You: " : ""}{t.last.content}
            </div>
          </div>
          <ChevronLeft size={14} color={C.inkFaint} style={{ transform:"rotate(180deg)", flexShrink:0 }} />
        </button>
      ))}
    </div>
  );
}
