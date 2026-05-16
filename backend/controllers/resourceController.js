import fetch from "node-fetch";

// POST /api/resource/theory
export const getTheory = async (req, res) => {
  try {
    const { topic, company, jobRole } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key not found" });
    }

    const prompt = `You are an expert technical educator preparing a candidate for ${company} ${jobRole} interview.

Create comprehensive study notes for the topic: "${topic}"

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "title": "${topic}",
  "introduction": "2-3 sentence introduction about this topic",
  "keyPoints": [
    "Key concept 1 with brief explanation",
    "Key concept 2 with brief explanation",
    "Key concept 3 with brief explanation",
    "Key concept 4 with brief explanation",
    "Key concept 5 with brief explanation"
  ],
  "explanation": "Detailed explanation of ${topic} in 4-5 sentences. Cover the main concepts clearly.",
  "example": "A practical real-world example or code example explaining ${topic}",
  "interviewTips": [
    "Interview tip 1 specific to ${company}",
    "Interview tip 2",
    "Interview tip 3"
  ],
  "commonMistakes": [
    "Common mistake 1 to avoid",
    "Common mistake 2 to avoid"
  ],
  "difficulty": "Beginner/Intermediate/Advanced"
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192,
          },
        }),
      }
    );
    const geminiData = await geminiRes.json();

    if (geminiData.error) {
      return res.status(500).json({ message: geminiData.error.message });
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let theory = {};
    try {
      theory = JSON.parse(rawText);
    } catch {
      try {
        const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        theory = JSON.parse(cleaned);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) theory = JSON.parse(match[0]);
      }
    }

    res.json(theory);
  } catch (error) {
    console.log("Theory error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/resource/quiz
export const getQuiz = async (req, res) => {
  try {
    const { topic, company, jobRole, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key not found" });
    }

    const prompt = `You are a technical interviewer at ${company} for ${jobRole} role.

Create exactly 5 MCQ questions about "${topic}" for interview preparation.
Difficulty level: ${difficulty || "Medium"}

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct - brief explanation"
  }
]

Rules:
- correctAnswer is the INDEX (0, 1, 2, or 3) of the correct option
- Questions must be relevant to ${company} interview style
- Mix easy and hard questions
- Explanations must be clear and educational`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();

    if (geminiData.error) {
      return res.status(500).json({ message: geminiData.error.message });
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let quiz = [];
    try {
      quiz = JSON.parse(rawText);
    } catch {
      try {
        const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        quiz = JSON.parse(cleaned);
      } catch {
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) quiz = JSON.parse(match[0]);
      }
    }

    res.json(quiz);
  } catch (error) {
    console.log("Quiz error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/resource/practice
export const getPracticeQuestions = async (req, res) => {
  try {
    const { topic, company, jobRole } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key not found" });
    }

    const prompt = `You are a senior technical interviewer at ${company} for ${jobRole} role.

Generate 3 practice interview questions about "${topic}" with detailed answers.

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "question": "Interview question here?",
    "difficulty": "Easy/Medium/Hard",
    "type": "Conceptual/Coding/System Design/Behavioral",
    "answer": "Detailed answer in 3-4 sentences covering all key points",
    "followUpQuestions": ["Follow up 1?", "Follow up 2?"]
  }
]`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();

    if (geminiData.error) {
      return res.status(500).json({ message: geminiData.error.message });
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let questions = [];
    try {
      questions = JSON.parse(rawText);
    } catch {
      try {
        const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        questions = JSON.parse(cleaned);
      } catch {
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) questions = JSON.parse(match[0]);
      }
    }

    res.json(questions);
  } catch (error) {
    console.log("Practice error:", error);
    res.status(500).json({ message: error.message });
  }
};