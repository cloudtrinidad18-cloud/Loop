import { C } from "@/lib/constants";

export default function PriceTag({ price, size = "md" }: { price: number; size?: "md"|"lg" }) {
  const big = size === "lg";
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
      <div style={{ background:C.clay, color:"#fff", fontFamily:"'Oswald',sans-serif",
        fontSize:big?24:15, padding:big?"7px 16px 7px 20px":"4px 10px 4px 14px",
        clipPath:"polygon(16% 0, 100% 0, 100% 100%, 16% 100%, 0 50%)",
        letterSpacing:0.4, lineHeight:1.1 }}>
        ${price}
      </div>
      <div style={{ position:"absolute", left:big?6:4, top:"50%", transform:"translateY(-50%)",
        width:big?5:4, height:big?5:4, borderRadius:"50%", background:C.cream }} />
    </div>
  );
}
