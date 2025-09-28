import fetch from "node-fetch";

function getAgeGroup(age) {
  if (age < 18) return "under-18";
  if (age >= 18 && age <= 25) return "18-25";
  if (age >= 26 && age <= 40) return "26-40";
  return "40+";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const age = parseInt(req.query.age, 10);
  const ageGroup = getAgeGroup(age);

  try {
    const queryUrl = `${process.env.DIRECTUS_URL}/items/questions?filter[age_group][_eq]=${ageGroup}`;
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
}