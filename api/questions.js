const questions = require("../data/questions.json");

module.exports = (req, res) => {
  try {
    const { age_group } = req.query;

    if (age_group) {
      const filtered = questions.filter(q => q.age_group === age_group);
      return res.status(200).json({ questions: filtered });
    }

    res.status(200).json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
