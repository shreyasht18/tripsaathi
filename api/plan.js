// Vercel serverless function. Your key stays here, never in the browser.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

  const { hours, budget, who, places, lunch } = req.body || {};
  if (!Array.isArray(places) || places.length > 20) {
    return res.status(400).json({ error: "Bad input" });
  }

  const prompt = `You are a trip planner for Belagavi, India.
Traveller: ${who} (elders = low walking, prefer autos; budget = cheap, walk or bus; kids = easy rides).
Time available: ${Number(hours)} hours, starting 9:00 AM from the bus stand. Budget: Rs ${Number(budget)}.

Places you may use (use ONLY these exact names): ${JSON.stringify(places)}
Lunch stop (include it once, around 12:00 to 1:00 PM, in the middle of the order, only if the trip is 5+ hours): ${JSON.stringify(lunch)}

Pick the best places and their ORDER so the whole trip, including travel and returning to the bus stand, fits the time and budget.
For each stop choose how to get THERE from the previous stop. Allowed modes: "walk", "bus", "auto", "rapido", "uber".
Do not invent fares, times or places.

Reply with JSON only, exactly this shape:
{"order":["Place name", "..."],"modes":["auto","..."],"summary":"one friendly sentence on why this plan suits the traveller"}
"modes" must have the same length as "order".`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 }
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
    return res.status(500).json({ error: e.message });
  }
};