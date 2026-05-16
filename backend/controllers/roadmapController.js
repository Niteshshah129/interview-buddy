import Roadmap from "../models/Roadmap.js";
import fetch from "node-fetch";

// POST /api/roadmap/generate
export const generateRoadmap = async (req, res) => {
  try {
    const { experienceLevel, company, jobRole } = req.body;

    if (!experienceLevel || !company || !jobRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key not found" });
    }

    const totalWeeks = experienceLevel === "Fresher" ? 12 : 8;
    const prompt = `You are an expert career coach and technical interview preparation specialist.

Create a detailed interview preparation roadmap for:
- Experience Level: ${experienceLevel}
- Target Company: ${company}
- Job Role: ${jobRole}

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "overview": "2-3 sentence overview of the preparation strategy for ${company} ${jobRole} role",
  "totalWeeks": ${totalWeeks},
  "rounds": [
    {
      "roundNumber": 1,
      "roundName": "Round name (e.g., Online Assessment)",
      "description": "What happens in this round",
      "topics": ["topic1", "topic2", "topic3"],
      "resources": ["resource1", "resource2"],
      "tips": ["tip1", "tip2"]
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "title": "Week title",
      "topics": ["topic1", "topic2"],
      "tasks": ["task1", "task2", "task3"],
      "resources": ["resource1", "resource2"]
    }
  ]
}

Requirements:
- Include ALL interview rounds specific to ${company} for ${jobRole}
- Weekly plan should cover ${totalWeeks} weeks
- For ${experienceLevel}: ${experienceLevel === "Fresher" ? "Focus on fundamentals, DSA basics, projects, and college-level concepts" : "Focus on system design, advanced concepts, leadership principles, and past experience"}
- Be specific to ${company} interview process
- Resources should be free and accessible (LeetCode, GeeksforGeeks, YouTube, etc.)`;

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

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let roadmapData = {};
    try {
      roadmapData = JSON.parse(rawText);
    } catch {
      try {
        const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        roadmapData = JSON.parse(cleaned);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) roadmapData = JSON.parse(match[0]);
      }
    }

    if (!roadmapData.rounds || !roadmapData.weeklyPlan) {
      return res.status(500).json({ message: "Failed to generate roadmap. Please try again." });
    }

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      experienceLevel,
      company,
      jobRole,
      totalWeeks: roadmapData.totalWeeks || totalWeeks,
      overview: roadmapData.overview || "",
      rounds: roadmapData.rounds,
      weeklyPlan: roadmapData.weeklyPlan,
    });

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/roadmap/my
export const getMyRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .sort({ lastAccessed: -1 })
      .select("-rounds -weeklyPlan");
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/roadmap/:id
export const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    if (roadmap.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    roadmap.lastAccessed = new Date();
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/roadmap/:id/progress
export const updateProgress = async (req, res) => {
  try {
    const { type, index, completed } = req.body;
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    if (roadmap.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (type === "round") {
      roadmap.rounds[index].completed = completed;
    } else if (type === "week") {
      roadmap.weeklyPlan[index].completed = completed;
    }

    // Calculate overall progress
    const totalItems = roadmap.rounds.length + roadmap.weeklyPlan.length;
    const completedItems =
      roadmap.rounds.filter((r) => r.completed).length +
      roadmap.weeklyPlan.filter((w) => w.completed).length;

    roadmap.overallProgress = Math.round((completedItems / totalItems) * 100);
    roadmap.lastAccessed = new Date();

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/roadmap/:id
export const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    if (roadmap.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await roadmap.deleteOne();
    res.json({ message: "Roadmap deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};