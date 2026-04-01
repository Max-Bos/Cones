/* ── SHARED PAGE UTILITIES ── */
function EmptyState({C,title,message}) {
  return (
    <div style={{textAlign:"center",padding:"2.75rem 1rem"}}>
      <div style={{width:84,height:84,margin:"0 auto 16px",position:"relative"}}>
        <div style={{position:"absolute",left:22,top:12,width:40,height:56,background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:18,transform:"rotate(14deg)"}}/>
        <div style={{position:"absolute",left:30,top:8,width:32,height:54,background:C.hoverBg,border:`1px solid ${C.border}`,borderRadius:14}}/>
      </div>
      <p style={{fontSize:14,fontWeight:500,color:C.text,marginBottom:6}}>{title}</p>
      <p style={{fontSize:12,color:C.muted}}>{message}</p>
    </div>
  );
}

function getNotePreview(html) {
  if(!html) return "No content yet";
  const parsed = new DOMParser().parseFromString(html,"text/html");
  const text = (parsed.body?.textContent || "").replace(/\s+/g," ").trim();
  return text || "No content yet";
}
