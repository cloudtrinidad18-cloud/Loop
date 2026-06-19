"use client";
import { useState, useEffect } from "react";
import { Star, Users } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";
import PriceTag from "./PriceTag";
import EmptyState from "./EmptyState";

export default function ProfileTab({ me, profile, listings, onOpenListing, showToast, onRefreshListings, onProfileUpdated }: any) {
  const supabase = createClient();
  const [bio, setBio]           = useState(profile?.bio || "");
  const [payHandle, setPayHandle] = useState(profile?.pay_handle || "");
  const [editing, setEditing]   = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [tab, setTab]           = useState("listings");
  const [followingCount, setFollowingCount] = useState(0);
  const [avgRating, setAvgRating] = useState<number|null>(null);

  useEffect(() => {
    if (profile) { setBio(profile.bio||""); setPayHandle(profile.pay_handle||""); }
    supabase.from("likes").select("listing_id").eq("user_id", me.id).then(({ data }) => setLikedIds((data||[]).map((r:any)=>r.listing_id)));
    supabase.from("follows").select("id", { count:"exact" }).eq("follower_id", me.id).then(({ count }) => setFollowingCount(count||0));
    supabase.from("ratings").select("stars").eq("seller_id", me.id).then(({ data }) => {
      if (data?.length) setAvgRating(data.reduce((s:number,r:any)=>s+r.stars,0)/data.length);
    });
  }, [me.id, profile]);

  async function saveProfile() {
    const { data } = await supabase.from("profiles").update({ bio: bio.trim(), pay_handle: payHandle.trim() }).eq("id", me.id).select().single();
    onProfileUpdated(data);
    setEditing(false);
    showToast("Profile saved ✓", "success");
  }

  async function toggleSold(id: string, sold: boolean) {
    await supabase.from("listings").update({ sold }).eq("id", id);
    onRefreshListings();
  }

  async function deleteListing(id: string) {
    await supabase.from("listings").delete().eq("id", id);
    onRefreshListings();
    showToast("Listing removed");
  }

  const myListings    = listings.filter((l: any) => l.seller_id === me.id);
  const likedListings = listings.filter((l: any) => likedIds.includes(l.id));
  const lbl: React.CSSProperties = { display:"block", fontSize:11, color:C.inkSoft, fontWeight:600, letterSpacing:0.3, textTransform:"uppercase", margin:"12px 0 5px" };
  const inp: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, background:"#fff", fontSize:14, color:C.ink, display:"block" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
        <div style={{ width:54, height:54, borderRadius:"50%", background:C.denim, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Oswald',sans-serif", fontSize:22 }}>
          {profile?.username?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, color:C.ink }}>@{profile?.username}</div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:4 }}>
            {avgRating && <span style={{ fontSize:12, color:C.inkSoft, display:"flex", alignItems:"center", gap:3 }}><Star size={11} fill={C.gold} color={C.gold} /> {avgRating.toFixed(1)}</span>}
            <span style={{ fontSize:12, color:C.inkSoft }}>{myListings.length} listings</span>
            <span style={{ fontSize:12, color:C.inkSoft, display:"flex", alignItems:"center", gap:3 }}><Users size={11} /> {followingCount} following</span>
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} style={{ background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"7px 14px", fontSize:11.5, color:C.inkSoft, cursor:"pointer" }}>
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {editing ? (
        <div style={{ background:C.tan, borderRadius:14, padding:16, marginBottom:18 }}>
          <label style={lbl}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ ...inp, height:72, resize:"none", lineHeight:1.5 }} placeholder="Tell people what you're about…" />
          <label style={lbl}>Payment handle (Venmo / Cash App / PayPal)</label>
          <input value={payHandle} onChange={e => setPayHandle(e.target.value)} style={inp} placeholder="@your-venmo" />
          <button onClick={saveProfile} style={{ background:C.clay, color:"#fff", border:"none", borderRadius:10, padding:"12px 0", width:"100%", fontWeight:600, fontSize:14, cursor:"pointer", marginTop:10 }}>
            Save profile
          </button>
        </div>
      ) : (
        <div style={{ marginBottom:18 }}>
          {profile?.bio && <div style={{ fontSize:13.5, color:C.inkSoft, marginBottom:8, lineHeight:1.5 }}>{profile.bio}</div>}
          <div style={{ fontSize:12.5, color:C.inkFaint }}>
            {profile?.pay_handle ? `💳 ${profile.pay_handle}` : "No payment handle set — add one so buyers can pay you"}
          </div>
        </div>
      )}

      <div style={{ display:"flex", borderBottom:`2px solid ${C.line}`, marginBottom:16 }}>
        {[["listings",`My items (${myListings.length})`],["liked",`Liked (${likedListings.length})`]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontSize:13.5, fontWeight:tab===id?600:400, color:tab===id?C.clay:C.inkSoft, background:"none", border:"none", padding:"6px 0", marginRight:20, cursor:"pointer", borderBottom:tab===id?`2px solid ${C.clay}`:"2px solid transparent", marginBottom:-2 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" && (
        myListings.length === 0
          ? <EmptyState icon="📦" title="No listings yet" subtitle="Head to Sell to post your first item." />
          : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {myListings.map((l: any) => (
                <div key={l.id} style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:`1px solid ${C.line}` }}>
                  <div style={{ position:"relative" }} onClick={() => onOpenListing(l.id)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image_url||""} alt={l.title} style={{ width:"100%", height:140, objectFit:"cover", opacity:l.sold?0.55:1 }} />
                    {l.sold && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ background:C.denim, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:6 }}>SOLD</span>
                    </div>}
                  </div>
                  <div style={{ padding:"10px 10px 12px" }}>
                    <div style={{ fontSize:12.5, color:C.ink, marginBottom:6, lineHeight:1.3 }}>{l.title}</div>
                    <PriceTag price={l.price} />
                    <div style={{ display:"flex", gap:6, marginTop:8 }}>
                      <button onClick={() => toggleSold(l.id,!l.sold)} style={{ background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"5px 10px", fontSize:11.5, color:C.inkSoft, cursor:"pointer" }}>
                        {l.sold ? "Relist" : "Mark sold"}
                      </button>
                      <button onClick={() => deleteListing(l.id)} style={{ background:"none", border:"1px solid #e8b8b0", borderRadius:8, padding:"5px 10px", fontSize:11.5, color:"#C0392B", cursor:"pointer" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {tab === "liked" && (
        likedListings.length === 0
          ? <EmptyState icon="❤️" title="No liked items" subtitle="Tap the heart on any listing to save it here." />
          : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {likedListings.map((l: any) => (
                <div key={l.id} style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:`1px solid ${C.line}`, opacity:l.sold?0.6:1, cursor:"pointer" }} onClick={() => onOpenListing(l.id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image_url||""} alt={l.title} style={{ width:"100%", height:140, objectFit:"cover" }} />
                  <div style={{ padding:"9px 10px 11px" }}>
                    <div style={{ fontSize:12.5, color:C.ink, marginBottom:5 }}>{l.title}</div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <PriceTag price={l.price} />
                      {l.sold && <span style={{ fontSize:10.5, color:C.denim }}>Sold</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}
