// Distance in km between two points (straight line x 1.35 for roads)
function km(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 1.35 * 2 * R * Math.asin(Math.sqrt(x));
}

// Times and fares for each way to travel one leg
function legOptions(a, b) {
  const d = km(a, b);
  return {
    walk: { name: "Walk", min: Math.round(d * 13), fare: 0 },
    bus:  { name: "City bus", min: Math.round(d * 4 + 12), fare: 10 },
    auto: { name: "Auto", min: Math.round(d * 3 + 4),
            fare: Math.max(40, Math.round((30 + d * 16) / 10) * 10) }
  };
}

// Pick the best option for this kind of traveller
function pickLeg(a, b, who) {
  const o = legOptions(a, b);
  let pick, why;
  if (o.walk.min <= 8)        { pick = o.walk; why = "Short hop"; }
  else if (who === "elders")  { pick = o.auto; why = "Easiest for elders"; }
  else if (who === "kids")    { pick = o.auto; why = "Easier with kids"; }
  else if (o.walk.min <= 18)  { pick = o.walk; why = "Free and close"; }
  else                        { pick = o.bus;  why = "Cheapest option"; }
  return { ...pick, why };
}

function fmt(m) {
  let h = Math.floor(m / 60), n = Math.round(m % 60);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + String(n).padStart(2, "0") + " " + ap;
}

// The main planner
function makePlan(hours, budget, who) {
  const today = new Date().getDay();
  const endTime = 9 * 60 + hours * 60;          // day starts at 9:00
  let t = 9 * 60, spent = 0, here = START, lunchDone = false;
  const stops = [], skipped = [];

  // 1. Remove places that don't suit today or the traveller
  let pool = PLACES.filter(p => {
    if (p.closedDay === today) { skipped.push(p.name + " is closed today"); return false; }
    if (who === "elders" && !p.step && p.walk > 1) {
      skipped.push(p.name + ": steps and walking are hard for elders"); return false;
    }
    return true;
  });

  // 2. Keep adding the nearest place while time and budget allow
  while (pool.length) {
    pool.sort((a, b) => km(here, a) - km(here, b));
    const p = pool.shift();
    const go = pickLeg(here, p, who);
    const back = pickLeg(p, START, who);

    const needLunch = !lunchDone && t + go.min >= 11 * 60 + 30;   // lunch from 11:30
    const lunchLeg = needLunch ? pickLeg(here, LUNCH, who) : null;
    const extraTime = needLunch ? lunchLeg.min + LUNCH.dur : 0;
    const extraCost = needLunch ? lunchLeg.fare + LUNCH.cost : 0;

    const finish = t + extraTime + go.min + p.dur + back.min;
    const total = spent + extraCost + go.fare + p.cost + back.fare;
    if (finish > endTime || total > budget) {
      skipped.push(p.name + ": not enough " + (finish > endTime ? "time" : "budget"));
      continue;
    }

    if (needLunch) {
      t += lunchLeg.min;
      stops.push({ place: LUNCH, time: t, leg: lunchLeg });
      spent += lunchLeg.fare + LUNCH.cost;
      t += LUNCH.dur; here = LUNCH; lunchDone = true;
    }
    const leg = pickLeg(here, p, who);
    t += leg.min;
    stops.push({ place: p, time: t, leg });
    spent += leg.fare + p.cost;
    t += p.dur; here = p;
  }

  // 3. Return to the bus stand
  const home = pickLeg(here, START, who);
  t += home.min; spent += home.fare;
  stops.push({ place: START, time: t, leg: home, isEnd: true });

  return { stops, spent, backBy: t, skipped };
}