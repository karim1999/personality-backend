const path = require("path");
const fs = require("fs");

module.exports = (req, res) => {
  try {
    const type = req.query.type;
    const dataPath = path.join(__dirname, "..", "data", "characters.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const all = JSON.parse(raw);

    if (type) {
      const found = all.find(c => c.type === type);
      return res.status(200).json({ character: found || null });
    }

    res.status(200).json({ characters: all });
  } catch (err) {
    console.error("Error in characters:", err);
    res.status(500).json({ error: "Server error" });
  }
};
