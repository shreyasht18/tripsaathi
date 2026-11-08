function km(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 1.35 * 2 * R * Math.asin(Math.sqrt(x));
}

// Fares are for the whole group. Uber and Rapido are ESTIMATES, not live prices.
function legOptions(a, b, people) {
  const d = km(a, b), n = Math.max(1, people || 1), vans = Math.ceil(n / 3);
  const r = (x, k) => Math.round(x / k) * k;
  const autoOne = Math.max(40, r(30 + d * 16, 10));
  const uberOne = r(35 + d * 15, 5);
  const bikeOne = r(20 + d * 8, 1);
  return {
    walk:   { key: "walk", name: "Walk", min: Math.round(d * 13), fare: 0 },
    bus:    { key: "bus", name: "City bus", min: Math.round(d * 4 + 12), fare: 10 * n },
    auto:   { key: "auto", name: "Local auto", min: Math.round(d * 3 + 4), fare: autoOne * vans,
              unit: vans > 1 ? vans + " autos" : "" },
    rapido: { key: "rapido", name: "Rapido Bike", min: Math.round(d * 2.6 + 5), fare: bikeOne * n,
              estimate: true, unit: n > 1 ? n + " bikes" : "", app: "https://www.rapido.bike/" },
    uber:   { key: "uber", name: "Uber Auto", min: Math.round(d * 3 + 7), fare: uberOne * vans,
              estimate: true, unit: vans > 1 ? vans + " autos" : "",
              app: "https://m.uber.com/ul/?action=setPickup&pickup=my_location" +
                   "&dropoff[latitude]=" + b.lat + "&dropoff[longitude]=" + b.lng +
                   "&dropoff[nickname]=" + encodeURIComponent(b.name) }
  };
}

// o = { people, elders, kids, budgetMode }
function pickLeg(a, b, o) {
  const L = legOptions(a, b, o.people);
  const byFare = (x, y) => x.fare - y.fare;
  const carRide = [L.auto, L.uber].sort(byFare)[0];
  const rides = [L.auto, L.uber, L.rapido]
    .filter(x => !(x.key === "rapido" && (o.elders || o.kids || o.people > 2)))
    .sort(byFare);
  let pick, why;
  if (L.walk.min <= 8)    { pick = L.walk;  why = "Short hop"; }
  else if (o.elders)      { pick = carRide; why = "Easiest for elders"; }
  else if (o.kids)        { pick = carRide; why = "Easier with kids"; }
  else if (o.budgetMode)  { if (L.walk.min <= 18) { pick = L.walk; why = "Free and close"; }
                            else { pick = L.bus; why = "Cheapest option"; } }
  else                    { pick = rides[0]; why = "Best value"; }
  return { ...pick, why, options: Object.values(L) };
}

function fmt(m) {
  m = ((Math.round(m) % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60), n = m % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + String(n).padStart(2, "0") + " " + ap;
}

function usable(o) {
  const today = new Date().getDay(), skipped = [];
  const list = o.places.filter(p => {
    if (p.closedDay === today) { skipped.push(p.name + " (" + t("closedToday") + ")"); return false; }
    if (o.elders && !p.step && p.walk > 1) { skipped.push(p.name + ": steps and walking"); return false; }
    return true;
  });
  return { list, skipped };
}

// Builds the real day: sightseeing + lunch + dinner. All times and fares come from OUR code.
// names = order of places, modes = optional { placeName: "auto" } from the AI.
function assemble(list, names, modes, o, skipped) {
  const P = o.people, startMin = o.startHour * 60, endTime = startMin + o.hours * 60;
  const lunchR = o.lunch, dinR = o.dinner, DIN = 18 * 60 + 30;
  const sightLimit = dinR ? Math.min(endTime - 110, DIN - 30) : endTime;
  const reserve = dinR ? dinR.cost * P + 120 : 0;
  let clock = startMin, spent = 0, here = o.origin;
  let lunchDone = !lunchR || o.hours < 4;
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
    const g0 = pickLeg(here, p, o);
    const needLunch = !lunchDone && clock + g0.min >= 11 * 60 + 30;

    let tt = clock, h = here, c = spent;
    if (needLunch) {
      const l = pickLeg(h, lunchR, o);
      tt += l.min + lunchR.dur; c += l.fare + lunchR.cost * P; h = lunchR;
    }
    const go = pickLeg(h, p, o), back = pickLeg(p, o.origin, o);
    const fin = tt + go.min + p.dur + back.min;
    const tot = c + go.fare + p.cost * P + back.fare + reserve;
    if (fin > sightLimit || tot > o.budget) {
      skipped.push(p.name + ": not enough " + (fin > sightLimit ? "time" : "budget"));
      return;
    }
    if (needLunch && tryMeal(lunchR, 0, 0, endTime)) lunchDone = true;

    const L = legOptions(here, p, P), m = modes[n] && L[modes[n]];
    const leg = m ? { ...m, why: t("aiPick"), options: Object.values(L) } : pickLeg(here, p, o);
    clock += leg.min;
    stops.push({ place: p, time: clock, leg });
    spent += leg.fare + p.cost * P;
    clock += p.dur; here = p;
  });

  if (!lunchDone) tryMeal(lunchR, 11 * 60 + 30, reserve, sightLimit);
  if (dinR) tryMeal(dinR, DIN, 0, endTime);

  const home = pickLeg(here, o.origin, o);
  clock += home.min; spent += home.fare;
  stops.push({ place: o.origin, time: clock, leg: home, isEnd: true });
  return { stops, spent, backBy: clock, skipped };
}

// Built-in planner: nearest place first
function makePlan(o) {
  const { list, skipped } = usable(o);
  let here = o.origin; const pool = [...list], names = [];
  while (pool.length) {
    pool.sort((a, b) => km(here, a) - km(here, b));
    const p = pool.shift(); names.push(p.name); here = p;
  }
  return assemble(list, names, {}, o, skipped);
}