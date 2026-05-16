import fetch from "node-fetch";
import Question from "../models/Question.js";

// GET /api/questions?company=Google&branch=Frontend Developer
export const getQuestions = async (req, res) => {
  try {
    const { company, branch } = req.query;

    if (!company || !branch) {
      return res.status(400).json({ message: "Enter both company and branch." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const prompt = `You are a senior technical interviewer at ${company} for ${branch} role.

Generate exactly 5 unique and challenging interview questions for a ${branch} position at ${company}.

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {"question": "question text here", "difficulty": "Easy", "category": "Technical"},
  {"question": "question text here", "difficulty": "Medium", "category": "Technical"},
  {"question": "question text here", "difficulty": "Medium", "category": "Problem Solving"},
  {"question": "question text here", "difficulty": "Hard", "category": "System Design"},
  {"question": "question text here", "difficulty": "Hard", "category": "Technical"}
]

Rules:
- Questions must be specific to ${company} interview style
- Mix of Easy, Medium, Hard difficulty
- Relevant to ${branch} role
- No repeated questions
- Professional and realistic`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 1500,
              },
            }),
          }
        );

        const geminiData = await geminiRes.json();

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

        if (Array.isArray(questions) && questions.length > 0) {
          const formattedQuestions = questions.map((q, index) => ({
            _id: `ai_${Date.now()}_${index}`,
            question: q.question,
            difficulty: q.difficulty || "Medium",
            category: q.category || "Technical",
            company,
            branch,
            aiGenerated: true,
          }));

          return res.json(formattedQuestions);
        }
      } catch (aiError) {
        console.log(aiError.message);
      }
    }

    const questions = await Question.find({ company, branch });

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this combination" });
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedQuestions = async (req, res) => {
  try {
    await Question.deleteMany({});

    const questions = [
      // Google - Frontend
      { company: "Google", branch: "Frontend Developer", question: "Explain the difference between == and === in JavaScript.", difficulty: "Easy" },
      { company: "Google", branch: "Frontend Developer", question: "What is the Virtual DOM and how does React use it?", difficulty: "Medium" },
      { company: "Google", branch: "Frontend Developer", question: "Explain CSS specificity and how it works.", difficulty: "Medium" },
      { company: "Google", branch: "Frontend Developer", question: "What are React Hooks? Explain useState and useEffect.", difficulty: "Medium" },
      { company: "Google", branch: "Frontend Developer", question: "How does event bubbling work in JavaScript?", difficulty: "Hard" },
      // Google - Backend
      { company: "Google", branch: "Backend Developer", question: "What is REST API and what are its principles?", difficulty: "Easy" },
      { company: "Google", branch: "Backend Developer", question: "Explain the difference between SQL and NoSQL databases.", difficulty: "Medium" },
      { company: "Google", branch: "Backend Developer", question: "What is middleware in Express.js?", difficulty: "Medium" },
      { company: "Google", branch: "Backend Developer", question: "How does JWT authentication work?", difficulty: "Hard" },
      { company: "Google", branch: "Backend Developer", question: "Explain database indexing and its benefits.", difficulty: "Hard" },
      // Amazon - Frontend
      { company: "Amazon", branch: "Frontend Developer", question: "What is the box model in CSS?", difficulty: "Easy" },
      { company: "Amazon", branch: "Frontend Developer", question: "Explain lazy loading and why it's important.", difficulty: "Medium" },
      { company: "Amazon", branch: "Frontend Developer", question: "What is the difference between let, var, and const?", difficulty: "Easy" },
      { company: "Amazon", branch: "Frontend Developer", question: "How does React context API work?", difficulty: "Hard" },
      { company: "Amazon", branch: "Frontend Developer", question: "What are promises and async/await in JavaScript?", difficulty: "Medium" },
      // TCS - Full Stack
      { company: "TCS", branch: "Full Stack Developer", question: "What is Git and explain basic Git commands.", difficulty: "Easy" },
      { company: "TCS", branch: "Full Stack Developer", question: "Explain the MERN stack.", difficulty: "Medium" },
      { company: "TCS", branch: "Full Stack Developer", question: "What is an API? How do you test APIs?", difficulty: "Easy" },
      // Infosys - Backend
      { company: "Infosys", branch: "Backend Developer", question: "What is Mongoose and how is it used with MongoDB?", difficulty: "Medium" },
      { company: "Infosys", branch: "Backend Developer", question: "What is the event loop in Node.js?", difficulty: "Hard" },
    ];

    await Question.insertMany(questions);
    res.json({ message: `${questions.length} Questions seeded!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};