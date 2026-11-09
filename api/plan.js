let cachedModel = null;
const ver = n => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);

// Finds a working Gemini Flash model for your key (so the name never goes out of date)
async function pickModel(key) {
  if (process.env.GEMINI_MODEL) return process.env.GEMINI_MODEL;
  if (cachedModel) return cachedModel;
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
    { headers: { "x-goog-api-key": key } });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || "Could not list models");
  const all = (d.models || []).filter(m =>
    /flash/i.test(m.name) && !/lite|image|tts|live|audio|embed/i.test(m.name) &&
    (m.supportedGenerationMethods || []).includes("generateContent"));
  let ok = all.filter(m => !/preview|exp/i.test(m.name));
  if (!ok.length) ok = all;
  if (!ok.length) throw new Error("No Flash model available for this key");
  ok.sort((a, b) => ver(b.name) - ver(a.name));
  cachedModel = ok[0].name.replace("models/", "");
  return cachedModel;
}

async function callGemini(key, model, prompt, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const gen = { responseMimeType: "application/json", temperature: 0.4 };
    if (/2\.5/.test(model)) gen.thinkingConfig = { thinkingBudget: 0 };   // faster on 2.5 models
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: gen })
      });
    const data = await r.json();
    if (!r.ok) return { ok: false, status: r.status, error: data.error?.message || "Gemini error" };
    return { ok: true, text: data.candidates[0].content.parts[0].text };
  } catch (e) {
    return { ok: false, status: 0, error: e.name === "AbortError" ? "Gemini timed out" : e.message };
  } finally { clearTimeout(timer); }
}

module.exports = async (req, res) => {
  const key = process.env.GEMINI_API_KEY;

  // Open /api/plan in the browser to check the setup
  if (req.method === "GET") {
    if (!key) return res.status(200).json({ keySet: false, fix: "Add GEMINI_API_KEY in Vercel > Settings > Environment Variables, then Redeploy." });
    try {
      const model = await pickModel(key);
      const t = await callGemini(key, model, 'Reply with this JSON only: {"ok":true}', 8000);
      return res.status(200).json({ keySet: true, model, test: t.ok ? "ok, Gemini works" : t.error });
    } catch (e) { return res.status(200).json({ keySet: true, error: e.message }); }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY in Vercel" });

  const { hours, budget, people, group, elders, kids, lang, places } = req.body || {};
  if (!Array.isArray(places) || places.length > 25) return res.status(400).json({ error: "Bad input" });

  const langName = { en: "English", hi: "Hindi", kn: "Kannada", mr: "Marathi" }[lang] || "English";
  const prompt = `Plan a day of sightseeing in Belagavi, India.
Group: ${group}, ${Number(people)} people${elders ? ", includes an elderly person (prefer autos, little walking)" : ""}${kids ? ", includes children" : ""}.
Time: ${Number(hours)} hours. Total group budget: Rs ${Number(budget)} (entry fees per person, rides per group).
Allowed places (use ONLY these exact names): ${JSON.stringify(places)}
Choose the best places and their ORDER. Lunch and dinner are added separately, so do not include them.
For each place choose how to get THERE from the previous stop. Modes: "walk","bus","auto","rapido","uber".
Do not invent fares or times. Write the summary in ${langName}, one friendly sentence.
Reply as JSON only: {"order":["Place"],"modes":["auto"],"summary":"..."} with modes the same length as order.`;

  try {
    let model = await pickModel(key);
    let r = await callGemini(key, model, prompt, 9000);
    if (!r.ok && r.status === 404 && !process.env.GEMINI_MODEL) {   // model was retired: pick again
      cachedModel = null; model = await pickModel(key);
      r = await callGemini(key, model, prompt, 9000);
    }
    if (!r.ok) return res.status(502).json({ error: r.error });
    const plan = JSON.parse(r.text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(plan.order) || !Array.isArray(plan.modes)) throw new Error("Bad AI answer shape");
    return res.status(200).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
