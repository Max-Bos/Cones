function Spinner({C}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {[0,1,2].map(i=>(
          <span key={i} style={{width:10,height:10,borderRadius:"50%",background:C.accent,animation:`dotPulse 0.9s ease ${i*0.14}s infinite`}}/>
        ))}
      </div>
    </div>
  );
}

function NavItem({icon,label,active,onClick,C,mobile}) {
  const [hover,setHover]=useState(false);
  if(mobile) {
    return (
      <button onClick={onClick} style={{
        display:"flex",flexDirection:"column",alignItems:"center",gap:2,
        padding:"6px 0",borderRadius:0,border:"none",
        background:"none",
        color:active?C.accent:C.muted,fontSize:10,fontWeight:active?500:400,
        cursor:"pointer",flex:1,
        borderBottom:active?`2px solid ${C.accent}`:"2px solid transparent",
        transition:"all 0.15s ease",
      }}>
        <span style={{fontSize:20}}>{icon}</span>{label}
      </button>
    );
  }
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        display:"flex",flexDirection:"row",alignItems:"center",gap:10,
        padding:"12px 16px",
        borderRadius:999,border:"none",
        boxShadow:active?`inset 3px 0 0 ${C.accent}`:"none",
        background:(active||hover)?C.hoverBg:"transparent",
        color:active?C.accent:hover?C.text:C.muted,
        fontSize:14,fontWeight:active?500:400,
        cursor:"pointer",width:"100%",textAlign:"left",
        transition:"all 0.15s ease",
      }}>
      <span style={{fontSize:16}}>{icon}</span>{label}
    </button>
  );
}

function TagPill({tag,C}) {
  const tk = TAGS.find(x=>x.label===tag);
  const t = tk ? C.tags?.[tk.key] : null;
  if(!t) return null;
  return <span style={{fontSize:11,fontWeight:500,color:t.color,background:t.bg,borderRadius:6,padding:"3px 10px",border:`1px solid ${t.color}${C.tagBorderAlpha}`,flexShrink:0,textTransform:"capitalize"}}>{tag.toLowerCase()}</span>;
}

function RichEditor({value,onChange,placeholder,C}) {
  const ref=useRef(); const last=useRef(value);
  useEffect(()=>{ if(ref.current&&value!==last.current){ref.current.innerHTML=value;last.current=value;} },[value]);
  const exec=(cmd,val)=>{ document.execCommand(cmd,false,val); ref.current.focus(); };
  const tools=[{label:"B",cmd:"bold",s:{fontWeight:700}},{label:"I",cmd:"italic",s:{fontStyle:"italic"}},{label:"H",cmd:"formatBlock",val:"h3",s:{fontWeight:600}},{label:"•",cmd:"insertUnorderedList",s:{}}];
  return (
    <div style={{border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",background:C.cardBg}}>
      <div style={{display:"flex",gap:8,padding:"10px 12px",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        {tools.map(t=><button key={t.cmd} onMouseDown={e=>{e.preventDefault();exec(t.cmd,t.val);}} style={{...t.s,width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,background:C.inputBg,color:C.text,cursor:"pointer",transition:"all 0.15s ease"}}>{t.label}</button>)}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning data-placeholder={placeholder}
        onInput={e=>{last.current=e.target.innerHTML;onChange(e.target.innerHTML);}}
        style={{minHeight:132,padding:"14px 16px",fontSize:14,lineHeight:1.7,color:C.text,background:C.inputBg}}/>
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:${C.faint};}`}</style>
    </div>
  );
}
