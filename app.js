const hours = document.getElementById("hours");
const budget = document.getElementById("budget");

hours.oninput = () => document.getElementById("hoursVal").textContent = hours.value;
budget.oninput = () => document.getElementById("budgetVal").textContent = budget.value;

function fareText(o) {
  if (!o.fare) return "Free";
  return o.estimate ? `₹${o.fare}–${Math.round(o.fare * 1.25)}` : `~₹${o.fare}`;
}

function legHTML(leg) {
  const rows = leg.options.map(o => `
    <div class="opt ${o.key === leg.key ? "best" : ""}">
      <span>${o.name}${o.key === leg.key ? " ✓" : ""}</span>
      <b>${o.min} min · ${fareText(o)}</b>
      ${o.app ? `<a href="${o.app}" target="_blank" rel="noopener">Open app</a><small>estimate</small>` : ""}
    </div>`).join("");

  return `<div class="leg">
    <b>Getting here: ${leg.name} · ${leg.min} min · ${fareText(leg)}</b><br>${leg.why}
    <details><summary>Compare all options</summary>${rows}</details>
  </div>`;
}

function renderPlan(plan, hrs, bud, source, note) {
  const places = plan.stops.filter(s => !s.isEnd);
  const pct = Math.min(100, Math.round(plan.spent / bud * 100));

  let html = `
    <p id="status">${source}</p>
    <div class="stats">
      <div class="stat"><b>${places.length}</b><span>stops</span></div>
      <div class="stat"><b>₹${plan.spent}</b><span>of ₹${bud}</span></div>
      <div class="stat"><b>${fmt(plan.backBy)}</b><span>back by</span></div>
    </div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <p class="summary">${note || "Fits inside " + hrs + " hours. Open status checked for today."}</p>`;

  if (places.length === 0) {
    html += `<div class="card">No stop fits those limits. Try more hours or more budget.</div>`;
  }

  html += `<div class="timeline">`;
  plan.stops.forEach(s => {
    const p = s.place;
    if (s.isEnd) {
      html += `<div class="stop"><div class="time">${fmt(s.time)}</div>
        <h3>Back at bus stand</h3>${legHTML(s.leg)}</div>`;
      return;
    }
    html += `<div class="stop">
      <div class="time">${fmt(s.time)}</div>
      <h3>${p.name}</h3>
      <div class="meta">${p.dur} min · ${p.cost ? "₹" + p.cost + " entry" : "Free entry"}</div>
      <span class="badge good">Open today</span>
      <span class="badge ${p.step ? "good" : "warn"}">${p.step ? "Step-free" : "Some steps"}</span>
      <span class="badge">${p.walk > 1 ? "Moderate walking" : "Low walking"}</span>
      ${p.tip ? `<div class="tip">${p.tip}</div>` : ""}
      ${legHTML(s.leg)}
    </div>`;
  });
  html += `</div>`;

  if (plan.skipped && plan.skipped.length) {
    html += `<p class="left-out"><b>Left out:</b> ${plan.skipped.join("; ")}</p>`;
  }
  document.getElementById("result").innerHTML = html;
}

// ---------- AI planning ----------

// Places that make sense today for this traveller (sent to the AI)
function eligiblePlaces(who) {
  const today = new Date().getDay();
  return PLACES.filter(p => {
    if (p.closedDay === today) return false;
    if (who === "elders" && !p.step && p.walk > 1) return false;
    return true;
  });
}

// Build the real plan from the AI's order. Times and fares come from OUR code.
function buildFromAI(ai, who, hrs, bud) {
  const endTime = 9 * 60 + hrs * 60;
  const byName = n => n === LUNCH.name ? LUNCH : PLACES.find(p => p.name === n);
  const allowed = eligiblePlaces(who).map(p => p.name).concat(LUNCH.name);
  let t = 9 * 60, spent = 0, here = START;
  const stops = [];

  ai.order.forEach((name, i) => {
    const p = byName(name);
    if (!p || !allowed.includes(name)) return;           // ignore anything unknown
    const o = legOptions(here, p);
    const chosen = o[ai.modes[i]];
    const leg = chosen
      ? { ...chosen, why: "Picked by AI for your trip", options: Object.values(o) }
      : pickLeg(here, p, who);
    t += leg.min;
    stops.push({ place: p, time: t, leg });
    spent += leg.fare + (p.cost || 0);
    t += p.dur;
    here = p;
  });

  if (stops.length === 0) throw new Error("AI returned no valid stops");
  const home = pickLeg(here, START, who);
  t += home.min; spent += home.fare;
  stops.push({ place: START, time: t, leg: home, isEnd: true });

  if (t > endTime || spent > bud) throw new Error("AI plan exceeds time or budget");
  return { stops, spent, backBy: t, skipped: [] };
}

async function aiPlan(hrs, bud, who) {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hours: hrs, budget: bud, who,
      places: eligiblePlaces(who).map(p => ({ name: p.name, dur: p.dur, cost: p.cost, walk: p.walk, step: p.step, tags: p.tags })),
      lunch: { name: LUNCH.name, dur: LUNCH.dur, cost: LUNCH.cost }
    })
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const ai = await res.json();
  return { plan: buildFromAI(ai, who, hrs, bud), summary: ai.summary };
}

// ---------- Button ----------

document.getElementById("planBtn").onclick = async () => {
  const btn = document.getElementById("planBtn");
  const who = document.getElementById("who").value;
  const hrs = +hours.value, bud = +budget.value;

  btn.disabled = true; btn.textContent = "Planning with AI…";
  try {
    const { plan, summary } = await aiPlan(hrs, bud, who);
    renderPlan(plan, hrs, bud, "✨ Planned by Gemini AI", summary);
  } catch (e) {
    console.warn("AI failed, using rule-based planner:", e.message);
    const plan = makePlan(hrs, bud, who);
    renderPlan(plan, hrs, bud, "Rule-based plan (AI unavailable)");
  }
  btn.disabled = false; btn.textContent = "Plan my day";
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
};