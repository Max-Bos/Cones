/* ══════════════ ROOT ══════════════ */
function App() {
  const [dark,setDark]=useState(()=>window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [page,setPage]=useState("today");
  const [habits,setHabits]=useState([]);
  const [completions,setCompletions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [reminder,setReminder]=useState(null);
  const [user,setUser]=useState(null);

  const C=dark?DARK:LIGHT;

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null);
      if(!session) setLoading(false);
    });
    const {data:{subscription}}=sb.auth.onAuthStateChange((_e,session)=>{
      const u=session?.user??null;
      setUser(u);
      if(!u){setLoading(false);setHabits([]);setCompletions([]);return;}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user) return;
    (async()=>{
      setLoading(true);
      try {
        const [{data:h,error:he},{data:c,error:ce}]=await Promise.all([
          sb.from("habits").select("*").order("position"),
          sb.from("completions").select("*"),
        ]);
        if(he) console.error("habits error:",he);
        if(ce) console.error("completions error:",ce);
        setHabits(h||[]); setCompletions(c||[]);
      } catch(e) {
        console.error("fetch error:",e);
      } finally {
        setLoading(false);
      }
    })();
  },[user]);

  const signOut=async()=>{ await sb.auth.signOut(); setPage("today"); };

  const nav=[
    {id:"today",   icon:"☀️",label:"Today"},
    {id:"habits",  icon:"✓", label:"Habits"},
    {id:"goals",   icon:"◎", label:"Goals"},
    {id:"notes",   icon:"✎", label:"Notes"},
    {id:"overview",icon:"◈", label:"Overview"},
    {id:"settings",icon:"⚙", label:"Settings"},
  ];

  if(!user) return <AuthPage C={C}/>;
  if(loading) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div><p style={{fontSize:22,fontWeight:500,color:C.text,textAlign:"center",marginBottom:20}}>Cones</p><Spinner C={C}/></div>
    </div>
  );

  const currentPageLabel = nav.find(n=>n.id===page)?.label ?? "";
  const initials = user.email ? user.email[0].toUpperCase() : "?";

  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex"}}>

      {/* ── Desktop sidebar ── */}
      <div className="desktop-sidebar" style={{
        width:220,flexShrink:0,
        background:C.sidebar,
        borderRight:`0.5px solid ${C.border}`,
        height:"100vh",position:"sticky",top:0,
        display:"flex",flexDirection:"column",
        padding:"1.5rem 0",overflowY:"auto",
      }}>
        <div style={{padding:"0 1.25rem",marginBottom:"1.5rem"}}>
          <h1 style={{fontSize:20,fontWeight:600,color:C.accent,letterSpacing:"-0.02em"}}>Cones</h1>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flex:1,padding:"0 8px"}}>
          {nav.map(n=>(
            <React.Fragment key={n.id}>
              {n.id==="settings"&&<div style={{height:"0.5px",background:C.border,margin:"8px 4px"}}/>}
              <NavItem icon={n.icon} label={n.label} active={page===n.id} onClick={()=>setPage(n.id)} C={C} mobile={false}/>
            </React.Fragment>
          ))}
        </div>
        <div style={{padding:"0 1.25rem"}}>
          <div style={{height:"0.5px",background:C.border,marginBottom:"1rem"}}/>
          <div style={{width:28,height:28,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:600,marginBottom:6}}>
            {initials}
          </div>
          <p style={{fontSize:11,color:C.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</p>
        </div>
      </div>

      {/* ── Main content column ── */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>

        {/* Desktop top bar */}
        <div className="top-bar" style={{borderBottom:`0.5px solid ${C.border}`}}>
          <h2 style={{color:C.text}}>{currentPageLabel}</h2>
          <button onClick={()=>setDark(d=>!d)} style={{fontSize:15,background:"none",border:`0.5px solid ${C.border}`,borderRadius:8,padding:"5px 12px",color:C.muted,cursor:"pointer",transition:"background 0.15s"}}>
            {dark?"☀ Light":"☾ Dark"}
          </button>
        </div>

        {/* Page content */}
        <div className="content-area">
          {page==="today"    &&<TodayPage    habits={habits} completions={completions} setCompletions={setCompletions} userId={user.id} C={C}/>}
          {page==="habits"   &&<HabitsPage   habits={habits} setHabits={setHabits} completions={completions} userId={user.id} C={C}/>}
          {page==="goals"    &&<GoalsPage    userId={user.id} C={C}/>}
          {page==="notes"    &&<NotesPage    userId={user.id} C={C}/>}
          {page==="overview" &&<OverviewPage habits={habits} completions={completions} C={C}/>}
          {page==="settings" &&<SettingsPage user={user} C={C} dark={dark} setDark={setDark} reminder={reminder} setReminder={setReminder} onSignOut={signOut}/>}
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="mobile-bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:C.nav,borderTop:`0.5px solid ${C.navBorder}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {nav.map(n=><NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={()=>setPage(n.id)} C={C} mobile={true}/>)}
      </div>

      <style>{`
        @media(min-width:640px){
          .desktop-sidebar{display:flex!important;}
          .mobile-bottom-nav{display:none!important;}
          .top-bar{display:flex!important;align-items:center;justify-content:space-between;padding:1.5rem 2.5rem 1rem;margin-bottom:0;}
          .top-bar h2{font-size:22px;font-weight:500;letter-spacing:-0.02em;}
          .content-area{padding:1.5rem 2.5rem 2rem;max-width:720px;}
          .page-heading{display:none!important;}
        }
        @media(max-width:639px){
          .desktop-sidebar{display:none!important;}
          .top-bar{display:none!important;}
          .content-area{padding:1.5rem 1rem 5rem;}
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
