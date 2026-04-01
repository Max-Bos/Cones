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
          <h1 style={{fontSize:32,fontWeight:600,color:C.accent,letterSpacing:"-0.03em",marginBottom:6,display:"flex",alignItems:"center",gap:8}}><Triangle aria-hidden="true" size={20} fill="currentColor" strokeWidth={1.8}/> Cones</h1>
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
