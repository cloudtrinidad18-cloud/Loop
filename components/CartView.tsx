"use client";
import { useState, useEffect } from "react";
import { Trash2, MessageCircle, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C } from "@/lib/constants";
import PriceTag from "./PriceTag";
import EmptyState from "./EmptyState";

export default function CartView({ cart, me, onRemove, onCheckedOut, onMessage }: any) {
  const supabase = createClient();
  const [checkingOut, setCheckingOut] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const total = cart.reduce((s: number, i: any) => s + Number(i.price), 0);

  useEffect(() => {
    if (!checkingOut) return;
    supabase.from("profiles").select("*").eq("id", checkingOut.seller_id).single()
      .then(({ data }) => setSellerProfile(data));
  }, [checkingOut]);

  if (cart.length === 0) return <EmptyState icon="🛍️" title="Your bag is empty" subtitle="Add items from listings to get started." />;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:18 }}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24, color:C.ink }}>Your bag</div>
        <div style={{ fontSize:13, color:C.inkSoft }}>{cart.length} item{cart.length!==1?"s":""}</div>
      </div>

      {cart.map((item: any) => (
        <div key={item.id} style={{ display:"flex", alignItems:"flex-start", padding:"13px 0", borderBottom:`1px solid ${C.line}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url||""} alt={item.title} style={{ width:68, height:78, objectFit:"cover", borderRadius:10, flexShrink:0 }} />
          <div style={{ flex:1, margin:"0 12px" }}>
            <div style={{ fontSize:14, color:C.ink, marginBottom:4, lineHeight:1.3 }}>{item.title}</div>
            <div style={{ fontSize:12, color:C.inkFaint, marginBottom:8 }}>from @{item.seller?.username}</div>
            <PriceTag price={item.price} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
            <button onClick={() => onRemove(item.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
              <Trash2 size={16} color={C.inkFaint} />
            </button>
            <button onClick={() => setCheckingOut(item)} style={{ background:C.ink, border:"none", borderRadius:8, padding:"6px 12px", fontSize:11.5, color:C.cream, cursor:"pointer" }}>
              Checkout
            </button>
          </div>
        </div>
      ))}

      <div style={{ display:"flex", justifyContent:"space-between", padding:"16px 0 4px", borderTop:`1px solid ${C.line}`, fontSize:15, color:C.ink, marginTop:4 }}>
        <span>Total</span><strong>${total.toFixed(2)}</strong>
      </div>

      {checkingOut && (
        <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.52)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }} onClick={() => setCheckingOut(null)}>
          <div style={{ background:C.cream, width:"100%", maxWidth:480, borderRadius:"20px 20px 0 0", position:"relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setCheckingOut(null)} style={{ position:"absolute", top:14, right:14, background:"#fff", border:"none", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
              <X size={18} color={C.ink} />
            </button>
            <div style={{ padding:"24px 24px 36px" }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, marginBottom:4, color:C.ink }}>Checkout</div>
              <div style={{ fontSize:13.5, color:C.inkSoft, marginBottom:20 }}>{checkingOut.title} · <strong style={{ color:C.ink }}>${checkingOut.price}</strong></div>
              <div style={{ background:C.tan, borderRadius:12, padding:16, marginBottom:16 }}>
                {sellerProfile?.pay_handle ? (
                  <>
                    <div style={{ fontSize:12, color:C.inkSoft, marginBottom:6 }}>Send payment to @{sellerProfile.username}:</div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, color:C.ink, marginBottom:10 }}>{sellerProfile.pay_handle}</div>
                    <div style={{ fontSize:12.5, color:C.inkSoft, lineHeight:1.6 }}>
                      Send <strong>${checkingOut.price}</strong> via Venmo, Cash App, or PayPal using the handle above. Confirm here once paid.
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.6 }}>This seller hasn't added a payment handle yet. Message them to arrange payment.</div>
                )}
              </div>
              <button onClick={() => { onMessage(sellerProfile); setCheckingOut(null); }}
                style={{ background:"transparent", color:C.ink, border:`1.5px solid ${C.ink}`, borderRadius:10, padding:"12px 0", width:"100%", fontWeight:600, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:10 }}>
                <MessageCircle size={15} />Message seller
              </button>
              <button onClick={() => { onCheckedOut(checkingOut); setCheckingOut(null); }}
                style={{ background:C.clay, color:"#fff", border:"none", borderRadius:10, padding:"12px 0", width:"100%", fontWeight:600, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Check size={15} />I've paid — confirm order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
