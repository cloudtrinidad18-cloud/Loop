"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";
import BottomNav from "./BottomNav";
import Browse from "./Browse";
import SellForm from "./SellForm";
import MessagesHub from "./MessagesHub";
import ProfileTab from "./ProfileTab";
import CartView from "./CartView";
import ListingDetail from "./ListingDetail";
import ChatPanel from "./ChatPanel";
import PublicProfile from "./PublicProfile";

export default function App({ session }: { session: any }) {
  const supabase   = createClient();
  const me         = session.user;
  const [profile, setProfile]   = useState<any>(null);
  const [tab, setTab]           = useState("browse");
  const [listings, setListings] = useState<any[]>([]);
  const [cart, setCart]         = useState<any[]>([]);
  const [toast, setToast]       = useState<{msg:string,type:string}|null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [detailId, setDetailId] = useState<string|null>(null);
  const [chatWith, setChatWith] = useState<any>(null);
  const [profileOf, setProfileOf] = useState<string|null>(null);
  const [unread, setUnread]     = useState(false);
  const toastTimer = useRef<any>(null);

  const showToast = useCallback((msg: string, type = "default") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", me.id).single()
      .then(({ data }) => setProfile(data));
  }, [me.id]);

  async function refreshListings() {
    const { data } = await supabase
      .from("listings")
      .select("*, seller:profiles!listings_seller_id_fkey(id,username,avatar_url)")
      .order("created_at", { ascending: false });
    setListings(data || []);
  }
  useEffect(() => { refreshListings(); }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`cart:${me.id}`);
    if (saved) setCart(JSON.parse(saved));
  }, [me.id]);

  function persistCart(next: any[]) {
    setCart(next);
    localStorage.setItem(`cart:${me.id}`, JSON.stringify(next));
  }

  function addToCart(listing: any) {
    if (listing.seller_id === me.id) { showToast("That's your own listing!", "warn"); return; }
    if (cart.find(c => c.id === listing.id)) { showToast("Already in your bag", "warn"); return; }
    persistCart([...cart, listing]);
    showToast("Added to bag 🛍️", "success");
  }

  useEffect(() => {
    const channel = supabase
      .channel("unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${me.id}` },
        () => setUnread(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [me.id]);

  async function handleLogout() { await supabase.auth.signOut(); }

  const detailListing = listings.find(l => l.id === detailId);

  return (
    <div style={{ minHeight:"100vh", background:C.cream, maxWidth:480, margin:"0 auto", paddingBottom:72 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap'); .hide-scroll::-webkit-scrollbar{display:none} .card-hover{transition:transform .15s,box-shadow .15s} .card-hover:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(28,26,23,.10)}`}</style>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px 10px", position:"sticky", top:0, background:C.cream, zIndex:10, borderBottom:`1px solid ${C.line}` }}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:26, color:C.ink, letterSpacing:1 }}>loop</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={() => setTab("cart")} style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:6 }}>
            <ShoppingBag size={21} color={C.ink} />
            {cart.length > 0 && <span style={{ position:"absolute", top:-2, right:-2, background:C.clay, color:"#fff", fontSize:9, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{cart.length}</span>}
          </button>
          <button onClick={handleLogout} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.inkSoft, padding:"6px 10px" }}>out</button>
        </div>
      </div>

      <div style={{ padding:"16px 16px 20px" }}>
        {tab==="browse"   && <Browse listings={listings} me={me} profile={profile} onOpen={setDetailId} onRefresh={refreshListings} showToast={showToast} />}
        {tab==="sell"     && <SellForm me={me} onPosted={async () => { await refreshListings(); setTab("browse"); showToast("Listing live! 🎉","success"); }} />}
        {tab==="messages" && <MessagesHub me={me} onOpenChat={p => { setChatWith(p); setUnread(false); }} />}
        {tab==="profile"  && <ProfileTab me={me} profile={profile} listings={listings} onOpenListing={setDetailId} showToast={showToast} onRefreshListings={refreshListings} onProfileUpdated={setProfile} />}
        {tab==="cart"     && <CartView cart={cart} me={me} onRemove={id => persistCart(cart.filter(c=>c.id!==id))}
          onCheckedOut={async item => {
            persistCart(cart.filter(c=>c.id!==item.id));
            await supabase.from("listings").update({ sold:true, buyer_id:me.id }).eq("id",item.id);
            await supabase.from("orders").insert({ listing_id:item.id, buyer_id:me.id, seller_id:item.seller_id, amount:item.price });
            await refreshListings();
            showToast("Order placed — go pay your seller! 💸","success");
          }}
          onMessage={p => { setChatWith(p); setTab("messages"); }} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} cartCount={cart.length} unread={unread} />

      {detailListing && <ListingDetail listing={detailListing} me={me} onClose={() => setDetailId(null)}
        onAddToCart={addToCart}
        onMessage={p => { setDetailId(null); setChatWith(p); setTab("messages"); }}
        onOpenProfile={uid => { setDetailId(null); setProfileOf(uid); }} />}

      {chatWith && <ChatPanel me={me} other={chatWith} onClose={() => setChatWith(null)} />}
      {profileOf && <PublicProfile userId={profileOf} me={me} listings={listings}
        onClose={() => setProfileOf(null)}
        onOpenListing={id => { setProfileOf(null); setDetailId(id); }}
        onMessage={p => { setProfileOf(null); setChatWith(p); setTab("messages"); }} />}

      {toast && (
        <div style={{ position:"fixed", bottom:86, left:"50%", transform:"translateX(-50%)", color:C.cream, fontFamily:"'Inter',sans-serif", fontSize:13.5, padding:"10px 22px", borderRadius:24, zIndex:200, whiteSpace:"nowrap", transition:"opacity 0.25s, transform 0.25s", boxShadow:"0 4px 16px rgba(0,0,0,0.2)", opacity:toastVisible?1:0,
          background: toast.type==="success" ? C.denim : toast.type==="warn" ? C.clay : C.ink }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
