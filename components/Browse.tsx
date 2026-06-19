"use client";
import { useState, useEffect } from "react";
import { Search, RefreshCw, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C, CATEGORIES, CAT_EMOJI } from "@/lib/constants";
import PriceTag from "./PriceTag";
import EmptyState from "./EmptyState";

export default function Browse({ listings, me, profile, onOpen, onRefresh, showToast }: any) {
  const supabase = createClient();
  const [query, setQuery]     = useState("");
  const [cat, setCat]         = useState("All");
  const [likes, setLikes]     = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.from("likes").select("listing_id").eq("user_id", me.id)
      .then(({ data }) => setLikes((data||[]).map((r:any) => r.listing_id)));
  }, [me.id]);

  async function toggleLike(listing: any) {
    const liked = likes.includes(listing.id);
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", me.id).eq("listing_id", listing.id);
      setLikes(likes.filter(id => id !== listing.id));
    } else {
      await supabase.from("likes").insert({ user_id: me.id, listing_id: listing.id });
      setLikes([...likes, listing.id]);
      showToast("Liked! ❤️");
    }
  }

  async function doRefresh() {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  }

  const filtered = listings.filter((l: any) => {
    if (l.sold) return false;
    if (cat !== "All" && l.category !== cat) return false;
    if (query && !(l.title.toLowerCase().includes(query.toLowerCase()) || l.description?.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ position:"relative", flex:1 }}>
          <Search size={15} color={C.inkFaint} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search listings…"
            style={{ width:"100%", padding:"11px 14px 11px 36px", borderRadius:10, border:`1.5px solid ${C.line}`, background:"#fff", fontSize:14, color:C.ink }} />
        </div>
        <button onClick={doRefresh} style={{ border:`1px solid ${C.line}`, borderRadius:10, width:44, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <RefreshCw size={16} color={refreshing ? C.clay : C.inkFaint} style={{ transition:"transform 0.4s", transform:refreshing?"rotate(360deg)":"none" }} />
        </button>
      </div>

      <div className="hide-scroll" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:10, marginBottom:8 }}>
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding:"6px 13px", borderRadius:20, border:`1.5px solid ${cat===c ? C.ink : C.line}`,
            fontSize:12.5, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
            background:cat===c ? C.ink : "#fff", color:cat===c ? C.cream : C.inkSoft, fontWeight:cat===c?600:400,
          }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🔍" title="Nothing here yet" subtitle={query||cat!=="All" ? "Try a different search or category." : "Be the first to list something — tap Sell."} />
        : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {filtered.map((l: any) => (
              <div key={l.id} className="card-hover" onClick={() => onOpen(l.id)}
                style={{ background:"#fff", borderRadius:14, overflow:"hidden", cursor:"pointer", border:`1px solid ${C.line}` }}>
                <div style={{ position:"relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image_url || placeholderImg(l.title, l.category)} alt={l.title}
                    style={{ width:"100%", height:160, objectFit:"cover", display:"block" }} />
                  {l.condition === "New with tags" && (
                    <div style={{ position:"absolute", top:8, left:8, background:C.gold, color:C.ink, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4 }}>NEW</div>
                  )}
                  <button onClick={e => { e.stopPropagation(); toggleLike(l); }}
                    style={{ position:"absolute", top:8, right:8, background:"rgba(28,26,23,0.38)", border:"none", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <Heart size={15} color={likes.includes(l.id) ? C.clay : "#fff"} fill={likes.includes(l.id) ? C.clay : "none"} strokeWidth={2} />
                  </button>
                </div>
                <div style={{ padding:"10px 10px 13px" }}>
                  <div style={{ fontSize:13, color:C.ink, marginBottom:7, lineHeight:1.35, minHeight:36 }}>{l.title}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <PriceTag price={l.price} />
                    <span style={{ fontSize:10.5, color:C.inkFaint }}>@{l.seller?.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function placeholderImg(title: string, category: string) {
  const emoji = CAT_EMOJI[category] || "📦";
  const hues: Record<string,number> = { Tops:35, Bottoms:220, Dresses:320, Outerwear:28, Shoes:10, Accessories:200, Bags:45, Other:160 };
  const hue = hues[category] || 180;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='hsl(${hue},40%,92%)'/><stop offset='100%' stop-color='hsl(${(hue+40)%360},30%,82%)'/></linearGradient></defs><rect width='400' height='500' fill='url(#g)'/><text x='200' y='220' font-size='90' text-anchor='middle' dominant-baseline='middle'>${emoji}</text><text x='200' y='310' font-family='Helvetica Neue,sans-serif' font-size='18' font-weight='500' fill='hsl(${hue},25%,38%)' text-anchor='middle'>${title.split(" ")[0]}</text></svg>`)}`;
}
