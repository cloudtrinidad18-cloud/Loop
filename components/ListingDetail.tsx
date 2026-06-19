"use client";
import { useState, useEffect } from "react";
import { X, MessageCircle, Star, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C, CAT_EMOJI } from "@/lib/constants";
import PriceTag from "./PriceTag";

export default function ListingDetail({ listing, me, onClose, onAddToCart, onMessage, onOpenProfile }: any) {
  const supabase = createClient();
  const [seller, setSeller] = useState<any>(listing.seller || null);
  const [avgRating, setAvgRating] = useState<number|null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!seller?.id && listing.seller_id) {
      supabase.from("profiles").select("*").eq("id", listing.seller_id).single()
        .then(({ data }) => setSeller(data));
    }
    supabase.from("ratings").select("stars").eq("seller_id", listing.seller_id)
      .then(({ data }) => {
        if (data?.length) {
          setAvgRating(data.reduce((s:number,r:any)=>s+r.stars,0)/data.length);
          setRatingCount(data.length);
        }
      });
  }, [listing.seller_id]);

  const overlay: React.CSSProperties = { position:"fixed", inset:0, background:"rgba(28,26,23,0.52)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 };
  const sheet: React.CSSProperties  = { background:C.cream, width:"100%", maxWidth:480, maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0", position:"relative" };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, zIndex:5, background:"#fff", border:"none", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
          <X size={18} color={C.ink} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.image_url || ""} alt={listing.title} style={{ width:"100%", height:300, objectFit:"cover" }} />
        <div style={{ padding:"20px 20px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, color:C.ink, lineHeight:1.15, maxWidth:"68%" }}>{listing.title}</div>
            <PriceTag price={listing.price} size="lg" />
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:11.5, color:C.inkSoft, background:C.tan, padding:"4px 10px", borderRadius:20 }}>{CAT_EMOJI[listing.category]} {listing.category}</span>
            <span style={{ fontSize:11.5, color:C.inkSoft, background:listing.condition==="New with tags"?"#FFF3CC":C.tan, padding:"4px 10px", borderRadius:20 }}>{listing.condition}</span>
            {listing.sold && <span style={{ fontSize:11.5, color:"#fff", background:C.denim, padding:"4px 10px", borderRadius:20 }}>Sold</span>}
          </div>

          <div style={{ fontSize:14, color:C.inkSoft, lineHeight:1.65, marginBottom:20 }}>{listing.description}</div>

          {seller && (
            <button onClick={() => onOpenProfile(listing.seller_id)}
              style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, background:C.tan, border:"none", padding:"12px 14px", borderRadius:12, cursor:"pointer", width:"100%", textAlign:"left" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:C.denim, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Oswald',sans-serif", fontSize:16 }}>
                {seller.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:C.ink, fontWeight:500 }}>@{seller.username}</div>
                {avgRating && <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:12, color:C.inkSoft, marginTop:2 }}>
                  <Star size={11} fill={C.gold} color={C.gold} /> {avgRating.toFixed(1)} · {ratingCount} reviews
                </div>}
              </div>
              <ChevronLeft size={15} color={C.inkFaint} style={{ transform:"rotate(180deg)" }} />
            </button>
          )}

          {listing.seller_id !== me.id && !listing.sold && (
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => onMessage(seller)} style={{ flex:1, background:"transparent", color:C.ink, border:`1.5px solid ${C.ink}`, borderRadius:10, padding:"12px 0", fontWeight:600, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <MessageCircle size={15} />Message
              </button>
              <button onClick={() => { onAddToCart(listing); onClose(); }} style={{ flex:1, background:C.clay, color:"#fff", border:"none", borderRadius:10, padding:"12px 0", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                Add to bag
              </button>
            </div>
          )}
          {listing.seller_id === me.id && (
            <div style={{ textAlign:"center", fontSize:13, color:C.inkFaint, padding:"10px 0" }}>Your listing</div>
          )}
        </div>
      </div>
    </div>
  );
}
