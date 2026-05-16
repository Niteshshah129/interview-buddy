import fetch from "node-fetch";
import Resume from "../models/Resume.js";
import axios from "axios";

export const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: "Resume Id not found" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access not allowed" });
    }

    const fileUrl = resume.fileUrl;
    const fileName = resume.fileName;

    let base64Data = "";
    let mimeType = "application/pdf";

    try {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      base64Data = Buffer.from(response.data).toString("base64");

      if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
    } catch (err) {
      return res.status(500).json({ message: "Resume file fetch not successful" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key not found" });
    }

    const prompt = `You are an expert resume reviewer and career coach.
Analyze this resume thoroughly and provide detailed feedback.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "atsScore": 75,
  "overallRating": "Good",
  "summary": "This is a summary of the resume",
  "strongPoints": ["Point 1", "Point 2", "Point 3"],
  "weakPoints": ["Point 1", "Point 2", "Point 3"],
  "improvementTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "missingSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "keywordsFound": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "experienceLevel": "Junior",
  "topSkills": ["Skill 1", "Skill 2", "Skill 3"]
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let analysis = {};
    try {
      analysis = JSON.parse(rawText);
    } catch {
      try {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          analysis = JSON.parse(match[0]);
        }
      } catch {
        const cleaned = rawText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/gi, "")
          .trim();
        try {
          analysis = JSON.parse(cleaned);
        } catch {
          return res.status(500).json({ message: "Analysis parse not successful" });
        }
      }
    }

    res.json({ fileName: resume.fileName, analysis });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};