import { C } from "@/lib/constants";

export default function EmptyState({ icon, title, subtitle }: { icon?: string; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px 40px" }}>
      {icon && <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>}
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, color:C.ink, marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.6, maxWidth:260, margin:"0 auto" }}>{subtitle}</div>
    </div>
  );
}
