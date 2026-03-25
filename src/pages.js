/* ── AUTH ── */
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

function AuthPage({C}) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [sent,setSent]=useState(false);

  const submit=async()=>{
    setError("");setLoading(true);
    if(mode==="login"){
      const {error:e}=await sb.auth.signInWithPassword({email,password});
      if(e){
        if(e.message.toLowerCase().includes("invalid login")) setError("Incorrect email or password.");
        else setError(e.message);
      }
    } else {
      if(!email.includes("@")){setError("Enter a valid email address.");setLoading(false);return;}
      if(password.length<6){setError("Password must be at least 6 characters.");setLoading(false);return;}
      const {data,error:e}=await sb.auth.signUp({email,password});
      if(e){
        if(e.message.toLowerCase().includes("already registered")||e.message.toLowerCase().includes("user already exists"))
          setError("An account with this email already exists. Sign in instead.");
        else setError(e.message);
      } else if(data?.user?.identities?.length===0){
        setError("An account with this email already exists. Sign in instead.");
      } else {
        setSent(true);
      }
    }
    setLoading(false);
  };

  const inp={width:"100%",height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,background:C.inputBg,color:C.text,marginBottom:12,outline:"none",boxShadow:"none"};

  if(sent) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem","--accent":C.accent,"--accent-glow":C.accentGlow}}>
      <div style={{maxWidth:400,width:"100%",textAlign:"center"}}>
        <h1 style={{fontSize:24,fontWeight:600,color:C.accent,marginBottom:8}}>Cones</h1>
        <p style={{fontSize:15,color:C.text,marginBottom:6}}>Check your email</p>
        <p style={{fontSize:13,color:C.muted}}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem","--accent":C.accent,"--accent-glow":C.accentGlow}}>
      <div style={{maxWidth:400,width:"100%"}}>
        <h1 style={{fontSize:32,fontWeight:700,color:C.accent,letterSpacing:"-0.03em",marginBottom:6,textAlign:"center"}}>Cones</h1>
        <p style={{fontSize:13,color:C.muted,textAlign:"center",marginBottom:32}}>Stay consistent, one cone at a time.</p>
        <div style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:36}}>
          <div style={{position:"relative",display:"flex",background:C.bg,borderRadius:10,padding:3,marginBottom:22,border:`1px solid ${C.border}`}}>
            <div style={{position:"absolute",top:3,bottom:3,left:mode==="login"?"3px":"calc(50% + 1px)",width:"calc(50% - 4px)",borderRadius:8,background:C.accent,transition:"all 0.2s ease"}}/>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}} style={{position:"relative",zIndex:1,flex:1,border:"none",borderRadius:8,padding:"9px 0",fontSize:13,fontWeight:500,background:"transparent",color:mode===m?C.onAccent:C.muted,cursor:"pointer"}}>
                {m==="login"?"Sign in":"Sign up"}
              </button>
            ))}
          </div>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{...inp,marginBottom:18}}/>
          {error&&<p style={{fontSize:12,color:C.danger,marginBottom:12,marginTop:-6}}>{error}</p>}
          <button onClick={submit} disabled={loading} style={{width:"100%",border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer",opacity:loading?0.7:1}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            {loading?"...":(mode==="login"?"Sign in":"Create account")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SETTINGS PAGE ── */
function SettingsPage({user,C,dark,setDark,reminder,setReminder,onSignOut}) {
  const requestReminder=async()=>{
    if(!("Notification"in window)) return alert("Notifications not supported.");
    const perm=await Notification.requestPermission();
    if(perm==="granted"){
      const t=prompt("Daily reminder time (e.g. 20:00):","20:00");
      if(t){setReminder(t);new Notification("Cones reminder set ✓",{body:`Reminder set for ${t} daily.`});}
    }
  };

  const card={background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:14};
  const row={display:"flex",alignItems:"center",justifyContent:"space-between",gap:12};
  const btn=(danger)=>({border:`1px solid ${danger?C.danger:C.border}`,borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:500,background:danger?C.dangerBg:C.inputBg,color:danger?C.danger:C.accent,cursor:"pointer"});

  return (
    <div className="fadein">
      <h2 className="page-heading" style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text,marginBottom:"2.2rem"}}>Settings</h2>

      {/* Account */}
      <div style={card}>
        <p className="section-label" style={{color:C.faint,marginBottom:12}}>Account</p>
        <div style={row}>
          <span style={{fontSize:14,color:C.muted,overflow:"hidden",textOverflow:"ellipsis"}}>{user.email}</span>
          <button onClick={onSignOut} style={btn(true)}>Sign out</button>
        </div>
      </div>

      {/* Appearance */}
      <div style={card}>
        <p className="section-label" style={{color:C.faint,marginBottom:12}}>Appearance</p>
        <div style={row}>
          <span style={{fontSize:14,color:C.text}}>{dark?"Dark mode":"Light mode"}</span>
          <button onClick={()=>setDark(d=>!d)} style={btn(false)}>{dark?"Switch to light":"Switch to dark"}</button>
        </div>
      </div>

      {/* Reminders */}
      <div style={card}>
        <p className="section-label" style={{color:C.faint,marginBottom:12}}>Reminders</p>
        <div style={row}>
          <span style={{fontSize:14,color:C.text}}>{reminder?`Daily at ${reminder}`:"No reminder set"}</span>
          <button onClick={requestReminder} style={btn(false)}>Set time</button>
        </div>
      </div>

    </div>
  );
}

/* ── TODAY ── */
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
        return (
          <div key={h.id} style={{background:done?C.successBg:C.cardBg,border:`1px solid ${done?C.done:C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12,position:"relative",transition:"all 0.3s ease",boxShadow:`inset 4px 0 0 ${tagAccentColor}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>toggle(h.id)} aria-label={`Mark ${h.name} as ${done?"incomplete":"complete"}`} role="button" style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.8px solid ${done?C.done:C.border}`,background:done?C.done:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",transform:done?"scale(1.06)":"scale(1)"}}>
                {done&&<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{fontSize:14,fontWeight:400,flex:1,color:done?C.done:C.text,textDecoration:done?"line-through":"none",opacity:done?0.76:1,transition:"all 0.3s ease"}}>{h.name}</span>
              {h.tag&&<TagPill tag={h.tag} C={C}/>}
              {linkedCount>0&&<span title={`${linkedCount} linked goal${linkedCount===1?"":"s"}`} style={{fontSize:12,fontWeight:500,color:C.accent,border:`1px solid ${C.accent}55`,background:C.hoverBg,borderRadius:999,padding:"3px 10px",flexShrink:0}}>🔗 {linkedCount}{pingCount>0?` +${pingCount}`:""}</span>}
              {streak>0&&<span aria-label={`Current streak: ${streak} days`} style={{fontSize:12,fontWeight:500,color:C.accentDark,background:C.streakBg,border:`1px solid ${C.streakBorder}`,borderRadius:999,padding:"3px 12px",flexShrink:0}}>🔥 {streak}</span>}
              <button onClick={()=>setExpanded(e=>({...e,[h.id]:!e[h.id]}))} style={{width:32,height:32,fontSize:12,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>{isOpen?"▲":"▼"}</button>
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
          <div style={{height:8,borderRadius:999,background:C.border,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:pct===100?C.done:C.accent,borderRadius:999,transition:"width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",animation:pct===100?"progressPulse 0.8s ease 1":"none"}}/>
          </div>
          {pct===100&&<p style={{fontSize:13,color:C.done,marginTop:8,fontWeight:500}}>All done for today ✓</p>}
        </div>
      )}
    </div>
  );
}

/* ── HABITS ── */
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
                <div key={h.id} draggable={true} onDragStart={()=>setDragId(h.id)} onDragOver={e=>{e.preventDefault();setDragOverId(h.id);}} onDragLeave={()=>dragOverId===h.id&&setDragOverId(null)} onDrop={e=>{e.preventDefault();onDrop(h.id);}} onDragEnd={()=>{setDragId(null);setDragOverId(null);}} style={{display:"flex",alignItems:"center",gap:10,background:C.cardBg,border:`1px solid ${dragOverId===h.id?C.accent:C.border}`,borderRadius:12,padding:"15px 16px",marginBottom:8,boxShadow:`inset 4px 0 0 ${tagTheme.color}`}}>
                  <span style={{fontSize:16,color:C.faint,cursor:"grab",userSelect:"none"}}>⠿</span>
                  {editingId===h.id?(
                    <input value={editVal} autoFocus onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();saveEdit(h.id);} if(e.key==="Escape"){e.preventDefault();cancelEdit();}}} onBlur={()=>onEditBlur(h.id)}
                      style={{flex:1,height:42,fontSize:14,fontWeight:500,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",background:C.inputBg}}/>
                  ):(
                    <span style={{flex:1,fontSize:14,fontWeight:500,color:C.text}}>{h.name}</span>
                  )}
                   <span style={{fontSize:12,color:C.muted,border:`1px solid ${C.streakBorder}`,background:C.streakBg,borderRadius:999,padding:"3px 10px"}}>🔥 {streak}d</span>
                   <span style={{fontSize:12,color:C.faint}}>best {longest}d</span>
                   <button aria-label={`Edit habit: ${h.name}`} onClick={()=>startEdit(h)} style={{width:32,height:32,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>✎</button>
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

/* ── GOALS ── */
function GoalsPage({userId,habits,C}) {
  const [goals,setGoals]=useState([]);
  const [subs,setSubs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [newSub,setNewSub]=useState({});
  const [expanded,setExpanded]=useState({});
  const [showArchived,setShowArchived]=useState(false);
  const [view,setView]=useState("list");
  const [showAddForm,setShowAddForm]=useState(false);
  const [editingGoalId,setEditingGoalId]=useState(null);
  const [editingGoalVal,setEditingGoalVal]=useState("");
  const [editingSubId,setEditingSubId]=useState(null);
  const [editingSubVal,setEditingSubVal]=useState("");
  const [openSubNote,setOpenSubNote]=useState({});
  const [dragGoalId,setDragGoalId]=useState(null);
  const [isMobile,setIsMobile]=useState(()=>window.matchMedia("(max-width: 639px)").matches);
  const [newGoalForm,setNewGoalForm]=useState({
    title:"",
    status:"not_started",
    priority:"medium",
    color:GOAL_COLORS[0],
    due_date:"",
    linked_habit_id:"",
    note:"",
  });

  useEffect(()=>{(async()=>{
    const [{data:g},{data:s}]=await Promise.all([
      sb.from("goals").select("*").order("created_at"),
      sb.from("subtasks").select("*"),
    ]);
    setGoals(g||[]);
    setSubs(s||[]);
    setLoading(false);
  })();},[]);

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.matchMedia("(max-width: 639px)").matches);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  const statusById=Object.fromEntries(STATUSES.map(s=>[s.id,s]));
  const priorityById=Object.fromEntries(PRIORITIES.map(p=>[p.id,p]));
  const habitsById=Object.fromEntries((habits||[]).map(h=>[h.id,h]));
  const activeGoals=goals.filter(g=>!g.archived);
  const archivedGoals=goals.filter(g=>g.archived);
  const isOverdue=(d)=>!!d&&d<todayKey();
  const fmtDue=(d)=>d?new Date(`${d}T00:00:00`).toLocaleDateString("en-NL",{month:"short",day:"numeric"}):"";
  const goalSubs=(goalId)=>subs.filter(s=>s.goal_id===goalId);
  const goalProgress=(goalId)=>{
    const items=goalSubs(goalId);
    const done=items.filter(s=>s.done).length;
    const pct=items.length?Math.round((done/items.length)*100):0;
    return {items,done,pct};
  };

  const updateGoal=async(id,patch)=>{
    setGoals(g=>g.map(x=>x.id===id?{...x,...patch}:x));
    await sb.from("goals").update(patch).eq("id",id);
  };
  const updateSub=async(id,patch)=>{
    setSubs(s=>s.map(x=>x.id===id?{...x,...patch}:x));
    await sb.from("subtasks").update(patch).eq("id",id);
  };

  const addGoal=async()=>{
    const title=newGoalForm.title.trim();
    if(!title) return;
    const id=Date.now().toString();
    const payload={
      id,
      title,
      user_id:userId,
      archived:false,
      status:newGoalForm.status||"not_started",
      priority:newGoalForm.priority||"medium",
      color:newGoalForm.color||GOAL_COLORS[0],
      due_date:newGoalForm.due_date||null,
      linked_habit_id:newGoalForm.linked_habit_id||null,
      note:newGoalForm.note||"",
    };
    const {data}=await sb.from("goals").insert(payload).select().single();
    if(data){
      setGoals(g=>[...g,data]);
      setExpanded(e=>({...e,[id]:true}));
      setShowAddForm(false);
      setNewGoalForm({title:"",status:"not_started",priority:"medium",color:GOAL_COLORS[0],due_date:"",linked_habit_id:"",note:""});
    }
  };
  const delGoal=async(id)=>{
    await sb.from("goals").delete().eq("id",id);
    setGoals(g=>g.filter(x=>x.id!==id));
    setSubs(s=>s.filter(x=>x.goal_id!==id));
  };
  const addSub=async(goalId)=>{
    const title=(newSub[goalId]||"").trim();
    if(!title) return;
    const id=`${goalId}_${Date.now()}`;
    const {data}=await sb.from("subtasks").insert({id,goal_id:goalId,title,done:false,user_id:userId,due_date:null,note:""}).select().single();
    if(data) setSubs(s=>[...s,data]);
    setNewSub(n=>({...n,[goalId]:""}));
  };
  const toggleSub=async(s)=>updateSub(s.id,{done:!s.done});
  const delSub=async(id)=>{
    await sb.from("subtasks").delete().eq("id",id);
    setSubs(s=>s.filter(x=>x.id!==id));
  };
  const startGoalEdit=(g)=>{ setEditingGoalId(g.id); setEditingGoalVal(g.title||""); };
  const saveGoalEdit=async(id)=>{
    const val=editingGoalVal.trim();
    setEditingGoalId(null);
    setEditingGoalVal("");
    if(!val) return;
    await updateGoal(id,{title:val});
  };
  const startSubEdit=(s)=>{ setEditingSubId(s.id); setEditingSubVal(s.title||""); };
  const saveSubEdit=async(id)=>{
    const val=editingSubVal.trim();
    setEditingSubId(null);
    setEditingSubVal("");
    if(!val) return;
    await updateSub(id,{title:val});
  };

  const getRoadmapPosition=(date,minDate,totalDays,containerWidth)=>{
    const days=(new Date(date)-new Date(minDate))/(1000*60*60*24);
    return (days/totalDays)*containerWidth;
  };
  const roadmapGoals=activeGoals;
  const roadmapDueDates=roadmapGoals.map(g=>g.due_date).filter(Boolean);
  const minCreated=roadmapGoals.length?new Date(Math.min(...roadmapGoals.map(g=>new Date(g.created_at).getTime()))):new Date();
  const maxDue=roadmapDueDates.length?new Date(Math.max(...roadmapDueDates.map(d=>new Date(d).getTime()))):new Date(minCreated.getTime()+90*24*60*60*1000);
  const minDate=minCreated;
  const minEndByThreeMonths=new Date(minDate.getTime()); minEndByThreeMonths.setMonth(minEndByThreeMonths.getMonth()+3);
  const endDate=maxDue>minEndByThreeMonths?maxDue:minEndByThreeMonths;
  const totalDays=Math.max(1,Math.ceil((endDate-minDate)/(1000*60*60*24)));
  const containerWidth=Math.max(720,totalDays*4);
  const monthTicks=[];
  const monthCursor=new Date(minDate.getFullYear(),minDate.getMonth(),1);
  const monthEnd=new Date(endDate.getFullYear(),endDate.getMonth()+1,1);
  while(monthCursor<=monthEnd){
    monthTicks.push(new Date(monthCursor));
    monthCursor.setMonth(monthCursor.getMonth()+1);
  }

  if(loading) return <Spinner C={C}/>;

  return (
    <div className="fadein">
      <h2 className="page-heading" style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text,marginBottom:"1.4rem"}}>Goals</h2>

      <div style={{position:"relative",display:"flex",background:C.bg,borderRadius:10,padding:3,marginBottom:18,border:`1px solid ${C.border}`,maxWidth:420}}>
        <div style={{position:"absolute",top:3,bottom:3,left:view==="list"?"3px":view==="roadmap"?"calc(33.333% + 1px)":"calc(66.666% + 0px)",width:"calc(33.333% - 4px)",borderRadius:8,background:C.accent,transition:"all 0.2s ease"}}/>
        {["list","roadmap","board"].map(v=>(
          <button key={v} onClick={()=>setView(v)} style={{position:"relative",zIndex:1,flex:1,border:"none",borderRadius:8,padding:"9px 0",fontSize:13,fontWeight:500,background:"transparent",color:view===v?C.onAccent:C.muted,cursor:"pointer"}}>
            {v==="list"?"List":v==="roadmap"?"Roadmap":"Board"}
          </button>
        ))}
      </div>

      {view==="list"&&(
        <>
          {!showAddForm?(
            <button onClick={()=>setShowAddForm(true)} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 16px",fontSize:14,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer",marginBottom:"1rem"}}>+ Add goal</button>
          ):(
            <div style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:14}}>
              <input value={newGoalForm.title} onChange={e=>setNewGoalForm(f=>({...f,title:e.target.value}))} placeholder="Goal name"
                style={{width:"100%",height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,background:C.inputBg,color:C.text,marginBottom:10}}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
                <label style={{fontSize:12,color:C.muted}}>Status
                  <select value={newGoalForm.status} onChange={e=>setNewGoalForm(f=>({...f,status:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Priority
                  <select value={newGoalForm.priority} onChange={e=>setNewGoalForm(f=>({...f,priority:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    {PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Due date
                  <input type="date" value={newGoalForm.due_date} onChange={e=>setNewGoalForm(f=>({...f,due_date:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}/>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Link habit
                  <select value={newGoalForm.linked_habit_id} onChange={e=>setNewGoalForm(f=>({...f,linked_habit_id:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    <option value="">None</option>
                    {(habits||[]).map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </label>
              </div>
              <div style={{marginTop:10,fontSize:12,color:C.muted}}>Color</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6,marginBottom:10}}>
                {GOAL_COLORS.map(color=>(
                  <button key={color} onClick={()=>setNewGoalForm(f=>({...f,color}))} style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${newGoalForm.color===color?C.text:C.border}`,background:color,cursor:"pointer"}}/>
                ))}
              </div>
              <textarea rows={3} value={newGoalForm.note} onChange={e=>setNewGoalForm(f=>({...f,note:e.target.value}))} placeholder="Note"
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,color:C.text,background:C.inputBg,lineHeight:1.5,marginBottom:10}}/>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <button onClick={()=>setShowAddForm(false)} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",fontSize:13,background:C.inputBg,color:C.muted,cursor:"pointer"}}>Cancel</button>
                <button onClick={addGoal} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"9px 14px",fontSize:13,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer"}}>Add goal</button>
              </div>
            </div>
          )}

          <label style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:13,color:C.muted,marginBottom:"1rem",cursor:"pointer"}}>
            <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} style={{width:22,height:22}}/>
            Show archived
          </label>

          {activeGoals.length===0&&<EmptyState C={C} title="No goals yet" message="Break your ambitions into goals and small subtasks."/>}
          {activeGoals.map(g=>{
            const {items,done,pct}=goalProgress(g.id);
            const isOpen=!!expanded[g.id];
            const status=statusById[g.status]||statusById.not_started;
            const priority=priorityById[g.priority]||priorityById.medium;
            const linkedHabit=habitsById[g.linked_habit_id];
            return (
              <div key={g.id} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12,boxShadow:`inset 5px 0 0 ${g.color||GOAL_COLORS[0]}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  {editingGoalId===g.id?(
                    <input value={editingGoalVal} autoFocus onChange={e=>setEditingGoalVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") saveGoalEdit(g.id); if(e.key==="Escape"){setEditingGoalId(null);setEditingGoalVal("");}}} onBlur={()=>saveGoalEdit(g.id)}
                      style={{flex:1,minWidth:160,height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:15,fontWeight:500,background:C.inputBg,color:C.text}}/>
                  ):(
                    <span onClick={()=>startGoalEdit(g)} style={{flex:1,fontSize:15,fontWeight:500,color:C.text,cursor:"text"}}>{g.title}</span>
                  )}
                  <span style={{fontSize:12,color:status.color,background:`${status.color}1A`,border:`1px solid ${status.color}55`,borderRadius:999,padding:"3px 10px"}}>{status.label}</span>
                  <span style={{fontSize:12,color:priority.color,background:`${priority.color}1A`,border:`1px solid ${priority.color}55`,borderRadius:999,padding:"3px 10px"}}>{priority.label}</span>
                  {g.due_date&&<span style={{fontSize:12,color:isOverdue(g.due_date)?C.danger:C.muted}}>Due {fmtDue(g.due_date)}</span>}
                  {linkedHabit&&<span style={{fontSize:12,color:C.accent,border:`1px solid ${C.accent}55`,background:C.hoverBg,borderRadius:999,padding:"3px 10px"}}>🔗 {linkedHabit.name}</span>}
                  <button onClick={()=>setExpanded(e=>({...e,[g.id]:!e[g.id]}))} style={{width:32,height:32,fontSize:11,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>{isOpen?"▲":"▼"}</button>
                  {pct===100&&<button onClick={()=>updateGoal(g.id,{archived:true})} style={{fontSize:12,color:C.accent,background:C.inputBg,border:`1px solid ${C.accent}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Archive</button>}
                  <button onClick={()=>delGoal(g.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                </div>
                <div style={{height:8,borderRadius:999,background:C.border,overflow:"hidden",marginBottom:isOpen?12:0}}><div style={{height:"100%",width:`${pct}%`,background:pct===100?C.done:(g.color||C.accent),borderRadius:999,transition:"width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"}}/></div>
                {isOpen&&(
                  <div style={{borderTop:`1px solid ${C.rowDivider}`,paddingTop:12}}>
                    {g.note&&<p style={{fontSize:12,color:C.muted,marginBottom:8}}>{g.note}</p>}
                    {items.map(s=>(
                      <div key={s.id} style={{padding:"6px 0"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div onClick={()=>toggleSub(s)} aria-label={`Mark ${s.title} as ${s.done?"incomplete":"complete"}`} role="button" style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.8px solid ${s.done?C.done:C.border}`,background:s.done?C.done:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {s.done&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3L3.5 6L8 1" stroke={C.onAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          {editingSubId===s.id?(
                            <input value={editingSubVal} autoFocus onChange={e=>setEditingSubVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") saveSubEdit(s.id); if(e.key==="Escape"){setEditingSubId(null);setEditingSubVal("");}}} onBlur={()=>saveSubEdit(s.id)}
                              style={{flex:1,minWidth:120,height:34,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,background:C.inputBg,color:C.text}}/>
                          ):(
                            <span onClick={()=>startSubEdit(s)} style={{flex:1,fontSize:13,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none",opacity:s.done?0.6:1,cursor:"text"}}>{s.title}</span>
                          )}
                          <input type="date" value={s.due_date||""} onChange={e=>updateSub(s.id,{due_date:e.target.value||null})} style={{height:30,border:`1px solid ${C.border}`,borderRadius:7,padding:"0 8px",fontSize:12,background:C.inputBg,color:s.due_date&&isOverdue(s.due_date)?C.danger:C.muted}}/>
                          <button onClick={()=>setOpenSubNote(n=>({...n,[s.id]:!n[s.id]}))} style={{width:28,height:28,fontSize:13,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>💬</button>
                          <button onClick={()=>delSub(s.id)} style={{width:28,height:28,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                        </div>
                        {openSubNote[s.id]&&(
                          <textarea rows={2} value={s.note||""} onChange={e=>updateSub(s.id,{note:e.target.value})} placeholder="Subtask note..."
                            style={{marginTop:6,marginLeft:30,width:"calc(100% - 30px)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.text,background:C.inputBg,lineHeight:1.4}}/>
                        )}
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <input value={newSub[g.id]||""} onChange={e=>setNewSub(n=>({...n,[g.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSub(g.id)}
                        placeholder="Add sub-task..." style={{flex:1,height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,background:C.inputBg,color:C.text}}/>
                      <button onClick={()=>addSub(g.id)} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:500,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Add</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {showArchived&&archivedGoals.length>0&&(
            <div style={{marginTop:"2rem"}}>
              <div className="section-label" style={{color:C.faint,marginBottom:8}}>Archived</div>
              {archivedGoals.map(g=>{
                const {pct}=goalProgress(g.id);
                return (
                  <div key={g.id} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:12,opacity:0.75}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{flex:1,fontSize:14,fontWeight:500,color:C.text}}>{g.title}</span>
                      <span style={{fontSize:12,color:C.muted}}>{pct}%</span>
                      <button onClick={()=>updateGoal(g.id,{archived:false})} style={{fontSize:12,color:C.accent,background:C.inputBg,border:`1px solid ${C.accent}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Unarchive</button>
                      <button onClick={()=>delGoal(g.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view==="roadmap"&&(
        <div style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 16px",overflowX:"auto"}}>
          {roadmapGoals.length===0?(
            <EmptyState C={C} title="No goals yet" message="Add goals to see your roadmap."/>
          ):(
            <div style={{minWidth:containerWidth+180}}>
              <div style={{position:"relative",height:34,marginLeft:160,borderBottom:`1px solid ${C.border}`}}>
                {monthTicks.map((m,i)=>{
                  const x=getRoadmapPosition(m,minDate,totalDays,containerWidth);
                  return <div key={i} style={{position:"absolute",left:x,fontSize:12,color:C.muted,transform:"translateX(-50%)"}}>{m.toLocaleDateString("en-NL",{month:"short"})}</div>;
                })}
              </div>
              <div style={{position:"relative",width:containerWidth,height:roadmapGoals.length*40,marginLeft:160}}>
                <div style={{position:"absolute",left:Math.max(0,Math.min(containerWidth,getRoadmapPosition(new Date(),minDate,totalDays,containerWidth))),top:0,bottom:0,width:2,background:C.danger,opacity:0.8}}/>
                {roadmapGoals.map((g,i)=>{
                  const rowTop=i*40+4;
                  const start=getRoadmapPosition(g.created_at,minDate,totalDays,containerWidth);
                  const due=g.due_date?new Date(g.due_date):null;
                  const end=due?getRoadmapPosition(due,minDate,totalDays,containerWidth):containerWidth;
                  const barWidth=Math.max(26,end-start);
                  const status=statusById[g.status]||statusById.not_started;
                  return (
                    <div key={g.id}>
                      <div style={{position:"absolute",left:-152,top:rowTop+6,width:145,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</div>
                      <div style={{position:"absolute",left:start,top:rowTop,width:barWidth,height:32,borderRadius:8,background:g.color||C.accent,border:due?"none":`1px dashed ${C.faint}`,display:"flex",alignItems:"center",padding:"0 10px",color:"#fff",fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:status.color,marginRight:8,flexShrink:0}}/>
                        {barWidth>120?g.title:""}
                      </div>
                      {barWidth<=120&&<div style={{position:"absolute",left:start+barWidth+6,top:rowTop+8,fontSize:12,color:C.text}}>{g.title}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {view==="board"&&(
        <div style={{display:"grid",gap:12,gridTemplateColumns:isMobile?"1fr":"repeat(4,minmax(0,1fr))"}}>
          {STATUSES.map(s=>{
            const items=activeGoals.filter(g=>(g.status||"not_started")===s.id);
            return (
              <div key={s.id} onDragOver={e=>{if(!isMobile) e.preventDefault();}} onDrop={async()=>{if(!isMobile&&dragGoalId){setGoals(gs=>gs.map(g=>g.id===dragGoalId?{...g,status:s.id}:g)); await sb.from("goals").update({status:s.id}).eq("id",dragGoalId); setDragGoalId(null);}}}
                style={{background:`${s.color}1A`,border:`1px solid ${C.border}`,borderRadius:12,padding:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{s.label}</span>
                  <span style={{fontSize:12,color:C.muted}}>{items.length}</span>
                </div>
                {items.map(g=>{
                  const {items:subItems,done,pct}=goalProgress(g.id);
                  const priority=priorityById[g.priority]||priorityById.medium;
                  return (
                    <div key={g.id} draggable={!isMobile} onDragStart={()=>setDragGoalId(g.id)} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 10px 9px",marginBottom:8,boxShadow:`inset 0 4px 0 ${g.color||GOAL_COLORS[0]}`,cursor:isMobile?"default":"grab"}}>
                      <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:7}}>{g.title}</div>
                      <div style={{height:6,borderRadius:999,background:C.border,overflow:"hidden",marginBottom:7}}><div style={{height:"100%",width:`${pct}%`,background:g.color||C.accent}}/></div>
                      <div style={{display:"flex",justifyContent:"space-between",gap:6,fontSize:11,color:C.muted,marginBottom:6}}>
                        <span style={{color:priority.color}}>{priority.label}</span>
                        <span style={{color:g.due_date&&isOverdue(g.due_date)?C.danger:C.muted}}>{g.due_date?fmtDue(g.due_date):"No due"}</span>
                      </div>
                      <div style={{fontSize:11,color:C.muted}}>{done}/{subItems.length||0} subtasks</div>
                      {isMobile&&(
                        <select value={g.status||"not_started"} onChange={e=>updateGoal(g.id,{status:e.target.value})} style={{marginTop:6,width:"100%",height:30,border:`1px solid ${C.border}`,borderRadius:7,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}>
                          {STATUSES.map(opt=><option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── NOTES ── */
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
              <div key={n.id} onClick={()=>openNote(n.id)} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
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

/* ── OVERVIEW ── */
function OverviewPage({habits,completions,userId,C}) {
  const days=last90();
  const YEAR_LABEL_INTERVAL=10;
  const lifeWeeksGridWidth=(WEEKS_PER_YEAR*LIFE_WEEK_CELL_PX)+((WEEKS_PER_YEAR-1)*LIFE_WEEK_GAP_PX);
  const lifeWeeksGridHeight=(LIFE_YEARS*LIFE_WEEK_CELL_PX)+((LIFE_YEARS-1)*LIFE_WEEK_GAP_PX);
  const [profileLoading,setProfileLoading]=useState(true);
  const [birthDate,setBirthDate]=useState("");
  const [birthDateInput,setBirthDateInput]=useState("");
  const [editingBirthDate,setEditingBirthDate]=useState(false);
  const [savingBirthDate,setSavingBirthDate]=useState(false);
  const [birthDateError,setBirthDateError]=useState("");

  useEffect(()=>{
    let active=true;
    if(!userId){setProfileLoading(false);return;}
    (async()=>{
      setProfileLoading(true);
      const {data,error}=await sb.from("profiles").select("birth_date").eq("id",userId).maybeSingle();
      if(error && error.code!=="PGRST116") console.error("profile fetch error:",error);
      if(!active) return;
      const nextBirthDate=data?.birth_date||"";
      setBirthDate(nextBirthDate);
      setBirthDateInput(nextBirthDate);
      setEditingBirthDate(!nextBirthDate);
      setProfileLoading(false);
    })();
    return ()=>{active=false;};
  },[userId]);

  const saveBirthDate=async()=>{
    if(!birthDateInput){setBirthDateError("Please choose a date.");return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(birthDateInput)){setBirthDateError("Please enter a valid date.");return;}
    const [year,month,day]=birthDateInput.split("-").map(Number);
    const parsedBirthDate=new Date(Date.UTC(year,month-1,day));
    const now=new Date();
    const todayUtcTimestamp=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
    if(Number.isNaN(parsedBirthDate.getTime())||parsedBirthDate.getTime()>todayUtcTimestamp){setBirthDateError("Please enter a valid past date.");return;}
    setBirthDateError("");
    setSavingBirthDate(true);
    const {error}=await sb.from("profiles").upsert({id:userId,birth_date:birthDateInput});
    if(error){setBirthDateError("Could not save date. Try again.");setSavingBirthDate(false);return;}
    setBirthDate(birthDateInput);
    setEditingBirthDate(false);
    setSavingBirthDate(false);
  };

  const weekIndex=getWeekIndex(birthDate);
  const weeksLived=weekIndex;
  const weeksLeft=Math.max(0,TOTAL_WEEKS-weekIndex);
  const age=Math.floor(weeksLived/WEEKS_PER_YEAR);
  const globalStreak=useMemo(()=>{
    if(!habits.length) return 0; let s=0; const d=new Date();
    while(true){ const k=d.toISOString().slice(0,10); if(habits.every(h=>completions.find(c=>c.habit_id===h.id&&c.date===k))){s++;d.setDate(d.getDate()-1);}else break; } return s;
  },[habits,completions]);
  const totalDone=completions.filter(c=>days.includes(c.date)).length;
  const heatFills=C.heat;
  return (
    <div className="fadein">
      <h2 className="page-heading" style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text,marginBottom:"2.2rem"}}>Overview</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:"2.2rem"}}>
        {[{label:"Global streak",value:`${globalStreak}d`},{label:"Total habits",value:habits.length},{label:"Done (90d)",value:totalDone}].map(s=>(
          <div key={s.label} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px"}}>
            <div className="section-label" style={{color:C.faint,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:500,color:C.accent}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:"2rem"}}>
        <div className="section-label" style={{color:C.faint,marginBottom:10}}>Streaks</div>
        {habits.map(h=>{
          const streak=computeStreak(h.id,completions); const longest=computeLongest(h.id,completions);
          const pct=longest?Math.round((streak/longest)*100):0;
          return (
            <div key={h.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{color:C.text,fontWeight:500}}>{h.name}</span>
                <span style={{color:C.muted}}>{streak}d <span style={{color:C.faint}}>/ best {longest}d</span></span>
              </div>
              <div style={{height:8,borderRadius:999,background:C.border,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:streak===longest&&longest>0?C.done:C.accent,borderRadius:999,transition:"width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"}}/>
              </div>
            </div>
          );
        })}
        {habits.length===0&&<EmptyState C={C} title="Nothing to show yet" message="Complete habits to unlock streaks and trends."/>}
      </div>
      <div>
        <div className="section-label" style={{color:C.faint,marginBottom:10}}>90-day heatmap</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {days.map(d=>{
            const count=completions.filter(c=>c.date===d).length;
            const level=count===0?0:count<2?1:count<habits.length*0.5?2:count<habits.length?3:4;
            return <div key={d} title={`${d} · ${count} completions`} className="heat-cell" style={{width:13,height:13,borderRadius:4,background:heatFills[level],flexShrink:0}}/>;
          })}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:8}}>
          <span style={{fontSize:11,color:C.faint}}>Lower activity</span>
          {heatFills.map((f,i)=><div key={i} style={{width:11,height:11,borderRadius:3,background:f}}/>)}
          <span style={{fontSize:11,color:C.faint}}>Higher activity</span>
        </div>
      </div>

      <div style={{marginTop:"2rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div className="section-label" style={{color:C.faint}}>Your life in weeks</div>
          {!!birthDate && !editingBirthDate && (
            <button onClick={()=>setEditingBirthDate(true)} style={{border:"none",background:"transparent",padding:0,fontSize:12,color:C.accent,cursor:"pointer",textDecoration:"underline"}}>
              edit
            </button>
          )}
        </div>
        <p style={{fontSize:12,color:C.muted,marginBottom:12}}>A full-life view: 90 years × 52 weeks.</p>

        {profileLoading ? (
          <div className="life-weeks-skeleton" style={{height:lifeWeeksGridHeight,width:"100%",maxWidth:lifeWeeksGridWidth,borderRadius:12,border:`1px solid ${C.border}`,background:C.surface}}/>
        ) : editingBirthDate ? (
          <div style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10,maxWidth:420}}>
            <p style={{fontSize:13,color:C.text,marginBottom:10}}>Enter your date of birth to see your weeks of life</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input type="date" value={birthDateInput} onChange={e=>setBirthDateInput(e.target.value)}
                style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:13,background:C.inputBg,color:C.text}}/>
              <button onClick={saveBirthDate} disabled={savingBirthDate} style={{height:38,border:`1px solid ${C.accent}`,borderRadius:8,padding:"0 14px",fontSize:13,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer",opacity:savingBirthDate?0.7:1}}>
                {savingBirthDate?"Saving...":"Save"}
              </button>
            </div>
            {!!birthDateError&&<p style={{fontSize:12,color:C.danger,marginTop:8}}>{birthDateError}</p>}
          </div>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginBottom:12}}>
              {[{label:"Age",value:age.toLocaleString()},{label:"Weeks lived",value:weeksLived.toLocaleString()},{label:"Weeks left",value:weeksLeft.toLocaleString()}].map(s=>(
                <div key={s.label} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
                  <div className="section-label" style={{color:C.faint,marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:20,fontWeight:500,color:C.accent}}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="life-weeks-scroll">
              <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:lifeWeeksGridWidth}}>
                {Array.from({length:LIFE_YEARS},(_,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div className="life-week-year-label" style={{width:18,fontSize:10,color:C.faint,textAlign:"right"}}>{i%YEAR_LABEL_INTERVAL===0?getYearLabel(i):""}</div>
                    <div className="life-weeks-grid-row">
                      {Array.from({length:WEEKS_PER_YEAR},(_,j)=>{
                        const idx=i*WEEKS_PER_YEAR+j;
                        const isCurrent=weekIndex<TOTAL_WEEKS&&idx===weekIndex;
                        const isLived=idx<weekIndex;
                        return (
                          <div key={idx} className={`life-week-cell ${isCurrent?"life-week-current":""} ${isLived?"life-week-lived":""}`} style={{background:isCurrent?C.accent:(isLived?C.accent:C.border)}}/>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
