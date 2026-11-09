// access.js: Smart Accessibility Checker (plug-in). Loads after planner.js, before app.js.
(function () {
  // ---------- words (English fallback is automatic) ----------
  const TXT = {
    en: {
      wheel: "Wheelchair user in the group", accTitle: "Accessibility details", accWheel: "Wheelchair access",
      accRamp: "Ramp", accSteps: "Steps", accToilet: "Accessible toilet", accRest: "Rest seating",
      accWalk: "Walking effort", accParking: "Parking", accYes: "Yes", accPartial: "Partly", accNo: "No",
      accUnknown: "Not checked", accLow: "Low", accMod: "Moderate", accReported: "Reported by sources",
      accSample: "Sample data, not audited", accVerify: "Please confirm with the venue before you travel.",
      accMode: "Accessibility mode is on",
      accModeNote: "Accessibility information is incomplete. Rides are chosen to avoid walking.",
      accGeneral: "Official resources", accBadgeYes: "♿ Accessible", accBadgePartial: "♿ Partly",
      accBadgeNo: "♿ Not suitable", accBadgeUnknown: "♿ Not checked"
    },
    hi: {
      wheel: "ग्रुप में व्हीलचेयर उपयोगकर्ता हैं", accTitle: "एक्सेसिबिलिटी जानकारी", accWheel: "व्हीलचेयर पहुँच",
      accRamp: "रैंप", accSteps: "सीढ़ियाँ", accToilet: "सुलभ शौचालय", accRest: "आराम के लिए बैठने की जगह",
      accWalk: "पैदल चलने की मेहनत", accParking: "पार्किंग", accYes: "हाँ", accPartial: "आंशिक", accNo: "नहीं",
      accUnknown: "जाँच नहीं हुई", accLow: "कम", accMod: "मध्यम", accReported: "स्रोतों द्वारा बताया गया",
      accSample: "नमूना डेटा, ऑडिट नहीं हुआ", accVerify: "जाने से पहले स्थान से पुष्टि कर लें।",
      accMode: "एक्सेसिबिलिटी मोड चालू है",
      accModeNote: "जानकारी अधूरी है। चलना कम हो, इसलिए सवारी चुनी गई है।",
      accGeneral: "आधिकारिक संसाधन", accBadgeYes: "♿ सुलभ", accBadgePartial: "♿ आंशिक",
      accBadgeNo: "♿ उपयुक्त नहीं", accBadgeUnknown: "♿ जाँच नहीं हुई"
    },
    kn: {
      wheel: "ಗುಂಪಿನಲ್ಲಿ ಗಾಲಿಕುರ್ಚಿ ಬಳಸುವವರಿದ್ದಾರೆ", accTitle: "ಪ್ರವೇಶಾರ್ಹತೆಯ ವಿವರ", accWheel: "ಗಾಲಿಕುರ್ಚಿ ಪ್ರವೇಶ",
      accRamp: "ರ್ಯಾಂಪ್", accSteps: "ಮೆಟ್ಟಿಲುಗಳು", accToilet: "ಸುಲಭ ಶೌಚಾಲಯ", accRest: "ವಿಶ್ರಾಂತಿ ಆಸನ",
      accWalk: "ನಡಿಗೆಯ ಶ್ರಮ", accParking: "ಪಾರ್ಕಿಂಗ್", accYes: "ಹೌದು", accPartial: "ಭಾಗಶಃ", accNo: "ಇಲ್ಲ",
      accUnknown: "ಪರಿಶೀಲಿಸಿಲ್ಲ", accLow: "ಕಡಿಮೆ", accMod: "ಮಧ್ಯಮ", accReported: "ಮೂಲಗಳ ಪ್ರಕಾರ",
      accSample: "ಮಾದರಿ ಮಾಹಿತಿ, ಪರಿಶೀಲನೆಯಾಗಿಲ್ಲ", accVerify: "ಹೋಗುವ ಮೊದಲು ಸ್ಥಳದಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      accMode: "ಪ್ರವೇಶಾರ್ಹತೆ ಮೋಡ್ ಆನ್ ಆಗಿದೆ",
      accModeNote: "ಮಾಹಿತಿ ಅಪೂರ್ಣ. ನಡಿಗೆ ಕಡಿಮೆ ಇರುವಂತೆ ವಾಹನ ಆರಿಸಲಾಗಿದೆ.",
      accGeneral: "ಅಧಿಕೃತ ಸಂಪನ್ಮೂಲಗಳು", accBadgeYes: "♿ ಪ್ರವೇಶಾರ್ಹ", accBadgePartial: "♿ ಭಾಗಶಃ",
      accBadgeNo: "♿ ಸೂಕ್ತವಲ್ಲ", accBadgeUnknown: "♿ ಪರಿಶೀಲಿಸಿಲ್ಲ"
    },
    mr: {
      wheel: "ग्रुपमध्ये व्हीलचेअर वापरणारे आहेत", accTitle: "सुलभता माहिती", accWheel: "व्हीलचेअर प्रवेश",
      accRamp: "रॅम्प", accSteps: "पायऱ्या", accToilet: "सुलभ स्वच्छतागृह", accRest: "विश्रांतीसाठी बसण्याची जागा",
      accWalk: "चालण्याचा त्रास", accParking: "पार्किंग", accYes: "होय", accPartial: "अंशतः", accNo: "नाही",
      accUnknown: "तपासलेले नाही", accLow: "कमी", accMod: "मध्यम", accReported: "स्रोतांनुसार",
      accSample: "नमुना डेटा, तपासणी झालेली नाही", accVerify: "प्रवासापूर्वी ठिकाणी खात्री करा.",
      accMode: "सुलभता मोड चालू आहे",
      accModeNote: "माहिती अपूर्ण आहे. कमी चालावे लागेल अशी वाहने निवडली आहेत.",
      accGeneral: "अधिकृत संसाधने", accBadgeYes: "♿ सुलभ", accBadgePartial: "♿ अंशतः",
      accBadgeNo: "♿ योग्य नाही", accBadgeUnknown: "♿ तपासलेले नाही"
    }
  };
  ["en", "hi", "kn", "mr"].forEach(l => Object.assign(I18N[l], TXT[l]));

  // ---------- DATA ----------
  // Only the Fort has information from sources. Everything else is "sample / not checked".
  // To add real data: copy the Fort entry, change the place name and fill the fields.
  // Values for wheelchair / ramp / toilet / rest: "yes" | "partial" | "no" | "unknown"
  // level: "reported" (from a source) or "sample" (not audited)
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

  function badgeHTML(p) {
    const w = acc(p).wheelchair;
    return `<span class="badge ${BCLASS[w]}">${t(BADGE[w])}</span>`;
  }

  function detailsHTML(p) {
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

  function bannerHTML() {
    return `<div class="accmode"><b>♿ ${t("accMode")}</b><br>${t("accModeNote")}</div>`;
  }

  // ---------- wheelchair mode changes the plan ----------
  const baseUsable = usable;
  usable = function (o) {
    const w = document.getElementById("wheel");
    const wheel = !!(w && w.checked);
    if (wheel) o.elders = true;                    // prefer rides, avoid walking
    const r = baseUsable(o);
    if (!wheel) return r;
    r.list = r.list.filter(p => {
      if (acc(p).wheelchair === "no") { r.skipped.push(p.name + ": not wheelchair accessible"); return false; }
      return true;
    });
    return r;
  };

  // ---------- style ----------
  const css = document.createElement("style");
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

  // ---------- adds badges and details after the page draws ----------
  function inject() {
    const all = PLACES.concat(typeof MEALS !== "undefined" ? MEALS : []);
    document.querySelectorAll("#placeList .place:not([data-acc])").forEach(el => {
      el.dataset.acc = "1";
      const p = PLACES[+el.dataset.i];
      const box = el.querySelector(":scope > span:last-child");
      if (p && box) box.insertAdjacentHTML("beforeend", badgeHTML(p));
    });
    document.querySelectorAll("#result .stop:not([data-acc])").forEach(el => {
      el.dataset.acc = "1";
      const h = el.querySelector("h3");
      if (!h) return;
      const name = h.textContent.replace(/^[^\p{L}]+/u, "").trim();
      const p = all.find(x => x.name === name);
      if (!p) return;
      const mr = el.querySelector(".maprow");
      if (mr) mr.insertAdjacentHTML("beforebegin", detailsHTML(p));
      else el.insertAdjacentHTML("beforeend", detailsHTML(p));
    });
    const res = document.getElementById("result");
    const on = ["wheel", "elders"].some(id => { const c = document.getElementById(id); return c && c.checked; });
    if (on && res.querySelector(".stats") && !res.querySelector(".accmode")) {
      res.insertAdjacentHTML("afterbegin", bannerHTML());
    }
  }
  new MutationObserver(inject).observe(document.querySelector("main"), { childList: true, subtree: true });
})();
