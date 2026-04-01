function GoalsPage({userId,habits,completions,onViewChange,C}) {
  const MS_PER_DAY=1000*60*60*24;
  const MOBILE_QUERY="(max-width: 639px)";
  const MIN_SUBTASK_LABEL_WIDTH=80;
  const DEFAULT_VIEWPORT_WIDTH=720;
  const MIN_CELL_WIDTH=3;
  const TODAY_SCROLL_OFFSET_RATIO=0.25;
  const MIN_BAR_WIDTH_FOR_INDICATORS=120;
  const MIN_MONTH_LABEL_SPACING=60;
  const MIN_TODAY_LABEL_SPACE=52;
  const getPriorityInitial=(priority)=>priority?.id==="critical"?"!":String(priority?.label||"").charAt(0).toUpperCase()||"?";
  const ZOOM_LEVELS={
    week:{days:21,label:"3w",showDetailHint:false},
    month:{days:90,label:"3m",showDetailHint:false},
    quarter:{days:180,label:"6m",showDetailHint:true},
    year:{days:365,label:"1y",showDetailHint:true},
  };
  const [goals,setGoals]=useState([]);
  const [subs,setSubs]=useState([]);
  const [milestones,setMilestones]=useState([]);
  const [loading,setLoading]=useState(true);
  const [newSub,setNewSub]=useState({});
  const [expanded,setExpanded]=useState({});
  const [roadmapExpanded,setRoadmapExpanded]=useState({});
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
  const [viewportWidth,setViewportWidth]=useState(0);
  const [toast,setToast]=useState("");
  const [promoteMsg,setPromoteMsg]=useState("");
  const [newMilestone,setNewMilestone]=useState({});
  const [editingMilestoneId,setEditingMilestoneId]=useState(null);
  const [milestoneEdit,setMilestoneEdit]=useState({title:"",date:""});
  const [newGoalSubtasks,setNewGoalSubtasks]=useState([]);
  const panelRef=useRef(null);
  const roadmapScrollRef=useRef(null);
  const roadmapAutoScrollKeyRef=useRef("");
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

  useEffect(()=>{
    const measure=()=>{
      if(!roadmapScrollRef.current) return;
      setViewportWidth(roadmapScrollRef.current.clientWidth||0);
    };
    measure();
    window.addEventListener("resize",measure);
    return ()=>window.removeEventListener("resize",measure);
  },[zoomLevel,view,isMobile]);

  const statusById=Object.fromEntries(STATUSES.map(s=>[s.id,s]));
  const priorityById=Object.fromEntries(PRIORITIES.map(p=>[p.id,p]));
  const priorityInitialById=Object.fromEntries(PRIORITIES.map(p=>[p.id,getPriorityInitial(p)]));
  const effortByValue=Object.fromEntries(EFFORT_LABELS.map(e=>[e.value,e.label]));
  const habitsById=Object.fromEntries((habits||[]).map(h=>[h.id,h]));
  const activeGoals=goals;
  const selectedGoal=activeGoals.find(g=>g.id===selectedGoalId)||null;
  const isOverdue=(d)=>!!d&&d<todayKey();
  const LABEL_COL=isMobile?120:190;
  const priorityInitial=(priorityId)=>priorityInitialById[priorityId]||"?";
  const truncateRoadmapLabel=(text,max)=>{
    const safe=String(text||"");
    if(max<=1) return safe.length?"…":"";
    return safe.length>max?`${safe.slice(0,max-1)}…`:safe;
  };
  const getSubtaskBarLabel=(subtask,width)=>width>MIN_SUBTASK_LABEL_WIDTH?`${subtask.done?"✓ ":""}${subtask.title||""}`:"";
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
    return !!(dep && dep.status!=="done");
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
  const todayTs=new Date(`${today}T00:00:00`).getTime();
  const oneWeekTs=todayTs+(7*MS_PER_DAY);
  const openGoals=activeGoals.filter(g=>g.status!=="done");
  const completedGoals=activeGoals.filter(g=>g.status==="done");
  const overdueGoals=openGoals.filter(g=>!!(g.due_date&&g.due_date<today));
  const dueSoonGoals=openGoals
    .filter(g=>{
      if(!g.due_date) return false;
      const dueTs=new Date(`${g.due_date}T00:00:00`).getTime();
      return dueTs>=todayTs&&dueTs<=oneWeekTs;
    })
    .sort((a,b)=>String(a.due_date||"9999-12-31").localeCompare(String(b.due_date||"9999-12-31")));
  const completionRate=activeGoals.length?Math.round((completedGoals.length/activeGoals.length)*100):0;
  const priorityRank={critical:4,high:3,medium:2,low:1};
  const focusGoals=[...openGoals].sort((a,b)=>{
    if(!!b.pinned!==!!a.pinned) return Number(!!b.pinned)-Number(!!a.pinned);
    const pa=priorityRank[a.priority]||0;
    const pb=priorityRank[b.priority]||0;
    if(pb!==pa) return pb-pa;
    return String(a.due_date||"9999-12-31").localeCompare(String(b.due_date||"9999-12-31"));
  }).slice(0,4);

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
      id,title,user_id:userId,
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
      setPromoteMsg("Subtask promoted to goal");
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
  const zoomCellWidth=Math.max(MIN_CELL_WIDTH,(viewportWidth||DEFAULT_VIEWPORT_WIDTH)/ZOOM_LEVELS[zoomLevel].days);
  const containerWidth=Math.max(280,viewportWidth-LABEL_COL-30,totalDays*zoomCellWidth);
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
  useEffect(()=>{
    if(view!=="roadmap"||!roadmapScrollRef.current||isMobile) return;
    const scrollKey=`${view}-${zoomLevel}-${Math.round((viewportWidth||0)/50)}`;
    if(roadmapAutoScrollKeyRef.current===scrollKey) return;
    roadmapAutoScrollKeyRef.current=scrollKey;
    const target=Math.max(0,todayPosition-(viewportWidth||0)*TODAY_SCROLL_OFFSET_RATIO);
    roadmapScrollRef.current.scrollLeft=target;
  },[view,zoomLevel,todayPosition,viewportWidth,isMobile]);
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
    const progress=effectiveProgress(g);
    const overdueGoal=!!(g.due_date&&g.due_date<todayKey()&&g.status!=="done");
    const subItems=goalSubs(g.id);
    const createdRaw=String(g.created_at||todayKey()||"");
    const createdDate=/^\d{4}-\d{2}-\d{2}/.test(createdRaw)?createdRaw.slice(0,10):todayKey();
    const goalStartDate=g.start_date?new Date(`${g.start_date}T00:00:00`):new Date(`${createdDate}T00:00:00`);
    const start=getRoadmapPosition(goalStartDate,minDate,totalDays,containerWidth);
    const fallbackEnd=getRoadmapPosition(new Date(goalStartDate.getTime()+30*MS_PER_DAY),minDate,totalDays,containerWidth);
    const due=g.due_date?new Date(`${g.due_date}T00:00:00`):null;
    const end=due?getRoadmapPosition(due,minDate,totalDays,containerWidth):fallbackEnd;
    const barWidth=Math.max(28,end-start);
    const top=acc.top;
    acc.rows[g.id]={start,end,top:top+18,color:g.color||C.accent};
    acc.nodes.push(
      <div key={`goal_${g.id}`}>
        {!isMobile&&<button aria-label={roadmapExpanded[g.id]!==false?`Collapse ${g.title}`:`Expand ${g.title}`} onClick={()=>setRoadmapExpanded(e=>({...e,[g.id]:!e[g.id]}))} style={{position:"absolute",left:-LABEL_COL+6,top:top+9,width:18,height:18,background:"transparent",border:"none",cursor:"pointer",color:C.muted,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{roadmapExpanded[g.id]!==false?<ChevronDown size={14} strokeWidth={2}/>:<ChevronRight size={14} strokeWidth={2}/>}</button>}
        <div style={{position:"absolute",left:-LABEL_COL+26,top:top+10,width:LABEL_COL-30,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{truncateRoadmapLabel(g.title,isMobile?12:36)}</div>
        <button aria-label={`Goal ${g.title}, ${status.label}`} onClick={()=>setSelectedGoalId(g.id)} title={`${g.title} • ${formatDateRange(g.start_date,g.due_date)} • ${status.label} • Assignee note: ${g.note?getNotePreview(g.note):"none"}`} style={{position:"absolute",left:start,top,width:barWidth,height:36,borderRadius:999,background:g.color||C.accent,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",color:"#fff",fontSize:12,fontWeight:600,overflow:"hidden",whiteSpace:"nowrap",border:overdueGoal?`2px dashed ${C.danger}`:"none",cursor:"pointer"}}>
          <span className="roadmap-bar-progress" style={{width:`${progress}%`}}/>
          <span style={{position:"relative",zIndex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:6}}>{g.title}</span>
          {barWidth>MIN_BAR_WIDTH_FOR_INDICATORS&&(
            <span style={{position:"relative",zIndex:1,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span>{priorityInitial(g.priority)}</span>
              <span style={{color:status.color||"#fff"}}>●</span>
            </span>
          )}
        </button>
        {goalMilestones(g.id).map(m=>{
          const x=getRoadmapPosition(new Date(`${m.date}T00:00:00`),minDate,totalDays,containerWidth);
          const isPast=!!(m.date&&m.date<todayKey());
          const isMissed=!!(isPast&&g.status!=="done");
          const milestoneColor=isMissed?C.danger:(isPast?C.done:(g.color||C.accent));
          const milestoneSize=isMobile?18:14;
          return (
            <div key={m.id} style={{position:"absolute",left:x-(milestoneSize/2),top:top+13}}>
              <div
                className="milestone-diamond"
                title={`${m.title} • ${formatDueDate(m.date)}`}
                onClick={()=>startMilestoneEdit(m)}
                style={{background:milestoneColor}}
              />
              <div className="milestone-label" style={{position:"absolute",top:isMobile?20:18,left:isMobile?-10:10,fontSize:11,color:C.muted,whiteSpace:"nowrap",background:isMobile?C.cardBg:"transparent",border:isMobile?`1px solid ${C.border}`:"none",padding:isMobile?"2px 6px":0,borderRadius:isMobile?6:0,opacity:isMobile?1:0,pointerEvents:"none"}}>
                {m.title} · {formatDueDate(m.date)}
              </div>
            </div>
          );
        })}
      </div>
    );
    acc.top+=44;
    if(!isMobile&&roadmapExpanded[g.id]!==false){
      subItems.forEach(s=>{
        const subStart=s.start_date?getRoadmapPosition(new Date(`${s.start_date}T00:00:00`),minDate,totalDays,containerWidth):start;
        const subEnd=s.due_date?getRoadmapPosition(new Date(`${s.due_date}T00:00:00`),minDate,totalDays,containerWidth):end;
        const subWidth=Math.max(18,subEnd-subStart);
        const subtaskBarLabel=getSubtaskBarLabel(s,subWidth);
        acc.nodes.push(
          <div key={`sub_${s.id}`}>
            <div aria-label={`Subtask of ${g.title}: ${s.title}`} style={{position:"absolute",left:-LABEL_COL+26,top:acc.top+2,width:LABEL_COL-30,fontSize:13,color:C.muted,textDecoration:s.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>└─ {s.title}</div>
            <div title={`${s.title} • ${formatDateRange(s.start_date,s.due_date)} • ${s.done?"Done":"Pending"} • Assignee note: ${s.note||"none"}`} style={{position:"absolute",left:subStart+24,top:acc.top,width:subWidth,height:20,borderRadius:999,border:s.due_date?"none":`1px dotted ${(g.color||C.accent)}AA`,background:s.done?`repeating-linear-gradient(135deg, ${(g.color||C.accent)}, ${(g.color||C.accent)} 8px, ${(g.color||C.accent)}CC 8px, ${(g.color||C.accent)}CC 16px)`:`${(g.color||C.accent)}88`,display:"flex",alignItems:"center",padding:"0 8px",fontSize:11,color:"#fff",opacity:s.done?0.5:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {subtaskBarLabel||(s.done?<Check size={11} strokeWidth={2.4}/>:null)}
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
          <div className="glass-card" style={{...cardStyle,padding:isMobile?"14px 14px":"18px 20px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <span className="section-label" style={{color:C.faint,marginBottom:0}}>Overview</span>
              <span title={focusGoals.length?focusGoals.map(g=>g.title).join(" • "):"Add goals to start"} style={{fontSize:12,color:C.muted,flex:"1 1 220px",minWidth:0,textAlign:isMobile?"left":"right",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Focus: {focusGoals.length?focusGoals.map(g=>g.title).join(" • "):"Add goals to start"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,minmax(0,1fr))":"repeat(5,minmax(0,1fr))",gap:8}}>
              {[
                {label:"Total",value:activeGoals.length},
                {label:"Open",value:openGoals.length},
                {label:"Done",value:completedGoals.length},
                {label:"Due soon",value:dueSoonGoals.length},
                {label:"Overdue",value:overdueGoals.length,color:overdueGoals.length?C.danger:C.text},
              ].map(item=>(
                <div key={item.label} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 10px"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:3}}>{item.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:item.color||C.text,lineHeight:1.1}}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:4}}>
                <span>Completion</span>
                <span style={{fontWeight:600,color:C.text}}>{completionRate}%</span>
              </div>
              <div style={{height:6,borderRadius:999,background:C.border,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${completionRate}%`,background:C.done}}/>
              </div>
            </div>
          </div>
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

          {activeGoals.length===0&&(
            <div style={{textAlign:"center",padding:"2.8rem 1rem",background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12}}>
              <div style={{width:82,height:82,borderRadius:"50%",border:`2px solid ${C.border}`,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:C.done}}><Check size={32} strokeWidth={2}/></div>
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
                const linkedHabitMeta=linkedHabit?(
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,marginLeft:6}}>
                    <Link2 size={12} strokeWidth={2}/>
                    {linkedHabit.name} — {linkedDone?"done today":"not done yet"}
                    {linkedDone&&<Check size={12} strokeWidth={2}/>}
                  </span>
                ):null;
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
                  <button title={g.pinned?"Unpin":"Pin"} onClick={()=>updateGoal(g.id,{pinned:!g.pinned})} style={{width:32,height:32,fontSize:14,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{g.pinned?<PinOff size={14} strokeWidth={2}/>:<Pin size={14} strokeWidth={2}/>}</button>
                  <button aria-label={`Edit goal ${g.title}`} onClick={()=>startGoalEdit(g)} style={{width:32,height:32,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Pencil size={14} strokeWidth={2}/></button>
                  <button onClick={()=>setExpanded(e=>({...e,[g.id]:!e[g.id]}))} style={{width:32,height:32,fontSize:11,color:C.faint,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{isOpen?<ChevronUp size={14} strokeWidth={2}/>:<ChevronDown size={14} strokeWidth={2}/>}</button>
                  {isMobile&&<button onClick={()=>setSelectedGoalId(g.id)} style={{height:32,border:`1px solid ${C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:C.inputBg,color:C.text,cursor:"pointer"}}>Open</button>}
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
                  <span style={{display:"inline-flex",gap:8,alignItems:"center"}}>Priority: {priority.label} <span style={{fontSize:11,padding:"2px 8px",borderRadius:999,border:`1px solid ${tagTheme.color}55`,background:tagTheme.bg,color:tagTheme.color}}>{g.tag||"Other"}</span> <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Clock size={12} strokeWidth={2}/>{(effortByValue[Number(g.effort||0)]||"").split(" ")[0]}</span></span>
                  <span style={{fontWeight:600,color:pct===100?C.done:C.accent}}>{pct}% {(g.manual_progress??-1)>=0&&<span style={{fontSize:10,color:C.muted}}>M</span>}</span>
                </div>
                {dep&&blocked&&<div style={{fontSize:12,color:C.danger,marginBottom:6,display:"inline-flex",alignItems:"center",gap:5}}><Lock size={12} strokeWidth={2}/>Blocked by: {dep.title}</div>}
                {dep&&!blocked&&<div style={{fontSize:12,color:C.done,marginBottom:6,display:"inline-flex",alignItems:"center",gap:5}}><Check size={12} strokeWidth={2}/>Dependency met</div>}
                <div style={{fontSize:12,color:g.due_date&&isOverdue(g.due_date)?C.danger:C.muted,marginBottom:6,display:"inline-flex",alignItems:"center",gap:5}}><Calendar size={12} strokeWidth={2}/>{formatDateRange(g.start_date,g.due_date)}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:6}}>
                  <span>{done}/{items.length||0} subtasks {linkedHabitMeta}</span>
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
                            <button title="Promote to goal" onClick={()=>promoteSubToGoal(s,g)} style={{width:28,height:28,fontSize:13,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><ArrowUpRight size={13} strokeWidth={2}/></button>
                            <button onClick={()=>delSub(s.id)} style={{width:28,height:28,fontSize:14,color:C.faint,background:"transparent",border:"none",cursor:"pointer",lineHeight:1,borderRadius:8}}>&times;</button>
                          </div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,paddingLeft:"calc(22px + 8px)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11,color:C.muted,flexWrap:"wrap"}}>
                              <button className="badge glass-card-sm" aria-label={`Toggle date range picker for ${s.title}`} aria-expanded={!!openSubDates[s.id]} onClick={()=>setOpenSubDates(n=>({...n,[s.id]:!n[s.id]}))} style={{color:isOverdue(s.due_date)?C.danger:C.muted,border:`1px solid ${isOverdue(s.due_date)?C.danger:C.border}`,padding:"2px 8px",background:C.inputBg,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}><Calendar size={11} strokeWidth={2}/>{formatDateRange(s.start_date,s.due_date)}</button>
                              {s.assignee&&<span style={{display:"inline-flex",alignItems:"center",gap:4}}><User size={11} strokeWidth={2}/>{s.assignee}</span>}
                            </div>
                            <button onClick={()=>setOpenSubNote(n=>({...n,[s.id]:!n[s.id]}))} style={{width:28,height:28,fontSize:13,color:C.muted,background:"transparent",border:"none",cursor:"pointer",borderRadius:8,flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><MessageSquare size={13} strokeWidth={2}/></button>
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
                        <span style={{fontSize:12,color:C.text,flex:1,display:"inline-flex",alignItems:"center",gap:4}}><Milestone size={12} strokeWidth={2}/>{m.title} {formatDueDate(m.date)}</span>
                        <button onClick={()=>startMilestoneEdit(m)} style={{border:"none",background:"transparent",cursor:"pointer",color:C.muted,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13} strokeWidth={2}/></button>
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

          {dueSoonGoals.length>0&&(
            <div style={{marginTop:2,marginBottom:8}}>
              <div className="section-label" style={{color:C.faint,marginBottom:8}}>Due soon</div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
                {dueSoonGoals.slice(0,isMobile?2:4).map(g=>(
                  <button key={g.id} onClick={()=>setSelectedGoalId(g.id)} style={{textAlign:"left",background:C.inputBg,border:`1px solid ${C.border}`,borderLeft:`3px solid ${g.color||C.accent}`,borderRadius:10,padding:"8px 10px",cursor:"pointer"}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.title}</div>
                    <div style={{fontSize:11,color:isOverdue(g.due_date)?C.danger:C.muted,marginTop:3}}>{formatDateRange(g.start_date,g.due_date)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {view==="roadmap"&&(
        <div ref={roadmapScrollRef} style={{background:C.cardBg,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 16px",overflowX:"auto",minHeight:400}}>
          <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:isMobile?2:10}}>
            {Object.keys(ZOOM_LEVELS).map(z=>(
              <button key={z} onClick={()=>setZoomLevel(z)} style={{height:30,border:`1px solid ${zoomLevel===z?C.accent:C.border}`,borderRadius:8,padding:"0 10px",fontSize:12,background:zoomLevel===z?C.hoverBg:C.inputBg,color:zoomLevel===z?C.accent:C.muted,cursor:"pointer"}}>{ZOOM_LEVELS[z].label}</button>
            ))}
          </div>
          {!isMobile&&<div style={{fontSize:11,color:C.muted,textAlign:"right",marginBottom:10}}>On mobile devices, a simplified card-based layout is shown.</div>}
          {roadmapGoals.length===0?(
            <div style={{textAlign:"center",padding:"3rem 1rem"}}>
              <p style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:6}}>No goals with timeline dates</p>
              <p style={{fontSize:13,color:C.muted,marginBottom:12}}>Add start/end dates to your goals to see them on the roadmap</p>
              <button onClick={()=>setView("list")} style={{border:`1px solid ${C.accent}`,borderRadius:8,padding:"10px 16px",fontSize:13,fontWeight:500,background:C.accent,color:C.onAccent,cursor:"pointer"}}>Go to list view</button>
            </div>
          ):isMobile?(
            <div style={{display:"grid",gap:10}}>
              {[...roadmapGoals].sort((a,b)=>{
                const ad=a.due_date||"9999-12-31";
                const bd=b.due_date||"9999-12-31";
                return ad.localeCompare(bd);
              }).map(g=>{
                const status=statusById[g.status]||statusById.not_started;
                const pct=effectiveProgress(g);
                return (
                  <button key={g.id} className="roadmap-mobile-card" onClick={()=>setSelectedGoalId(g.id)} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderLeft:`4px solid ${g.color||C.accent}`,borderRadius:10,padding:"10px 12px",textAlign:"left",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</div>
                      <span style={{fontSize:10,color:status.color,background:`${status.color}22`,borderRadius:999,padding:"2px 7px",flexShrink:0}}>{status.label}</span>
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>{formatDateRange(g.start_date,g.due_date)}</div>
                    <div style={{height:6,borderRadius:999,background:C.border,overflow:"hidden",marginTop:8}}>
                      <div style={{height:"100%",width:`${pct}%`,background:g.color||C.accent}}/>
                    </div>
                  </button>
                );
              })}
            </div>
          ):(
            <div style={{minWidth:containerWidth+LABEL_COL+20}}>
              {ZOOM_LEVELS[zoomLevel].showDetailHint&&<div style={{marginLeft:LABEL_COL,fontSize:11,color:C.muted,marginBottom:6}}>Zoom in to month/week for more detailed labels.</div>}
              <div style={{position:"relative",height:46,marginLeft:LABEL_COL,borderBottom:`1px solid ${C.border}`}}>
                {monthTicks.map((m,i)=>{
                  const x=getRoadmapPosition(m,minDate,totalDays,containerWidth);
                  const next=monthTicks[i+1]?getRoadmapPosition(monthTicks[i+1],minDate,totalDays,containerWidth):containerWidth;
                  const hasRoom=(next-x)>=MIN_MONTH_LABEL_SPACING;
                  return (
                    <React.Fragment key={m.toISOString()}>
                      <div style={{position:"absolute",left:x,top:0,bottom:0,width:1,background:C.rowDivider}}/>
                      {hasRoom&&<div style={{position:"absolute",left:x+4,top:2,fontSize:12,fontWeight:600,color:C.muted}}>{m.toLocaleDateString("nl-NL",{month:"short"})}</div>}
                    </React.Fragment>
                  );
                })}
                {(zoomLevel==="week"||zoomLevel==="month")&&weekTicks.map((w)=>{
                  const x=getRoadmapPosition(w,minDate,totalDays,containerWidth);
                  return <div key={`w_${w.toISOString()}`} style={{position:"absolute",left:x,bottom:0,width:1,height:8,background:C.border}}/>;
                })}
                <div style={{position:"absolute",left:todayPosition,top:0,bottom:0,width:2,background:C.accent,zIndex:2}}/>
                <div style={{position:"absolute",left:todayPosition-4,top:0,fontSize:10,color:C.accent}}>▼</div>
                {containerWidth-todayPosition>MIN_TODAY_LABEL_SPACE&&<div style={{position:"absolute",left:todayPosition+4,top:2,fontSize:11,color:C.accent,fontWeight:600}}>Today</div>}
              </div>
              <div style={{position:"relative",width:containerWidth,marginLeft:LABEL_COL,paddingTop:8,paddingBottom:8,height:roadmapLayout.top+12}}>
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
                        {g.pinned&&<div style={{position:"absolute",right:8,top:8,fontSize:12,color:C.muted,display:"inline-flex",alignItems:"center"}}><Pin size={12} strokeWidth={2}/></div>}
                        <button title={g.pinned?"Unpin":"Pin"} onClick={(e)=>{e.stopPropagation();updateGoal(g.id,{pinned:!g.pinned});}} style={{position:"absolute",right:28,top:6,width:24,height:24,fontSize:12,color:C.muted,background:"transparent",border:"none",cursor:"pointer",zIndex:2,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{g.pinned?<PinOff size={12} strokeWidth={2}/>:<Pin size={12} strokeWidth={2}/>}</button>
                        {blocked&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.04)",borderRadius:10,pointerEvents:"none"}}/>}
                        <div style={{height:6,borderRadius:999,background:g.color||GOAL_COLORS[0],marginBottom:12}}/>
                        <div style={{fontSize:16,fontWeight:500,color:C.text,marginBottom:10}}>{g.title}</div>
                        {g.description&&<div style={{fontSize:12,color:C.muted,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{g.description}</div>}
                        <div style={{display:"inline-flex",alignItems:"center",fontSize:11,padding:"2px 8px",borderRadius:999,border:`1px solid ${tagTheme.color}55`,background:tagTheme.bg,color:tagTheme.color,marginBottom:4}}>{g.tag||"Other"}</div>
                        <div style={{fontSize:12,color:priority.color,marginBottom:4,display:"inline-flex",alignItems:"center",gap:4}}><Flag size={12} strokeWidth={2}/>{priority.label} priority</div>
                        <div style={{fontSize:12,color:g.due_date&&isOverdue(g.due_date)?C.danger:C.muted,marginBottom:8,display:"inline-flex",alignItems:"center",gap:4}}><Calendar size={12} strokeWidth={2}/>{formatDateRange(g.start_date,g.due_date)}</div>
                        <div style={{height:6,borderRadius:999,background:C.border,overflow:"hidden",marginBottom:7}}><div style={{height:"100%",width:`${pct}%`,background:g.color||C.accent}}/></div>
                        <div style={{fontSize:11,color:C.muted,marginBottom:4,display:"inline-flex",alignItems:"center",gap:4}}>{done}/{subItems.length||0} • <Clock size={11} strokeWidth={2}/> {(effortByValue[Number(g.effort||0)]||"").split(" ")[0]}{(g.manual_progress??-1)>=0?" • M":""}</div>
                        {dep&&blocked&&<div style={{fontSize:11,color:C.danger,marginBottom:4,display:"inline-flex",alignItems:"center",gap:4}}><Lock size={11} strokeWidth={2}/>Blocked by {dep.title}</div>}
                        {dep&&!blocked&&<div style={{fontSize:11,color:C.done,marginBottom:4,display:"inline-flex",alignItems:"center",gap:4}}><Check size={11} strokeWidth={2}/>Dependency met</div>}
                        {subItems.slice(0,3).map(s=><div key={s.id} aria-label={`${s.title} ${s.done?"done":"not done"}`} style={{fontSize:11,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none",marginBottom:2,display:"inline-flex",alignItems:"center",gap:4}}>{s.done?<CheckSquare size={11} strokeWidth={2}/>:<Square size={11} strokeWidth={2}/>} {s.title}</div>)}
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
                  <button aria-pressed={s.done} aria-label={s.done?`Subtask status: complete. Click to mark ${s.title} as incomplete`:`Subtask status: incomplete. Click to mark ${s.title} as complete`} onClick={()=>toggleSub(s)} style={{width:20,height:20,border:`1px solid ${s.done?C.done:C.border}`,borderRadius:6,background:s.done?C.done:"transparent",color:C.onAccent,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{s.done?<Check size={12} strokeWidth={2.4}/>:null}</button>
                  <span style={{flex:1,fontSize:12,color:s.done?C.muted:C.text,textDecoration:s.done?"line-through":"none"}}>{s.title}</span>
                  <button className="badge glass-card-sm" aria-label={`Toggle date range picker for ${s.title}`} aria-expanded={!!openSubDates[s.id]} onClick={()=>setOpenSubDates(n=>({...n,[s.id]:!n[s.id]}))} style={{color:C.muted,border:`1px solid ${C.border}`,background:C.inputBg,cursor:"pointer"}}>{formatDateRange(s.start_date,s.due_date)}</button>
                  <input value={s.assignee||""} onChange={e=>updateSub(s.id,{assignee:e.target.value})} placeholder="Assignee" style={{width:90,height:24,border:`1px solid ${C.border}`,borderRadius:6,padding:"0 6px",fontSize:11,background:C.inputBg,color:C.text}}/>
                  <button onClick={()=>setOpenSubNote(n=>({...n,[s.id]:!n[s.id]}))} style={{width:24,height:24,background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><MessageSquare size={12} strokeWidth={2}/></button>
                  <button onClick={()=>promoteSubToGoal(s,selectedGoal)} style={{width:24,height:24,background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><ArrowUpRight size={12} strokeWidth={2}/></button>
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
                <span style={{fontSize:12,color:C.text,flex:1,display:"inline-flex",alignItems:"center",gap:4}}><Milestone size={12} strokeWidth={2}/>{m.title} {formatDueDate(m.date)}</span>
                <button onClick={()=>startMilestoneEdit(m)} style={{border:"none",background:"transparent",cursor:"pointer",color:C.muted,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Pencil size={13} strokeWidth={2}/></button>
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
