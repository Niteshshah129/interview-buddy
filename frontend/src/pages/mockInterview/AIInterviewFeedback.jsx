import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy, CheckCircle, AlertCircle, Lightbulb,
  ArrowLeft, RotateCcw, TrendingUp, Star, ChevronDown, ChevronUp
} from "lucide-react";

const AIInterviewFeedback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const company = location.state?.company || "";
  const branch = location.state?.branch || "";
  const answers = location.state?.answers || [];

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(0);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY_2;

  useEffect(() => {
    if (!location.state) { navigate("/mock-interview"); return; }
    generateFeedback();
  }, []);

  const generateFeedback = async () => {
    setLoading(true);
    try {
      const answersText = answers.map((a, i) =>
        `Q${i + 1} (${a.difficulty}): ${a.question}\nAnswer: ${a.answer}`
      ).join("\n\n");

      const prompt = `You are a senior technical interviewer at ${company} for ${branch} role.

Evaluate this complete interview:
${answersText}

Return ONLY valid JSON (no markdown):
{
  "overallScore": 75,
  "overallRating": "Good/Excellent/Average/Needs Improvement",
  "summary": "3-4 sentence personalized overall feedback mentioning ${company} and ${branch}",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "questionFeedback": [
    {
      "question": "question text",
      "score": 7,
      "rating": "Good",
      "feedback": "specific feedback for this answer",
      "idealPoints": ["key point 1", "key point 2"],
      "difficulty": "Easy/Medium/Hard"
    }
  ],
  "nextSteps": ["action 1", "action 2", "action 3"],
  "hiringChance": "Low/Medium/High"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
          }),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      let result = {};
      try { result = JSON.parse(rawText); }
      catch {
        const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        try { result = JSON.parse(cleaned); }
        catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) result = JSON.parse(match[0]);
        }
      }

      setFeedback(result);
    } catch (err) {
      console.log("Feedback error:", err);
      setFeedback({ error: err.message });
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50", border: "border-green-200", label: "Excellent!" };
    if (score >= 60) return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200", label: "Good Job!" };
    if (score >= 40) return { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-50", border: "border-yellow-200", label: "Keep Practicing" };
    return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50", border: "border-red-200", label: "Needs Improvement" };
  };

  const getHiringColor = (chance) => {
    if (chance === "High") return "bg-green-100 text-green-700";
    if (chance === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Analyzing Your Interview...</h2>
          <p className="text-gray-500 text-sm">AI is evaluating all your responses</p>
        </div>
      </div>
    );
  }

  if (!feedback || feedback.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{feedback?.error || "Failed to generate feedback"}</p>
          <button onClick={generateFeedback} className="bg-[#243A6F] text-white px-6 py-2 rounded-xl">Retry</button>
        </div>
      </div>
    );
  }

  const scoreColors = getScoreColor(feedback.overallScore || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate("/mock-interview")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft size={16} /> Back to Interview
        </button>

        {/* Header Score Card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Score Circle */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-28 h-28 ${scoreColors.bg} rounded-full flex items-center justify-center shadow-xl`}>
                <span className="text-4xl font-bold text-white">{feedback.overallScore}</span>
              </div>
              <p className={`font-bold mt-2 ${scoreColors.text}`}>{scoreColors.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{feedback.overallRating}</p>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-3 flex-wrap">
                <h1 className="text-xl font-bold">{company} Interview</h1>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{branch}</span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">{feedback.summary}</p>

              {/* Hiring Chance */}
              {feedback.hiringChance && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Star size={15} className="text-yellow-500" />
                  <span className="text-sm text-gray-600">Hiring Chance:</span>
                  <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${getHiringColor(feedback.hiringChance)}`}>
                    {feedback.hiringChance}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Score Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Overall Score</span>
              <span>{feedback.overallScore}/100</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-3 ${scoreColors.bg} rounded-full transition-all duration-1000`}
                style={{ width: `${feedback.overallScore}%` }} />
            </div>
          </div>
        </div>

        {/* Strengths + Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" /> Strengths
            </h3>
            <div className="space-y-2">
              {feedback.strengths?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 bg-green-50 rounded-xl p-3">
                  <span className="text-green-500 shrink-0 text-sm">✓</span>
                  <p className="text-xs text-green-800">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Areas to Improve
            </h3>
            <div className="space-y-2">
              {feedback.improvements?.map((imp, i) => (
                <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <span className="text-blue-500 shrink-0 text-sm">→</span>
                  <p className="text-xs text-blue-800">{imp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question-wise Feedback */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Question-wise Feedback
          </h3>

          <div className="space-y-3">
            {feedback.questionFeedback?.map((qf, index) => {
              const qColors = getScoreColor(qf.score * 10);
              return (
                <div key={index} className={`border-2 rounded-xl overflow-hidden ${expanded === index ? qColors.border : "border-gray-100"
                  }`}>
                  {/* Question Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-start justify-between gap-3"
                    onClick={() => setExpanded(expanded === index ? -1 : index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">Q{index + 1}</span>
                        {qf.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${qf.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                              qf.difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" :
                                "bg-red-100 text-red-600"
                            }`}>{qf.difficulty}</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${qColors.light} ${qColors.text}`}>
                          {qf.score}/10
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">{qf.question}</p>
                    </div>
                    {expanded === index
                      ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
                      : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />
                    }
                  </div>

                  {/* Question Detail */}
                  {expanded === index && (
                    <div className={`border-t px-4 pb-4 pt-3 space-y-3 ${qColors.light}`}>

                      {/* Your Answer */}
                      {answers[index]?.answer && (
                        <div className="bg-white rounded-xl p-3 border">
                          <p className="text-xs font-bold text-gray-500 mb-1">Your Answer</p>
                          <p className="text-sm text-gray-700">{answers[index].answer}</p>
                        </div>
                      )}

                      {/* Feedback */}
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-1">AI Feedback</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{qf.feedback}</p>
                      </div>

                      {/* Ideal Points */}
                      {qf.idealPoints?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-600 mb-2">Key Points to Include</p>
                          <div className="space-y-1">
                            {qf.idealPoints.map((point, i) => (
                              <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border">
                                <span className="text-[#2fb79c] shrink-0 text-xs mt-0.5">•</span>
                                <p className="text-xs text-gray-700">{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        {feedback.nextSteps?.length > 0 && (
          <div className="bg-[#243A6F] rounded-2xl shadow p-5 sm:p-6">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-400" /> Next Steps
            </h3>
            <div className="space-y-2">
              {feedback.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                  <span className="w-5 h-5 bg-[#2fb79c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/90">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <button
            onClick={() => navigate("/mock-interview")}
            className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
          >
            <RotateCcw size={16} /> Try Again
          </button>
          <button
            onClick={() => navigate("/progress")}
            className="flex items-center justify-center gap-2 bg-[#243A6F] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1f3158] transition"
          >
            <TrendingUp size={16} /> View Progress
          </button>
        </div>

      </div>
    </div>
  );
};

export default AIInterviewFeedback;