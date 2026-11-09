const $ = id => document.getElementById(id);

// ---------- safety net: if places.js is old or cached, these keep the app working ----------
if (typeof MEALS === "undefined") {
  window.MEALS = [
    { name: "Hotel Amar (Tilakwadi)", lat: 15.8330, lng: 74.5110, dur: 60, cost: 250, veg: true, meal: true, walk: 1, step: true,
      special: "Vegetarian thali and South Indian dishes.", tip: "Gets busy at lunch." },
    { name: "Hotel Panchamruth Pure Veg", lat: 15.8560, lng: 74.5095, dur: 60, cost: 200, veg: true, meal: true, walk: 1, step: true,
      special: "Pure veg meals at pocket-friendly prices.", tip: "Good value for groups." },
    { name: "Niyaaz Restaurant (Tilakwadi)", lat: 15.8345, lng: 74.5120, dur: 60, cost: 300, veg: false, meal: true, walk: 1, step: true,
      special: "Chicken and mutton biryani and kebabs.", tip: "Portions are big, so share." }
  ];
}
if (typeof TAKEHOME === "undefined") {
  window.TAKEHOME = ["Belagavi Kunda: the city's signature milk sweet", "Gokak Karadantu: a nut and dry-fruit sweet", "Belagavi masala doodh: spiced milk"];
}
if (typeof PHRASES === "undefined") {
  window.PHRASES = [["ನಮಸ್ಕಾರ", "Namaskara", "Hello"], ["ಎಷ್ಟು?", "Eshtu?", "How much?"]];
}

const S = { group: "family", people: 4, picked: new Set(), origin: { ...START }, screen: 0, last: null, wx: null, aiErr: "" };

// ---------- extra words for the maps buttons ----------
const MAPTXT = {
  en: { directions: "Directions", viewMap: "View on map", fullRoute: "Open full route in Google Maps", preview: "Map preview" },
  hi: { directions: "रास्ता देखें", viewMap: "मैप पर देखें", fullRoute: "पूरा रूट Google Maps में खोलें", preview: "मैप प्रीव्यू" },
  kn: { directions: "ದಾರಿ ನೋಡಿ", viewMap: "ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ", fullRoute: "ಪೂರ್ಣ ಮಾರ್ಗವನ್ನು Google Maps ನಲ್ಲಿ ತೆರೆಯಿರಿ", preview: "ನಕ್ಷೆ ಪೂರ್ವವೀಕ್ಷಣೆ" },
  mr: { directions: "मार्ग पहा", viewMap: "नकाशावर पहा", fullRoute: "संपूर्ण मार्ग Google Maps मध्ये उघडा", preview: "नकाशा पूर्वावलोकन" }
};
const mt = k => (MAPTXT[LANG] && MAPTXT[LANG][k]) || MAPTXT.en[k];

// ---------- Google Maps links (search by NAME so Google finds the real place) ----------
const mapQ = p => p.name === "Your location"
  ? p.lat + "," + p.lng
  : encodeURIComponent(p.name.replace(/[()]/g, "") + ", Belagavi, Karnataka");
const modeOf = leg => leg.key === "walk" ? "walking" : leg.key === "bus" ? "transit" : "driving";
const dirUrl = (from, to, mode) =>
  `https://www.google.com/maps/dir/?api=1&origin=${mapQ(from)}&destination=${mapQ(to)}&travelmode=${mode}`;
const searchUrl = p => `https://www.google.com/maps/search/?api=1&query=${mapQ(p)}`;
const embedUrl = p => `https://maps.google.com/maps?q=${mapQ(p)}&z=15&output=embed`;
function routeUrl(plan, origin) {
  const way = plan.stops.filter(s => !s.isEnd).slice(0, 9).map(s => mapQ(s.place)).join("%7C");
  return `https://www.google.com/maps/dir/?api=1&origin=${mapQ(origin)}&destination=${mapQ(origin)}` +
         (way ? `&waypoints=${way}` : "") + `&travelmode=driving`;
}

// ---------- screens ----------
function show(n) {
  S.screen = n; S.last = null;
  [0, 1, 2, 3].forEach(i => $("s" + i).hidden = i !== n);
  $("dots").hidden = n === 0;
  $("langMini").hidden = n === 0;
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

// ---------- step 2: group ----------
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
$("back2").onclick = () => show(1);

// shows the real error in a popup if something breaks
$("next2").onclick = () => {
  try { buildPlaceList(false); fillMeals(); show(3); }
  catch (e) { alert("Error: " + e.message); console.error(e); }
};

// ---------- step 3: places + food ----------
const todayDay = () => new Date().getDay();

function buildPlaceList(keep) {
  const sorted = PLACES.map((p, i) => ({ p, i })).sort((a, b) => km(S.origin, a.p) - km(S.origin, b.p));
  if (!keep) {
    S.picked = new Set(sorted.filter(x => !x.p.food && x.p.closedDay !== todayDay()).slice(0, 3).map(x => x.p.name));
  }
  $("placeList").innerHTML = sorted.map(({ p, i }) => {
    const closed = p.closedDay === todayDay();
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
  PLACES.filter(p => p.closedDay !== todayDay()).forEach(p => S.picked.add(p.name));
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
    group: S.group
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

// ---------- AI (only used if the hidden "useAI" box is turned on) ----------
async function aiPlan(o) {
  const { list, skipped } = usable(o);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch("/api/plan", {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hours: o.hours, budget: o.budget, people: o.people, group: o.group,
        elders: o.elders, kids: o.kids, lang: LANG || "en",
        places: list.map(p => ({ name: p.name, dur: p.dur, cost: p.cost, walk: p.walk, step: p.step, food: !!p.food }))
      })
    });
    let body = null;
    try { body = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error((body && body.error) || ("HTTP " + res.status));
    const ai = body;
    const names = ai.order.filter(n => list.some(p => p.name === n));
    const modes = {};
    ai.order.forEach((n, i) => { modes[n] = ai.modes[i]; });
    const plan = assemble(list, names, modes, o, skipped);
    if (!plan.stops.some(s => !s.isEnd && !s.place.meal)) throw new Error("AI picked no usable places");
    return { plan, summary: ai.summary };
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "AI took longer than 12 seconds" : e.message);
  } finally { clearTimeout(timer); }
}

// ---------- render ----------
function renderPlan(plan, o, srcKey, note) {
  S.last = { plan, o, srcKey, note };
  [0, 1, 2, 3].forEach(i => $("s" + i).hidden = true);
  const sights = plan.stops.filter(s => !s.isEnd && !s.place.meal);
  const pct = Math.min(100, Math.round(plan.spent / o.budget * 100));
  const fullUrl = routeUrl(plan, o.origin);
  let txt = `Belagavi plan for ${o.people} people\n`;

  let html = `
    <p class="source">${t(srcKey)}</p>
    ${srcKey === "srcFallback" && S.aiErr ? `<p class="left-out">AI error: ${S.aiErr}</p>` : ""}
    <div class="stats">
      <div class="stat"><b>${sights.length}</b><span>${t("stops")}</span></div>
      <div class="stat"><b>${o.people}</b><span>${t("peopleLbl")}</span></div>
      <div class="stat"><b>₹${plan.spent}</b><span>${t("of")} ₹${o.budget}</span></div>
      <div class="stat"><b>${fmt(plan.backBy)}</b><span>${t("backBy")}</span></div>
    </div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <p class="summary">${note || t("fits")}</p>
    ${sights.length ? `<a class="btn fullroute" target="_blank" rel="noopener" href="${fullUrl}">🗺 ${mt("fullRoute")}</a>` : ""}`;

  if (!sights.length) html += `<div class="card">${t("noStops")}</div>`;

  html += `<div class="timeline">`;
  let prev = o.origin;
  plan.stops.forEach(s => {
    const p = s.place;
    const dUrl = dirUrl(prev, p, modeOf(s.leg));
    const maps = `<div class="maprow">
        <a class="mbtn" href="${dUrl}" target="_blank" rel="noopener">🧭 ${mt("directions")}</a>
        ${s.isEnd ? "" : `<a class="mbtn" href="${searchUrl(p)}" target="_blank" rel="noopener">📍 ${mt("viewMap")}</a>`}
      </div>`;
    const preview = s.isEnd ? "" : `<details class="mapd"><summary>🗺 ${mt("preview")}</summary>
        <iframe data-src="${embedUrl(p)}" title="${p.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          style="width:100%;height:220px;border:0;border-radius:12px;margin-top:8px"></iframe></details>`;

    if (s.isEnd) {
      html += `<div class="stop"><div class="time">${fmt(s.time)}</div>
        <h3>${t("backAt")} ${p.name}</h3>${legHTML(s.leg)}${maps}</div>`;
      txt += `${fmt(s.time)} ${t("backAt")} ${p.name}\n`;
      return;
    }
    html += `<div class="stop ${p.meal ? "meal" : ""}">
      <div class="time">${fmt(s.time)}</div>
      ${s.wait ? `<span class="badge">${t("freeTime")}</span>` : ""}
      ${p.img ? `<img class="banner" src="images/${p.img}" alt="" onerror="this.remove()">` : ""}
      <h3>${p.meal ? "🍽 " : p.food ? "🍴 " : ""}${p.name}</h3>
      <div class="meta">${p.dur} ${t("min")} · ${p.cost ? "₹" + p.cost + " " + t("perPerson") : t("free")}</div>
      ${p.meal ? `<span class="badge food">${p.veg ? "🥬 Veg" : "🍗 Non-veg"}</span>` : `<span class="badge good">${t("openToday")}</span>`}
      <span class="badge ${p.step ? "good" : "warn"}">${p.step ? t("stepFree") : t("someSteps")}</span>
      ${p.meal ? "" : `<span class="badge">${p.walk > 1 ? t("modWalk") : t("lowWalk")}</span>`}
      ${p.special ? `<div class="special"><b>${t("mustTry")}:</b> ${p.special}</div>` : ""}
      ${p.tip ? `<div class="tip">${p.tip}</div>` : ""}
      ${legHTML(s.leg)}
      ${maps}
      ${preview}
    </div>`;
    txt += `${fmt(s.time)} ${p.name} (${nameOf(s.leg)}, ${s.leg.min} min)\n`;
    prev = p;
  });
  html += `</div>`;
  if (plan.skipped.length) html += `<p class="left-out"><b>${t("leftOut")}:</b> ${plan.skipped.join("; ")}</p>`;

  const tips = [t("autoTip")];
  if (S.wx && S.wx.rain >= 50) tips.unshift(t("rainTip"));
  html += `<div class="card info"><h3>💡 Tips</h3><ul>${tips.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
  html += `<div class="card info"><h3>🍬 ${t("bringHome")}</h3><ul>${TAKEHOME.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
  html += `<div class="card info"><h3>🗣 ${t("phrasesT")}</h3><ul>${
    PHRASES.map(x => `<li><b>${x[0]}</b> (${x[1]}): ${x[2]}</li>`).join("")}</ul></div>`;

  txt += `Total about Rs ${plan.spent}.\nRoute: ${fullUrl}\nPlanned with Belagavi TripSaathi.`;
  html += `<div class="actions">
    <button class="btn ghost" id="editBtn">${t("change")}</button>
    <a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">${t("share")}</a>
    <button class="btn ghost" id="printBtn">${t("print")}</button>
  </div>`;

  $("result").innerHTML = html;
  // load each map only when its panel is opened
  document.querySelectorAll("details.mapd").forEach(d => {
    d.ontoggle = () => {
      const f = d.querySelector("iframe");
      if (d.open && !f.getAttribute("src")) f.src = f.dataset.src;
    };
  });
  $("editBtn").onclick = () => { S.last = null; show(3); };
  $("printBtn").onclick = () => window.print();
  $("result").scrollIntoView({ behavior: "smooth" });
}

// ---------- the button ----------
$("planBtn").onclick = async () => {
  if (S.picked.size === 0) { $("pickStatus").textContent = t("pickOne"); return; }
  const btn = $("planBtn"), o = getOpts();
  btn.disabled = true; S.aiErr = "";
  try {
    let done = false;
    if ($("useAI").checked) {
      btn.textContent = t("planning");
      try {
        const { plan, summary } = await aiPlan(o);
        renderPlan(plan, o, "srcAI", summary);
        done = true;
      } catch (e) {
        S.aiErr = e.message;
        console.warn("AI failed, using the built-in planner:", e.message);
      }
    }
    if (!done) renderPlan(makePlan(o), o, $("useAI").checked ? "srcFallback" : "srcBuilt", null);
  } catch (e) {
    $("pickStatus").textContent = "Error: " + e.message;
    alert("Error: " + e.message);
    console.error(e);
  } finally {
    btn.disabled = false; btn.textContent = t("makePlan");
  }
};

// ---------- start ----------
loadWx();
if (LANG) { $("langMini").value = LANG; applyLang(); show(1); }
else { $("langMini").value = "en"; applyLang(); show(0); }
