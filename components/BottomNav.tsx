"use client";
import { Search, Plus, MessageCircle, User } from "lucide-react";
import { C } from "@/lib/constants";

export default function BottomNav({ tab, setTab, cartCount, unread }: {
  tab: string; setTab: (t: string) => void; cartCount: number; unread: boolean;
}) {
  const items = [
    { id: "browse",   icon: Search,        label: "Browse" },
    { id: "sell",     icon: Plus,          label: "Sell" },
    { id: "messages", icon: MessageCircle, label: "Chats", dot: unread },
    { id: "profile",  icon: User,          label: "Profile" },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.cream, borderTop:`1px solid ${C.line}`, display:"flex", justifyContent:"space-around", padding:"8px 0 11px", zIndex:10 }}>
      {items.map(it => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"none", border:"none", cursor:"pointer", flex:1, padding:"4px 0" }}>
            <div style={{ position:"relative" }}>
              <Icon size={22} color={active ? C.clay : C.inkFaint} strokeWidth={active ? 2.4 : 1.8} />
              {it.dot && <span style={{ position:"absolute", top:-2, right:-3, width:7, height:7, borderRadius:"50%", background:C.clay, border:`2px solid ${C.cream}` }} />}
            </div>
            <span style={{ fontSize:10.5, color:active ? C.clay : C.inkFaint, marginTop:3, fontWeight:active ? 600 : 400 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
