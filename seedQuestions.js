import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

const questions = [
  { text: "هل تفضل العمل بشكل فردي أم ضمن فريق؟" },
  { text: "كيف تتعامل مع ضغوط العمل؟" },
  { text: "ما هو أهم إنجاز شخصي لك حتى الآن؟" },
  { text: "هل تعتبر نفسك شخص منظم أم عفوي؟" },
  { text: "كيف تتعامل مع التحديات غير المتوقعة؟" }
];

async function seedQuestions() {
  try {
    for (const q of questions) {
      const res = await fetch(`${DIRECTUS_URL}/items/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DIRECTUS_TOKEN}`
        },
        body: JSON.stringify(q)
      });

      const data = await res.json();
      console.log("تمت إضافة السؤال:", data);
    }
    console.log("✅ كل الأسئلة اتضافت بنجاح!");
  } catch (err) {
    console.error("❌ حصل خطأ:", err);
  }
}

seedQuestions();
