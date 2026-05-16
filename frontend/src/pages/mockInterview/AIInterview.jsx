import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, MicOff, Send, ArrowRight, Volume2, VolumeX, User, Bot, Loader } from "lucide-react";

const AIInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const company = location.state?.company || "Google";
  const branch = location.state?.branch || "Frontend Developer";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [status, setStatus] = useState("loading");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY_2;

  useEffect(() => {
    if (!location.state) { navigate("/mock-interview"); return; }
    generateQuestions();
    setupSpeechRecognition();
    return () => {
      synthRef.current?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { console.log("Speech recognition not supported"); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const result = Array.from(e.results)
        .map(r => r[0].transcript)
        .join("");
      setTranscript(result);
      setCurrentAnswer(result);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.log("Speech error:", e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const speak = (text, onEnd) => {
    if (isMuted) { onEnd?.(); return; }
    synthRef.current?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Select a good voice
    const voices = synthRef.current?.getVoices() || [];
    const preferred = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Natural") || v.lang === "en-US"
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => onEnd?.();
    synthRef.current?.speak(utterance);
  };

  const generateQuestions = async () => {
    setStatus("loading");
    addMessage("ai", `Hello! I'm your AI interviewer for the ${branch} position at ${company}. I'll be asking you 5 questions. You can speak or type your answers. Let's begin!`);

    try {
      const prompt = `Generate exactly 5 interview questions for ${branch} role at ${company}.
Return ONLY JSON array (no markdown):
[{"question":"detailed question 1?","difficulty":"Easy"},{"question":"question 2?","difficulty":"Medium"},{"question":"question 3?","difficulty":"Medium"},{"question":"question 4?","difficulty":"Hard"},{"question":"question 5?","difficulty":"Hard"}]`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
          }),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      let qs = [];
      try { qs = JSON.parse(rawText); }
      catch {
        const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        try { qs = JSON.parse(cleaned); }
        catch {
          const match = rawText.match(/\[[\s\S]*\]/);
          if (match) qs = JSON.parse(match[0]);
        }
      }

      if (!Array.isArray(qs) || qs.length === 0) throw new Error("Questions not generated");

      setQuestions(qs);
      setStatus("speaking");

      const intro = `Hello! I'm your AI interviewer for the ${branch} position at ${company}. I'll be asking you 5 questions. You can speak or type your answers. Let's begin!`;
      speak(intro, () => {
        setTimeout(() => askQuestion(qs, 0), 500);
      });

    } catch (err) {
      setError("Failed to generate questions. Please go back and try again.");
      setStatus("done");
    }
  };

  const askQuestion = (qs, index) => {
    if (index >= qs.length) return;
    const q = qs[index];
    const questionText = `Question ${index + 1} of ${qs.length}: ${q.question}`;

    addMessage("ai", questionText, q.difficulty);
    setStatus("speaking");

    speak(questionText, () => {
      setStatus("listening");
    });
  };

  const addMessage = (role, text, difficulty = null) => {
    setMessages(prev => [...prev, { role, text, difficulty, time: new Date() }]);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported in your browser. Please type your answer.");
      return;
    }
    setTranscript("");
    setCurrentAnswer("");
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const submitAnswer = async () => {
    const answer = currentAnswer.trim();
    if (!answer) { setError("Please provide an answer before continuing."); return; }
    setError("");

    addMessage("user", answer);
    const newAnswers = [...answers, {
      question: questions[currentIndex]?.question,
      answer,
      difficulty: questions[currentIndex]?.difficulty
    }];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    setTranscript("");
    stopListening();

    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      setStatus("done");
      const doneText = "Excellent! You've completed all questions. Let me analyze your responses and provide feedback.";
      addMessage("ai", doneText);

      const avgLen = newAnswers.reduce((acc, a) => acc + (a.answer?.length || 0), 0) / newAnswers.length;
      const score = avgLen > 200 ? 85 : avgLen > 100 ? 70 : avgLen > 50 ? 55 : 34;

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        const answersArray = newAnswers.map((a, i) => ({
          questionId: `ai_voice_${Date.now()}_${i}`,
          questionText: a.question || "",
          answerText: a.answer || "",
          difficulty: a.difficulty || "Medium",
        }));

        await fetch("http://localhost:5000/api/interview/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company,
            branch,
            answers: answersArray,
            score,
            totalQuestions: questions.length,
            answeredQuestions: newAnswers.length,
            feedback: "AI Voice Interview",
            duration: 0,
            interviewType: "voice",
          }),
        });
      } catch (err) {
        console.log("Save error:", err);
      }

      speak(doneText, () => {
        setTimeout(() => {
          navigate("/ai-interview-feedback", {
            state: { company, branch, answers: newAnswers },
          });
        }, 1500);
      });

    } else {
      setCurrentIndex(nextIndex);
      setStatus("speaking");
      const transitionTexts = [
        "Great answer! Let's move to the next question.",
        "Thank you. Here's your next question.",
        "Good. Moving on.",
        "Interesting. Next question.",
        "Thank you for your response.",
      ];
      const transition = transitionTexts[nextIndex - 1] || "Next question.";
      speak(transition, () => {
        setTimeout(() => askQuestion(questions, nextIndex), 300);
      });
    }
  };

  const getDifficultyColor = (d) => {
    if (d === "Easy") return "bg-green-100 text-green-600";
    if (d === "Medium") return "bg-yellow-100 text-yellow-600";
    return "bg-red-100 text-red-600";
  };

  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <div className="bg-[#1f2a44] text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-bold text-sm sm:text-base">{company} - {branch}</h1>
          <p className="text-xs text-gray-400">AI Voice Interview</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute Toggle */}
          <button
            onClick={() => { setIsMuted(!isMuted); synthRef.current?.cancel(); }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title={isMuted ? "Unmute AI" : "Mute AI"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Question counter */}
          <div className="text-xs bg-white/10 px-3 py-1.5 rounded-lg font-semibold">
            {Math.min(currentIndex + 1, questions.length)}/{questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-1 bg-[#2fb79c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 max-w-3xl mx-auto w-full">

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-[#243A6F] rounded-full flex items-center justify-center shadow-lg">
              <Bot size={32} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-3 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-medium text-sm">AI Interviewer is preparing questions...</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

            {/* Avatar */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-[#243A6F]" : "bg-[#2fb79c]"
              }`}>
              {msg.role === "ai"
                ? <Bot size={18} className="text-white" />
                : <User size={18} className="text-white" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {msg.difficulty && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start ${getDifficultyColor(msg.difficulty)}`}>
                  {msg.difficulty}
                </span>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "ai"
                  ? "bg-white shadow text-gray-800 rounded-tl-none"
                  : "bg-[#243A6F] text-white rounded-tr-none"
                }`}>
                {msg.text}
              </div>
              <span className="text-xs text-gray-400">
                {msg.role === "ai" ? "AI Interviewer" : "You"}
              </span>
            </div>
          </div>
        ))}

        {/* Speaking indicator */}
        {status === "speaking" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#243A6F] flex items-center justify-center shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-white shadow px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#2fb79c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#2fb79c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#2fb79c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {(status === "listening" || status === "typing") && (
        <div className="bg-white border-t shadow-lg px-4 sm:px-6 py-4 shrink-0">
          <div className="max-w-3xl mx-auto">

            {error && (
              <p className="text-red-500 text-xs mb-2">{error}</p>
            )}

            {/* Live transcript */}
            {isListening && transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-3">
                <p className="text-xs text-blue-600 font-medium mb-0.5">Listening...</p>
                <p className="text-sm text-blue-800">{transcript}</p>
              </div>
            )}

            {/* Text Input */}
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={(e) => { setCurrentAnswer(e.target.value); setStatus("typing"); }}
                placeholder="Type your answer here or use the mic to speak..."
                rows={3}
                className="flex-1 border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#243A6F] resize-none"
              />

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-xl transition ${isListening
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  title={isListening ? "Stop recording" : "Start recording"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Submit Button */}
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim()}
                  className="p-3 rounded-xl bg-[#243A6F] text-white hover:bg-[#1f3158] disabled:opacity-40 transition"
                  title="Submit answer"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>

            {/* Helper text */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                {isListening ? "Recording — speak clearly" : "Click mic to speak or type your answer"}
              </p>
              <p className="text-xs text-gray-400">{currentAnswer.length} chars</p>
            </div>
          </div>
        </div>
      )}

      {/* Done state */}
      {status === "done" && (
        <div className="bg-white border-t px-4 py-4 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm font-medium">Analyzing your responses...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIInterview;