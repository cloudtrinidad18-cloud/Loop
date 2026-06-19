"use client";
import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { C, CATEGORIES, CONDITIONS, CAT_EMOJI } from "@/lib/constants";

export default function SellForm({ me, onPosted }: { me: any; onPosted: () => void }) {
  const supabase = createClient();
  const [title, setTitle]       = useState("");
  const [price, setPrice]       = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [desc, setDesc]         = useState("");
  const [imgFile, setImgFile]   = useState<File|null>(null);
  const [imgPreview, setImgPreview] = useState<string|null>(null);
  const [posting, setPosting]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = () => setImgPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const canPost = title.trim() && price && !isNaN(Number(price)) && Number(price) > 0;

  async function submit() {
    if (!canPost) return;
    setPosting(true);

    let image_url = "";
    if (imgFile) {
      setUploadProgress(30);
      const ext = imgFile.name.split(".").pop();
      const path = `${me.id}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("listing-images").upload(path, imgFile, { upsert: true });
      if (!error && data) {
        setUploadProgress(80);
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(data.path);
        image_url = urlData.publicUrl;
      }
    }

    setUploadProgress(90);
    await supabase.from("listings").insert({
      seller_id: me.id,
      title: title.trim(),
      price: Number(price),
      category,
      condition,
      description: desc.trim(),
      image_url,
    });

    setPosting(false);
    setUploadProgress(0);
    onPosted();
  }

  const lbl: React.CSSProperties = { display:"block", fontSize:11, color:C.inkSoft, fontWeight:600, letterSpacing:0.3, textTransform:"uppercase", margin:"12px 0 5px" };
  const inp: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, background:"#fff", fontSize:14, color:C.ink, display:"block" };

  return (
    <div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24, color:C.ink, marginBottom:20 }}>List an item</div>

      <div onClick={() => fileRef.current?.click()}
        style={{ width:"100%", height:190, border:`2px dashed ${C.line}`, borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", marginBottom:16, overflow:"hidden", background:imgPreview?"transparent":"#fff" }}>
        {imgPreview ? (
          <div style={{ position:"relative", width:"100%", height:"100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgPreview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <button onClick={e => { e.stopPropagation(); setImgFile(null); setImgPreview(null); }}
              style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.5)", border:"none", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color="#fff" />
            </button>
          </div>
        ) : (
          <>
            <Camera size={28} color={C.inkFaint} />
            <span style={{ fontSize:13, color:C.inkSoft, marginTop:8 }}>Add a photo</span>
            <span style={{ fontSize:11.5, color:C.inkFaint, marginTop:3 }}>tap to upload from your device</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />

      <label style={lbl}>Title *</label>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Vintage denim jacket" style={inp} />

      <label style={lbl}>Price (USD) *</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:12, fontSize:14, color:C.inkSoft }}>$</span>
        <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g,""))}
          placeholder="25" style={{ ...inp, paddingLeft:26 }} inputMode="decimal" />
      </div>

      <label style={lbl}>Category</label>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding:"6px 13px", borderRadius:20, border:`1.5px solid ${category===c ? C.ink : C.line}`,
            fontSize:12.5, cursor:"pointer", whiteSpace:"nowrap",
            background:category===c ? C.ink : "#fff", color:category===c ? C.cream : C.inkSoft,
          }}>{CAT_EMOJI[c]} {c}</button>
        ))}
      </div>

      <label style={lbl}>Condition</label>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
        {CONDITIONS.map(c => (
          <button key={c} onClick={() => setCondition(c)} style={{
            padding:"6px 13px", borderRadius:20, border:`1.5px solid ${condition===c ? C.denim : C.line}`,
            fontSize:12.5, cursor:"pointer", whiteSpace:"nowrap",
            background:condition===c ? C.denim : "#fff", color:condition===c ? "#fff" : C.inkSoft,
          }}>{c}</button>
        ))}
      </div>

      <label style={lbl}>Description</label>
      <textarea value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="Size, fit, condition details, measurements, why you're letting it go…"
        style={{ ...inp, height:96, resize:"none", lineHeight:1.5 }} />

      {posting && uploadProgress > 0 && (
        <div style={{ height:4, borderRadius:2, background:C.line, marginTop:14, overflow:"hidden" }}>
          <div style={{ height:"100%", background:C.clay, width:`${uploadProgress}%`, transition:"width 0.3s" }} />
        </div>
      )}

      <button onClick={submit} disabled={!canPost || posting}
        style={{ background:C.clay, color:"#fff", border:"none", borderRadius:10, padding:"15px 0", width:"100%", fontWeight:600, fontSize:15, cursor:"pointer", marginTop:18, opacity:canPost&&!posting?1:0.4, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        {posting ? "Posting…" : "Post listing →"}
      </button>
    </div>
  );
}
