// facilities.js: (1) Smart Accessibility Checker  (2) Nearby facilities (DEMO SAMPLE DATA)
(function () {
  const accAlready = !!I18N.en.accTitle;   // true if access.js already loaded

  // ---------- words ----------
  const TXT = {
    en: {
      wheel: "♿ Wheelchair user in the group", accTitle: "Accessibility details", accWheel: "Wheelchair access",
      accRamp: "Ramp", accSteps: "Steps", accToilet: "Accessible toilet", accRest: "Rest seating",
      accWalk: "Walking effort", accParking: "Parking", accYes: "Yes", accPartial: "Partly", accNo: "No",
      accUnknown: "Not checked", accLow: "Low", accMod: "Moderate", accReported: "Reported by sources",
      accSample: "Sample data, not audited", accVerify: "Please confirm with the venue before you travel.",
      accMode: "Accessibility mode is on",
      accModeNote: "Accessibility information is incomplete. Rides are chosen to avoid walking.",
      accGeneral: "Official resources", accBadgeYes: "♿ Accessible", accBadgePartial: "♿ Partly",
      accBadgeNo: "♿ Not suitable", accBadgeUnknown: "♿ Not checked",
      facTitle: "Nearby facilities", facToilet: "Toilet", facWater: "Drinking water", facPharm: "Pharmacy",
      facHosp: "Hospital or clinic", facAtm: "ATM", facBench: "Benches within 300 m",
      facSample: "Demo sample data, not verified. Check on site."
    },
    hi: {
      wheel: "♿ ग्रुप में व्हीलचेयर उपयोगकर्ता हैं", accTitle: "एक्सेसिबिलिटी जानकारी", accWheel: "व्हीलचेयर पहुँच",
      accRamp: "रैंप", accSteps: "सीढ़ियाँ", accToilet: "सुलभ शौचालय", accRest: "आराम के लिए बैठने की जगह",
      accWalk: "पैदल चलने की मेहनत", accParking: "पार्किंग", accYes: "हाँ", accPartial: "आंशिक", accNo: "नहीं",
      accUnknown: "जाँच नहीं हुई", accLow: "कम", accMod: "मध्यम", accReported: "स्रोतों द्वारा बताया गया",
      accSample: "नमूना डेटा, ऑडिट नहीं हुआ", accVerify: "जाने से पहले स्थान से पुष्टि कर लें।",
      accMode: "एक्सेसिबिलिटी मोड चालू है",
      accModeNote: "जानकारी अधूरी है। चलना कम हो, इसलिए सवारी चुनी गई है।",
      accGeneral: "आधिकारिक संसाधन", accBadgeYes: "♿ सुलभ", accBadgePartial: "♿ आंशिक",
      accBadgeNo: "♿ उपयुक्त नहीं", accBadgeUnknown: "♿ जाँच नहीं हुई",
      facTitle: "आस-पास की सुविधाएँ", facToilet: "शौचालय", facWater: "पीने का पानी", facPharm: "दवा की दुकान",
      facHosp: "अस्पताल या क्लिनिक", facAtm: "ATM", facBench: "300 मी. में बेंच",
      facSample: "डेमो नमूना डेटा, सत्यापित नहीं। मौके पर जाँच लें।"
    },
    kn: {
      wheel: "♿ ಗುಂಪಿನಲ್ಲಿ ಗಾಲಿಕುರ್ಚಿ ಬಳಸುವವರಿದ್ದಾರೆ", accTitle: "ಪ್ರವೇಶಾರ್ಹತೆಯ ವಿವರ", accWheel: "ಗಾಲಿಕುರ್ಚಿ ಪ್ರವೇಶ",
      accRamp: "ರ್ಯಾಂಪ್", accSteps: "ಮೆಟ್ಟಿಲುಗಳು", accToilet: "ಸುಲಭ ಶೌಚಾಲಯ", accRest: "ವಿಶ್ರಾಂತಿ ಆಸನ",
      accWalk: "ನಡಿಗೆಯ ಶ್ರಮ", accParking: "ಪಾರ್ಕಿಂಗ್", accYes: "ಹೌದು", accPartial: "ಭಾಗಶಃ", accNo: "ಇಲ್ಲ",
      accUnknown: "ಪರಿಶೀಲಿಸಿಲ್ಲ", accLow: "ಕಡಿಮೆ", accMod: "ಮಧ್ಯಮ", accReported: "ಮೂಲಗಳ ಪ್ರಕಾರ",
      accSample: "ಮಾದರಿ ಮಾಹಿತಿ, ಪರಿಶೀಲನೆಯಾಗಿಲ್ಲ", accVerify: "ಹೋಗುವ ಮೊದಲು ಸ್ಥಳದಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      accMode: "ಪ್ರವೇಶಾರ್ಹತೆ ಮೋಡ್ ಆನ್ ಆಗಿದೆ",
      accModeNote: "ಮಾಹಿತಿ ಅಪೂರ್ಣ. ನಡಿಗೆ ಕಡಿಮೆ ಇರುವಂತೆ ವಾಹನ ಆರಿಸಲಾಗಿದೆ.",
      accGeneral: "ಅಧಿಕೃತ ಸಂಪನ್ಮೂಲಗಳು", accBadgeYes: "♿ ಪ್ರವೇಶಾರ್ಹ", accBadgePartial: "♿ ಭಾಗಶಃ",
      accBadgeNo: "♿ ಸೂಕ್ತವಲ್ಲ", accBadgeUnknown: "♿ ಪರಿಶೀಲಿಸಿಲ್ಲ",
      facTitle: "ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳು", facToilet: "ಶೌಚಾಲಯ", facWater: "ಕುಡಿಯುವ ನೀರು", facPharm: "ಔಷಧಿ ಅಂಗಡಿ",
      facHosp: "ಆಸ್ಪತ್ರೆ ಅಥವಾ ಕ್ಲಿನಿಕ್", facAtm: "ATM", facBench: "300 ಮೀ. ಒಳಗೆ ಬೆಂಚುಗಳು",
      facSample: "ಡೆಮೊ ಮಾದರಿ ಮಾಹಿತಿ, ಪರಿಶೀಲಿಸಿಲ್ಲ. ಸ್ಥಳದಲ್ಲಿ ಖಚಿತಪಡಿಸಿ."
    },
    mr: {
      wheel: "♿ ग्रुपमध्ये व्हीलचेअर वापरणारे आहेत", accTitle: "सुलभता माहिती", accWheel: "व्हीलचेअर प्रवेश",
      accRamp: "रॅम्प", accSteps: "पायऱ्या", accToilet: "सुलभ स्वच्छतागृह", accRest: "विश्रांतीसाठी बसण्याची जागा",
      accWalk: "चालण्याचा त्रास", accParking: "पार्किंग", accYes: "होय", accPartial: "अंशतः", accNo: "नाही",
      accUnknown: "तपासलेले नाही", accLow: "कमी", accMod: "मध्यम", accReported: "स्रोतांनुसार",
      accSample: "नमुना डेटा, तपासणी झालेली नाही", accVerify: "प्रवासापूर्वी ठिकाणी खात्री करा.",
      accMode: "सुलभता मोड चालू आहे",
      accModeNote: "माहिती अपूर्ण आहे. कमी चालावे लागेल अशी वाहने निवडली आहेत.",
      accGeneral: "अधिकृत संसाधने", accBadgeYes: "♿ सुलभ", accBadgePartial: "♿ अंशतः",
      accBadgeNo: "♿ योग्य नाही", accBadgeUnknown: "♿ तपासलेले नाही",
      facTitle: "जवळच्या सुविधा", facToilet: "स्वच्छतागृह", facWater: "पिण्याचे पाणी", facPharm: "औषधाचे दुकान",
      facHosp: "रुग्णालय किंवा क्लिनिक", facAtm: "ATM", facBench: "300 मी. आत बाके",
      facSample: "डेमो नमुना डेटा, पडताळलेला नाही. जागेवर खात्री करा."
    }
  };
  ["en", "hi", "kn", "mr"].forEach(l => Object.assign(I18N[l], TXT[l]));

  // ---------- ACCESSIBILITY DATA ----------
  // Only the Fort has info from sources. Everything else is "sample / not checked".
  const ACCESS = {
    "Belagavi Fort & Kamal Basti": {
      wheelchair: "partial", ramp: "unknown", toilet: "unknown", rest: "unknown",
      steps: "Steps lead up to the Kamal Basadi main hall",
      parking: "Wheelchair-accessible parking and some pathways reported",
      level: "reported",
      src: "Wikipedia (steps); visitor guide website (parking, pathways)"
    }
  };
  function acc(p) {
    return ACCESS[p.name] || {
      wheelchair: "unknown", ramp: "unknown", toilet: "unknown", rest: "unknown",
      steps: p.step ? "Entry assumed step-free" : "Steps likely", parking: "unknown",
      level: "sample", src: ""
    };
  }
  const WORD = { yes: "accYes", partial: "accPartial", no: "accNo", unknown: "accUnknown" };
  const BADGE = { yes: "accBadgeYes", partial: "accBadgePartial", no: "accBadgeNo", unknown: "accBadgeUnknown" };
  const BCLASS = { yes: "good", partial: "", no: "warn", unknown: "" };

  const badgeHTML = p => `<span class="badge ${BCLASS[acc(p).wheelchair]}">${t(BADGE[acc(p).wheelchair])}</span>`;

  function accHTML(p) {
    const a = acc(p);
    const st = k => `<span class="accv ${a[k]}">${t(WORD[a[k]])}</span>`;
    const park = a.parking === "unknown" ? t("accUnknown") : a.parking;
    return `<details class="acc"><summary>♿ ${t("accTitle")}</summary>
      <div class="accrow"><span>${t("accWheel")}</span>${st("wheelchair")}</div>
      <div class="accrow"><span>${t("accRamp")}</span>${st("ramp")}</div>
      <div class="accrow"><span>${t("accSteps")}</span><span>${a.steps}</span></div>
      <div class="accrow"><span>${t("accToilet")}</span>${st("toilet")}</div>
      <div class="accrow"><span>${t("accRest")}</span>${st("rest")}</div>
      <div class="accrow"><span>${t("accWalk")}</span><span>${p.walk > 1 ? t("accMod") : t("accLow")} · ${p.dur} ${t("min")}</span></div>
      <div class="accrow"><span>${t("accParking")}</span><span>${park}</span></div>
      <p class="accnote ${a.level}">${a.level === "reported" ? t("accReported") : t("accSample")}${a.src ? ": " + a.src : ""}. ${t("accVerify")}</p>
      <p class="accnote">${t("accGeneral")}:
        <a href="https://belagavi.nic.in/en/tourism/" target="_blank" rel="noopener">belagavi.nic.in</a> ·
        <a href="https://depwd.gov.in/" target="_blank" rel="noopener">depwd.gov.in</a></p>
    </details>`;
  }

  // wheelchair mode changes the plan (only if access.js has not done it already)
  if (!accAlready) {
    const baseUsable = usable;
    usable = function (o) {
      const w = document.getElementById("wheel");
      const wheel = !!(w && w.checked);
      if (wheel) o.elders = true;
      const r = baseUsable(o);
      if (!wheel) return r;
      r.list = r.list.filter(p => {
        if (acc(p).wheelchair === "no") { r.skipped.push(p.name + ": not wheelchair accessible"); return false; }
        return true;
      });
      return r;
    };
  }

  // ---------- FACILITIES: DEMO SAMPLE DATA (made-up numbers, replace after a site visit) ----------
  // d = distance in metres. benches = count within 300 m.
  const DEFAULT = { toilet: 200, water: 150, pharmacy: 350, hospital: 800, atm: 300, benches: 4 };
  const FAC = {
    "Belagavi Fort & Kamal Basti":   { toilet: 150, water: 90,  pharmacy: 450, hospital: 900, atm: 400, benches: 8 },
    "Kapileshwar Temple":            { toilet: 80,  water: 60,  pharmacy: 300, hospital: 700, atm: 350, benches: 5 },
    "Rani Chennamma Circle":         { toilet: 220, water: 180, pharmacy: 120, hospital: 500, atm: 90,  benches: 2 },
    "Vaccine Depot Lake & Park":     { toilet: 110, water: 100, pharmacy: 420, hospital: 850, atm: 380, benches: 12 },
    "Military Mahadev Temple":       { toilet: 130, water: 70,  pharmacy: 600, hospital: 1100, atm: 650, benches: 4 },
    "Belgaum Heritage Museum":       { toilet: 40,  water: 40,  pharmacy: 280, hospital: 650, atm: 300, benches: 6 },
    "Hotel Amar (Tilakwadi)":        { toilet: 20,  water: 10,  pharmacy: 150, hospital: 600, atm: 200, benches: 1 },
    "Hotel Panchamruth Pure Veg":    { toilet: 15,  water: 10,  pharmacy: 100, hospital: 450, atm: 120, benches: 1 },
    "Niyaaz Restaurant (Tilakwadi)": { toilet: 20,  water: 10,  pharmacy: 160, hospital: 620, atm: 210, benches: 1 }
  };
  const m = d => d + " m";
  const row = (label, value) => `<div class="accrow"><span>${label}</span><span>${value}</span></div>`;

  function facHTML(p) {
    const f = FAC[p.name] || DEFAULT;
    return `<details class="acc fac"><summary>🚻 ${t("facTitle")} · 🚻 ${m(f.toilet)} · 💧 ${m(f.water)}</summary>
      ${row(t("facToilet"), m(f.toilet))}
      ${row(t("facWater"), m(f.water))}
      ${row(t("facPharm"), m(f.pharmacy))}
      ${row(t("facHosp"), m(f.hospital))}
      ${row(t("facAtm"), m(f.atm))}
      ${row(t("facBench"), f.benches)}
      <p class="accnote">${t("facSample")}</p></details>`;
  }

  // ---------- style (added once) ----------
  if (!document.getElementById("acc-css")) {
    const css = document.createElement("style");
    css.id = "acc-css";
    css.textContent = `
      details.acc { margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px 10px; }
      details.acc summary { font-size: .88rem; }
      .accrow { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: .84rem; }
      .accrow span:last-child { text-align: right; }
      .accv { font-weight: 700; }
      .accv.yes { color: #059669; } .accv.partial { color: #b45309; } .accv.no { color: #dc2626; } .accv.unknown { color: #64748b; }
      .accnote { font-size: .78rem; color: #64748b; margin: 8px 0 0; }
      .accnote.reported { color: #047857; }
      .accmode { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; border-radius: 14px; padding: 10px 12px; margin: 0 0 12px; font-size: .88rem; }
    `;
    document.head.appendChild(css);
  }

  // ---------- adds everything after the page draws ----------
  function inject() {
    const all = PLACES.concat(typeof MEALS !== "undefined" ? MEALS : []);

    if (!accAlready) {
      document.querySelectorAll("#placeList .place:not([data-acc])").forEach(el => {
        el.dataset.acc = "1";
        const p = PLACES[+el.dataset.i];
        const box = el.querySelector(":scope > span:last-child");
        if (p && box) box.insertAdjacentHTML("beforeend", badgeHTML(p));
      });
    }

    document.querySelectorAll("#result .stop:not([data-x])").forEach(el => {
      el.dataset.x = "1";
      const h = el.querySelector("h3");
      if (!h) return;
      const name = h.textContent.replace(/^[^\p{L}]+/u, "").trim();
      const p = all.find(x => x.name === name);
      if (!p) return;
      const html = (accAlready ? "" : accHTML(p)) + facHTML(p);
      const mr = el.querySelector(".maprow");
      if (mr) mr.insertAdjacentHTML("beforebegin", html);
      else el.insertAdjacentHTML("beforeend", html);
    });

    if (!accAlready) {
      const res = document.getElementById("result");
      const on = ["wheel", "elders"].some(id => { const c = document.getElementById(id); return c && c.checked; });
      if (on && res.querySelector(".stats") && !res.querySelector(".accmode")) {
        res.insertAdjacentHTML("afterbegin",
          `<div class="accmode"><b>♿ ${t("accMode")}</b><br>${t("accModeNote")}</div>`);
      }
    }
  }
  new MutationObserver(inject).observe(document.querySelector("main"), { childList: true, subtree: true });
})();
