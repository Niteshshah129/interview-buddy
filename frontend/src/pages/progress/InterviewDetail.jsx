import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, Trophy, Target,
  ChevronDown, ChevronUp, Calendar, Building2,
  Mic, FileText, RefreshCw
} from "lucide-react";
import API from "../../api/api.js";

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY_2;
  const feedbackCacheKey = `interview_feedback_${id}`;

  useEffect(() => {
    fetchInterview();

    const cached = localStorage.getItem(`interview_feedback_${id}`);
    if (cached) {
      try {
        setAiFeedback(JSON.parse(cached));
      } catch {
        localStorage.removeItem(`interview_feedback_${id}`);
      }
    }
  }, [id]);

  const fetchInterview = async () => {
    try {
      const res = await API.get(`/interview/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterview(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
      navigate("/progress");
    }
    setLoading(false);
  };

  const generateAIFeedback = async () => {
    if (!interview) return;
    setLoadingFeedback(true);

    try {
      const answersText = interview.answers?.map((a, i) =>
        `Q${i + 1}: ${a.questionText}\nAnswer: ${a.answerText}`
      ).join("\n\n");

      const prompt = `You are a senior interviewer at ${interview.company} for ${interview.branch} role.
Evaluate these interview answers briefly:
${answersText}

Return ONLY valid JSON (no markdown):
{"overallScore":${interview.score},"summary":"2 sentence feedback","strengths":["s1","s2"],"improvements":["i1","i2"],"questionFeedback":[{"question":"q","score":7,"feedback":"1 sentence feedback"}]}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 3000 },
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

      setAiFeedback(result);

    } catch (err) {
      console.log("Feedback error:", err);
    }
    setLoadingFeedback(false);
  };

  const handleRegenerate = () => {
    localStorage.removeItem(feedbackCacheKey);
    setAiFeedback(null);
    setTimeout(() => generateAIFeedback(), 100);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-blue-500 text-white";
    if (score >= 40) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getDifficultyColor = (d) => {
    if (d === "Easy") return "bg-green-100 text-green-600";
    if (d === "Medium") return "bg-yellow-100 text-yellow-600";
    return "bg-red-100 text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Back */}
        <button onClick={() => navigate("/progress")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft size={16} /> Back to Progress
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Building2 size={18} className="text-[#243A6F]" />
                <h1 className="text-xl font-bold">{interview.company}</h1>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 text-sm">{interview.branch}</span>
                {interview.interviewType === "voice" ? (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Mic size={10} /> Voice
                  </span>
                ) : (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <FileText size={10} /> Text
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(interview.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={12} />
                  {interview.answeredQuestions}/{interview.totalQuestions} answered
                </span>
              </div>
            </div>

            {/* Score */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${getScoreColor(interview.score)}`}>
              {interview.score}%
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#243A6F]" />
            Questions & Your Answers
          </h2>

          {interview.answers?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No answers recorded</p>
          ) : (
            <div className="space-y-3">
              {interview.answers?.map((ans, i) => (
                <div key={i} className="border rounded-xl overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-start justify-between gap-3"
                    onClick={() => setExpandedAnswer(expandedAnswer === i ? null : i)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">Q{i + 1}</span>
                        {ans.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(ans.difficulty)}`}>
                            {ans.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-gray-800 leading-relaxed">
                        {ans.questionText}
                      </p>
                    </div>
                    {expandedAnswer === i
                      ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
                      : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />
                    }
                  </div>

                  {expandedAnswer === i && (
                    <div className="border-t bg-gray-50 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-2">Your Answer:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {ans.answerText || "No answer provided"}
                        </p>
                      </div>

                      {aiFeedback?.questionFeedback?.[i] && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-xs font-bold text-blue-600 mb-1">💡 AI Feedback</p>
                          <p className="text-xs text-blue-800 leading-relaxed">
                            {aiFeedback.questionFeedback[i].feedback}
                          </p>
                          {aiFeedback.questionFeedback[i].score && (
                            <span className="text-xs font-bold text-blue-600 mt-1 block">
                              Score: {aiFeedback.questionFeedback[i].score}/10
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Feedback Section */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              AI Feedback
              {aiFeedback && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  ✓ Saved
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {aiFeedback && (
                <button
                  onClick={handleRegenerate}
                  disabled={loadingFeedback}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#243A6F] border rounded-lg px-2 py-1.5 hover:border-[#243A6F] transition disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              )}
              {!aiFeedback && (
                <button
                  onClick={generateAIFeedback}
                  disabled={loadingFeedback}
                  className="bg-[#243A6F] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1f3158] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingFeedback
                    ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                    : "Generate Feedback"
                  }
                </button>
              )}
            </div>
          </div>

          {loadingFeedback ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">AI is analyzing your answers...</p>
            </div>
          ) : !aiFeedback ? (
            <div className="text-center py-6">
              <Trophy size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No feedback yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Click "Generate Feedback" to get AI analysis
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-600 mb-1">Overall Feedback</p>
                <p className="text-sm text-blue-800 leading-relaxed">{aiFeedback.summary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                {aiFeedback.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-green-600 mb-2">Strengths</p>
                    <div className="space-y-2">
                      {aiFeedback.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg p-2.5">
                          <span className="text-green-500 shrink-0 text-xs mt-0.5">✓</span>
                          <p className="text-xs text-green-800">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {aiFeedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-orange-600 mb-2">Improvements</p>
                    <div className="space-y-2">
                      {aiFeedback.improvements.map((imp, i) => (
                        <div key={i} className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-2.5">
                          <span className="text-orange-500 shrink-0 text-xs mt-0.5">→</span>
                          <p className="text-xs text-orange-800">{imp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Saved indicator */}
              <p className="text-xs text-gray-400 text-center">
                Feedback saved locally — available next time you open this interview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;