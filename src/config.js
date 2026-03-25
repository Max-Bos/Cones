const { useState, useEffect, useRef, useMemo } = React;
const LucideSource =
  (typeof LucideReact !== "undefined" && LucideReact)
  || (typeof window !== "undefined" && (window.LucideReact || window.lucideReact || window.lucide))
  || {};
const Lucide = LucideSource.icons || LucideSource.default || LucideSource;
// Lucide UMD builds expose components with different key shapes across versions.
function pickLucideIcon(name) {
  return Lucide[name] || Lucide[`${name}Icon`] || Lucide[`Lucide${name}`] || FallbackIcon;
}
function FallbackIcon({size=16,color="currentColor",strokeWidth=2,fill="none",...props}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={!props["aria-label"]}
      {...props}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}
const Sun = pickLucideIcon("Sun");
const CheckSquare = pickLucideIcon("CheckSquare");
const Target = pickLucideIcon("Target");
const FileText = pickLucideIcon("FileText");
const BarChart2 = pickLucideIcon("BarChart2");
const Settings = pickLucideIcon("Settings");
const Flame = pickLucideIcon("Flame");
const Link2 = pickLucideIcon("Link2");
const Pin = pickLucideIcon("Pin");
const PinOff = pickLucideIcon("PinOff");
const Archive = pickLucideIcon("Archive");
const ArchiveRestore = pickLucideIcon("ArchiveRestore");
const Trash2 = pickLucideIcon("Trash2");
const Pencil = pickLucideIcon("Pencil");
const ChevronDown = pickLucideIcon("ChevronDown");
const ChevronUp = pickLucideIcon("ChevronUp");
const ChevronRight = pickLucideIcon("ChevronRight");
const ArrowUpRight = pickLucideIcon("ArrowUpRight");
const Plus = pickLucideIcon("Plus");
const X = pickLucideIcon("X");
const Check = pickLucideIcon("Check");
const Calendar = pickLucideIcon("Calendar");
const Clock = pickLucideIcon("Clock");
const User = pickLucideIcon("User");
const AlertCircle = pickLucideIcon("AlertCircle");
const Lock = pickLucideIcon("Lock");
const Flag = pickLucideIcon("Flag");
const Milestone = pickLucideIcon("Milestone");
const GitBranch = pickLucideIcon("GitBranch");
const Copy = pickLucideIcon("Copy");
const MessageSquare = pickLucideIcon("MessageSquare");
const MoreHorizontal = pickLucideIcon("MoreHorizontal");
const Triangle = pickLucideIcon("Triangle");
const Star = pickLucideIcon("Star");
const Zap = pickLucideIcon("Zap");
const TrendingUp = pickLucideIcon("TrendingUp");
const LayoutGrid = pickLucideIcon("LayoutGrid");
const List = pickLucideIcon("List");
const RefreshCw = pickLucideIcon("RefreshCw");
const Moon = pickLucideIcon("Moon");
const SunMedium = pickLucideIcon("SunMedium");
const LogOut = pickLucideIcon("LogOut");
const Shield = pickLucideIcon("Shield");
const Bell = pickLucideIcon("Bell");
const Eye = pickLucideIcon("Eye");
const EyeOff = pickLucideIcon("EyeOff");
const GripVertical = pickLucideIcon("GripVertical");
const Square = pickLucideIcon("Square");

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
const GOAL_TAGS = [
  { label:"Work", color:"#C4884A", bg:"#FEF3E2" },
  { label:"Personal", color:"#6B6BAA", bg:"#EEEEF8" },
  { label:"Health", color:"#5A8A5A", bg:"#EDF5ED" },
  { label:"Finance", color:"#AA8A4A", bg:"#F8F2E2" },
  { label:"Learning", color:"#4A8AAA", bg:"#E2F2F8" },
  { label:"Other", color:"#8C7560", bg:"#F7F2EA" },
];
const EFFORT_LABELS = [
  { value:0, label:"Not set" },
  { value:1, label:"XS — 1h" },
  { value:2, label:"S — few hours" },
  { value:3, label:"M — 1 day" },
  { value:5, label:"L — few days" },
  { value:8, label:"XL — 1 week" },
  { value:13, label:"XXL — weeks" },
];
const GOAL_TEMPLATES = [
  {
    id:"launch",
    name:"Product launch",
    description:"Ship a product from idea to launch",
    color:"#C4884A",
    tag:"Work",
    effort:13,
    subtasks:[
      "Define requirements",
      "Design mockups",
      "Build MVP",
      "Internal testing",
      "Fix critical bugs",
      "Launch",
    ],
  },
  {
    id:"fitness",
    name:"Fitness goal",
    description:"Build a consistent fitness routine",
    color:"#5A8A5A",
    tag:"Health",
    effort:5,
    subtasks:[
      "Set target metrics",
      "Create workout plan",
      "Week 1 check-in",
      "Week 2 check-in",
      "Month review",
    ],
  },
  {
    id:"learning",
    name:"Learn a skill",
    description:"Study and apply a new skill",
    color:"#4A8AAA",
    tag:"Learning",
    effort:8,
    subtasks:[
      "Find resources",
      "Complete beginner material",
      "Build a practice project",
      "Review and reflect",
    ],
  },
  {
    id:"project",
    name:"Side project",
    description:"Plan and execute a personal project",
    color:"#6B6BAA",
    tag:"Personal",
    effort:8,
    subtasks:[
      "Define scope",
      "Set milestones",
      "Build v1",
      "Get feedback",
      "Iterate",
    ],
  },
];
const LIGHT = {
  bg:"#F5F0E8",
  bgGradient:"linear-gradient(135deg, #F5F0E8 0%, #EDE8DC 50%, #F0EAE0 100%)",
  surface:"rgba(255,252,245,0.7)",
  surfaceSolid:"#FDFAF4",
  sidebar:"rgba(248,244,235,0.85)",
  cardBg:"rgba(255,252,245,0.65)",
  cardBorder:"rgba(255,255,255,0.8)",
  cardShadow:"0 4px 24px rgba(180,140,90,0.10), 0 1px 4px rgba(180,140,90,0.08)",
  inputBg:"rgba(255,252,245,0.9)",
  accent:"#C4603A",
  accentLight:"#E8896A",
  accentDark:"#8B3D22",
  accentBg:"rgba(196,96,58,0.10)",
  olive:"#7A8C4E",
  oliveLight:"#A3B068",
  oliveBg:"rgba(122,140,78,0.12)",
  sun:"#D4A017",
  sunLight:"#E8C050",
  sunBg:"rgba(212,160,23,0.12)",
  sky:"#4A8FA8",
  skyBg:"rgba(74,143,168,0.10)",
  text:"#2D2418",
  muted:"#7A6650",
  faint:"#B5A088",
  onAccent:"#FFFFFF",
  done:"#7A8C4E",
  doneBg:"rgba(122,140,78,0.12)",
  danger:"#B84040",
  dangerBg:"rgba(184,64,64,0.10)",
  streakBg:"rgba(212,160,23,0.12)",
  streakBorder:"rgba(212,160,23,0.4)",
  nav:"rgba(248,244,235,0.92)",
  navBorder:"rgba(196,96,58,0.15)",
  navBorderSolid:"#E8D8C8",
  border:"rgba(180,140,90,0.20)",
  borderSolid:"#E0D4C0",
  rowDivider:"rgba(180,140,90,0.12)",
  hoverBg:"rgba(196,96,58,0.07)",
  heat:["#EDE8DC","#F2D5BC","#E8B090","#D47858","#C4603A"],
  tags:{
    health:{color:"#7A8C4E",bg:"rgba(122,140,78,0.12)"},
    mind:{color:"#4A8FA8",bg:"rgba(74,143,168,0.10)"},
    work:{color:"#C4603A",bg:"rgba(196,96,58,0.10)"},
    social:{color:"#B8607A",bg:"rgba(184,96,122,0.10)"},
    other:{color:"#7A6650",bg:"rgba(122,102,80,0.10)"},
  },
  successBg:"rgba(122,140,78,0.10)",
  accentGlow:"rgba(196,96,58,0.18)",
  tagBorderAlpha:"40",
  scrollThumb:"rgba(196,96,58,0.25)",
};
const DARK = {
  bg:"#1C1610",
  bgGradient:"linear-gradient(135deg, #1C1610 0%, #221A12 50%, #1E1812 100%)",
  surface:"rgba(40,30,20,0.7)",
  surfaceSolid:"#2A2018",
  sidebar:"rgba(28,22,14,0.90)",
  cardBg:"rgba(44,34,22,0.70)",
  cardBorder:"rgba(255,255,255,0.06)",
  cardShadow:"0 4px 24px rgba(0,0,0,0.30), 0 1px 4px rgba(0,0,0,0.20)",
  inputBg:"rgba(50,38,26,0.90)",
  accent:"#D4784A",
  accentLight:"#E89A72",
  accentDark:"#F0B890",
  accentBg:"rgba(212,120,74,0.15)",
  olive:"#96A860",
  oliveLight:"#B0C478",
  oliveBg:"rgba(150,168,96,0.15)",
  sun:"#E8B828",
  sunLight:"#F0CC60",
  sunBg:"rgba(232,184,40,0.15)",
  sky:"#60A8C0",
  skyBg:"rgba(96,168,192,0.12)",
  text:"#F0E8D8",
  muted:"#B09880",
  faint:"#706050",
  onAccent:"#1C1008",
  done:"#96A860",
  doneBg:"rgba(150,168,96,0.15)",
  danger:"#D06060",
  dangerBg:"rgba(208,96,96,0.15)",
  streakBg:"rgba(232,184,40,0.15)",
  streakBorder:"rgba(232,184,40,0.35)",
  nav:"rgba(28,22,14,0.95)",
  navBorder:"rgba(212,120,74,0.15)",
  navBorderSolid:"#3A2C1C",
  border:"rgba(255,220,180,0.10)",
  borderSolid:"#3A2C1C",
  rowDivider:"rgba(255,220,180,0.06)",
  hoverBg:"rgba(212,120,74,0.10)",
  heat:["#2A2218","#3D2E1A","#5A4025","#8A5C38","#D4784A"],
  tags:{
    health:{color:"#96A860",bg:"rgba(150,168,96,0.15)"},
    mind:{color:"#60A8C0",bg:"rgba(96,168,192,0.12)"},
    work:{color:"#D4784A",bg:"rgba(212,120,74,0.15)"},
    social:{color:"#D07890",bg:"rgba(208,120,144,0.12)"},
    other:{color:"#B09880",bg:"rgba(176,152,128,0.12)"},
  },
  successBg:"rgba(150,168,96,0.12)",
  accentGlow:"rgba(212,120,74,0.20)",
  tagBorderAlpha:"40",
  scrollThumb:"rgba(212,120,74,0.25)",
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
