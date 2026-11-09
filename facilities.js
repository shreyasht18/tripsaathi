// facilities.js: nearby toilets, water, pharmacy, hospital, ATM, benches (OpenStreetMap)
(function () {
  const TXT = {
    en: { facTitle: "Nearby facilities", facToilet: "Toilet", facWater: "Drinking water", facPharm: "Pharmacy",
      facHosp: "Hospital or clinic", facAtm: "ATM", facBench: "Benches within 300 m",
      facNone: "None mapped within 500 m", facAccessible: "wheelchair accessible",
      facNote: "From OpenStreetMap (volunteer-mapped, may be incomplete). Distances are straight-line from the place pin.",
      facLoading: "Loading nearby facilities...", facFail: "Could not load nearby facilities.", facRetry: "Tap to retry" },
    hi: { facTitle: "आस-पास की सुविधाएँ", facToilet: "शौचालय", facWater: "पीने का पानी", facPharm: "दवा की दुकान",
      facHosp: "अस्पताल या क्लिनिक", facAtm: "ATM", facBench: "300 मी. में बेंच",
      facNone: "500 मी. में कोई दर्ज नहीं", facAccessible: "व्हीलचेयर सुलभ",
      facNote: "OpenStreetMap से (स्वयंसेवकों द्वारा बनाया गया, अधूरा हो सकता है)।",
      facLoading: "आस-पास की सुविधाएँ लोड हो रही हैं...", facFail: "सुविधाएँ लोड नहीं हो सकीं।", facRetry: "दोबारा कोशिश करें" },
    kn: { facTitle: "ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳು", facToilet: "ಶೌಚಾಲಯ", facWater: "ಕುಡಿಯುವ ನೀರು", facPharm: "ಔಷಧಿ ಅಂಗಡಿ",
      facHosp: "ಆಸ್ಪತ್ರೆ ಅಥವಾ ಕ್ಲಿನಿಕ್", facAtm: "ATM", facBench: "300 ಮೀ. ಒಳಗೆ ಬೆಂಚುಗಳು",
      facNone: "500 ಮೀ. ಒಳಗೆ ದಾಖಲಾಗಿಲ್ಲ", facAccessible: "ಗಾಲಿಕುರ್ಚಿ ಪ್ರವೇಶಾರ್ಹ",
      facNote: "OpenStreetMap ನಿಂದ (ಸ್ವಯಂಸೇವಕರು ದಾಖಲಿಸಿದ್ದು, ಅಪೂರ್ಣವಾಗಿರಬಹುದು).",
      facLoading: "ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...", facFail: "ಸೌಲಭ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ.", facRetry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" },
    mr: { facTitle: "जवळच्या सुविधा", facToilet: "स्वच्छतागृह", facWater: "पिण्याचे पाणी", facPharm: "औषधाचे दुकान",
      facHosp: "रुग्णालय किंवा क्लिनिक", facAtm: "ATM", facBench: "300 मी. आत बाके",
      facNone: "500 मी. आत नोंद नाही", facAccessible: "व्हीलचेअर सुलभ",
      facNote: "OpenStreetMap वरून (स्वयंसेवकांनी नोंदवलेले, अपूर्ण असू शकते).",
      facLoading: "जवळच्या सुविधा लोड होत आहेत...", facFail: "सुविधा लोड होऊ शकल्या नाहीत.", facRetry: "पुन्हा प्रयत्न करा" }
  };
  ["en", "hi", "kn", "mr"].forEach(l => Object.assign(I18N[l], TXT[l]));

  // basic styling, in case access.js is not loaded
  if (!document.getElementById("fac-css")) {
    const css = document.createElement("style");
    css.id = "fac-css";
    css.textContent = `
      details.fac { margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 10px; }
      details.fac summary { font-size: .88rem; }
      details.fac .accrow { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: .84rem; }
      details.fac .accrow span:last-child { text-align: right; }
      details.fac .accnote { font-size: .78rem; color: #64748b; margin: 8px 0 0; }
      .facretry { color: #4f46e5; font-weight: 700; cursor: pointer; text-decoration: underline; }
    `;
    document.head.appendChild(css);
  }

  const ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
  ];
  const KEY = "fac_v2", TTL = 7 * 24 * 3600 * 1000;
  let FAC = null, STATE = "loading", REASON = "";

  function dist(a, b) {
    const R = 6371000, r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  async function fetchFrom(url, q) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 14000);
    try {
      const r = await fetch(url, {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(q)
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  }

  async function load() {
    STATE = "loading"; REASON = "";
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && Date.now() - c.t < TTL && Array.isArray(c.d)) { FAC = c.d; STATE = "ok"; return; }
    } catch (e) {}

    const box = "(15.80,74.45,15.91,74.57)";
    const q = '[out:json][timeout:25];(' +
      'node["amenity"~"^(toilets|drinking_water|pharmacy|hospital|clinic|atm)$"]' + box + ';' +
      'way["amenity"~"^(toilets|pharmacy|hospital|clinic)$"]' + box + ';' +
      'node["amenity"="bench"]' + box + ';);out center tags;';

    let lastErr = "";
    for (const url of ENDPOINTS) {
      try {
        const j = await fetchFrom(url, q);
        FAC = (j.elements || []).map(e => ({
          type: e.tags && e.tags.amenity,
          lat: e.lat !== undefined ? e.lat : e.center && e.center.lat,
          lng: e.lon !== undefined ? e.lon : e.center && e.center.lon,
          wc: e.tags && e.tags.wheelchair
        })).filter(x => x.type && x.lat !== undefined && x.lng !== undefined);
        STATE = "ok";
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: FAC })); } catch (e) {}
        return;
      } catch (e) { lastErr = e.name === "AbortError" ? "timed out" : e.message; }
    }
    STATE = "fail"; REASON = lastErr;
  }

  function nearest(p, types, max) {
    let best = null;
    FAC.forEach(f => {
      if (!types.includes(f.type)) return;
      const d = dist(p, f);
      if (d <= max && (!best || d < best.d)) best = { d: Math.round(d), wc: f.wc };
    });
    return best;
  }
  const row = (label, n) => `<div class="accrow"><span>${label}</span><span>${
    n ? n.d + " m" + (n.wc === "yes" ? " · ♿ " + t("facAccessible") : "") : t("facNone")}</span></div>`;

  function facHTML(p) {
    const head = `<details class="acc fac"><summary>🚻 ${t("facTitle")}`;
    if (STATE === "loading") return `${head}</summary><p class="accnote">${t("facLoading")}</p></details>`;
    if (STATE === "fail" || !FAC) {
      return `${head}</summary><p class="accnote">${t("facFail")} (${REASON})
        <span class="facretry">${t("facRetry")}</span></p></details>`;
    }
    const toilet = nearest(p, ["toilets"], 500), water = nearest(p, ["drinking_water"], 500);
    const benches = FAC.filter(f => f.type === "bench" && dist(p, f) <= 300).length;
    const quick = " · 🚻 " + (toilet ? toilet.d + " m" : "–") + " · 💧 " + (water ? water.d + " m" : "–");
    return `${head}${quick}</summary>
      ${row(t("facToilet"), toilet)}
      ${row(t("facWater"), water)}
      ${row(t("facPharm"), nearest(p, ["pharmacy"], 500))}
      ${row(t("facHosp"), nearest(p, ["hospital", "clinic"], 500))}
      ${row(t("facAtm"), nearest(p, ["atm"], 500))}
      <div class="accrow"><span>${t("facBench")}</span><span>${benches || t("facNone")}</span></div>
      <p class="accnote">${t("facNote")}</p></details>`;
  }

  function inject() {
    const all = PLACES.concat(typeof MEALS !== "undefined" ? MEALS : []);
    document.querySelectorAll("#result .stop:not([data-fac])").forEach(el => {
      el.dataset.fac = "1";
      const h = el.querySelector("h3");
      if (!h) return;
      const name = h.textContent.replace(/^[^\p{L}]+/u, "").trim();
      const p = all.find(x => x.name === name);
      if (!p) return;
      const mr = el.querySelector(".maprow");
      if (mr) mr.insertAdjacentHTML("beforebegin", facHTML(p));
      else el.insertAdjacentHTML("beforeend", facHTML(p));
    });
  }
  function refresh() {
    document.querySelectorAll("details.fac").forEach(d => d.remove());
    document.querySelectorAll("#result .stop[data-fac]").forEach(e => delete e.dataset.fac);
    inject();
  }

  document.addEventListener("click", e => {
    if (e.target.classList && e.target.classList.contains("facretry")) {
      STATE = "loading"; refresh();
      load().then(refresh);
    }
  });

  new MutationObserver(inject).observe(document.querySelector("main"), { childList: true, subtree: true });
  load().then(refresh);
})();
