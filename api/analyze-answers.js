// api/analyze-answers.js
// Expects JSON body: { answers: [...] }
// NOTE: requires OPENAI_API_KEY set in Vercel environment variables if using OpenAI.

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { answers } = req.body || {};
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload: answers expected" });
    }

    // --- Simple local analysis fallback (in case no OpenAI key) ---
    if (!process.env.OPENAI_API_KEY) {
      // lightweight mock analysis
      const summary = answers.join(" ").slice(0, 200);
      return res.status(200).json({
        engine: "mock",
        summary,
        suggestedCareers: ["Lawyer", "Consultant", "Manager"]
      });
    }

    // --- If OPENAI_API_KEY exists, call OpenAI (example using REST) ---
    const apiKey = process.env.OPENAI_API_KEY;
    const prompt = `Analyze these answers and produce a short personality summary and 5 suggested careers:\n\n${JSON.stringify(answers)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change if desired
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", text);
      return res.status(502).json({ error: "OpenAI API error", detail: text });
    }

    const data = await response.json();
    const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

    return res.status(200).json({
      engine: "openai",
      raw: data,
      analysis: content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
