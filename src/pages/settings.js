function SettingsPage({user,C,dark,setDark,reminder,setReminder,onSignOut}) {
  const requestReminder=async()=>{
    if(!("Notification"in window)) return alert("Notifications not supported.");
    const perm=await Notification.requestPermission();
    if(perm==="granted"){
      const t=prompt("Daily reminder time (e.g. 20:00):","20:00");
      if(t){setReminder(t);new Notification("Cones reminder set",{body:`Reminder set for ${t} daily.`});}
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
