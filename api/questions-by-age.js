// api/questions-by-age.js
// Example simple endpoint: /api/questions-by-age?age=20
const QUESTIONS = {
  "18": [
    { id: 1, q: "What do you enjoy doing in free time?" },
    { id: 2, q: "Are you more introvert or extrovert?" }
  ],
  "25": [
    { id: 1, q: "What are your career goals?" },
    { id: 2, q: "How do you handle stress?" }
  ]
};

module.exports = (req, res) => {
  try {
    const ageParam = req.query.age || req.query.age || "";
    // use coarse bucket: 18, 25, 35 ...
    const bucket = String(Math.floor(Number(ageParam) / 10) * 10) || "18";
    const questions = QUESTIONS[bucket] || QUESTIONS["18"];
    res.status(200).json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
