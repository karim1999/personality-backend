const path = require("path");
const fs = require("fs");

module.exports = (req, res) => {
  try {
    const age = req.query.age;
    if (!age) {
      return res.status(400).json({ error: "age query param is required" });
    }

    const dataPath = path.join(__dirname, "..", "data", "questions.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const all = JSON.parse(raw);

    const filtered = all.filter(q => q.age_group === getAgeGroup(age));

    return res.status(200).json({ questions: filtered });
  } catch (err) {
    console.error("Error in questions-by-age:", err);
    res.status(500).json({ error: "Server error" });
  }
};

function getAgeGroup(age) {
  const a = Number(age);
  if (a < 18) return "under-18";
  if (a <= 25) return "18-25";
  if (a <= 40) return "26-40";
  return "40+";
}
