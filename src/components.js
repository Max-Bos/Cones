function Spinner({C}) {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}><div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.accent,animation:"spin 0.7s linear infinite"}}/></div>;
}

function NavItem({icon,label,active,onClick,C,mobile}) {
  return (
    <button onClick={onClick} style={{
      display:"flex",flexDirection:mobile?"column":"row",alignItems:"center",gap:mobile?2:10,
      padding:mobile?"6px 0":"9px 14px",borderRadius:mobile?0:9,border:"none",
      background:active?(mobile?"none":C.surface):"none",
      color:active?C.accent:C.muted,fontSize:mobile?10:14,fontWeight:active?500:400,
      cursor:"pointer",flex:mobile?1:"none",
      borderBottom:mobile&&active?`2px solid ${C.accent}`:mobile?"2px solid transparent":"none",
      transition:"all 0.15s",
    }}>
      <span style={{fontSize:mobile?20:16}}>{icon}</span>{label}
    </button>
  );
}

function TagPill({tag}) {
  const t = TAGS.find(x=>x.label===tag);
  if(!t) return null;
  return <span style={{fontSize:11,fontWeight:500,color:t.color,background:t.bg,borderRadius:20,padding:"2px 8px",border:`0.5px solid ${t.color}44`,flexShrink:0}}>{t.label}</span>;
}

function RichEditor({value,onChange,placeholder,C}) {
  const ref=useRef(); const last=useRef(value);
  useEffect(()=>{ if(ref.current&&value!==last.current){ref.current.innerHTML=value;last.current=value;} },[value]);
  const exec=(cmd,val)=>{ document.execCommand(cmd,false,val); ref.current.focus(); };
  const tools=[{label:"B",cmd:"bold",s:{fontWeight:700}},{label:"I",cmd:"italic",s:{fontStyle:"italic"}},{label:"H",cmd:"formatBlock",val:"h3",s:{fontWeight:600}},{label:"•",cmd:"insertUnorderedList",s:{}}];
  return (
    <div style={{border:`0.5px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"flex",gap:2,padding:"6px 8px",borderBottom:`0.5px solid ${C.border}`,background:C.surface}}>
        {tools.map(t=><button key={t.cmd} onMouseDown={e=>{e.preventDefault();exec(t.cmd,t.val);}} style={{...t.s,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"2px 8px",fontSize:12,background:C.bg,color:C.text,cursor:"pointer"}}>{t.label}</button>)}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning data-placeholder={placeholder}
        onInput={e=>{last.current=e.target.innerHTML;onChange(e.target.innerHTML);}}
        style={{minHeight:120,padding:"10px 12px",fontSize:14,lineHeight:1.7,color:C.text,background:C.bg}}/>
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:${C.faint};}`}</style>
    </div>
  );
}
