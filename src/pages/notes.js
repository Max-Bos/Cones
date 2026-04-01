function NotesPage({userId,C}) {
  const [notes,setNotes]=useState([]); const [active,setActive]=useState(null); const [loading,setLoading]=useState(true);
  const [mobileView,setMobileView]=useState("list"); // "list" | "editor"
  const timer=useRef(null);

  useEffect(()=>{(async()=>{
    const {data}=await sb.from("notes").select("*").order("updated_at",{ascending:false});
    setNotes(data||[]); if(data&&data.length) setActive(data[0].id); setLoading(false);
  })();},[]);

  const addNote=async()=>{
    const id=Date.now().toString();
    const {data}=await sb.from("notes").insert({id,title:"Untitled",content:"",user_id:userId}).select().single();
    if(data){setNotes(n=>[data,...n]);setActive(data.id);setMobileView("editor");}
  };

  const delNote=async(id)=>{
    await sb.from("notes").delete().eq("id",id);
    const r=notes.filter(n=>n.id!==id); setNotes(r);
    setActive(r.length?r[0].id:null);
    setMobileView("list");
  };

  const update=(id,field,val)=>{
    setNotes(n=>n.map(x=>x.id===id?{...x,[field]:val}:x));
    clearTimeout(timer.current);
    timer.current=setTimeout(async()=>{ await sb.from("notes").update({[field]:val,updated_at:new Date().toISOString()}).eq("id",id); },600);
  };

  const openNote=(id)=>{ setActive(id); setMobileView("editor"); };
  const activeNote=notes.find(n=>n.id===active);

  const fmtDate=(d)=>d?new Date(d).toLocaleDateString("en-NL",{month:"short",day:"numeric"}):"";
  const notePreviews = useMemo(
    ()=>Object.fromEntries(notes.map(n=>[n.id,getNotePreview(n.content)])),
    [notes]
  );

  if(loading) return <Spinner C={C}/>;

  return (
    <div className="fadein">
      {/* ── Desktop: side by side ── */}
      <div className="notes-desktop" style={{display:"flex",gap:16}}>
        <div style={{width:240,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:13,fontWeight:500,color:C.muted}}>Notes</span>
            <button onClick={addNote} style={{width:32,height:32,fontSize:20,color:C.accent,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,padding:0,borderRadius:8}}>+</button>
          </div>
          {notes.length===0&&<EmptyState C={C} title="No notes yet" message="Capture ideas, plans, and quick thoughts here."/>}
          {notes.map(n=>(
            <div key={n.id} onClick={()=>openNote(n.id)} style={{padding:"10px 12px",borderRadius:10,marginBottom:6,cursor:"pointer",background:n.id===active?C.hoverBg:"transparent",border:`1px solid ${n.id===active?C.accent:C.border}`,boxShadow:n.id===active?`inset 3px 0 0 ${C.accent}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:n.id===active?C.accent:C.text,fontWeight:n.id===active?500:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title||"Untitled"}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{notePreviews[n.id]}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();delNote(n.id);}} style={{width:32,height:32,fontSize:15,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,flexShrink:0,borderRadius:8}}>&times;</button>
            </div>
          ))}
        </div>
        <div style={{flex:1,minWidth:0}}>
          {activeNote?(
            <>
              <input value={activeNote.title} onChange={e=>update(activeNote.id,"title",e.target.value)}
                style={{width:"100%",fontSize:20,fontWeight:500,letterSpacing:"-0.02em",border:"none",background:"transparent",color:C.text,marginBottom:14,padding:0}} placeholder="Title"/>
              <RichEditor value={activeNote.content} onChange={v=>update(activeNote.id,"content",v)} placeholder="Start writing..." C={C}/>
            </>
          ):(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200}}>
              <button onClick={addNote} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 20px",fontSize:14,color:C.accent,background:C.inputBg,cursor:"pointer"}}>New note</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile: list view ── */}
      <div className="notes-mobile">
        {mobileView==="list"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{fontSize:24,fontWeight:600,color:C.text,letterSpacing:"-0.02em"}}>Notes</h2>
              <button onClick={addNote} style={{fontSize:14,fontWeight:500,color:C.onAccent,background:C.accent,border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer"}}>+ New</button>
            </div>
            {notes.length===0&&(
              <EmptyState C={C} title="No notes yet" message="Create your first note and start writing."/>
            )}
            {notes.map(n=>(
             <div key={n.id} className="glass-card card-hover" onClick={()=>openNote(n.id)} style={{background:C.cardBg,border:`1px solid ${C.cardBorder||C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{n.title||"Untitled"}</div>
                  <div style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{notePreviews[n.id]}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();delNote(n.id);}} style={{width:32,height:32,fontSize:18,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,padding:"4px",flexShrink:0,borderRadius:8}}>&times;</button>
              </div>
            ))}
          </>
        )}

        {mobileView==="editor"&&activeNote&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <button onClick={()=>setMobileView("list")} style={{fontSize:13,color:C.accent,background:C.inputBg,border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 14px",cursor:"pointer",flexShrink:0}}>← Notes</button>
              <input value={activeNote.title} onChange={e=>update(activeNote.id,"title",e.target.value)}
                style={{flex:1,fontSize:18,fontWeight:500,letterSpacing:"-0.02em",border:"none",background:"transparent",color:C.text,padding:0,minWidth:0}} placeholder="Title"/>
              <button onClick={()=>delNote(activeNote.id)} style={{width:32,height:32,fontSize:18,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,padding:"4px",flexShrink:0,borderRadius:8}}>&times;</button>
            </div>
            <RichEditor value={activeNote.content} onChange={v=>update(activeNote.id,"content",v)} placeholder="Start writing..." C={C}/>
          </>
        )}
      </div>

      <style>{`
        .notes-desktop { display: flex; }
        .notes-mobile  { display: none; }
        @media (max-width: 639px) {
          .notes-desktop { display: none !important; }
          .notes-mobile  { display: block !important; }
        }
      `}</style>
    </div>
  );
}
