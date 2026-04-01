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
