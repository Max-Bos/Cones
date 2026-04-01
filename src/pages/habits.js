function HabitsPage({habits,setHabits,completions,userId,C}) {
  const [newName,setNewName]=useState(""); const [newTag,setNewTag]=useState("Other"); const [saving,setSaving]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [dragId,setDragId]=useState(null);
  const [dragOverId,setDragOverId]=useState(null);
  const suppressBlurSave=useRef(false);
  const add=async()=>{
    if(!newName.trim()) return; setSaving(true);
    const id=Date.now().toString();
    const {data}=await sb.from("habits").insert({id,name:newName.trim(),tag:newTag,user_id:userId,position:habits.length}).select().single();
    if(data) setHabits(h=>[...h,data]); setNewName(""); setSaving(false);
  };
  const del=async(id)=>{ await sb.from("habits").delete().eq("id",id); setHabits(h=>h.filter(x=>x.id!==id)); };
  const startEdit=(habit)=>{ suppressBlurSave.current=false; setEditingId(habit.id); setEditVal(habit.name); };
  const cancelEdit=()=>{ suppressBlurSave.current=true; setEditingId(null); setEditVal(""); };
  const onEditBlur=(id)=>{
    if(suppressBlurSave.current){suppressBlurSave.current=false; return;}
    saveEdit(id);
  };
  const saveEdit=async(id)=>{
    const val=editVal.trim();
    if(!val){cancelEdit();return;}
    await sb.from("habits").update({name:val}).eq("id",id);
    setHabits(h=>h.map(x=>x.id===id?{...x,name:val}:x));
    cancelEdit();
  };
  const reorderHabits=async(next)=>{
    setHabits(next.map((h,index)=>({...h,position:index})));
    await Promise.all(next.map((habit,index)=>sb.from("habits").update({position:index}).eq("id",habit.id)));
  };
  const onDrop=async(targetId)=>{
    if(!dragId||dragId===targetId){setDragId(null);setDragOverId(null);return;}
    const from=habits.findIndex(h=>h.id===dragId);
    const to=habits.findIndex(h=>h.id===targetId);
    if(from<0||to<0){setDragId(null);setDragOverId(null);return;}
    const next=[...habits];
    const [moved]=next.splice(from,1);
    next.splice(to,0,moved);
    setDragId(null); setDragOverId(null);
    await reorderHabits(next);
  };

  return (
    <div className="fadein">
      <h2 className="page-heading" style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text,marginBottom:"2.2rem"}}>Habits</h2>
      <div style={{display:"flex",gap:10,marginBottom:"1.9rem",flexWrap:"wrap"}}>
        <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="New habit..."
          style={{flex:1,minWidth:140,height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,background:C.inputBg,color:C.text}}/>
        <select value={newTag} onChange={e=>setNewTag(e.target.value)}
          style={{height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",fontSize:14,background:C.inputBg,color:C.text,cursor:"pointer"}}>
          {TAGS.map(t=><option key={t.label}>{t.label}</option>)}
        </select>
        <button onClick={add} disabled={saving} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer",opacity:saving?0.6:1}}>{saving?"...":"Add"}</button>
      </div>
      {habits.length===0&&<EmptyState C={C} title="No habits yet" message="Add one above, then drag to keep your order."/>}
      {TAGS.map(tag=>{
        const group=habits.filter(h=>(h.tag||"Other")===tag.label);
        if(!group.length) return null;
        const tagTheme = getTagTheme(tag.label,C);
        return (
          <div key={tag.label} style={{marginBottom:"1.9rem"}}>
            <div className="section-label" style={{color:tagTheme.color,marginBottom:10}}>{tag.label}</div>
            {group.map(h=>{
              const streak=computeStreak(h.id,completions); const longest=computeLongest(h.id,completions);
              return (
                <div key={h.id} className="glass-card card-hover" draggable={true} onDragStart={()=>setDragId(h.id)} onDragOver={e=>{e.preventDefault();setDragOverId(h.id);}} onDragLeave={()=>dragOverId===h.id&&setDragOverId(null)} onDrop={e=>{e.preventDefault();onDrop(h.id);}} onDragEnd={()=>{setDragId(null);setDragOverId(null);}} style={{display:"flex",alignItems:"center",gap:10,background:C.cardBg,border:`1px solid ${dragOverId===h.id?C.accent:(C.cardBorder||C.border)}`,borderRadius:16,padding:"15px 16px",marginBottom:8,boxShadow:`inset 5px 0 0 ${tagTheme.color}, ${C.cardShadow}`}}>
                  <span style={{fontSize:16,color:C.faint,cursor:"grab",userSelect:"none",display:"inline-flex",alignItems:"center"}}><GripVertical size={16} strokeWidth={2}/></span>
                  {editingId===h.id?(
                    <input value={editVal} autoFocus onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();saveEdit(h.id);} if(e.key==="Escape"){e.preventDefault();cancelEdit();}}} onBlur={()=>onEditBlur(h.id)}
                      style={{flex:1,height:42,fontSize:14,fontWeight:500,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",background:C.inputBg}}/>
                  ):(
                    <span style={{flex:1,fontSize:14,fontWeight:500,color:C.text}}>{h.name}</span>
                  )}
                   <span style={{fontSize:12,color:C.muted,border:`1px solid ${C.streakBorder}`,background:C.streakBg,borderRadius:999,padding:"3px 10px",display:"inline-flex",alignItems:"center",gap:4}}><Flame size={12} strokeWidth={2}/>{streak}d</span>
                   <span style={{fontSize:12,color:C.faint}}>best {longest}d</span>
                   <button aria-label={`Edit habit: ${h.name}`} onClick={()=>startEdit(h)} style={{width:32,height:32,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Pencil size={14} strokeWidth={2}/></button>
                   <button onClick={()=>del(h.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
