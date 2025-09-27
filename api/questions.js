import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const age = parseInt(req.query.age, 10);

    function getAgeGroup(age) {
      if (age < 18) return "under-18";
      if (age >= 18 && age <= 25) return "18-25";
      if (age >= 26 && age <= 40) return "26-40";
      return "40+";
    }

    const ageGroup = getAgeGroup(age);

    try {
      const queryUrl = `${process.env.DIRECTUS_URL}/items/questions?filter[age_group][_eq]=${ageGroup}`;
      const response = await fetch(queryUrl, {
        headers: {
          Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
        },
      });
      const data = await response.json();

      res.status(200).json({
        questions: data.data.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options || [],
          age_group: q.age_group,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
