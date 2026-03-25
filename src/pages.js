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

  const toggle=async(habitId)=>{
    const ex=completions.find(c=>c.habit_id===habitId&&c.date===today);
    if(ex){
      await sb.from("completions").delete().eq("id",ex.id);
      setCompletions(c=>c.filter(x=>x.id!==ex.id));
    } else {
      const id=`${habitId}_${today}`;
      const {data}=await sb.from("completions").insert({id,habit_id:habitId,date:today,note:"",user_id:userId}).select().single();
      if(data) setCompletions(c=>[...c,data]);
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
        const tk=TAGS.find(t=>t.label===h.tag);
        const accent=tk?C.tags[tk.key].color:C.accent;
        return (
          <div key={h.id} style={{background:done?C.successBg:C.cardBg,border:`1px solid ${done?C.done:C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12,position:"relative",transition:"all 0.3s ease",boxShadow:`inset 4px 0 0 ${accent}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>toggle(h.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.8px solid ${done?C.done:C.border}`,background:done?C.done:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",transform:done?"scale(1.06)":"scale(1)"}}>
                {done&&<svg width="12" height="10" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke={C.onAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{fontSize:14,fontWeight:400,flex:1,color:done?C.done:C.text,textDecoration:done?"line-through":"none",opacity:done?0.76:1,transition:"all 0.3s ease"}}>{h.name}</span>
              {h.tag&&<TagPill tag={h.tag} C={C}/>}
              {streak>0&&<span style={{fontSize:12,fontWeight:500,color:C.accentDark,background:C.streakBg,border:`1px solid ${C.streakBorder}`,borderRadius:999,padding:"3px 12px",flexShrink:0}}>🔥 {streak}</span>}
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
        const t = C.tags[tag.key];
        return (
          <div key={tag.label} style={{marginBottom:"1.9rem"}}>
            <div className="section-label" style={{color:t.color,marginBottom:10}}>{tag.label}</div>
            {group.map(h=>{
              const streak=computeStreak(h.id,completions); const longest=computeLongest(h.id,completions);
              return (
                <div key={h.id} draggable={true} onDragStart={()=>setDragId(h.id)} onDragOver={e=>{e.preventDefault();setDragOverId(h.id);}} onDragLeave={()=>dragOverId===h.id&&setDragOverId(null)} onDrop={e=>{e.preventDefault();onDrop(h.id);}} onDragEnd={()=>{setDragId(null);setDragOverId(null);}} style={{display:"flex",alignItems:"center",gap:10,background:C.cardBg,border:`1px solid ${dragOverId===h.id?C.accent:C.border}`,borderRadius:12,padding:"15px 16px",marginBottom:8,boxShadow:`inset 4px 0 0 ${t.color}`}}>
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
function GoalsPage({userId,C}) {
  const [goals,setGoals]=useState([]); const [subs,setSubs]=useState([]); const [loading,setLoading]=useState(true);
  const [newGoal,setNewGoal]=useState(""); const [newSub,setNewSub]=useState({}); const [expanded,setExpanded]=useState({});
  const [showArchived,setShowArchived]=useState(false);
  useEffect(()=>{(async()=>{
    const [{data:g},{data:s}]=await Promise.all([sb.from("goals").select("*").order("created_at"),sb.from("subtasks").select("*")]);
    setGoals(g||[]); setSubs(s||[]); setLoading(false);
  })();},[]);
  const activeGoals=goals.filter(g=>!g.archived);
  const archivedGoals=goals.filter(g=>g.archived);
  const addGoal=async()=>{
    if(!newGoal.trim()) return; const id=Date.now().toString();
    const {data}=await sb.from("goals").insert({id,title:newGoal.trim(),user_id:userId,archived:false}).select().single();
    if(data){setGoals(g=>[...g,data]);setExpanded(e=>({...e,[id]:true}));} setNewGoal("");
  };
  const delGoal=async(id)=>{ await sb.from("goals").delete().eq("id",id); setGoals(g=>g.filter(x=>x.id!==id)); setSubs(s=>s.filter(x=>x.goal_id!==id)); };
  const setArchived=async(id,archived)=>{
    await sb.from("goals").update({archived}).eq("id",id);
    setGoals(g=>g.map(x=>x.id===id?{...x,archived}:x));
  };
  const addSub=async(gid)=>{
    const title=(newSub[gid]||"").trim(); if(!title) return;
    const id=`${gid}_${Date.now()}`;
    const {data}=await sb.from("subtasks").insert({id,goal_id:gid,title,done:false,user_id:userId}).select().single();
    if(data) setSubs(s=>[...s,data]); setNewSub(n=>({...n,[gid]:""}));
  };
  const toggleSub=async(s)=>{ await sb.from("subtasks").update({done:!s.done}).eq("id",s.id); setSubs(a=>a.map(x=>x.id===s.id?{...x,done:!s.done}:x)); };
  const delSub=async(id)=>{ await sb.from("subtasks").delete().eq("id",id); setSubs(s=>s.filter(x=>x.id!==id)); };
  if(loading) return <Spinner C={C}/>;
  return (
    <div className="fadein">
      <h2 className="page-heading" style={{fontSize:24,fontWeight:600,letterSpacing:"-0.02em",color:C.text,marginBottom:"2.2rem"}}>Goals</h2>
      <div style={{display:"flex",gap:10,marginBottom:"1.9rem"}}>
        <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGoal()} placeholder="New goal..."
          style={{flex:1,height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,background:C.inputBg,color:C.text}}/>
        <button onClick={addGoal} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer"}}>Add</button>
      </div>
      <label style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:13,color:C.muted,marginBottom:"1rem",cursor:"pointer"}}>
        <input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} style={{width:22,height:22}}/>
        Show archived
      </label>
      {activeGoals.length===0&&<EmptyState C={C} title="No goals yet" message="Break your ambitions into goals and small subtasks."/>}
      {activeGoals.map(g=>{
        const gSubs=subs.filter(s=>s.goal_id===g.id); const done=gSubs.filter(s=>s.done).length;
        const pct=gSubs.length?Math.round((done/gSubs.length)*100):0; const isOpen=!!expanded[g.id];
        return (
          <div key={g.id} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isOpen?10:0}}>
              <span style={{flex:1,fontSize:14,fontWeight:500,color:C.text}}>{g.title}</span>
              <span style={{fontSize:12,color:C.muted}}>{pct}%</span>
              <button onClick={()=>setExpanded(e=>({...e,[g.id]:!e[g.id]}))} style={{width:32,height:32,fontSize:11,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8}}>{isOpen?"▲":"▼"}</button>
              {pct===100&&<button aria-label={`Archive goal: ${g.title}`} onClick={()=>setArchived(g.id,true)} style={{fontSize:12,color:C.accent,background:C.inputBg,border:`1px solid ${C.accent}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Archive</button>}
              <button onClick={()=>delGoal(g.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
            </div>
            {gSubs.length>0&&<div style={{height:8,borderRadius:999,background:C.border,overflow:"hidden",marginBottom:isOpen?12:0}}><div style={{height:"100%",width:`${pct}%`,background:pct===100?C.done:C.accent,borderRadius:999,transition:"width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",animation:pct===100?"progressPulse 0.8s ease 1":"none"}}/></div>}
            {isOpen&&(
              <div style={{borderTop:`1px solid ${C.rowDivider}`,paddingTop:12}}>
                {gSubs.map(s=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
                    <div onClick={()=>toggleSub(s)} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:`1.8px solid ${s.done?C.done:C.border}`,background:s.done?C.done:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",transform:s.done?"scale(1.06)":"scale(1)"}}>
                      {s.done&&<svg width="10" height="8" viewBox="0 0 9 7" fill="none"><path d="M1 3L3.5 6L8 1" stroke={C.onAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{flex:1,fontSize:13,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none",opacity:s.done?0.6:1}}>{s.title}</span>
                    <button onClick={()=>delSub(s.id)} style={{width:32,height:32,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <input value={newSub[g.id]||""} onChange={e=>setNewSub(n=>({...n,[g.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSub(g.id)}
                    placeholder="Add sub-task..." style={{flex:1,height:42,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:14,background:C.inputBg,color:C.text}}/>
                  <button onClick={()=>addSub(g.id)} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:500,background:C.inputBg,color:C.accent,cursor:"pointer"}}>Add</button>
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
            const gSubs=subs.filter(s=>s.goal_id===g.id); const done=gSubs.filter(s=>s.done).length;
            const pct=gSubs.length?Math.round((done/gSubs.length)*100):0;
            return (
              <div key={g.id} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:12,opacity:0.75}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{flex:1,fontSize:14,fontWeight:500,color:C.text}}>{g.title}</span>
                  <span style={{fontSize:12,color:C.muted}}>{pct}%</span>
                  <button aria-label={`Unarchive goal: ${g.title}`} onClick={()=>setArchived(g.id,false)} style={{fontSize:12,color:C.accent,background:C.inputBg,border:`1px solid ${C.accent}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Unarchive</button>
                  <button onClick={()=>delGoal(g.id)} style={{width:32,height:32,fontSize:16,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                </div>
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
  const preview=(html)=>((html||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()||"No content yet");

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
                <div style={{fontSize:12,color:C.muted,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{preview(n.content)}</div>
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
                  <div style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{preview(n.content)}</div>
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
function OverviewPage({habits,completions,C}) {
  const days=last90();
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
    </div>
  );
}
