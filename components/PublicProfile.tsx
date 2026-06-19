"use client";
import { useState, useEffect } from "react";
import { X, Star, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";
import PriceTag from "./PriceTag";

export default function PublicProfile({ userId, me, listings, onClose, onOpenListing, onMessage }: any) {
  const supabase = createClient();
  const [profile, setProfile]     = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const [rateVal, setRateVal]     = useState(0);
  const [rated, setRated]         = useState(false);
  const [avgRating, setAvgRating] = useState<number|null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", userId).single().then(({ data }) => setProfile(data));
    supabase.from("follows").select("id").eq("follower_id", me.id).eq("following_id", userId).single()
      .then(({ data }) => setFollowing(!!data));
    supabase.from("ratings").select("stars").eq("seller_id", userId)
      .then(({ data }) => {
        if (data?.length) {
          setAvgRating(data.reduce((s:number,r:any)=>s+r.stars,0)/data.length);
          setRatingCount(data.length);
        }
      });
    supabase.from("ratings").select("id").eq("rater_id", me.id).eq("seller_id", userId).single()
      .then(({ data }) => setRated(!!data));
  }, [userId]);

  async function toggleFollow() {
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", me.id).eq("following_id", userId);
    } else {
      await supabase.from("follows").insert({ follower_id: me.id, following_id: userId });
    }
    setFollowing(!following);
  }

  async function submitRating(stars: number) {
    if (rated) return;
    setRateVal(stars);
    await supabase.from("ratings").upsert({ rater_id: me.id, seller_id: userId, stars });
    setRated(true);
    const { data } = await supabase.from("ratings").select("stars").eq("seller_id", userId);
    if (data?.length) { setAvgRating(data.reduce((s:number,r:any)=>s+r.stars,0)/data.length); setRatingCount(data.length); }
  }

  const theirListings = listings.filter((l: any) => l.seller_id === userId && !l.sold);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.52)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }} onClick={onClose}>
      <div style={{ background:C.cream, width:"100%", maxWidth:480, maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0", position:"relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, zIndex:5, background:"#fff", border:"none", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
          <X size={18} color={C.ink} />
        </button>
        <div style={{ padding:"24px 20px 36px" }}>
          {!profile ? (
            <div style={{ textAlign:"center", padding:40, color:C.inkFaint }}>Loading…</div>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:C.denim, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Oswald',sans-serif", fontSize:20 }}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, color:C.ink }}>@{profile.username}</div>
                  {avgRating && <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:12.5, color:C.inkSoft, marginTop:3 }}>
                    <Star size={11} fill={C.gold} color={C.gold} /> {avgRating.toFixed(1)} · {ratingCount} reviews
                  </div>}
                </div>
              </div>

              {profile.bio && <div style={{ fontSize:13.5, color:C.inkSoft, marginBottom:14, lineHeight:1.5 }}>{profile.bio}</div>}

              <div style={{ display:"flex", gap:8, marginBottom:18 }}>
                <button onClick={() => onMessage(profile)} style={{ flex:1, background:"transparent", color:C.ink, border:`1.5px solid ${C.ink}`, borderRadius:10, padding:"10px 0", fontWeight:600, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <MessageCircle size={14} />Message
                </button>
                <button onClick={toggleFollow} style={{ flex:1, background:following?C.tan:C.clay, color:following?C.ink:"#fff", border:`1.5px solid ${following?C.line:C.clay}`, borderRadius:10, padding:"10px 0", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  {following ? "✓ Following" : "Follow"}
                </button>
              </div>

              <div style={{ background:C.tan, borderRadius:12, padding:14, marginBottom:20 }}>
                <div style={{ fontSize:12, color:C.inkSoft, marginBottom:8 }}>{rated ? "Thanks for your review!" : `Rate @${profile.username}`}</div>
                <div style={{ display:"flex", gap:4 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => submitRating(s)} style={{ background:"none", border:"none", cursor:rated?"default":"pointer", padding:2 }}>
                      <Star size={22} fill={s<=rateVal?C.gold:"none"} color={s<=rateVal?C.gold:C.inkFaint} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:17, color:C.ink, marginBottom:12 }}>
                Active listings ({theirListings.length})
              </div>
              {theirListings.length === 0
                ? <div style={{ fontSize:13, color:C.inkFaint }}>Nothing listed right now.</div>
                : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {theirListings.map((l: any) => (
                      <div key={l.id} style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:`1px solid ${C.line}`, cursor:"pointer" }} onClick={() => onOpenListing(l.id)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.image_url||""} alt={l.title} style={{ width:"100%", height:130, objectFit:"cover" }} />
                        <div style={{ padding:"8px 8px 10px" }}>
                          <div style={{ fontSize:12.5, color:C.ink, marginBottom:5 }}>{l.title}</div>
                          <PriceTag price={l.price} />
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}
