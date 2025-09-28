import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Route رئيسي يرد على "/"
app.get("/", (req, res) => {
  res.send("✅ Personality Backend is running!");
});

// تحديد الفئة العمرية
function getAgeGroup(age) {
  if (age < 18) return "under-18";
  if (age >= 18 && age <= 25) return "18-25";
  if (age >= 26 && age <= 40) return "26-40";
  return "40+";
}

// جلب الأسئلة حسب العمر
app.get("/questions-by-age", async (req, res) => {
  const age = parseInt(req.query.age, 10);
  const ageGroup = getAgeGroup(age);

  try {
    const queryUrl = `http://localhost:8055/items/questions?filter[age_group][_eq]=${ageGroup}`;
    const response = await fetch(queryUrl);
    const data = await response.json();

    res.json({
      questions: data.data.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options || [],
        age_group: q.age_group,
      })),
    });
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// تحليل الإجابات وتحديد الشخصية + جلب كل تفاصيلها
app.post("/analyze-answers", async (req, res) => {
  const { age, answers } = req.body;

  if (!age || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Age and answers array are required" });
  }

  try {
    // حساب الشخصية الأكثر تكراراً
    const personalityCount = {};
    answers.forEach((ans) => {
      if (ans.personality) {
        personalityCount[ans.personality] = (personalityCount[ans.personality] || 0) + 1;
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

    // جلب كل التفاصيل من Directus
    const queryUrl = `http://localhost:8055/items/personalities?filter[type][_eq]=${bestPersonality}`;
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
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


export default app;

