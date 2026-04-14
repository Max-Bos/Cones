function getWeekIndex(birthDate) {
  if (!birthDate) return 0;
  const [year, month, day] = String(birthDate).split("-").map(Number);
  if (!year || !month || !day) return 0;
  const birthUtc = Date.UTC(year, month - 1, day);
  if (Number.isNaN(birthUtc)) return 0;
  const now = new Date();
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.min(TOTAL_WEEKS, Math.max(0, Math.floor((nowUtc - birthUtc) / MS_PER_WEEK)));
}

function getYearLabel(rowIndex) {
  return rowIndex.toLocaleString();
}

const todayKey = () => new Date().toISOString().slice(0, 10);

const last90 = () => {
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
};

const last30 = () => last90().slice(-30);

const computeStreak = (id, comps) => {
  let streak = 0;
  const date = new Date();
  while (true) {
    const key = date.toISOString().slice(0, 10);
    if (comps.find(c => c.habit_id === id && c.date === key)) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const computeLongest = (id, comps) => {
  const days = last90();
  let best = 0;
  let current = 0;
  days.forEach(day => {
    if (comps.find(x => x.habit_id === id && x.date === day)) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });
  return best;
};
