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

  const inp={width:"100%",height:42,marginBottom:12};

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
    <div style={{minHeight:"100vh",background:C.bgGradient||C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem"}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div className="glass-card fadein" style={{padding:36,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
          <h1 style={{fontSize:32,fontWeight:600,color:C.accent,letterSpacing:"-0.03em",marginBottom:6}}>🔺 Cones</h1>
          <p style={{fontSize:14,color:C.muted,marginBottom:24}}>Stay consistent, one day at a time.</p>
          <div className="glass-card-sm" style={{position:"relative",display:"flex",borderRadius:10,padding:3,marginBottom:22}}>
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
          <button className="btn-primary" onClick={submit} disabled={loading} style={{width:"100%",opacity:loading?0.7:1}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
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
        const linkedLabel=`${linkedCount} linked goal${linkedCount===1?"":"s"}`;
        const linkedBadgeText=`🔗 ${linkedCount}${pingCount>0?` +${pingCount}`:""}`;
        return (
          <div key={h.id} className="glass-card card-hover" style={{background:done?C.successBg:C.cardBg,border:`1px solid ${done?C.done:(C.cardBorder||C.border)}`,borderRadius:16,padding:"18px 20px",marginBottom:12,position:"relative",transition:"all 0.3s ease",boxShadow:`inset 5px 0 0 ${tagAccentColor}, ${C.cardShadow}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>toggle(h.id)} aria-label={`Mark ${h.name} as ${done?"incomplete":"complete"}`} role="button" style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.8px solid ${done?C.done:C.border}`,background:done?C.done:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",transform:done?"scale(1.06)":"scale(1)"}}>
                {done&&<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{fontSize:14,fontWeight:400,flex:1,color:done?C.done:C.text,textDecoration:done?"line-through":"none",opacity:done?0.76:1,transition:"all 0.3s ease"}}>{h.name}</span>
              {h.tag&&<TagPill tag={h.tag} C={C}/>}
              {linkedCount>0&&<span title={linkedLabel} style={{fontSize:12,fontWeight:500,color:C.accent,border:`1px solid ${C.accent}55`,background:C.hoverBg,borderRadius:999,padding:"3px 10px",flexShrink:0}}>{linkedBadgeText}</span>}
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
          <div className="progress-track" style={{background:C.borderSolid||C.border}}>
            <div className={`progress-fill ${pct===100?"done":""}`} style={{width:`${pct}%`,background:pct===100?undefined:(`linear-gradient(90deg, ${C.accent}, ${C.accentLight||C.accent})`),animation:pct===100?"progressPulse 0.8s ease 1":"none"}}/>
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
                <div key={h.id} className="glass-card card-hover" draggable={true} onDragStart={()=>setDragId(h.id)} onDragOver={e=>{e.preventDefault();setDragOverId(h.id);}} onDragLeave={()=>dragOverId===h.id&&setDragOverId(null)} onDrop={e=>{e.preventDefault();onDrop(h.id);}} onDragEnd={()=>{setDragId(null);setDragOverId(null);}} style={{display:"flex",alignItems:"center",gap:10,background:C.cardBg,border:`1px solid ${dragOverId===h.id?C.accent:(C.cardBorder||C.border)}`,borderRadius:16,padding:"15px 16px",marginBottom:8,boxShadow:`inset 5px 0 0 ${tagTheme.color}, ${C.cardShadow}`}}>
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
function GoalsPage({userId,habits,completions,onViewChange,C}) {
  const MS_PER_DAY=1000*60*60*24;
  const MOBILE_QUERY="(max-width: 639px)";
  const ZOOM_LEVELS={
    week:{days:28,cellWidth:40},
    month:{days:90,cellWidth:14},
    quarter:{days:180,cellWidth:7},
  };
  const [goals,setGoals]=useState([]);
  const [subs,setSubs]=useState([]);
  const [milestones,setMilestones]=useState([]);
  const [loading,setLoading]=useState(true);
  const [newSub,setNewSub]=useState({});
  const [expanded,setExpanded]=useState({});
  const [roadmapExpanded,setRoadmapExpanded]=useState({});
  const [showArchived,setShowArchived]=useState(false);
  const [view,setView]=useState("list");
  const [showAddForm,setShowAddForm]=useState(false);
  const [editingGoalId,setEditingGoalId]=useState(null);
  const [editingGoalVal,setEditingGoalVal]=useState("");
  const [editingSubId,setEditingSubId]=useState(null);
  const [editingSubVal,setEditingSubVal]=useState("");
  const [openSubNote,setOpenSubNote]=useState({});
  const [openSubDates,setOpenSubDates]=useState({});
  const [openColorId,setOpenColorId]=useState(null);
  const [dragGoalId,setDragGoalId]=useState(null);
  const [boardDraggingId,setBoardDraggingId]=useState(null);
  const [isMobile,setIsMobile]=useState(()=>window.matchMedia(MOBILE_QUERY).matches);
  const [selectedGoalId,setSelectedGoalId]=useState(null);
  const [zoomLevel,setZoomLevel]=useState("month");
  const [toast,setToast]=useState("");
  const [promoteMsg,setPromoteMsg]=useState("");
  const [newMilestone,setNewMilestone]=useState({});
  const [editingMilestoneId,setEditingMilestoneId]=useState(null);
  const [milestoneEdit,setMilestoneEdit]=useState({title:"",date:""});
  const [newGoalSubtasks,setNewGoalSubtasks]=useState([]);
  const panelRef=useRef(null);
  const goalNoteTimers=useRef({});
  const subNoteTimers=useRef({});
  const goalPatchTimers=useRef({});
  const seenCompletionIds=useRef(new Set());
  const [newGoalForm,setNewGoalForm]=useState({
    title:"",
    status:"not_started",
    priority:"medium",
    color:GOAL_COLORS[0],
    start_date:"",
    due_date:"",
    description:"",
    effort:0,
    tag:"Other",
    manual_progress:-1,
    pinned:false,
    depends_on:"",
    template:false,
    linked_habit_id:"",
    note:"",
  });

  useEffect(()=>{(async()=>{
    const [{data:g},{data:s},{data:m}]=await Promise.all([
      sb.from("goals").select("*").eq("user_id",userId).order("created_at"),
      sb.from("subtasks").select("*").eq("user_id",userId),
      sb.from("milestones").select("*").eq("user_id",userId),
    ]);
    const nextGoals=g||[];
    setGoals(nextGoals);
    setSubs(s||[]);
    setMilestones(m||[]);
    const desktopDefault=!window.matchMedia(MOBILE_QUERY).matches;
    const defaultExpanded=Object.fromEntries(nextGoals.map(goal=>[goal.id,desktopDefault]));
    setExpanded(defaultExpanded);
    setRoadmapExpanded(prev=>Object.keys(prev).length?prev:Object.fromEntries(nextGoals.map(goal=>[goal.id,true])));
    setLoading(false);
  })();},[userId]);

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.matchMedia(MOBILE_QUERY).matches);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  useEffect(()=>{
    if(!selectedGoalId) return;
    const onDown=(e)=>{
      if(panelRef.current && !panelRef.current.contains(e.target)) setSelectedGoalId(null);
    };
    window.addEventListener("mousedown",onDown);
    return ()=>window.removeEventListener("mousedown",onDown);
  },[selectedGoalId]);

  useEffect(()=>{
    if(!toast) return;
    const t=setTimeout(()=>setToast(""),2200);
    return ()=>clearTimeout(t);
  },[toast]);

  useEffect(()=>{
    if(!promoteMsg) return;
    const t=setTimeout(()=>setPromoteMsg(""),3000);
    return ()=>clearTimeout(t);
  },[promoteMsg]);

  useEffect(()=>{
    if(onViewChange) onViewChange(view);
  },[view,onViewChange]);

  const statusById=Object.fromEntries(STATUSES.map(s=>[s.id,s]));
  const priorityById=Object.fromEntries(PRIORITIES.map(p=>[p.id,p]));
  const effortByValue=Object.fromEntries(EFFORT_LABELS.map(e=>[e.value,e.label]));
  const habitsById=Object.fromEntries((habits||[]).map(h=>[h.id,h]));
  const activeGoals=goals.filter(g=>!g.archived);
  const archivedGoals=goals.filter(g=>g.archived);
  const selectedGoal=activeGoals.find(g=>g.id===selectedGoalId)||null;
  const isOverdue=(d)=>!!d&&d<todayKey();
  const formatDueDate=(d)=>d?new Date(`${d}T00:00:00`).toLocaleDateString("nl-NL",{month:"short",day:"numeric"}):"";
  const formatDateRange=(start,end)=>{
    if(start&&end) return `${formatDueDate(start)} → ${formatDueDate(end)}`;
    if(end) return `End ${formatDueDate(end)}`;
    if(start) return `Start ${formatDueDate(start)}`;
    return "No dates";
  };
  const isValidDateRange=(start,end)=>!start||!end||start<=end;
  const cardStyle={
    background:C.cardBg,
    border:`1px solid ${C.cardBorder||C.border}`,
    boxShadow:C.cardShadow,
    backdropFilter:"blur(12px)",
    WebkitBackdropFilter:"blur(12px)",
    borderRadius:16,
  };
  const goalById=Object.fromEntries(goals.map(g=>[g.id,g]));
  const depGoal=(goal)=>goal?.depends_on?goalById[goal.depends_on]:null;
  const depBlocked=(goal)=>{
    const dep=depGoal(goal);
    return !!(dep && dep.status!=="done" && !dep.archived);
  };
  const goalTagTheme=(tag)=>{
    const fallback=GOAL_TAGS.find(t=>t.label==="Other")||GOAL_TAGS[GOAL_TAGS.length-1];
    return GOAL_TAGS.find(t=>t.label===tag)||fallback;
  };
  const goalSubs=(goalId)=>subs.filter(s=>s.goal_id===goalId);
  const goalMilestones=(goalId)=>milestones.filter(m=>m.goal_id===goalId);
  const goalProgress=(goalId)=>{
    const items=goalSubs(goalId);
    const done=items.filter(s=>s.done).length;
    const pct=items.length?Math.round((done/items.length)*100):0;
    return {items,done,pct};
  };
  const effectiveProgress=(goal)=>{
    if((goal.manual_progress??-1)>=0) return Math.max(0,Math.min(100,goal.manual_progress));
    return goalProgress(goal.id).pct;
  };
  const sortedActiveGoals=[
    ...activeGoals.filter(g=>g.pinned),
    ...activeGoals.filter(g=>!g.pinned),
  ];
  const groupedActiveGoals=GOAL_TAGS.map(tag=>({
    tag:tag.label,
    theme:tag,
    items:sortedActiveGoals.filter(g=>(g.tag||"Other")===tag.label),
  })).filter(group=>group.items.length);
  const today=useMemo(()=>todayKey(),[]);
  const todayCompletions=useMemo(()=> (completions||[]).filter(c=>c.date===today),[completions,today]);
  const todayHabitIds=useMemo(()=>new Set(todayCompletions.map(c=>c.habit_id)),[todayCompletions]);
  const isHabitDoneToday=(habitId)=>!!(habitId&&todayHabitIds.has(habitId));

  useEffect(()=>{
    const linkedGoals=activeGoals.filter(g=>g.linked_habit_id);
    if(!linkedGoals.length) return;
    const linkedHabitIds=new Set(linkedGoals.map(g=>g.linked_habit_id));
    const nextMessage=todayCompletions.find(c=>!seenCompletionIds.current.has(c.id)&&linkedHabitIds.has(c.habit_id));
    if(!nextMessage) return;
    seenCompletionIds.current.add(nextMessage.id);
    const linkedGoal=linkedGoals.find(g=>g.linked_habit_id===nextMessage.habit_id);
    if(linkedGoal){
      const linkedHabit=habitsById[linkedGoal.linked_habit_id];
      setToast(`${linkedHabit?.name||"Unknown habit"} completed → Goal: ${linkedGoal.title} ↑`);
    }
  },[todayCompletions,activeGoals,habitsById]);

  const updateGoal=async(id,patch)=>{
    setGoals(g=>g.map(x=>x.id===id?{...x,...patch}:x));
    await sb.from("goals").update(patch).eq("id",id);
  };
  const updateSub=async(id,patch)=>{
    setSubs(s=>s.map(x=>x.id===id?{...x,...patch}:x));
    await sb.from("subtasks").update(patch).eq("id",id);
  };
  const updateGoalDebounced=(id,patch)=>{
    setGoals(g=>g.map(x=>x.id===id?{...x,...patch}:x));
    clearTimeout(goalPatchTimers.current[id]);
    goalPatchTimers.current[id]=setTimeout(async()=>{
      await sb.from("goals").update(patch).eq("id",id);
    },600);
  };
  const updateGoalNote=(id,note)=>{
    setGoals(g=>g.map(x=>x.id===id?{...x,note}:x));
    clearTimeout(goalNoteTimers.current[id]);
    goalNoteTimers.current[id]=setTimeout(async()=>{
      await sb.from("goals").update({note}).eq("id",id);
    },600);
  };
  const updateSubNote=(id,note)=>{
    setSubs(s=>s.map(x=>x.id===id?{...x,note}:x));
    clearTimeout(subNoteTimers.current[id]);
    subNoteTimers.current[id]=setTimeout(async()=>{
      await sb.from("subtasks").update({note}).eq("id",id);
    },600);
  };

  const addGoal=async()=>{
    const title=newGoalForm.title.trim();
    if(!title) return;
    if(!isValidDateRange(newGoalForm.start_date,newGoalForm.due_date)) return;
    const id=Date.now().toString();
    const payload={
      id,title,user_id:userId,archived:false,
      status:newGoalForm.status||"not_started",
      priority:newGoalForm.priority||"medium",
      color:newGoalForm.color||GOAL_COLORS[0],
      start_date:newGoalForm.start_date||null,
      due_date:newGoalForm.due_date||null,
      description:newGoalForm.description||"",
      effort:Number(newGoalForm.effort||0),
      tag:newGoalForm.tag||"Other",
      manual_progress:Number(newGoalForm.manual_progress??-1),
      pinned:!!newGoalForm.pinned,
      depends_on:newGoalForm.depends_on||null,
      template:!!newGoalForm.template,
      linked_habit_id:newGoalForm.linked_habit_id||null,
      note:newGoalForm.note||"",
    };
    const {data}=await sb.from("goals").insert(payload).select().single();
    if(data){
      setGoals(g=>[...g,data]);
      if(newGoalSubtasks.length){
        const subPayloads=newGoalSubtasks.map((title,idx)=>({
          id:`${id}_${Date.now()}_${idx}`,
          goal_id:id,
          title,
          done:false,
          user_id:userId,
          due_date:null,
          start_date:null,
          assignee:"",
          note:"",
        }));
        const {data:createdSubs}=await sb.from("subtasks").insert(subPayloads).select("*");
        if(createdSubs?.length) setSubs(s=>[...s,...createdSubs]);
      }
      setExpanded(e=>({...e,[id]:!isMobile}));
      setRoadmapExpanded(e=>({...e,[id]:true}));
      setShowAddForm(false);
      setNewGoalSubtasks([]);
      setNewGoalForm({title:"",status:"not_started",priority:"medium",color:GOAL_COLORS[0],start_date:"",due_date:"",description:"",effort:0,tag:"Other",manual_progress:-1,pinned:false,depends_on:"",template:false,linked_habit_id:"",note:""});
    }
  };
  const delGoal=async(id)=>{
    await sb.from("goals").delete().eq("id",id);
    setGoals(g=>g.filter(x=>x.id!==id));
    setSubs(s=>s.filter(x=>x.goal_id!==id));
    if(selectedGoalId===id) setSelectedGoalId(null);
  };
  const addSub=async(goalId)=>{
    const title=(newSub[goalId]||"").trim();
    if(!title) return;
    const id=`${goalId}_${Date.now()}`;
    const {data}=await sb.from("subtasks").insert({id,goal_id:goalId,title,done:false,user_id:userId,due_date:null,start_date:null,assignee:"",note:""}).select().single();
    if(data) setSubs(s=>[...s,data]);
    setNewSub(n=>({...n,[goalId]:""}));
  };
  const toggleSub=async(s)=>updateSub(s.id,{done:!s.done});
  const delSub=async(id)=>{
    await sb.from("subtasks").delete().eq("id",id);
    setSubs(s=>s.filter(x=>x.id!==id));
  };
  const promoteSubToGoal=async(sub,parentGoal)=>{
    const id=Date.now().toString();
    const payload={
      id,
      title:sub.title,
      user_id:userId,
      status:"not_started",
      priority:"medium",
      color:parentGoal.color||GOAL_COLORS[0],
      start_date:sub.start_date||todayKey(),
      archived:false,
      description:"",
      effort:0,
      tag:parentGoal.tag||"Other",
      manual_progress:-1,
      pinned:false,
      depends_on:null,
      template:false,
      linked_habit_id:null,
      note:"",
    };
    const {data}=await sb.from("goals").insert(payload).select().single();
    if(data){
      setGoals(g=>[...g,data]);
      await delSub(sub.id);
      setPromoteMsg("Subtask promoted to goal ✓");
    }
  };
  const addMilestone=async(goalId)=>{
    const form=newMilestone[goalId]||{title:"",date:""};
    const title=(form.title||"").trim();
    const date=form.date||"";
    if(!title||!date) return;
    const id=`m_${Date.now()}`;
    const payload={id,goal_id:goalId,user_id:userId,title,date};
    const {data}=await sb.from("milestones").insert(payload).select().single();
    if(data){
      setMilestones(m=>[...m,data]);
      setNewMilestone(x=>({...x,[goalId]:{title:"",date:""}}));
    }
  };
  const startMilestoneEdit=(m)=>{
    setEditingMilestoneId(m.id);
    setMilestoneEdit({title:m.title||"",date:m.date||""});
  };
  const saveMilestoneEdit=async(id)=>{
    const title=(milestoneEdit.title||"").trim();
    const date=milestoneEdit.date||"";
    if(!title||!date){ setEditingMilestoneId(null); return; }
    setMilestones(list=>list.map(m=>m.id===id?{...m,title,date}:m));
    await sb.from("milestones").update({title,date}).eq("id",id);
    setEditingMilestoneId(null);
  };
  const deleteMilestone=async(id)=>{
    await sb.from("milestones").delete().eq("id",id);
    setMilestones(list=>list.filter(m=>m.id!==id));
  };
  const applyTemplate=(tpl)=>{
    setNewGoalForm(f=>({
      ...f,
      title:tpl.name||"",
      description:tpl.description||"",
      color:tpl.color||f.color,
      tag:tpl.tag||"Other",
      effort:Number(tpl.effort||0),
      template:true,
    }));
    setNewGoalSubtasks([...(tpl.subtasks||[])]);
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
    const dateTs=new Date(date).getTime();
    const minDateTs=new Date(minDate).getTime();
    const elapsedDays=(dateTs-minDateTs)/MS_PER_DAY;
    return (elapsedDays/totalDays)*containerWidth;
  };
  const roadmapGoals=activeGoals.filter(g=>g.start_date||g.due_date||goalSubs(g.id).some(s=>s.due_date||s.start_date)||goalMilestones(g.id).some(m=>m.date));
  const roadmapDueDates=roadmapGoals.flatMap(g=>[g.start_date,g.due_date,...goalSubs(g.id).map(s=>s.start_date),...goalSubs(g.id).map(s=>s.due_date),...goalMilestones(g.id).map(m=>m.date)]).filter(Boolean);
  const minCreatedTs=roadmapGoals.reduce((acc,g)=>{
    const base=g.start_date?new Date(`${g.start_date}T00:00:00`).getTime():new Date(g.created_at).getTime();
    return Math.min(acc,base);
  },Number.POSITIVE_INFINITY);
  const minCreated=Number.isFinite(minCreatedTs)?new Date(minCreatedTs):new Date();
  const maxDue=roadmapDueDates.length?new Date(Math.max(...roadmapDueDates.map(d=>new Date(d).getTime()))):new Date(minCreated.getTime()+90*MS_PER_DAY);
  const minDate=minCreated;
  const minDateTarget=new Date(minDate.getTime());
  minDateTarget.setDate(minDateTarget.getDate()+ZOOM_LEVELS[zoomLevel].days);
  const endDate=maxDue>minDateTarget?maxDue:minDateTarget;
  const totalDays=Math.max(1,Math.ceil((endDate-minDate)/MS_PER_DAY));
  const containerWidth=Math.max(720,totalDays*ZOOM_LEVELS[zoomLevel].cellWidth);
  const monthTicks=[];
  const weekTicks=[];
  const monthCursor=new Date(minDate.getFullYear(),minDate.getMonth(),1);
  const monthEnd=new Date(endDate.getFullYear(),endDate.getMonth()+1,1);
  while(monthCursor<=monthEnd){
    monthTicks.push(new Date(monthCursor));
    monthCursor.setMonth(monthCursor.getMonth()+1);
  }
  const weekCursor=new Date(minDate);
  while(weekCursor<=endDate){
    weekTicks.push(new Date(weekCursor));
    weekCursor.setDate(weekCursor.getDate()+7);
  }
  const todayPosition=Math.max(0,Math.min(containerWidth,getRoadmapPosition(new Date(),minDate,totalDays,containerWidth)));
  const tabLeftByView={list:"3px",roadmap:"calc(33.333% + 1px)",board:"calc(66.666% + 1px)"};
  const tabSliderLeft=tabLeftByView[view]||tabLeftByView.list;
  const handleBoardDrop=async(statusId)=>{
    if(isMobile||!dragGoalId) return;
    setGoals(gs=>gs.map(g=>g.id===dragGoalId?{...g,status:statusId}:g));
    await sb.from("goals").update({status:statusId}).eq("id",dragGoalId);
    setDragGoalId(null);
  };
  const getNextStatus=(statusId,dir)=>{
    const idx=Math.max(0,STATUSES.findIndex(s=>s.id===statusId));
    const next=(idx+dir+STATUSES.length)%STATUSES.length;
    return STATUSES[next].id;
  };
  const openAddFromColumn=(status)=>{ setView("list"); setShowAddForm(true); setNewGoalForm(f=>({...f,status})); };
  const roadmapLayout=roadmapGoals.reduce((acc,g)=>{
    const status=statusById[g.status]||statusById.not_started;
    const subItems=goalSubs(g.id);
    const goalStartDate=g.start_date?new Date(`${g.start_date}T00:00:00`):new Date(g.created_at);
    const start=getRoadmapPosition(goalStartDate,minDate,totalDays,containerWidth);
    const fallbackEnd=getRoadmapPosition(new Date(goalStartDate.getTime()+30*MS_PER_DAY),minDate,totalDays,containerWidth);
    const due=g.due_date?new Date(`${g.due_date}T00:00:00`):null;
    const end=due?getRoadmapPosition(due,minDate,totalDays,containerWidth):fallbackEnd;
    const barWidth=Math.max(28,end-start);
    const top=acc.top;
    acc.rows[g.id]={start,end,top:top+18,color:g.color||C.accent};
    acc.nodes.push(
      <div key={`goal_${g.id}`}>
        <button aria-label={roadmapExpanded[g.id]!==false?`Collapse ${g.title}`:`Expand ${g.title}`} onClick={()=>setRoadmapExpanded(e=>({...e,[g.id]:!e[g.id]}))} style={{position:"absolute",left:-184,top:top+9,width:18,height:18,background:"transparent",border:"none",cursor:"pointer",color:C.muted}}>{roadmapExpanded[g.id]!==false?"▼":"▶"}</button>
        <div style={{position:"absolute",left:-164,top:top+10,width:160,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</div>
        <button aria-label={`Goal ${g.title}, ${status.label}`} onClick={()=>setSelectedGoalId(g.id)} title={`${g.title} • ${formatDateRange(g.start_date,g.due_date)} • ${status.label} • Assignee note: ${g.note?getNotePreview(g.note):"none"}`} style={{position:"absolute",left:start,top,width:barWidth,height:36,borderRadius:999,background:g.color||C.accent,display:"flex",alignItems:"center",padding:"0 12px",color:"#fff",fontSize:12,fontWeight:600,overflow:"hidden",whiteSpace:"nowrap",border:"none",cursor:"pointer"}}>
          {g.title}
        </button>
        {goalMilestones(g.id).map(m=>{
          const x=getRoadmapPosition(new Date(`${m.date}T00:00:00`),minDate,totalDays,containerWidth);
          return (
            <div
              key={m.id}
              className="milestone-diamond"
              title={`${m.title} • ${formatDueDate(m.date)}`}
              onClick={()=>startMilestoneEdit(m)}
              style={{left:x-5,top:top+13,background:g.color||C.accent}}
            />
          );
        })}
      </div>
    );
    acc.top+=44;
    if(roadmapExpanded[g.id]!==false){
      subItems.forEach(s=>{
        const subStart=s.start_date?getRoadmapPosition(new Date(`${s.start_date}T00:00:00`),minDate,totalDays,containerWidth):start;
        const subEnd=s.due_date?getRoadmapPosition(new Date(`${s.due_date}T00:00:00`),minDate,totalDays,containerWidth):end;
        const subWidth=Math.max(18,subEnd-subStart);
        acc.nodes.push(
          <div key={`sub_${s.id}`}>
            <div aria-label={`Subtask of ${g.title}: ${s.title}`} style={{position:"absolute",left:-140,top:acc.top+2,width:130,fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>└─ {s.title}</div>
            <div title={`${s.title} • ${formatDateRange(s.start_date,s.due_date)} • ${s.done?"Done":"Pending"} • Assignee note: ${s.note||"none"}`} style={{position:"absolute",left:subStart+24,top:acc.top,width:subWidth,height:20,borderRadius:999,border:s.due_date?"none":`1px dotted ${(g.color||C.accent)}AA`,background:s.done?`repeating-linear-gradient(135deg, ${(g.color||C.accent)}, ${(g.color||C.accent)} 8px, ${(g.color||C.accent)}CC 8px, ${(g.color||C.accent)}CC 16px)`:`${(g.color||C.accent)}88`,display:"flex",alignItems:"center",padding:"0 8px",fontSize:11,color:"#fff"}}>
              {s.done?"✓":""}
            </div>
          </div>
        );
        acc.top+=24;
      });
    }
    return acc;
  },{top:0,nodes:[],rows:{}});
  const dependencyLinks=roadmapGoals
    .filter(g=>g.depends_on && roadmapLayout.rows[g.depends_on] && roadmapLayout.rows[g.id])
    .map(g=>{
      const from=roadmapLayout.rows[g.depends_on];
      const to=roadmapLayout.rows[g.id];
      return {id:g.id,x1:from.end,y1:from.top,x2:to.start,y2:to.top};
    });

  if(loading) return <Spinner C={C}/>;

  return (
    <div className="fadein">
      <h2 className="page-heading" style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text,marginBottom:"1.4rem"}}>Goals</h2>
      {toast&&<div style={{position:"fixed",right:18,bottom:isMobile?86:18,zIndex:120,background:C.cardBg,border:`1px solid ${C.accent}`,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.text,boxShadow:`0 8px 24px ${C.accentGlow}`}}>{toast}</div>}
      {promoteMsg&&<div style={{position:"fixed",right:18,bottom:isMobile?126:58,zIndex:120,background:C.successBg,border:`1px solid ${C.done}`,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.text}}>{promoteMsg}</div>}

      <div style={{position:"relative",display:"flex",background:C.bg,borderRadius:10,padding:3,marginBottom:18,border:`1px solid ${C.border}`,maxWidth:420}}>
        <div style={{position:"absolute",top:3,bottom:3,left:tabSliderLeft,width:"calc(33.333% - 4px)",borderRadius:8,background:C.accent,transition:"all 0.2s ease"}}/>
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
            <div style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",marginBottom:14}}>
              <input value={newGoalForm.title} onChange={e=>setNewGoalForm(f=>({...f,title:e.target.value}))} placeholder="Goal name"
                style={{width:"100%",height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,background:C.inputBg,color:C.text,marginBottom:10}}/>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
                <span style={{fontSize:12,color:C.muted}}>Use a template:</span>
                {GOAL_TEMPLATES.map(tpl=>(
                  <button key={tpl.id} className="template-pill" onClick={()=>applyTemplate(tpl)} style={{border:`1px solid ${C.border}`,borderRadius:999,padding:"5px 10px",fontSize:12,background:C.inputBg,color:C.text,cursor:"pointer"}}>{tpl.name}</button>
                ))}
              </div>
              <textarea rows={3} value={newGoalForm.description} onChange={e=>setNewGoalForm(f=>({...f,description:e.target.value}))} placeholder="What does success look like for this goal?"
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,background:C.inputBg,color:C.text,marginBottom:10,lineHeight:1.4}}/>
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
                <label style={{fontSize:12,color:C.muted}}>Start date
                  <input type="date" value={newGoalForm.start_date} onChange={e=>setNewGoalForm(f=>({...f,start_date:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}/>
                </label>
                <label style={{fontSize:12,color:C.muted}}>End date
                  <input type="date" value={newGoalForm.due_date} onChange={e=>setNewGoalForm(f=>({...f,due_date:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}/>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Tag
                  <select value={newGoalForm.tag} onChange={e=>setNewGoalForm(f=>({...f,tag:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    {GOAL_TAGS.map(t=><option key={t.label} value={t.label}>{t.label}</option>)}
                  </select>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Effort
                  <select value={String(newGoalForm.effort)} onChange={e=>setNewGoalForm(f=>({...f,effort:parseInt(e.target.value,10)}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    {EFFORT_LABELS.map(eff=><option key={eff.value} value={eff.value}>{eff.label}</option>)}
                  </select>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Depends on
                  <select value={newGoalForm.depends_on} onChange={e=>setNewGoalForm(f=>({...f,depends_on:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    <option value="">None</option>
                    {activeGoals.map(goal=><option key={goal.id} value={goal.id}>{goal.title}</option>)}
                  </select>
                </label>
                <label style={{fontSize:12,color:C.muted}}>Link habit
                  <select value={newGoalForm.linked_habit_id} onChange={e=>setNewGoalForm(f=>({...f,linked_habit_id:e.target.value}))} style={{marginTop:4,width:"100%",height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                    <option value="">None</option>
                    {(habits||[]).map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </label>
              </div>
              {!isValidDateRange(newGoalForm.start_date,newGoalForm.due_date)&&<div style={{fontSize:12,color:C.danger,marginTop:8}}>Start date must be before end date.</div>}
              <div style={{marginTop:10,fontSize:12,color:C.muted}}>Color</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6,marginBottom:10}}>
                {GOAL_COLORS.map(color=>(
                  <button key={color} onClick={()=>setNewGoalForm(f=>({...f,color}))} style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${newGoalForm.color===color?C.text:C.border}`,background:color,cursor:"pointer"}}/>
                ))}
              </div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Template subtasks</div>
                <textarea rows={3} value={newGoalSubtasks.join("\n")} onChange={e=>setNewGoalSubtasks(e.target.value.split("\n").map(x=>x.trim()).filter(Boolean))} placeholder="One subtask per line"
                  style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,background:C.inputBg,color:C.text,lineHeight:1.4}}/>
              </div>
              <RichEditor value={newGoalForm.note} onChange={val=>setNewGoalForm(f=>({...f,note:val}))} placeholder="Goal note..." C={C}/>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:10}}>
                <button onClick={()=>setShowAddForm(false)} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",fontSize:13,background:C.inputBg,color:C.muted,cursor:"pointer"}}>Cancel</button>
                <button onClick={addGoal} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"9px 14px",fontSize:13,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer"}}>Add goal</button>
              </div>
            </div>
          )}

          <label style={{display:"inline-flex",alignItems:"center",margin:5,gap:14,fontSize:13,color:C.muted,marginBottom:"1rem",cursor:"pointer"}}>
            <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} style={{width:22,height:22}}/>
            Show archived
          </label>

          {activeGoals.length===0&&(
            <div style={{textAlign:"center",padding:"2.8rem 1rem",background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12}}>
              <div style={{width:82,height:82,borderRadius:"50%",border:`2px solid ${C.border}`,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:C.done}}>✓</div>
              <p style={{fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>No goals yet</p>
              <p style={{fontSize:13,color:C.muted,marginBottom:14}}>Break down your ambitions into achievable milestones</p>
              <button onClick={()=>setShowAddForm(true)} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 16px",fontSize:14,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer"}}>+ Create your first goal</button>
            </div>
          )}
          {groupedActiveGoals.map(group=>(
            <div key={group.tag} style={{marginBottom:14}}>
              <div className="section-label" style={{color:group.theme.color,marginBottom:8}}>{group.tag}</div>
              {group.items.map((g,idx)=>{
                const {items,done}=goalProgress(g.id);
                const pct=effectiveProgress(g);
                const isOpen=!!expanded[g.id];
                const status=statusById[g.status]||statusById.not_started;
                const priority=priorityById[g.priority]||priorityById.medium;
                const linkedHabit=habitsById[g.linked_habit_id];
                const linkedDone=isHabitDoneToday(g.linked_habit_id);
                const dep=depGoal(g);
                const blocked=depBlocked(g);
                const tagTheme=goalTagTheme(g.tag||"Other");
                return (
              <React.Fragment key={g.id}>
              {!g.pinned&&idx>0&&group.items[idx-1].pinned&&<div style={{height:1,background:C.rowDivider,margin:"6px 0 12px"}}/>}
              <div className={`glass-card card-hover ${blocked?"blocked-goal-card":""}`} style={{...cardStyle,position:"relative",border:`1px solid ${g.pinned?C.accent:(C.cardBorder||C.border)}`,padding:"20px 24px",marginBottom:14,boxShadow:`inset 5px 0 0 ${g.color||GOAL_COLORS[0]}, ${C.cardShadow}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <button aria-label={`Choose color for ${g.title}`} aria-expanded={openColorId===g.id} onClick={()=>setOpenColorId(openColorId===g.id?null:g.id)} style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${C.border}`,background:g.color||GOAL_COLORS[0],cursor:"pointer"}}/>
                  {editingGoalId===g.id?(
                    <input value={editingGoalVal} autoFocus onChange={e=>setEditingGoalVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") saveGoalEdit(g.id); if(e.key==="Escape"){setEditingGoalId(null);setEditingGoalVal("");}}} onBlur={()=>saveGoalEdit(g.id)}
                      style={{flex:1,minWidth:160,height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:16,fontWeight:500,background:C.inputBg,color:C.text}}/>
                  ):(
                    <span style={{flex:1,fontSize:16,fontWeight:500,color:C.text}}>{g.title}</span>
                  )}
                  <button title={g.pinned?"Unpin":"Pin"} onClick={()=>updateGoal(g.id,{pinned:!g.pinned})} style={{width:32,height:32,fontSize:14,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>📌</button>
                  <button aria-label={`Edit goal ${g.title}`} onClick={()=>startGoalEdit(g)} style={{width:32,height:32,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>✎</button>
                  <button onClick={()=>setExpanded(e=>({...e,[g.id]:!e[g.id]}))} style={{width:32,height:32,fontSize:11,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>{isOpen?"▲":"▼"}</button>
                  {isMobile&&<button onClick={()=>setSelectedGoalId(g.id)} style={{height:32,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text,cursor:"pointer"}}>Open</button>}
                  {pct===100&&<button onClick={()=>updateGoal(g.id,{archived:true})} style={{fontSize:12,color:C.accent,background:C.inputBg,border:`1px solid ${C.accent}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Archive</button>}
                  <button aria-label={`Delete goal ${g.title}`} onClick={()=>delGoal(g.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                </div>
                {g.description&&<div style={{fontSize:12,color:C.muted,marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.description.split("\n")[0]}</div>}
                {openColorId===g.id&&(
                  <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                    {GOAL_COLORS.map(color=>(
                      <button key={color} onClick={()=>updateGoal(g.id,{color})} style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${g.color===color?C.text:C.border}`,background:color,cursor:"pointer"}}/>
                    ))}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,minmax(0,1fr))",gap:8,marginBottom:8}}>
                  <select value={g.status||"not_started"} onChange={e=>updateGoal(g.id,{status:e.target.value})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:status.color}}>
                    {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={g.priority||"medium"} onChange={e=>updateGoal(g.id,{priority:e.target.value})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:priority.color}}>
                    {PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  <select value={String(Number(g.effort||0))} onChange={e=>updateGoal(g.id,{effort:parseInt(e.target.value,10)})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text}}>
                    {EFFORT_LABELS.map(eff=><option key={eff.value} value={eff.value}>{eff.label}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8,marginBottom:8}}>
                  <label style={{fontSize:12,color:C.muted}}>Start date
                    <input type="date" value={g.start_date||""} onChange={e=>updateGoal(g.id,{start_date:e.target.value||null})} style={{marginTop:4,height:38,width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text}}/>
                  </label>
                  <label style={{fontSize:12,color:C.muted}}>End date
                    <input type="date" value={g.due_date||""} onChange={e=>updateGoal(g.id,{due_date:e.target.value||null})} style={{marginTop:4,height:38,width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text}}/>
                  </label>
                </div>
                {!isValidDateRange(g.start_date,g.due_date)&&<div style={{fontSize:12,color:C.danger,marginBottom:8}}>Start date must be before end date.</div>}
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,minmax(0,1fr))",gap:8,marginBottom:8}}>
                  <select value={g.tag||"Other"} onChange={e=>updateGoal(g.id,{tag:e.target.value})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text}}>
                    {GOAL_TAGS.map(t=><option key={t.label} value={t.label}>{t.label}</option>)}
                  </select>
                  <select value={g.depends_on||""} onChange={e=>updateGoal(g.id,{depends_on:e.target.value||null})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text}}>
                    <option value="">Depends on: none</option>
                    {activeGoals.filter(x=>x.id!==g.id).map(goal=><option key={goal.id} value={goal.id}>{goal.title}</option>)}
                  </select>
                  <label style={{display:"flex",alignItems:"center",gap:8,height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,color:C.text,background:C.inputBg,cursor:"pointer"}}>
                    <input type="checkbox" checked={(g.manual_progress??-1)>=0} onChange={e=>updateGoal(g.id,{manual_progress:e.target.checked?pct:-1})}/>
                    Manual progress
                  </label>
                </div>
                {(g.manual_progress??-1)>=0&&(
                  <input type="range" min="0" max="100" value={Math.max(0,Math.min(100,g.manual_progress||0))} onChange={e=>updateGoal(g.id,{manual_progress:parseInt(e.target.value,10)})} style={{width:"100%",marginBottom:8}}/>
                )}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:6}}>
                  <span style={{display:"inline-flex",gap:8,alignItems:"center"}}>Priority: {priority.label} <span style={{fontSize:11,padding:"2px 8px",borderRadius:999,border:`1px solid ${tagTheme.color}55`,background:tagTheme.bg,color:tagTheme.color}}>{g.tag||"Other"}</span> <span>⏱ {(effortByValue[Number(g.effort||0)]||"").split(" ")[0]}</span></span>
                  <span style={{fontWeight:600,color:pct===100?C.done:C.accent}}>{pct}% {(g.manual_progress??-1)>=0&&<span style={{fontSize:10,color:C.muted}}>M</span>}</span>
                </div>
                {dep&&blocked&&<div style={{fontSize:12,color:C.danger,marginBottom:6}}>🔒 Blocked by: {dep.title}</div>}
                {dep&&!blocked&&<div style={{fontSize:12,color:C.done,marginBottom:6}}>✓ Dependency met</div>}
                <div style={{fontSize:12,color:g.due_date&&isOverdue(g.due_date)?C.danger:C.muted,marginBottom:6}}>📅 {formatDateRange(g.start_date,g.due_date)}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:6}}>
                  <span>{done}/{items.length||0} subtasks {linkedHabit?`• 🔗 ${linkedHabit.name} — ${linkedDone?"done today ✓":"not done yet"}`:""}</span>
                </div>
                <div style={{height:8,borderRadius:999,background:C.border,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${pct}%`,background:pct===100?C.done:(g.color||C.accent),borderRadius:999,transition:"width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"}}/></div>
                {isOpen&&(
                  <div style={{borderTop:`1px solid ${C.rowDivider}`,paddingTop:12}}>
                    <div className="section-label" style={{fontSize:13,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:C.faint,marginBottom:8}}>Subtasks</div>
                    {items.map(s=>(
                      <div key={s.id} style={{padding:"7px 0"}}>
                        <div style={{display:"grid",gridTemplateRows:"auto auto",gap:4}}>
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
                            <button title="Promote to goal" onClick={()=>promoteSubToGoal(s,g)} style={{width:28,height:28,fontSize:13,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>↗</button>
                            <button onClick={()=>delSub(s.id)} style={{width:28,height:28,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                          </div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,paddingLeft:"calc(22px + 8px)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11,color:C.muted,flexWrap:"wrap"}}>
                              <button className="badge glass-card-sm" onClick={()=>setOpenSubDates(n=>({...n,[s.id]:!n[s.id]}))} style={{color:isOverdue(s.due_date)?C.danger:C.muted,border:`1px solid ${isOverdue(s.due_date)?C.danger:C.border}`,padding:"2px 8px",background:C.inputBg,cursor:"pointer"}}>📅 {formatDateRange(s.start_date,s.due_date)}</button>
                              {s.assignee&&<span>👤 {s.assignee}</span>}
                            </div>
                            <button onClick={()=>setOpenSubNote(n=>({...n,[s.id]:!n[s.id]}))} style={{width:28,height:28,fontSize:13,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,flexShrink:0}}>💬</button>
                          </div>
                          {openSubDates[s.id]&&(
                            <div style={{display:"flex",gap:8,paddingLeft:"calc(22px + 8px)",marginTop:2,flexWrap:"wrap"}}>
                              <label style={{fontSize:11,color:C.muted,cursor:"pointer"}}>Start
                                <input type="date" value={s.start_date||""} onChange={e=>updateSub(s.id,{start_date:e.target.value||null})} style={{marginLeft:4,height:24,border:`1px solid ${C.border}`,borderRadius:6,padding:"0 6px",fontSize:11,background:C.inputBg,color:C.text}}/>
                              </label>
                              <label style={{fontSize:11,color:C.muted,cursor:"pointer"}}>End
                                <input type="date" value={s.due_date||""} onChange={e=>updateSub(s.id,{due_date:e.target.value||null})} style={{marginLeft:4,height:24,border:`1px solid ${C.border}`,borderRadius:6,padding:"0 6px",fontSize:11,background:C.inputBg,color:C.text}}/>
                              </label>
                            </div>
                          )}
                        </div>
                        {openSubNote[s.id]&&(
                          <textarea aria-label={`Subtask note for ${s.title}`} rows={2} value={s.note||""} onChange={e=>updateSubNote(s.id,e.target.value)} placeholder="Subtask note..."
                            style={{marginTop:6,marginLeft:38,width:"calc(100% - 38px)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.text,background:C.inputBg,lineHeight:1.4}}/>
                        )}
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <input value={newSub[g.id]||""} onChange={e=>setNewSub(n=>({...n,[g.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSub(g.id)}
                        placeholder="+ Add subtask" style={{flex:1,height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,background:C.inputBg,color:C.text}}/>
                      <button onClick={()=>addSub(g.id)} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:500,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Add</button>
                    </div>
                    <div className="section-label" style={{fontSize:13,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:C.faint,marginTop:12,marginBottom:6}}>Description</div>
                    <textarea rows={3} value={g.description||""} onChange={e=>updateGoalDebounced(g.id,{description:e.target.value})} placeholder="What does success look like for this goal?"
                      style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.text,background:C.inputBg,lineHeight:1.4,marginBottom:8}}/>
                    <div className="section-label" style={{fontSize:13,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:C.faint,marginTop:8,marginBottom:6}}>Milestones</div>
                    {goalMilestones(g.id).map(m=>(
                      <div key={m.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <span style={{fontSize:12,color:C.text,flex:1}}>◆ {m.title} {formatDueDate(m.date)}</span>
                        <button onClick={()=>startMilestoneEdit(m)} style={{border:"none",background:"transparent",cursor:"pointer",color:C.muted}}>✎</button>
                        <button onClick={()=>deleteMilestone(m.id)} style={{border:"none",background:"transparent",cursor:"pointer",color:C.faint}}>&times;</button>
                      </div>
                    ))}
                    {editingMilestoneId&&goalMilestones(g.id).some(m=>m.id===editingMilestoneId)&&(
                      <div style={{display:"flex",gap:6,marginBottom:6}}>
                        <input value={milestoneEdit.title} onChange={e=>setMilestoneEdit(x=>({...x,title:e.target.value}))} placeholder="Title" style={{flex:1,height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
                        <input type="date" value={milestoneEdit.date} onChange={e=>setMilestoneEdit(x=>({...x,date:e.target.value}))} style={{height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
                        <button onClick={()=>saveMilestoneEdit(editingMilestoneId)} style={{height:30,border:`1px solid ${C.accent}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Save</button>
                      </div>
                    )}
                    <div style={{display:"flex",gap:6,marginTop:4}}>
                      <input value={newMilestone[g.id]?.title||""} onChange={e=>setNewMilestone(x=>({...x,[g.id]:{...(x[g.id]||{}),title:e.target.value}}))} placeholder="Add milestone" style={{flex:1,height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
                      <input type="date" value={newMilestone[g.id]?.date||""} onChange={e=>setNewMilestone(x=>({...x,[g.id]:{...(x[g.id]||{}),date:e.target.value}}))} style={{height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
                      <button onClick={()=>addMilestone(g.id)} style={{height:30,border:`1px solid ${C.accent}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Add</button>
                    </div>
                    <div className="section-label" style={{fontSize:13,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:C.faint,marginTop:12,marginBottom:6}}>Goal note</div>
                    <RichEditor value={g.note||""} onChange={val=>updateGoalNote(g.id,val)} placeholder="Goal note..." C={C}/>
                  </div>
                )}
              </div>
              </React.Fragment>
            );
          })}
            </div>
          ))}

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
        <div style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 16px",overflowX:"auto",minHeight:400}}>
          <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:10}}>
            {Object.keys(ZOOM_LEVELS).map(z=>(
              <button key={z} onClick={()=>setZoomLevel(z)} style={{height:30,border:`1px solid ${zoomLevel===z?C.accent:C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:zoomLevel===z?C.hoverBg:C.inputBg,color:zoomLevel===z?C.accent:C.muted,cursor:"pointer"}}>{z[0].toUpperCase()+z.slice(1)}</button>
            ))}
          </div>
          {roadmapGoals.length===0?(
            <div style={{textAlign:"center",padding:"3rem 1rem"}}>
              <p style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:6}}>No goals with timeline dates</p>
              <p style={{fontSize:13,color:C.muted,marginBottom:12}}>Add start/end dates to your goals to see them on the roadmap</p>
              <button onClick={()=>setView("list")} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer"}}>Go to list view</button>
            </div>
          ):(
            <div style={{minWidth:containerWidth+210}}>
              <div style={{position:"relative",height:46,marginLeft:190,borderBottom:`1px solid ${C.border}`}}>
                {monthTicks.map((m)=>{
                  const x=getRoadmapPosition(m,minDate,totalDays,containerWidth);
                  return <div key={m.toISOString()} style={{position:"absolute",left:x,top:2,fontSize:12,fontWeight:600,color:C.muted,transform:"translateX(-50%)"}}>{m.toLocaleDateString("nl-NL",{month:"short"})}</div>;
                })}
                {weekTicks.map((w)=>{
                  const x=getRoadmapPosition(w,minDate,totalDays,containerWidth);
                  return <div key={`w_${w.toISOString()}`} style={{position:"absolute",left:x,bottom:0,width:1,height:8,background:C.border}}/>;
                })}
                <div style={{position:"absolute",left:todayPosition,top:0,bottom:0,width:2,background:C.accent,zIndex:2}}/>
                <div style={{position:"absolute",left:todayPosition+4,top:2,fontSize:11,color:C.accent,fontWeight:600}}>Today</div>
              </div>
              <div style={{position:"relative",width:containerWidth,marginLeft:190,paddingTop:8,paddingBottom:8,height:roadmapLayout.top+12}}>
                <svg aria-hidden="true" style={{position:"absolute",left:0,top:0,width:containerWidth,height:roadmapLayout.top+12,pointerEvents:"none"}}>
                  {dependencyLinks.map(line=>(
                    <g key={line.id}>
                      <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={C.faint} strokeWidth="1.5" strokeDasharray="4 4"/>
                      <polygon points={`${line.x2},${line.y2} ${line.x2-6},${line.y2-3} ${line.x2-6},${line.y2+3}`} fill={C.faint}/>
                    </g>
                  ))}
                </svg>
                {roadmapLayout.nodes}
              </div>
            </div>
          )}
        </div>
      )}

      {view==="board"&&(
        <div style={{overflowX:"auto"}}>
          <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(4,minmax(280px,1fr))",minWidth:isMobile?0:1150}}>
            {STATUSES.map(s=>{
              const items=activeGoals.filter(g=>(g.status||"not_started")===s.id);
              const sortedItems=[...items.filter(g=>g.pinned),...items.filter(g=>!g.pinned)];
              return (
                <div key={s.id} onDragOver={e=>{if(!isMobile) e.preventDefault();}} onDrop={()=>handleBoardDrop(s.id)}
                  style={{background:`${s.color}1A`,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
                  <div style={{height:48,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.text,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</span>
                    <span style={{fontSize:12,color:C.muted,background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:999,padding:"2px 8px"}}>{items.length}</span>
                  </div>
                  {items.length===0&&(
                    <button onClick={()=>openAddFromColumn(s.id)} style={{width:"100%",height:124,border:`1px dashed ${C.border}`,borderRadius:10,background:C.inputBg,color:C.muted,fontSize:13,cursor:"pointer",marginBottom:10}}>+ Add goal</button>
                  )}
                  {sortedItems.map((g,idx)=>{
                    const {items:subItems,done}=goalProgress(g.id);
                    const pct=effectiveProgress(g);
                    const priority=priorityById[g.priority]||priorityById.medium;
                    const blocked=depBlocked(g);
                    const dep=depGoal(g);
                    const tagTheme=goalTagTheme(g.tag||"Other");
                    return (
                      <React.Fragment key={g.id}>
                      {!g.pinned&&idx>0&&sortedItems[idx-1].pinned&&<div style={{height:1,background:C.rowDivider,margin:"4px 0 10px"}}/>}
                      <div
                        className={blocked?"board-card-locked":""}
                        draggable={!isMobile}
                        tabIndex={!isMobile?0:-1}
                        onDragStart={()=>{setDragGoalId(g.id);setBoardDraggingId(g.id);}}
                        onDragEnd={()=>setTimeout(()=>setBoardDraggingId(null),0)}
                        onClick={()=>{if(boardDraggingId===g.id) return; setSelectedGoalId(g.id);}}
                        onKeyDown={e=>{
                          if(isMobile) return;
                          if(e.key==="ArrowRight"){ e.preventDefault(); updateGoal(g.id,{status:getNextStatus(g.status||"not_started",1)}); }
                          if(e.key==="ArrowLeft"){ e.preventDefault(); updateGoal(g.id,{status:getNextStatus(g.status||"not_started",-1)}); }
                        }}
                        aria-label={`${g.title}. Current status: ${(statusById[g.status]||statusById.not_started).label}. Use left and right arrows to change status.`}
                        className="glass-card card-hover"
                        style={{position:"relative",background:C.cardBg,border:`1px solid ${g.pinned?C.accent:(C.cardBorder||C.border)}`,boxShadow:C.cardShadow,borderRadius:12,padding:"14px 14px 12px",marginBottom:10,minHeight:180,cursor:isMobile?"pointer":"grab"}}
                      >
                        {g.pinned&&<div style={{position:"absolute",right:8,top:8,fontSize:12,color:C.muted}}>📌</div>}
                        <button title={g.pinned?"Unpin":"Pin"} onClick={(e)=>{e.stopPropagation();updateGoal(g.id,{pinned:!g.pinned});}} style={{position:"absolute",right:28,top:6,width:24,height:24,fontSize:12,color:C.muted,background:"transparent",border:"none",cursor:"pointer",zIndex:2}}>📌</button>
                        {blocked&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.04)",borderRadius:10,pointerEvents:"none"}}/>}
                        <div style={{height:6,borderRadius:999,background:g.color||GOAL_COLORS[0],marginBottom:12}}/>
                        <div style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:10}}>{g.title}</div>
                        {g.description&&<div style={{fontSize:12,color:C.muted,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{g.description}</div>}
                        <div style={{display:"inline-flex",alignItems:"center",fontSize:11,padding:"2px 8px",borderRadius:999,border:`1px solid ${tagTheme.color}55`,background:tagTheme.bg,color:tagTheme.color,marginBottom:4}}>{g.tag||"Other"}</div>
                        <div style={{fontSize:12,color:priority.color,marginBottom:4}}>● {priority.label} priority</div>
                        <div style={{fontSize:12,color:g.due_date&&isOverdue(g.due_date)?C.danger:C.muted,marginBottom:8}}>📅 {formatDateRange(g.start_date,g.due_date)}</div>
                        <div style={{height:6,borderRadius:999,background:C.border,overflow:"hidden",marginBottom:7}}><div style={{height:"100%",width:`${pct}%`,background:g.color||C.accent}}/></div>
                        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{done}/{subItems.length||0} • ⏱ {(effortByValue[Number(g.effort||0)]||"").split(" ")[0]}{(g.manual_progress??-1)>=0?" • M":""}</div>
                        {dep&&blocked&&<div style={{fontSize:11,color:C.danger,marginBottom:4}}>🔒 Blocked by {dep.title}</div>}
                        {dep&&!blocked&&<div style={{fontSize:11,color:C.done,marginBottom:4}}>✓ Dependency met</div>}
                        {subItems.slice(0,3).map(s=><div key={s.id} aria-label={`${s.title} ${s.done?"done":"not done"}`} style={{fontSize:11,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none",marginBottom:2}}>{s.done?"☑":"☐"} {s.title}</div>)}
                        <select value={g.status||"not_started"} onChange={e=>updateGoal(g.id,{status:e.target.value})} onClick={e=>e.stopPropagation()} style={{marginTop:8,width:"100%",height:34,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}>
                          {STATUSES.map(opt=><option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                      </div>
                      </React.Fragment>
                    );
                  })}
                  <button onClick={()=>openAddFromColumn(s.id)} style={{width:"100%",height:36,border:`1px dashed ${C.border}`,borderRadius:8,background:"transparent",color:C.muted,cursor:"pointer"}}>+ Add goal</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedGoal&&(
        <div style={{position:"fixed",inset:0,zIndex:110,background:isMobile?"rgba(0,0,0,0.4)":"transparent"}}>
          <div ref={panelRef} className="glass-card" style={{position:"absolute",right:0,top:0,bottom:0,width:isMobile?"100%":320,background:C.cardBg,borderLeft:`1px solid ${C.border}`,padding:"16px 14px",overflowY:"auto",borderRadius:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <button onClick={()=>setSelectedGoalId(null)} style={{height:32,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text,cursor:"pointer"}}>← Back</button>
              <span style={{fontSize:15,fontWeight:600,color:C.text,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selectedGoal.title}</span>
              <button aria-label={`Delete goal ${selectedGoal.title}`} onClick={()=>delGoal(selectedGoal.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer"}}>&times;</button>
            </div>
            <div style={{display:"grid",gap:8,marginBottom:12}}>
              <select value={selectedGoal.status||"not_started"} onChange={e=>updateGoalDebounced(selectedGoal.id,{status:e.target.value})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
              <select value={selectedGoal.priority||"medium"} onChange={e=>updateGoalDebounced(selectedGoal.id,{priority:e.target.value})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select>
              <input type="date" value={selectedGoal.start_date||""} onChange={e=>updateGoalDebounced(selectedGoal.id,{start_date:e.target.value||null})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}/>
              <input type="date" value={selectedGoal.due_date||""} onChange={e=>updateGoalDebounced(selectedGoal.id,{due_date:e.target.value||null})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}/>
              {!isValidDateRange(selectedGoal.start_date,selectedGoal.due_date)&&<div style={{fontSize:12,color:C.danger}}>Start date must be before end date.</div>}
              <textarea rows={3} value={selectedGoal.description||""} onChange={e=>updateGoalDebounced(selectedGoal.id,{description:e.target.value})} placeholder="What does success look like for this goal?" style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,background:C.inputBg,color:C.text,lineHeight:1.4}}/>
              <select value={String(Number(selectedGoal.effort||0))} onChange={e=>updateGoalDebounced(selectedGoal.id,{effort:parseInt(e.target.value,10)})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                {EFFORT_LABELS.map(eff=><option key={eff.value} value={eff.value}>{eff.label}</option>)}
              </select>
              <select value={selectedGoal.tag||"Other"} onChange={e=>updateGoalDebounced(selectedGoal.id,{tag:e.target.value})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                {GOAL_TAGS.map(t=><option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
              <select value={selectedGoal.depends_on||""} onChange={e=>updateGoalDebounced(selectedGoal.id,{depends_on:e.target.value||null})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                <option value="">Depends on: none</option>
                {activeGoals.filter(x=>x.id!==selectedGoal.id).map(goal=><option key={goal.id} value={goal.id}>{goal.title}</option>)}
              </select>
              <select value={selectedGoal.linked_habit_id||""} onChange={e=>updateGoalDebounced(selectedGoal.id,{linked_habit_id:e.target.value||null})} style={{height:38,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",background:C.inputBg,color:C.text}}>
                <option value="">No linked habit</option>
                {(habits||[]).map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {GOAL_COLORS.map(color=><button key={color} onClick={()=>updateGoalDebounced(selectedGoal.id,{color})} style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${selectedGoal.color===color?C.text:C.border}`,background:color,cursor:"pointer"}}/>)}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Progress</div>
              <div style={{height:8,borderRadius:999,background:C.border,overflow:"hidden"}}><div style={{height:"100%",width:`${effectiveProgress(selectedGoal)}%`,background:selectedGoal.color||C.accent}}/></div>
              <label style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:12,color:C.muted,marginTop:6,cursor:"pointer"}}>
                <input type="checkbox" checked={(selectedGoal.manual_progress??-1)>=0} onChange={e=>updateGoalDebounced(selectedGoal.id,{manual_progress:e.target.checked?effectiveProgress(selectedGoal):-1})}/>
                Auto / Manual
              </label>
              {(selectedGoal.manual_progress??-1)>=0&&<input type="range" min="0" max="100" value={Math.max(0,Math.min(100,selectedGoal.manual_progress||0))} onChange={e=>updateGoalDebounced(selectedGoal.id,{manual_progress:parseInt(e.target.value,10)})} style={{width:"100%",marginTop:6}}/>}
            </div>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>Subtasks</div>
            {goalProgress(selectedGoal.id).items.map(s=>(
              <div key={s.id} style={{marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>toggleSub(s)} style={{width:20,height:20,border:`1px solid ${s.done?C.done:C.border}`,borderRadius:6,background:s.done?C.done:"transparent",color:C.onAccent,cursor:"pointer"}}>{s.done?"✓":""}</button>
                  <span style={{flex:1,fontSize:12,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none"}}>{s.title}</span>
                  <button className="badge glass-card-sm" onClick={()=>setOpenSubDates(n=>({...n,[s.id]:!n[s.id]}))} style={{color:C.muted,border:`1px solid ${C.border}`,background:C.inputBg,cursor:"pointer"}}>{formatDateRange(s.start_date,s.due_date)}</button>
                  <input value={s.assignee||""} onChange={e=>updateSub(s.id,{assignee:e.target.value})} placeholder="Assignee" style={{width:90,height:24,border:`1px solid ${C.border}`,borderRadius:6,padding:"0 6px",fontSize:11,background:C.inputBg,color:C.text}}/>
                  <button onClick={()=>setOpenSubNote(n=>({...n,[s.id]:!n[s.id]}))} style={{width:24,height:24,background:"transparent",border:"none",cursor:"pointer"}}>💬</button>
                  <button onClick={()=>promoteSubToGoal(s,selectedGoal)} style={{width:24,height:24,background:"transparent",border:"none",cursor:"pointer"}}>↗</button>
                </div>
                {openSubNote[s.id]&&<textarea aria-label={`Subtask note for ${s.title}`} rows={2} value={s.note||""} onChange={e=>updateSubNote(s.id,e.target.value)} style={{marginTop:4,width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,color:C.text,background:C.inputBg}}/>}
                {openSubDates[s.id]&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4,paddingLeft:26}}>
                    <label style={{fontSize:11,color:C.muted,cursor:"pointer"}}>Start<input type="date" value={s.start_date||""} onChange={e=>updateSub(s.id,{start_date:e.target.value||null})} style={{marginLeft:4,height:24,border:`1px solid ${C.border}`,borderRadius:6,padding:"0 6px",fontSize:11,background:C.inputBg,color:C.text}}/></label>
                    <label style={{fontSize:11,color:C.muted,cursor:"pointer"}}>End<input type="date" value={s.due_date||""} onChange={e=>updateSub(s.id,{due_date:e.target.value||null})} style={{marginLeft:4,height:24,border:`1px solid ${C.border}`,borderRadius:6,padding:"0 6px",fontSize:11,background:C.inputBg,color:C.text}}/></label>
                  </div>
                )}
              </div>
            ))}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input value={newSub[selectedGoal.id]||""} onChange={e=>setNewSub(n=>({...n,[selectedGoal.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSub(selectedGoal.id)} placeholder="+ Add subtask" style={{flex:1,height:36,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text}}/>
              <button onClick={()=>addSub(selectedGoal.id)} style={{height:36,border:`1px solid ${C.accent}`,borderRadius:8,padding:"0 10px",background:C.accent,color:C.onAccent,cursor:"pointer"}}>Add</button>
            </div>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>Notes</div>
            <RichEditor value={selectedGoal.note||""} onChange={val=>updateGoalNote(selectedGoal.id,val)} placeholder="Goal notes..." C={C}/>
            <div style={{fontSize:12,color:C.muted,marginTop:10,marginBottom:6}}>Milestones</div>
            {goalMilestones(selectedGoal.id).map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <span style={{fontSize:12,color:C.text,flex:1}}>◆ {m.title} {formatDueDate(m.date)}</span>
                <button onClick={()=>startMilestoneEdit(m)} style={{border:"none",background:"transparent",cursor:"pointer",color:C.muted}}>✎</button>
                <button onClick={()=>deleteMilestone(m.id)} style={{border:"none",background:"transparent",cursor:"pointer",color:C.faint}}>&times;</button>
              </div>
            ))}
            {editingMilestoneId&&goalMilestones(selectedGoal.id).some(m=>m.id===editingMilestoneId)&&(
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <input value={milestoneEdit.title} onChange={e=>setMilestoneEdit(x=>({...x,title:e.target.value}))} placeholder="Title" style={{flex:1,height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
                <input type="date" value={milestoneEdit.date} onChange={e=>setMilestoneEdit(x=>({...x,date:e.target.value}))} style={{height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
                <button onClick={()=>saveMilestoneEdit(editingMilestoneId)} style={{height:30,border:`1px solid ${C.accent}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Save</button>
              </div>
            )}
            <div style={{display:"flex",gap:6,marginTop:4}}>
              <input value={newMilestone[selectedGoal.id]?.title||""} onChange={e=>setNewMilestone(x=>({...x,[selectedGoal.id]:{...(x[selectedGoal.id]||{}),title:e.target.value}}))} placeholder="Add milestone" style={{flex:1,height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
              <input type="date" value={newMilestone[selectedGoal.id]?.date||""} onChange={e=>setNewMilestone(x=>({...x,[selectedGoal.id]:{...(x[selectedGoal.id]||{}),date:e.target.value}}))} style={{height:30,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 8px",fontSize:12,background:C.inputBg,color:C.text}}/>
              <button onClick={()=>addMilestone(selectedGoal.id)} style={{height:30,border:`1px solid ${C.accent}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Add</button>
            </div>
          </div>
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
  const [goalStats,setGoalStats]=useState({pts:0,count:0,label:"Not set"});

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

  useEffect(()=>{
    let active=true;
    if(!userId) return;
    (async()=>{
      const {data}=await sb.from("goals").select("effort,start_date,due_date,created_at,archived").eq("user_id",userId);
      if(!active) return;
      const monthKey=todayKey().slice(0,7);
      const activeGoals=(data||[]).filter(g=>!g.archived && (g.start_date||g.due_date||g.created_at||"").slice(0,7)===monthKey);
      const pts=activeGoals.reduce((acc,g)=>acc+Number(g.effort||0),0);
      const count=activeGoals.filter(g=>Number(g.effort||0)>0).length;
      const label=(EFFORT_LABELS.reduce((best,e)=>e.value<=pts?e:best,EFFORT_LABELS[0])||EFFORT_LABELS[0]).label;
      setGoalStats({pts,count,label});
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
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:"2.2rem"}}>
        {[{label:"Global streak",value:`${globalStreak}d`},{label:"Total habits",value:habits.length},{label:"Done (90d)",value:totalDone},{label:"Total effort this month",value:`${goalStats.label} (${goalStats.pts} pts across ${goalStats.count} goals)`}].map(s=>(
          <div key={s.label} className="glass-card" style={{background:C.cardBg,border:`1px solid ${C.cardBorder||C.border}`,borderRadius:16,padding:"14px 16px"}}>
            <div className="section-label" style={{color:C.faint,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:s.label==="Total effort this month"?14:22,fontWeight:500,color:C.accent}}>{s.value}</div>
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
