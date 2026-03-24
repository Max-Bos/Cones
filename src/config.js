const { useState, useEffect, useRef, useMemo } = React;

const SUPABASE_URL = "https://idfxmacdmyzhrwqjeidl.supabase.co";
const SUPABASE_KEY = "sb_publishable_kLkc8DvWZ9cTVeLk5mBB0Q_IwSD95eR";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Handle Supabase auth redirect tokens in the URL hash
if (window.location.hash && window.location.hash.includes("access_token")) {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(() => { window.history.replaceState(null, "", window.location.pathname); });
  }
}

const TAGS = [
  { label:"Health", color:"#5A8A5A", bg:"#EDF5ED" },
  { label:"Mind",   color:"#6B6BAA", bg:"#EEEEF8" },
  { label:"Work",   color:"#C4884A", bg:"#FEF3E2" },
  { label:"Social", color:"#C45A7A", bg:"#FCEEF3" },
  { label:"Other",  color:"#8C7560", bg:"#F7F2EA" },
];
const LIGHT = {
  bg:"#FDFAF6", surface:"#F7F2EA", border:"#E8DFD0",
  accent:"#C4884A", accentDark:"#8B5E30",
  text:"#3D2B1A", muted:"#8C7560", faint:"#B5A08A",
  done:"#5A8A5A", doneBg:"#EDF5ED",
  streakBg:"#FEF3E2", streakBorder:"#EAC98A",
  nav:"#F2EBE0", navBorder:"#E0D4C0", danger:"#C45A5A",
  sidebar:"#F2EBE0",
};
const DARK = {
  bg:"#1A1410", surface:"#251E17", border:"#3A2E22",
  accent:"#D4985A", accentDark:"#E8B87A",
  text:"#EDE5D8", muted:"#A08878", faint:"#6A5848",
  done:"#7AAA7A", doneBg:"#1E2E1E",
  streakBg:"#2E2010", streakBorder:"#6A4A20",
  nav:"#201810", navBorder:"#3A2E22", danger:"#D47070",
  sidebar:"#201810",
};

const todayKey = () => new Date().toISOString().slice(0,10);
const last90 = () => { const d=[]; for(let i=89;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); d.push(x.toISOString().slice(0,10)); } return d; };
const last30 = () => last90().slice(-30);
const computeStreak = (id, comps) => { let s=0,d=new Date(); while(true){ const k=d.toISOString().slice(0,10); if(comps.find(c=>c.habit_id===id&&c.date===k)){s++;d.setDate(d.getDate()-1);}else break; } return s; };
const computeLongest = (id, comps) => { const days=last90(); let b=0,c=0; days.forEach(d=>{ if(comps.find(x=>x.habit_id===id&&x.date===d)){c++;b=Math.max(b,c);}else c=0; }); return b; };
