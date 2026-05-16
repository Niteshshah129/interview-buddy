import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Brain, Trophy, RotateCcw } from "lucide-react";
import API from "../../api/api.js";

const QuickQuiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const topic = searchParams.get("topic") || "";
  const company = searchParams.get("company") || "";
  const jobRole = searchParams.get("jobRole") || "";

  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const progressKey = `quiz_history_${topic}_${company}_${jobRole}`.replace(/\s+/g, "_");

  useEffect(() => {
    fetchQuiz();
  }, []);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY_3;

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const prompt = `You are a technical interviewer at ${company} for ${jobRole} role.
Create exactly 5 MCQ questions about "${topic}" for interview preparation.
Return ONLY valid JSON array (no markdown):
[{"question":"Question?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"explanation":"Why this is correct"}]`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 4000 },
          }),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      let questions = [];
      try { questions = JSON.parse(rawText); }
      catch {
        try {
          const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
          questions = JSON.parse(cleaned);
        } catch {
          const match = rawText.match(/\[[\s\S]*\]/);
          if (match) questions = JSON.parse(match[0]);
        }
      }
      setQuiz(questions);
    } catch (err) {
      console.log("Quiz error:", err);
    }
    setLoading(false);
  };




  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === quiz[currentQ].correctAnswer;
    setAnswers([...answers, { questionIndex: currentQ, selectedAnswer: index, isCorrect }]);
  };

  const handleNext = () => {
    if (currentQ < quiz.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      saveQuizResult(score, percentage);
      setQuizCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
    fetchQuiz();
  };

  const saveQuizResult = (score, percentage) => {
    const existing = localStorage.getItem("quiz_history") || "[]";
    const history = JSON.parse(existing);
    history.unshift({
      topic, company, jobRole, score, percentage,
      total: quiz.length,
      date: new Date().toISOString(),
    });
    if (history.length > 50) history.splice(50);
    localStorage.setItem("quiz_history", JSON.stringify(history));
  };



  const score = answers.filter((a) => a.isCorrect).length;
  const percentage = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;

  const getScoreColor = () => {
    if (percentage >= 80) return { bg: "bg-green-500", text: "text-green-600", label: "Excellent!" };
    if (percentage >= 60) return { bg: "bg-blue-500", text: "text-blue-600", label: "Good Job!" };
    if (percentage >= 40) return { bg: "bg-yellow-500", text: "text-yellow-600", label: "Keep Practicing" };
    return { bg: "bg-red-500", text: "text-red-600", label: "Needs Improvement" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <div className="w-12 h-12 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Generating quiz questions...</p>
          <p className="text-gray-400 text-sm">AI is preparing 5 questions on {topic}</p>
        </div>
      </div>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-4">
          <p className="text-gray-500 mb-4">Failed to load quiz. Please try again.</p>
          <button onClick={() => navigate(-1)} className="bg-[#243A6F] text-white px-6 py-2 rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz Completed Screen
  if (quizCompleted) {
    const scoreInfo = getScoreColor();
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 text-center">

          <Trophy size={48} className="text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-1">Quiz Complete!</h1>
          <p className="text-gray-500 text-sm mb-6">{topic} • {company}</p>

          {/* Score */}
          <div className={`w-28 h-28 ${scoreInfo.bg} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <span className="text-4xl font-bold text-white">{percentage}%</span>
          </div>
          <p className={`font-bold text-lg ${scoreInfo.text} mb-6`}>{scoreInfo.label}</p>

          <p className="text-gray-600 text-sm mb-6">
            You got <strong>{score}</strong> out of <strong>{quiz.length}</strong> questions correct
          </p>

          {/* Question Review */}
          <div className="space-y-2 text-left mb-6">
            {quiz.map((q, i) => {
              const answer = answers[i];
              return (
                <div key={i} className={`flex items-start gap-2 p-3 rounded-xl ${answer?.isCorrect ? "bg-green-50" : "bg-red-50"
                  }`}>
                  {answer?.isCorrect ? (
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs text-gray-700">{q.question}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-[#243A6F] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1f3158] transition"
            >
              Back to Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz[currentQ];
  const progress = ((currentQ + 1) / quiz.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 mt-12 lg:mt-0">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Brain size={20} className="text-[#2fb79c]" />
              Quick Quiz: {topic}
            </h1>
            <p className="text-xs text-gray-500">{company} • {jobRole}</p>
          </div>
          <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-xl shadow">
            {currentQ + 1}/{quiz.length}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-2 bg-[#2fb79c] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6 mb-4">
          <p className="text-xs text-gray-400 mb-3">Question {currentQ + 1} of {quiz.length}</p>
          <h2 className="font-bold text-sm sm:text-base text-gray-800 leading-relaxed mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let optionStyle = "border-gray-200 hover:border-[#243A6F] hover:bg-gray-50";

              if (showResult) {
                if (index === currentQuestion.correctAnswer) {
                  optionStyle = "border-green-400 bg-green-50";
                } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                  optionStyle = "border-red-400 bg-red-50";
                } else {
                  optionStyle = "border-gray-100 opacity-60";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${showResult && index === currentQuestion.correctAnswer
                        ? "bg-green-500 text-white"
                        : showResult && index === selectedAnswer
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {["A", "B", "C", "D"][index]}
                    </span>
                    <span className="text-sm text-gray-700">{option}</span>
                    {showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle size={16} className="text-green-500 ml-auto shrink-0" />
                    )}
                    {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                      <XCircle size={16} className="text-red-500 ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQuestion.explanation && (
            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">💡 Explanation</p>
              <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full bg-[#243A6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1f3158] transition"
          >
            {currentQ < quiz.length - 1 ? "Next Question →" : "See Results 🏆"}
          </button>
        )}

      </div>
    </div>
  );
};

export default QuickQuiz;