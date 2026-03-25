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
  { label:"Health", key:"health" },
  { label:"Mind",   key:"mind" },
  { label:"Work",   key:"work" },
  { label:"Social", key:"social" },
  { label:"Other",  key:"other" },
];
const STATUSES = [
  { id:"not_started", label:"Not started", color:"#8C7560" },
  { id:"in_progress", label:"In progress", color:"#C4884A" },
  { id:"done", label:"Done", color:"#5A8A5A" },
  { id:"blocked", label:"Blocked", color:"#C45A5A" },
];
const PRIORITIES = [
  { id:"low", label:"Low", color:"#8C7560" },
  { id:"medium", label:"Medium", color:"#C4884A" },
  { id:"high", label:"High", color:"#D47A2A" },
  { id:"critical", label:"Critical", color:"#C45A5A" },
];
const GOAL_COLORS = [
  "#C4884A", "#5A8A5A", "#6B6BAA", "#C45A7A",
  "#4A8AAA", "#AA8A4A", "#7AAA7A", "#AA4A6B"
];
const LIGHT = {
  bg:"#FDFAF6", surface:"#F7F2EA", border:"#E8DFD0",
  accent:"#C4884A", accentDark:"#8B5E30",
  text:"#3D2B1A", muted:"#8C7560", faint:"#B5A08A",
  done:"#5A8A5A", doneBg:"#EDF5ED",
  streakBg:"#FEF3E2", streakBorder:"#EAC98A",
  nav:"#F2EBE0", navBorder:"#E0D4C0", danger:"#C45A5A",
  sidebar:"#F2EBE0",
  cardBg:"#FBF6EF",
  inputBg:"#FFFCF8",
  hoverBg:"#F3EBDD",
  successBg:"#EDF5ED",
  onAccent:"#FFF8F0",
  dangerBg:"#FCECEC",
  rowDivider:"#EDE3D4",
  accentGlow:"#C4884A22",
  tagBorderAlpha:"4D",
  heat:["#EFE5D6","#F2D9B7","#E7BD86","#D79A5A","#C4884A"],
  tags:{
    health:{color:"#5A8A5A",bg:"#EDF5ED"},
    mind:{color:"#6B6BAA",bg:"#EEEEF8"},
    work:{color:"#C4884A",bg:"#FEF3E2"},
    social:{color:"#C45A7A",bg:"#FCEEF3"},
    other:{color:"#8C7560",bg:"#F7F2EA"},
  },
};
const DARK = {
  bg:"#1A1410", surface:"#251E17", border:"#3A2E22",
  accent:"#D4985A", accentDark:"#E8B87A",
  text:"#EDE5D8", muted:"#A08878", faint:"#6A5848",
  done:"#7AAA7A", doneBg:"#1E2E1E",
  streakBg:"#2E2010", streakBorder:"#6A4A20",
  nav:"#201810", navBorder:"#3A2E22", danger:"#D47070",
  sidebar:"#1E1610",
  cardBg:"#2B231B",
  inputBg:"#2A221A",
  hoverBg:"#32271D",
  successBg:"#1E2E1E",
  onAccent:"#1C130B",
  dangerBg:"#3A1F1F",
  rowDivider:"#433224",
  accentGlow:"#D4985A22",
  tagBorderAlpha:"4D",
  heat:["#3A3128","#5A412A","#8A6135","#B67E46","#D4985A"],
  tags:{
    health:{color:"#7AAA7A",bg:"#263726"},
    mind:{color:"#9A9AD6",bg:"#2A2A3F"},
    work:{color:"#D4985A",bg:"#3A2A18"},
    social:{color:"#D7829D",bg:"#3D2330"},
    other:{color:"#B29A84",bg:"#30281F"},
  },
};

function getTagTheme(tag, C) {
  const tagConfig = TAGS.find(x=>x.label===tag);
  return (tagConfig ? C.tags?.[tagConfig.key] : null) || C.tags?.other || {color:C.accent,bg:C.hoverBg};
}

const LIFE_YEARS = 90;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = LIFE_YEARS * WEEKS_PER_YEAR;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const LIFE_WEEK_CELL_PX = 8;
const LIFE_WEEK_GAP_PX = 2;

function getWeekIndex(birthDate) {
  if(!birthDate) return 0;
  const [year,month,day] = String(birthDate).split("-").map(Number);
  if(!year || !month || !day) return 0;
  const birthUtc = Date.UTC(year,month-1,day);
  if(Number.isNaN(birthUtc)) return 0;
  const now = new Date();
  const nowUtc = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  return Math.min(TOTAL_WEEKS, Math.max(0, Math.floor((nowUtc - birthUtc) / MS_PER_WEEK)));
}

function getYearLabel(rowIndex) {
  return rowIndex.toLocaleString();
}

const todayKey = () => new Date().toISOString().slice(0,10);
const last90 = () => { const d=[]; for(let i=89;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); d.push(x.toISOString().slice(0,10)); } return d; };
const last30 = () => last90().slice(-30);
const computeStreak = (id, comps) => { let s=0,d=new Date(); while(true){ const k=d.toISOString().slice(0,10); if(comps.find(c=>c.habit_id===id&&c.date===k)){s++;d.setDate(d.getDate()-1);}else break; } return s; };
const computeLongest = (id, comps) => { const days=last90(); let b=0,c=0; days.forEach(d=>{ if(comps.find(x=>x.habit_id===id&&x.date===d)){c++;b=Math.max(b,c);}else c=0; }); return b; };
