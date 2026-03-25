const { useState, useEffect, useRef, useMemo } = React;
function Sun({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function CheckSquare({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function Target({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function FileText({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function BarChart2({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M5 21v-6" />
      <path d="M12 21V3" />
      <path d="M19 21V9" />
    </svg>
  );
}

function Settings({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Flame({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
    </svg>
  );
}

function Link2({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </svg>
  );
}

function Pin({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

function PinOff({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M12 17v5" />
      <path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89" />
      <path d="m2 2 20 20" />
      <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11" />
    </svg>
  );
}

function Archive({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function ArchiveRestore({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h2" />
      <path d="M20 8v11a2 2 0 0 1-2 2h-2" />
      <path d="m9 15 3-3 3 3" />
      <path d="M12 12v9" />
    </svg>
  );
}

function Trash2({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function Pencil({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function ChevronDown({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUp({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronRight({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ArrowUpRight({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function Plus({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function X({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function Check({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Calendar({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function Clock({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function User({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AlertCircle({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function Lock({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Flag({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />
    </svg>
  );
}

function Milestone({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M12 13v8" />
      <path d="M12 3v3" />
      <path d="M18.172 6a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function GitBranch({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M15 6a9 9 0 0 0-9 9V3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
    </svg>
  );
}

function Copy({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function MessageSquare({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MoreHorizontal({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function Triangle({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  );
}

function Star({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}

function Zap({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function TrendingUp({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </svg>
  );
}

function LayoutGrid({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function List({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M3 5h.01" />
      <path d="M3 12h.01" />
      <path d="M3 19h.01" />
      <path d="M8 5h13" />
      <path d="M8 12h13" />
      <path d="M8 19h13" />
    </svg>
  );
}

function RefreshCw({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function Moon({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );
}

function SunMedium({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1" />
      <path d="M12 20v1" />
      <path d="M3 12h1" />
      <path d="M20 12h1" />
      <path d="m18.364 5.636-.707.707" />
      <path d="m6.343 17.657-.707.707" />
      <path d="m5.636 5.636.707.707" />
      <path d="m17.657 17.657.707.707" />
    </svg>
  );
}

function LogOut({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

function Shield({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function Bell({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

function Eye({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function GripVertical({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function Square({size=16, color="currentColor", strokeWidth=2, ...props}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!props["aria-label"]} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}
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
