const $ = id => document.getElementById(id);
const S = { group: "family", people: 4, picked: new Set(), origin: { ...START }, screen: 0, last: null, wx: null };

// ---------- screens ----------
function show(n) {
  S.screen = n; S.last = null;
  [0, 1, 2, 3].forEach(i => $("s" + i).hidden = i !== n);
  $("dots").hidden = n === 0;
  [1, 2, 3].forEach(i => $("d" + i).className = i <= n ? "on" : "");
  $("result").innerHTML = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- language ----------
function setLang(l) {
  LANG = l;
  try { localStorage.setItem("lang", l); } catch (e) {}
  $("langMini").value = l;
  applyLang();
  showWx();
  if (S.screen === 3 && !S.last) { buildPlaceList(true); fillMeals(); }
  if (S.last) renderPlan(S.last.plan, S.last.o, S.last.srcKey, S.last.note);
}
document.querySelectorAll(".langbtn").forEach(b => b.onclick = () => { setLang(b.dataset.l); show(1); });
$("langMini").onchange = e => setLang(e.target.value);

// ---------- weather (free, no key) ----------
function showWx() {
  if (S.wx) $("wx").textContent = `🌤 ${S.wx.tmp}°C · ${t("rain")} ${S.wx.rain}%`;
}
async function loadWx() {
  const c = new AbortController(); setTimeout(() => c.abort(), 4000);
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=15.8497&longitude=74.4977" +
      "&current=temperature_2m&daily=precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=1",
      { signal: c.signal });
    const d = await r.json();
    S.wx = { tmp: Math.round(d.current.temperature_2m), rain: d.daily.precipitation_probability_max[0] };
    showWx();
  } catch (e) { /* weather is optional */ }
}

// ---------- step 1: location ----------
const sel = $("startSel");
sel.innerHTML = `<option value="-1">${START.name}</option>` +
  PLACES.filter(p => !p.food).map(p => `<option value="${PLACES.indexOf(p)}">${p.name}</option>`).join("");
sel.onchange = () => {
  S.origin = sel.value === "-1" ? { ...START } : PLACES[+sel.value];
  $("locStatus").textContent = "";
};
$("locBtn").onclick = () => {
  const st = $("locStatus");
  if (!navigator.geolocation) { st.textContent = t("locFail"); return; }
  st.textContent = t("locFind");
  navigator.geolocation.getCurrentPosition(pos => {
    const me = { name: "Your location", lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (km(me, START) > 40) { S.origin = { ...START }; st.textContent = t("locFar"); }
    else { S.origin = me; st.textContent = t("locOk"); }
  }, () => { st.textContent = t("locFail"); }, { enableHighAccuracy: true, timeout: 10000 });
};
$("next1").onclick = () => show(2);

// ---------- step 2: group & date ----------
const PRESET = { family: 4, friends: 4, students: 3, couple: 2, solo: 1 };
document.querySelectorAll("#groupChips .chip").forEach(c => {
  c.onclick = () => {
    document.querySelectorAll("#groupChips .chip").forEach(x => x.classList.remove("on"));
    c.classList.add("on");
    S.group = c.dataset.g; S.people = PRESET[S.group];
    $("pplVal").textContent = S.people;
  };
});
$("minus").onclick = () => { S.people = Math.max(1, S.people - 1); $("pplVal").textContent = S.people; };
$("plus").onclick  = () => { S.people = Math.min(20, S.people + 1); $("pplVal").textContent = S.people; };
$("startH").oninput = () => $("startVal").textContent = fmt(+$("startH").value * 60);
$("hours").oninput  = () => $("hoursVal").textContent = $("hours").value;
$("budget").oninput = () => $("budgetVal").textContent = $("budget").value;

// Initialize Date Picker
const dateInput = $("tripDate");
if (dateInput) {
  const todayStr = new Date().toISOString().split('T')[0];
  dateInput.min = todayStr;
  dateInput.value = todayStr;
}

$("back2").onclick = () => show(1);
$("next2").onclick = () => { buildPlaceList(false); fillMeals(); show(3); };

// ---------- step 3: places + food ----------
const getSelectedDay = () => {
  if ($("tripDate") && $("tripDate").value) {
    return new Date($("tripDate").value).getDay();
  }
  return new Date().getDay();
};

function buildPlaceList(keep) {
  const travelDay = getSelectedDay();
  const sorted = PLACES.map((p, i) => ({ p, i })).sort((a, b) => km(S.origin, a.p) - km(S.origin, b.p));
  if (!keep) {
    S.picked = new Set(sorted.filter(x => !x.p.food && x.p.closedDay !== travelDay).slice(0, 3).map(x => x.p.name));
  }
  $("placeList").innerHTML = sorted.map(({ p, i }) => {
    const closed = p.closedDay === travelDay;
    return `<button class="place ${closed ? "off" : ""}" data-i="${i}">
      <span class="tick">✓</span>
      ${p.img ? `<img class="pimg" src="images/${p.img}" alt="" onerror="this.remove()">` : ""}
      <span><b>${p.name}</b>
        <span class="dist">${km(S.origin, p).toFixed(1)} ${t("kmAway")} · ${p.dur} ${t("min")} · ${p.cost ? "₹" + p.cost : t("free")}</span><br>
        ${p.food ? `<span class="badge food">🍴 ${t("food")}</span>` : ""}
        ${closed ? `<span class="badge warn">${t("closedToday")}</span>` : ""}
        <span class="badge ${p.step ? "good" : "warn"}">${p.step ? t("stepFree") : t("someSteps")}</span>
        ${p.special ? `<br><span class="dist">${p.special}</span>` : ""}
      </span></button>`;
  }).join("");
  document.querySelectorAll(".place").forEach(el => {
    el.onclick = () => {
      if (el.classList.contains("off")) return;
      const n = PLACES[+el.dataset.i].name;
      S.picked.has(n) ? S.picked.delete(n) : S.picked.add(n);
      refreshPicks();
    };
  });
  refreshPicks();
}
function refreshPicks() {
  document.querySelectorAll(".place").forEach(el =>
    el.classList.toggle("on", S.picked.has(PLACES[+el.dataset.i].name)));
  $("pickStatus").textContent = S.picked.size + " " + t("selectedLbl");
}
$("allBtn").onclick = () => {
  const travelDay = getSelectedDay();
  PLACES.filter(p => p.closedDay !== travelDay).forEach(p => S.picked.add(p.name));
  refreshPicks();
};
$("noneBtn").onclick = () => { S.picked.clear(); refreshPicks(); };
$("back3").onclick = () => show(2);

function fillMeals() {
  const veg = $("vegOnly").checked;
  const list = MEALS.map((m, i) => ({ m, i })).filter(x => !veg || x.m.veg)
                    .sort((a, b) => km(S.origin, a.m) - km(S.origin, b.m));
  const opts = list.map(x =>
    `<option value="${x.i}">${x.m.name} · ${x.m.veg ? "🥬" : "🍗"} ~₹${x.m.cost}</option>`).join("");
  ["lunchSel", "dinnerSel"].forEach(id => {
    const prev = $(id).value;
    $(id).innerHTML = opts;
    if (list.some(x => String(x.i) === prev)) $(id).value = prev;
  });
}
$("vegOnly").onchange = fillMeals;
$("addDinner").onchange = () => { $("dinnerBox").hidden = !$("addDinner").checked; };

// ---------- plan helpers ----------
function getOpts() {
  const budget = +$("budget").value;
  return {
    hours: +$("hours").value, startHour: +$("startH").value, budget, people: S.people,
    elders: $("elders").checked, kids: $("kids").checked,
    budgetMode: S.group === "students" || budget / S.people < 400,
    origin: S.origin,
    places: PLACES.filter(p => S.picked.has(p.name)),
    lunch: MEALS[+$("lunchSel").value] || null,
    dinner: $("addDinner").checked ? (MEALS[+$("dinnerSel").value] || null) : null,
    group: S.group,
    dayOfWeek: getSelectedDay() // Support for the date picker!
  };
}
function fareText(o) {
  if (!o.fare) return t("free");
  return o.estimate ? `₹${o.fare}–${Math.round(o.fare * 1.25)}` : `~₹${o.fare}`;
}
const nameOf = o => o.name + (o.unit ? " (" + o.unit + ")" : "");

function legHTML(leg) {
  const rows = leg.options.map(o => `
    <div class="opt ${o.key === leg.key ? "best" : ""}">
      <span>${nameOf(o)}${o.key === leg.key ? " ✓" : ""}</span>
      <b>${o.min} ${t("min")} · ${fareText(o)}</b>
      ${o.app ? `<a href="${o.app}" target="_blank" rel="noopener">${t("openApp")}</a><small>${t("estimate")}</small>` : ""}
    </div>`).join("");
  return `<div class="leg">
    <b>${t("gettingHere")}: ${nameOf(leg)} · ${leg.min} ${t("min")} · ${fareText(leg)}</b><br>${leg.why}
    <details><summary>${t("compare")}</summary>${rows}</details>
  </div>`;
}

function getGoogleMapsRoute(stops) {
  const coordinates = stops.map(stop => `${stop.place.lat},${stop.place.lng}`).join('/');
  return `https://www.google.com/maps/dir/${coordinates}`;
}

// ---------- NEW GEMINI AI DIRECT CALL ----------
async function aiPlan(o) {
  const { list, skipped } = usable(o);
  
  // ⚠️ REPLACE THIS WITH YOUR ACTUAL API KEY
  const API_KEY = "YOUR_NEW_API_KEY"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // Tell Gemini to return exactly what the app needs to build the plan
  const prompt = `
    You are a travel planner for Belagavi.
    Group: ${o.people} people (${o.group}). Elders: ${o.elders}. Kids: ${o.kids}.
    Available time: ${o.hours} hours. Budget: ₹${o.budget}.
    Places available: ${list.map(p => p.name).join(", ")}
    
    Return ONLY a raw JSON object (no markdown, no backticks) with this exact format:
    {
      "order": ["Place Name 1", "Place Name 2"], 
      "modes": ["auto", "uber"], 
      "summary": "A 1-sentence summary of why you picked this route."
    }
  `;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  
  // Clean up the response in case Gemini includes markdown blocks like ```json
  let text = data.candidates[0].content.parts[0].text.trim();
  if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  if (text.startsWith("```")) text = text.replace(/```/g, "").trim();

  const ai = JSON.parse(text);
  const names = ai.order.filter(n => list.some(p => p.name === n));
  const modes = {};
  if (ai.modes) ai.order.forEach((n, i) => { modes[n] = ai.modes[i]; });
  
  const plan = assemble(list, names, modes, o, skipped);
  if (!plan.stops.some(s => !s.isEnd && !s.place.meal)) throw new Error("AI returned no valid stops");
  return { plan, summary: ai.summary };
}

// ---------- render ----------
function renderPlan(plan, o, srcKey, note) {
  S.last = { plan, o, srcKey, note };
  [0, 1, 2, 3].forEach(i => $("s" + i).hidden = true);
  const sights = plan.stops.filter(s => !s.isEnd && !s.place.meal);
  const pct = Math.min(100, Math.round(plan.spent / o.budget * 100));
  let txt = `Belagavi plan for ${o.people} people\n`;

  let html = `
    <p class="source">${t(srcKey)}</p>
    <div class="stats">
      <div class="stat"><b>${sights.length}</b><span>${t("stops")}</span></div>
      <div class="stat"><b>${o.people}</b><span>${t("peopleLbl")}</span></div>
      <div class="stat"><b>₹${plan.spent}</b><span>${t("of")} ₹${o.budget}</span></div>
      <div class="stat"><b>${fmt(plan.backBy)}</b><span>${t("backBy")}</span></div>
    </div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <p class="summary">${note || t("fits")}</p>`;

  if (!sights.length) html += `<div class="card">${t("noStops")}</div>`;

  html += `<div class="timeline">`;
  plan.stops.forEach(s => {
    const p = s.place;
    if (s.isEnd) {
      html += `<div class="stop"><div class="time">${fmt(s.time)}</div>
        <h3>${t("backAt")} ${p.name}</h3>${legHTML(s.leg)}</div>`;
      txt += `${fmt(s.time)} ${t("backAt")} ${p.name}\n`;
      return;
    }
    html += `<div class="stop ${p.meal ? "meal" : ""}">
      <div class="time">${fmt(s.time)}</div>
      ${s.wait ? `<span class="badge">${t("freeTime")}</span>` : ""}
      ${p.img ? `<img class="banner" src="images/${p.img}" alt="" onerror="this.remove()">` : ""}
      <h3>${p.meal ? "🍽 " : p.food ? "🍴 " : ""}${p.name}</h3>
      <div class="meta">${p.dur} ${t("min")} · ${p.cost ? "₹" + p.cost + " " + (p.meal || p.food ? t("perPerson") : t("perPerson")) : t("free")}</div>
      ${p.meal ? `<span class="badge food">${p.veg ? "🥬 Veg" : "🍗 Non-veg"}</span>` : `<span class="badge good">${t("openToday")}</span>`}
      <span class="badge ${p.step ? "good" : "warn"}">${p.step ? t("stepFree") : t("someSteps")}</span>
      ${p.meal ? "" : `<span class="badge">${p.walk > 1 ? t("modWalk") : t("lowWalk")}</span>`}
      ${p.special ? `<div class="special"><b>${t("mustTry")}:</b> ${p.special}</div>` : ""}
      ${p.tip ? `<div class="tip">${p.tip}</div>` : ""}
      ${legHTML(s.leg)}
    </div>`;
    txt += `${fmt(s.time)} ${p.name} (${nameOf(s.leg)}, ${s.leg.min} min)\n`;
  });
  html += `</div>`;
  if (plan.skipped.length) html += `<p class="left-out"><b>${t("leftOut")}:</b> ${plan.skipped.join("; ")}</p>`;

  const tips = [t("autoTip")];
  if (S.wx && S.wx.rain >= 50) tips.unshift(t("rainTip"));
  html += `<div class="card info"><h3>💡 Tips</h3><ul>${tips.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
  html += `<div class="card info"><h3>🍬 ${t("bringHome")}</h3><ul>${TAKEHOME.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
  html += `<div class="card info"><h3>🗣 ${t("phrasesT")}</h3><ul>${
    PHRASES.map(x => `<li><b>${x[0]}</b> (${x[1]}): ${x[2]}</li>`).join("")}</ul></div>`;

  txt += `Total about Rs ${plan.spent}. Planned with Belagavi TripSaathi.`;
  
  // NEW SHARING & MAPS BUTTONS
  html += `<div class="actions">
    <a class="btn alt" target="_blank" id="mapsBtn">🗺️ Open in Google Maps</a>
    <button class="btn" id="shareBtn">📤 ${t("share")}</button>
    <button class="btn ghost" id="editBtn">${t("change")}</button>
    <button class="btn ghost" id="printBtn">${t("print")}</button>
  </div>`;

  $("result").innerHTML = html;
  
  // Wire up the new buttons
  $("mapsBtn").href = getGoogleMapsRoute(plan.stops);
  $("shareBtn").onclick = () => {
    if (navigator.share) {
      navigator.share({ title: 'My TripSaathi Itinerary', text: txt, url: window.location.href }).catch(e => console.log(e));
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
    }
  };
  $("editBtn").onclick = () => { S.last = null; show(3); };
  $("printBtn").onclick = () => window.print();
  $("result").scrollIntoView({ behavior: "smooth" });
}

// ---------- the button ----------
$("planBtn").onclick = async () => {
  if (S.picked.size === 0) { $("pickStatus").textContent = t("pickOne"); return; }
  const btn = $("planBtn"), o = getOpts();
  btn.disabled = true;
  try {
    let done = false;
    if ($("useAI").checked) {
      btn.textContent = t("planning");
      try {
        const { plan, summary } = await aiPlan(o);
        renderPlan(plan, o, "srcAI", summary);
        done = true;
      } catch (e) { console.warn("AI failed, using the built-in planner:", e.message); }
    }
    if (!done) renderPlan(makePlan(o), o, $("useAI").checked ? "srcFallback" : "srcBuilt", null);
  } catch (e) {
    $("pickStatus").textContent = "Error: " + e.message;
    console.error(e);
  } finally {
    btn.disabled = false; btn.textContent = t("makePlan");
  }
};

// ---------- start ----------
loadWx();
if (LANG) { $("langMini").value = LANG; applyLang(); show(1); }
else { $("langMini").value = "en"; applyLang(); show(0); }
