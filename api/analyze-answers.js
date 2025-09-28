import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { age, answers } = req.body;

  if (!age || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Age and answers array are required" });
  }

  try {
    const personalityCount = {};
    answers.forEach((ans) => {
      if (ans.personality) {
        personalityCount[ans.personality] =
          (personalityCount[ans.personality] || 0) + 1;
      }
    });

    let bestPersonality = null;
    let maxCount = -1;
    for (const [personality, count] of Object.entries(personalityCount)) {
      if (count > maxCount) {
        maxCount = count;
        bestPersonality = personality;
      }
    }

    if (!bestPersonality) {
      return res.json({
        result: {
          personality: "Unknown",
          name: "",
          description: "No match found",
          traits: [],
          weaknesses: [],
          careers: [],
        },
      });
    }

    const queryUrl = `${process.env.DIRECTUS_URL}/items/personalities?filter[type][_eq]=${bestPersonality}`;
    const response = await fetch(queryUrl);
    const data = await response.json();

    const p = data.data && data.data[0];

    res.json({
      result: p
        ? {
            personality: p.type,
            name: p.name,
            description: p.description,
            traits: p.strengths || [],
            weaknesses: p.weaknesses || [],
            careers: p.careers || [],
          }
        : {
            personality: bestPersonality,
            name: "",
            description: "No description available",
            traits: [],
            weaknesses: [],
            careers: [],
          },
    });
  } catch (err) {
    console.error("Error analyzing answers:", err.message);
    res.status(500).json({ error: "Failed to analyze answers" });
  }
}