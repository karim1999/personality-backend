const characters = require("../data/characters.json");

module.exports = (req, res) => {
  try {
    const { type } = req.query;
    if (type) {
      const char = characters.find(c => c.type === type);
      return res.status(200).json({ character: char || null });
    }
    res.status(200).json({ characters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
