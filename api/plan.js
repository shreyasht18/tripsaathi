module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

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

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data.error?.message || "Gemini error" });
    const text = data.candidates[0].content.parts[0].text;
    const plan = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(plan.order) || !Array.isArray(plan.modes)) throw new Error("Bad shape");
    return res.status(200).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.name === "AbortError" ? "Gemini timed out" : e.message });
  } finally { clearTimeout(timer); }
};