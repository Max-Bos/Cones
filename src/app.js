/* ══════════════ ROOT ══════════════ */
function App() {
  const [dark,setDark]=useState(()=>window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [page,setPage]=useState("today");
  const [habits,setHabits]=useState([]);
  const [completions,setCompletions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [reminder,setReminder]=useState(null);
  const [user,setUser]=useState(null);
  const [needsMFA,setNeedsMFA]=useState(false);

  const C=dark?DARK:LIGHT;

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null);
      if(!session) setLoading(false);
    });
    const {data:{subscription}}=sb.auth.onAuthStateChange(async(_e,session)=>{
      const u=session?.user??null;
      setUser(u);
      if(!u){setLoading(false);setHabits([]);setCompletions([]);setNeedsMFA(false);return;}
      const aal=await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      if(aal.data?.nextLevel==="aal2"&&aal.data?.currentLevel==="aal1") setNeedsMFA(true);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user||needsMFA) return;
    (async()=>{
      setLoading(true);
      try {
        const [{data:h,error:he},{data:c,error:ce}]=await Promise.all([
          sb.from("habits").select("*").order("created_at"),
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
  },[user,needsMFA]);

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
  if(needsMFA) return <TwoFAVerify C={C} onVerified={()=>setNeedsMFA(false)}/>;
  if(loading) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div><p style={{fontSize:22,fontWeight:500,color:C.text,textAlign:"center",marginBottom:20}}>Cones</p><Spinner C={C}/></div>
    </div>
  );

  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",flex:1,maxWidth:900,margin:"0 auto",width:"100%",padding:"1.5rem 1rem"}}>
        <div style={{width:180,flexShrink:0,marginRight:"2rem",display:"flex",flexDirection:"column"}} className="desktop-sidebar">
          <div style={{marginBottom:"2rem"}}>
            <h1 style={{fontSize:20,fontWeight:600,color:C.accent,letterSpacing:"-0.02em"}}>Cones</h1>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {nav.map(n=><NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={()=>setPage(n.id)} C={C} mobile={false}/>)}
          </div>
          <div style={{marginTop:"auto",paddingTop:"2rem"}}>
            <p style={{fontSize:11,color:C.faint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</p>
          </div>
        </div>
        <div style={{flex:1,minWidth:0,paddingBottom:"5rem"}}>
          {page==="today"    &&<TodayPage    habits={habits} completions={completions} setCompletions={setCompletions} userId={user.id} C={C}/>}
          {page==="habits"   &&<HabitsPage   habits={habits} setHabits={setHabits} completions={completions} userId={user.id} C={C}/>}
          {page==="goals"    &&<GoalsPage    userId={user.id} C={C}/>}
          {page==="notes"    &&<NotesPage    userId={user.id} C={C}/>}
          {page==="overview" &&<OverviewPage habits={habits} completions={completions} C={C}/>}
          {page==="settings" &&<SettingsPage user={user} C={C} dark={dark} setDark={setDark} reminder={reminder} setReminder={setReminder} onSignOut={signOut}/>}
        </div>
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.nav,borderTop:`0.5px solid ${C.navBorder}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {nav.map(n=><NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={()=>setPage(n.id)} C={C} mobile={true}/>)}
      </div>
      <style>{`@media(min-width:640px){.desktop-sidebar{display:flex!important;flex-direction:column;}}@media(max-width:639px){.desktop-sidebar{display:none!important;}}`}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
