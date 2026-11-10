// Builds the real day: sightseeing + lunch + dinner. All times and fares come from OUR code.
// Respects opening hours (p.hrs = [openMinutes, closeMinutes]) and never lets meals starve the budget.
function assemble(list, names, modes, o, skipped) {
  const P = o.people, startMin = o.startHour * 60, endTime = startMin + o.hours * 60;
  const DIN = 18 * 60 + 30, rideReserve = 120 * P;
  const hrsOf = p => p.hrs || [0, 1440];

  // meals are optional: drop them (with a clear note) instead of breaking the plan
  let lunchR = o.hours >= 4 ? o.lunch : null, dinR = o.dinner;
  if (dinR && endTime < DIN + dinR.dur + 30) {
    skipped.push("Dinner skipped: your day ends before dinner time (about 7 PM)"); dinR = null;
  }
  const mealCost = () => ((lunchR ? lunchR.cost : 0) + (dinR ? dinR.cost : 0)) * P;
  if (dinR && mealCost() + rideReserve > o.budget) {
    skipped.push("Dinner skipped: budget is too low for two meals plus rides"); dinR = null;
  }
  if (lunchR && mealCost() + rideReserve > o.budget) {
    skipped.push("Lunch skipped: budget is too low"); lunchR = null;
  }

  const sightLimit = dinR ? Math.min(endTime - 110, DIN - 30) : endTime;
  const reserve = dinR ? dinR.cost * P + 80 : 0;
  let clock = startMin, spent = 0, here = o.origin, lunchDone = !lunchR;
  const stops = [];

  function tryMeal(m, minStart, res, limit) {
    const go = pickLeg(here, m, o), back = pickLeg(m, o.origin, o);
    const at = Math.max(clock + go.min, minStart);
    const fin = at + m.dur + back.min;
    const cost = spent + go.fare + m.cost * P + back.fare + res;
    if (fin > limit || cost > o.budget) {
      skipped.push(m.name + ": not enough " + (fin > limit ? "time" : "budget"));
      return false;
    }
    stops.push({ place: m, time: at, leg: go, wait: at > clock + go.min + 20 });
    spent += go.fare + m.cost * P; clock = at + m.dur; here = m;
    return true;
  }

  names.forEach(n => {
    const p = list.find(x => x.name === n);
    if (!p) return;
    const [op, cl] = hrsOf(p);
    const g0 = pickLeg(here, p, o);
    const needLunch = !lunchDone && clock + g0.min >= 11 * 60 + 30;

    let tt = clock, h = here, c = spent;
    if (needLunch) {
      const l = pickLeg(h, lunchR, o);
      tt += l.min + lunchR.dur; c += l.fare + lunchR.cost * P; h = lunchR;
    }
    const go = pickLeg(h, p, o), back = pickLeg(p, o.origin, o);
    const startAt = Math.max(tt + go.min, op);
    const fin = startAt + p.dur + back.min;
    const tot = c + go.fare + p.cost * P + back.fare + reserve;

    if (startAt + p.dur > cl) {
      skipped.push(p.name + ": closed at that time (open " + fmt(op) + " to " + fmt(cl) + ", sample hours)");
      return;
    }
    if (fin > sightLimit || tot > o.budget) {
      skipped.push(p.name + ": not enough " + (fin > sightLimit ? "time" : "budget"));
      return;
    }
    if (needLunch && tryMeal(lunchR, 0, 0, endTime)) lunchDone = true;

    const L = legOptions(here, p, P), m = modes[n] && L[modes[n]];
    const leg = m ? { ...m, why: t("aiPick"), options: Object.values(L) } : pickLeg(here, p, o);
    const arrive = clock + leg.min, at = Math.max(arrive, op);
    stops.push({ place: p, time: at, leg, wait: at > arrive + 20 });
    spent += leg.fare + p.cost * P;
    clock = at + p.dur; here = p;
  });

  // nothing fits: return an empty plan so the page shows a clear message
  if (!stops.length) return { stops: [], spent: 0, backBy: startMin, skipped };

  if (!lunchDone) tryMeal(lunchR, 11 * 60 + 30, reserve, sightLimit);
  if (dinR) tryMeal(dinR, DIN, 0, endTime);

  const home = pickLeg(here, o.origin, o);
  clock += home.min; spent += home.fare;
  stops.push({ place: o.origin, time: clock, leg: home, isEnd: true });
  return { stops, spent, backBy: clock, skipped };
}

// Built-in planner: picks the next place by distance, and prefers places that are already open
function makePlan(o) {
  const { list, skipped } = usable(o);
  let here = o.origin, clock = o.startHour * 60;
  const pool = [...list], names = [];
  const opens = p => (p.hrs || [0, 1440])[0];
  while (pool.length) {
    let best = null;
    pool.forEach(p => {
      const g = pickLeg(here, p, o);
      const arrive = clock + g.min;
      const score = km(here, p) + Math.max(0, opens(p) - arrive) / 15;
      if (!best || score < best.score) best = { p, score, arrive };
    });
    pool.splice(pool.indexOf(best.p), 1);
    names.push(best.p.name);
    clock = Math.max(best.arrive, opens(best.p)) + best.p.dur;
    here = best.p;
  }
  return assemble(list, names, {}, o, skipped);
}
