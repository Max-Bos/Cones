function TodayPage({habits,completions,setCompletions,userId,C}) {
  const today=todayKey(); const days=last30();
  const [expanded,setExpanded]=useState({});
  const [localNotes,setLocalNotes]=useState({});
  const [linkedGoalCounts,setLinkedGoalCounts]=useState({});
  const [linkedGoalPings,setLinkedGoalPings]=useState({});

  useEffect(()=>{(async()=>{
    const {data}=await sb.from("goals").select("id,linked_habit_id").eq("user_id",userId);
    const counts=(data||[]).reduce((acc,g)=>{
      if(!g.linked_habit_id) return acc;
      acc[g.linked_habit_id]=(acc[g.linked_habit_id]||0)+1;
      return acc;
    },{});
    setLinkedGoalCounts(counts);
  })();},[userId]);

  const toggle=async(habitId)=>{
    const ex=completions.find(c=>c.habit_id===habitId&&c.date===today);
    if(ex){
      await sb.from("completions").delete().eq("id",ex.id);
      setCompletions(c=>c.filter(x=>x.id!==ex.id));
    } else {
      const id=`${habitId}_${today}`;
      const {data}=await sb.from("completions").insert({id,habit_id:habitId,date:today,note:"",user_id:userId}).select().single();
      if(data) setCompletions(c=>[...c,data]);
      if(linkedGoalCounts[habitId]) setLinkedGoalPings(p=>({...p,[habitId]:(p[habitId]||0)+1}));
    }
  };

  const setNote=async(habitId,val)=>{
    const ex=completions.find(c=>c.habit_id===habitId&&c.date===today);
    if(ex) await sb.from("completions").update({note:val}).eq("id",ex.id);
    setLocalNotes(n=>({...n,[`${habitId}_${today}`]:val}));
  };

  const doneToday=habits.filter(h=>completions.find(c=>c.habit_id===h.id&&c.date===today)).length;
  const pct=habits.length?Math.round((doneToday/habits.length)*100):0;
  const dateStr=new Date().toLocaleDateString("en-NL",{weekday:"long",month:"long",day:"numeric"});
  const heatFills=C.heat;

  return (
    <div className="fadein">
      <div className="page-heading" style={{marginBottom:"1.75rem"}}>
        <h2 style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text}}>Today</h2>
        <p style={{fontSize:13,color:C.muted,marginTop:4}}>{dateStr}</p>
      </div>
      {habits.length===0&&<EmptyState C={C} title="No habits yet" message="Add your first habit in the Habits page to get started."/>}
      <div className={habits.length>=4?"habits-grid":""}>
      {habits.map(h=>{
        const comp=completions.find(c=>c.habit_id===h.id&&c.date===today);
        const done=!!comp; const streak=computeStreak(h.id,completions);
        const isOpen=!!expanded[h.id];
        const noteVal=localNotes[`${h.id}_${today}`]??comp?.note??"";
        const heatData=days.map(d=>completions.find(c=>c.habit_id===h.id&&c.date===d)?2:0);
        const tagConfig=TAGS.find(t=>t.label===h.tag);
        const tagAccentColor=tagConfig?C.tags[tagConfig.key].color:C.accent;
        const linkedCount=linkedGoalCounts[h.id]||0;
        const pingCount=linkedGoalPings[h.id]||0;
        const linkedLabel=`${linkedCount} linked goal${linkedCount===1?"":"s"}`;
        const linkedBadgeText=`${linkedCount}${pingCount>0?` +${pingCount}`:""}`;
        return (
          <div key={h.id} className="glass-card card-hover" style={{background:done?C.successBg:C.cardBg,border:`1px solid ${done?C.done:(C.cardBorder||C.border)}`,borderRadius:16,padding:"18px 20px",marginBottom:12,position:"relative",transition:"all 0.3s ease",boxShadow:`inset 5px 0 0 ${tagAccentColor}, ${C.cardShadow}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>toggle(h.id)} aria-label={`Mark ${h.name} as ${done?"incomplete":"complete"}`} role="button" style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.8px solid ${done?C.done:C.border}`,background:done?C.done:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",transform:done?"scale(1.06)":"scale(1)"}}>
                {done&&<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{fontSize:14,fontWeight:400,flex:1,color:done?C.done:C.text,textDecoration:done?"line-through":"none",opacity:done?0.76:1,transition:"all 0.3s ease"}}>{h.name}</span>
              {h.tag&&<TagPill tag={h.tag} C={C}/>}
              {linkedCount>0&&<span title={linkedLabel} style={{fontSize:12,fontWeight:500,color:C.accent,border:`1px solid ${C.accent}55`,background:C.hoverBg,borderRadius:999,padding:"3px 10px",flexShrink:0,display:"inline-flex",alignItems:"center",gap:5}}><Link2 size={12} strokeWidth={2}/>{linkedBadgeText}</span>}
              {streak>0&&<span aria-label={`Current streak: ${streak} days`} style={{fontSize:12,fontWeight:500,color:C.accentDark,background:C.streakBg,border:`1px solid ${C.streakBorder}`,borderRadius:999,padding:"3px 12px",flexShrink:0,display:"inline-flex",alignItems:"center",gap:5}}><Flame size={12} strokeWidth={2}/>{streak}</span>}
              <button onClick={()=>setExpanded(e=>({...e,[h.id]:!e[h.id]}))} style={{width:32,height:32,fontSize:12,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{isOpen?<ChevronUp size={14} strokeWidth={2}/>:<ChevronDown size={14} strokeWidth={2}/>}</button>
            </div>
            {isOpen&&(
              <div style={{marginTop:12,borderTop:`1px solid ${C.rowDivider}`,paddingTop:12}}>
                <div className="section-label" style={{color:C.faint,marginBottom:8}}>Last 30 days</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
                  {heatData.map((lvl,i)=><div key={i} title={days[i]} style={{width:13,height:13,borderRadius:3,background:heatFills[Math.min(lvl,4)]}}/>)}
                </div>
                <textarea rows={2} placeholder="Note for today..." value={noteVal} onChange={e=>setNote(h.id,e.target.value)}
                  style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,color:C.text,background:C.inputBg,lineHeight:1.5}}/>
              </div>
            )}
          </div>
        );
      })}
      </div>
      {habits.length>0&&(
        <div style={{marginTop:"2.25rem",paddingTop:"1.9rem",borderTop:`1px solid ${C.border}`}}>
          <div className="section-label" style={{color:C.faint,marginBottom:"0.95rem"}}>Today's progress</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.muted,marginBottom:6}}>
            <span>{doneToday} of {habits.length} done</span>
            <span style={{fontWeight:500,color:pct===100?C.done:C.accent}}>{pct}%</span>
          </div>
          <div className="progress-track" style={{background:C.borderSolid||C.border}}>
            <div className={`progress-fill ${pct===100?"done":""}`} style={{width:`${pct}%`,background:pct===100?undefined:(`linear-gradient(90deg, ${C.accent}, ${C.accentLight||C.accent})`),animation:pct===100?"progressPulse 0.8s ease 1":"none"}}/>
          </div>
          {pct===100&&<p style={{fontSize:13,color:C.done,marginTop:8,fontWeight:500,display:"inline-flex",alignItems:"center",gap:6}}>All done for today <Check size={14} strokeWidth={2}/></p>}
        </div>
      )}
    </div>
  );
}
