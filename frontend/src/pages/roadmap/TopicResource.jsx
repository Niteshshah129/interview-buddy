import { useState, useEffect } from "react";
import {
  BookOpen, PlayCircle, FileQuestion, Lightbulb,
  AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  ExternalLink, Brain, RefreshCw, Eye, EyeOff
} from "lucide-react";

const TopicResource = ({ topic, company, jobRole, onClose }) => {
  const [activeTab, setActiveTab] = useState("theory");
  const [theory, setTheory] = useState(null);
  const [practice, setPractice] = useState(null);
  const [loadingTheory, setLoadingTheory] = useState(false);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [theoryDone, setTheoryDone] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY_3;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const cacheKey = `topic_${topic}_${company}_${jobRole}`.replace(/\s+/g, "_");
  const progressKey = `topic_progress_${topic}_${company}_${jobRole}`.replace(/\s+/g, "_");

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { theory: t, practice: p } = JSON.parse(cached);
      if (t) setTheory(t);
      if (p) setPractice(p);
    }

    const progress = localStorage.getItem(progressKey);
    if (progress) {
      const { theoryDone: td, practiceDone: pd } = JSON.parse(progress);
      setTheoryDone(td || false);
      setPracticeDone(pd || false);
    }

    fetchTheory(false);
  }, [topic]);

  const saveProgress = (td, pd) => {
    localStorage.setItem(progressKey, JSON.stringify({
      theoryDone: td,
      practiceDone: pd,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const saveToCache = (newTheory, newPractice) => {
    const existing = localStorage.getItem(cacheKey);
    const current = existing ? JSON.parse(existing) : {};
    localStorage.setItem(cacheKey, JSON.stringify({
      ...current,
      theory: newTheory || current.theory,
      practice: newPractice || current.practice,
    }));
  };

  const callGemini = async (prompt) => {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const parseJSON = (text) => {
    try { return JSON.parse(text); } catch { }
    try {
      const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      return JSON.parse(cleaned);
    } catch { }
    const match = text.match(/[\[{][\s\S]*[\]}]/);
    if (match) { try { return JSON.parse(match[0]); } catch { } }
    return null;
  };

  const fetchTheory = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { theory: t } = JSON.parse(cached);
        if (t) { setTheory(t); return; }
      }
    }
    setLoadingTheory(true);
    setTheory(null);
    try {
      const prompt = `You are an expert educator for ${company} ${jobRole} interview preparation.
Create comprehensive study notes for: "${topic}"
Return ONLY valid JSON (no markdown):
{"title":"${topic}","difficulty":"Beginner/Intermediate/Advanced","introduction":"2-3 sentence clear introduction","keyPoints":["Key concept 1","Key concept 2","Key concept 3","Key concept 4","Key concept 5"],"explanation":"4-5 sentence detailed technical explanation","example":"Practical code example or real-world example","interviewTips":["${company} specific tip 1","tip 2","tip 3"],"commonMistakes":["mistake 1","mistake 2"],"quickRevision":["fact 1","fact 2","fact 3"]}`;

      const rawText = await callGemini(prompt);
      const data = parseJSON(rawText);
      if (data?.title) {
        setTheory(data);
        saveToCache(data, null);
      } else {
        setTheory({ error: "Could not generate theory. Please retry." });
      }
    } catch (err) {
      setTheory({ error: err.message });
    }
    setLoadingTheory(false);
  };

  const fetchPractice = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { practice: p } = JSON.parse(cached);
        if (p) { setPractice(p); return; }
      }
    }
    setLoadingPractice(true);
    setPractice(null);
    setUserAnswers({});
    setShowAnswers({});
    try {
      const prompt = `You are a senior technical interviewer at ${company} for ${jobRole} role.
Generate 3 practice interview questions about "${topic}" with detailed answers.
Return ONLY valid JSON array (no markdown):
[{"question":"Detailed question?","difficulty":"Easy/Medium/Hard","type":"Conceptual/Coding/System Design","answer":"Comprehensive answer in 3-4 sentences","keyPoints":["point 1","point 2","point 3"],"followUpQuestions":["follow up 1?","follow up 2?"]}]`;

      const rawText = await callGemini(prompt);
      const data = parseJSON(rawText);
      if (Array.isArray(data) && data.length > 0) {
        setPractice(data);
        saveToCache(null, data);
      } else {
        setPractice([]);
      }
    } catch (err) {
      setPractice([]);
    }
    setLoadingPractice(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "practice" && !practice) fetchPractice(false);
  };

  const handleMarkTheoryDone = () => {
    const newVal = !theoryDone;
    setTheoryDone(newVal);
    saveProgress(newVal, practiceDone);
  };

  const handleMarkPracticeDone = () => {
    const newVal = !practiceDone;
    setPracticeDone(newVal);
    saveProgress(theoryDone, newVal);
  };

  const getYouTubeUrl = (query) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  const getDifficultyColor = (d) => {
    if (!d) return "bg-gray-100 text-gray-600";
    if (d === "Easy" || d === "Beginner") return "bg-green-100 text-green-600";
    if (d === "Medium" || d === "Intermediate") return "bg-yellow-100 text-yellow-600";
    return "bg-red-100 text-red-600";
  };

  const isTopicFullyDone = theoryDone && practiceDone;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isTopicFullyDone ? "bg-green-100" : "bg-[#d1f0ea]"}`}>
              {isTopicFullyDone
                ? <CheckCircle size={20} className="text-green-600" />
                : <BookOpen size={20} className="text-[#2fb79c]" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base">{topic}</h2>
                {isTopicFullyDone && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{company} • {jobRole}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition text-lg">
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-50 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-[#2fb79c] rounded-full transition-all duration-500"
                style={{ width: `${(theoryDone && practiceDone ? 100 : theoryDone || practiceDone ? 50 : 0)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium shrink-0">
              {theoryDone && practiceDone ? "All done!" : theoryDone || practiceDone ? "50%" : "0%"}
            </span>
          </div>
          <div className="flex gap-4 mt-1.5">
            <span className={`text-xs flex items-center gap-1 ${theoryDone ? "text-green-600" : "text-gray-400"}`}>
              {theoryDone ? <CheckCircle size={11} /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
              Theory
            </span>
            <span className={`text-xs flex items-center gap-1 ${practiceDone ? "text-green-600" : "text-gray-400"}`}>
              {practiceDone ? <CheckCircle size={11} /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
              Practice
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 sm:p-3 bg-gray-50 border-b shrink-0">
          {[
            { id: "theory", label: "Theory", icon: <BookOpen size={13} />, done: theoryDone },
            { id: "videos", label: "Videos", icon: <PlayCircle size={13} />, done: false },
            { id: "practice", label: "Practice", icon: <FileQuestion size={13} />, done: practiceDone },
          ].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex-1 justify-center relative ${activeTab === tab.id ? "bg-[#243A6F] text-white" : "text-gray-600 hover:bg-gray-200"
                }`}>
              {tab.icon} {tab.label}
              {tab.done && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={10} className="text-white" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {/*THEORY TAB*/}
          {activeTab === "theory" && (
            <div>
              {loadingTheory ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm font-medium">Generating study notes...</p>
                </div>
              ) : theory?.error ? (
                <div className="text-center py-8">
                  <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
                  <p className="text-red-500 text-sm mb-3">{theory.error}</p>
                  <button onClick={() => fetchTheory(true)}
                    className="bg-[#243A6F] text-white px-6 py-2 rounded-xl text-sm font-semibold">Retry</button>
                </div>
              ) : !theory ? (
                <div className="text-center py-8">
                  <button onClick={() => fetchTheory(false)}
                    className="bg-[#243A6F] text-white px-6 py-3 rounded-xl font-semibold">Load Theory</button>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Title + Difficulty + Regenerate */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base sm:text-lg">{theory.title}</h3>
                      {theory.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(theory.difficulty)}`}>
                          {theory.difficulty}
                        </span>
                      )}
                    </div>
                    <button onClick={() => fetchTheory(true)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#243A6F] border rounded-lg px-2 py-1 hover:border-[#243A6F] transition">
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>

                  {/* Introduction */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide">📌 Introduction</p>
                    <p className="text-sm text-blue-800 leading-relaxed">{theory.introduction}</p>
                  </div>

                  {/* Quick Revision */}
                  {theory.quickRevision?.length > 0 && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">⚡ Quick Facts</p>
                      <div className="space-y-1">
                        {theory.quickRevision.map((fact, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-purple-400 shrink-0 font-bold text-xs mt-0.5">→</span>
                            <p className="text-xs text-purple-800">{fact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Points */}
                  {theory.keyPoints?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle size={13} className="text-green-500" /> Key Concepts
                      </p>
                      <div className="space-y-2">
                        {theory.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white border border-green-100 rounded-xl p-3 shadow-sm">
                            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-gray-700">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {theory.explanation && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <Brain size={13} className="text-purple-500" /> Detailed Explanation
                      </p>
                      <div className="bg-gray-50 border rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{theory.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Example */}
                  {theory.example && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <Lightbulb size={13} className="text-yellow-500" /> Example
                      </p>
                      <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                          {theory.example}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Interview Tips */}
                  {theory.interviewTips?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <Lightbulb size={13} /> {company} Interview Tips
                      </p>
                      <div className="space-y-2">
                        {theory.interviewTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl p-3">
                            <span className="text-orange-500 shrink-0 text-sm">💡</span>
                            <p className="text-sm text-orange-800">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {theory.commonMistakes?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <AlertCircle size={13} /> Common Mistakes
                      </p>
                      <div className="space-y-2">
                        {theory.commonMistakes.map((mistake, i) => (
                          <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                            <span className="text-red-500 shrink-0 text-sm">❌</span>
                            <p className="text-sm text-red-800">{mistake}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mark Theory Done Button */}
                  <button
                    onClick={handleMarkTheoryDone}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${theoryDone
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-[#243A6F] text-white hover:bg-[#1f3158]"
                      }`}
                  >
                    {theoryDone
                      ? <><CheckCircle size={16} /> Theory Completed — Click to Undo</>
                      : <><BookOpen size={16} /> Mark Theory as Read</>
                    }
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Saved locally — loads instantly next time
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIDEOS TAB */}
          {activeTab === "videos" && (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">YouTube search links for <strong>{topic}</strong></p>
              {[
                { title: `${topic} - Complete Tutorial`, desc: "Full concept from basics", query: `${topic} complete tutorial`, color: "bg-red-50 border-red-200", icon: "text-red-500" },
                { title: `${topic} - Interview Questions`, desc: `Questions asked at ${company}`, query: `${topic} interview questions ${company}`, color: "bg-blue-50 border-blue-200", icon: "text-blue-500" },
                { title: `${topic} for ${jobRole}`, desc: "Role-specific concepts", query: `${topic} ${jobRole} tutorial`, color: "bg-purple-50 border-purple-200", icon: "text-purple-500" },
                { title: `${topic} - Advanced`, desc: "Deep dive concepts", query: `${topic} advanced interview`, color: "bg-green-50 border-green-200", icon: "text-green-500" },
                { title: `${company} ${jobRole} Experience`, desc: "Real interview stories", query: `${company} ${jobRole} interview experience`, color: "bg-yellow-50 border-yellow-200", icon: "text-yellow-600" },
              ].map((v, i) => (
                <a key={i} href={getYouTubeUrl(v.query)} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-3 p-4 rounded-xl border ${v.color} hover:shadow-md transition group`}>
                  <PlayCircle size={26} className={`${v.icon} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800">{v.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 shrink-0" />
                </a>
              ))}
              <a href={getYouTubeUrl(`${topic} ${jobRole} interview`)} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-red-300 rounded-xl text-red-500 hover:bg-red-50 transition text-sm font-semibold">
                <PlayCircle size={16} /> More on YouTube
              </a>
            </div>
          )}

          {/* PRACTICE TAB */}
          {activeTab === "practice" && (
            <div>
              {loadingPractice ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-[#2fb79c] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm font-medium">Generating practice questions...</p>
                </div>
              ) : !practice ? (
                <div className="text-center py-8">
                  <button onClick={() => fetchPractice(false)}
                    className="bg-[#243A6F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1f3158] transition">
                    Load Practice Questions
                  </button>
                </div>
              ) : practice.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-sm mb-3">Failed to load.</p>
                  <button onClick={() => fetchPractice(true)}
                    className="bg-[#243A6F] text-white px-6 py-2 rounded-xl text-sm font-semibold">Retry</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-medium">{practice.length} questions on <strong>{topic}</strong></p>
                    <button onClick={() => fetchPractice(true)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#243A6F] border rounded-lg px-2 py-1 hover:border-[#243A6F] transition">
                      <RefreshCw size={12} /> New Questions
                    </button>
                  </div>

                  {practice.map((q, index) => (
                    <div key={index} className="border rounded-xl overflow-hidden shadow-sm">
                      <div className="p-4 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-500">Q{index + 1}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                {q.type}
                              </span>
                            </div>
                            <p className="font-semibold text-sm text-gray-800 leading-relaxed">{q.question}</p>
                          </div>
                          {expandedQuestion === index
                            ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
                            : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />
                          }
                        </div>
                      </div>

                      {expandedQuestion === index && (
                        <div className="border-t bg-gray-50 p-4 space-y-4">
                          <div>
                            <p className="text-xs font-bold text-gray-600 mb-2">✍️ Your Answer</p>
                            <textarea
                              value={userAnswers[index] || ""}
                              onChange={(e) => setUserAnswers({ ...userAnswers, [index]: e.target.value })}
                              placeholder="Write your answer before checking..."
                              className="w-full h-24 border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#243A6F] resize-none bg-white"
                            />
                          </div>

                          <button
                            onClick={() => setShowAnswers({ ...showAnswers, [index]: !showAnswers[index] })}
                            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${showAnswers[index]
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-[#243A6F] text-white hover:bg-[#1f3158]"
                              }`}
                          >
                            {showAnswers[index]
                              ? <><EyeOff size={15} /> Hide Answer</>
                              : <><Eye size={15} /> Show Ideal Answer</>
                            }
                          </button>

                          {showAnswers[index] && (
                            <div className="space-y-3">
                              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-green-700 mb-2">Ideal Answer</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
                              </div>
                              {q.keyPoints?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-blue-600 mb-2"> Key Points</p>
                                  <div className="space-y-1">
                                    {q.keyPoints.map((kp, i) => (
                                      <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2">
                                        <span className="text-blue-400 shrink-0">•</span>
                                        <p className="text-xs text-blue-800">{kp}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {q.followUpQuestions?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-orange-600 mb-2">Follow-ups</p>
                                  <div className="space-y-1">
                                    {q.followUpQuestions.map((fq, i) => (
                                      <p key={i} className="text-xs text-gray-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">• {fq}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Mark Practice Done Button */}
                  <button
                    onClick={handleMarkPracticeDone}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${practiceDone
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-[#2fb79c] text-white hover:bg-[#27a085]"
                      }`}
                  >
                    {practiceDone
                      ? <><CheckCircle size={16} /> Practice Completed — Click to Undo</>
                      : <><FileQuestion size={16} /> Mark Practice as Done</>
                    }
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Saved locally — click "New Questions" for fresh ones
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Quiz */}
        <div className="border-t p-3 sm:p-4 shrink-0">
          <a
            href={`/quiz?topic=${encodeURIComponent(topic)}&company=${encodeURIComponent(company)}&jobRole=${encodeURIComponent(jobRole)}`}
            className="w-full bg-[#2fb79c] text-white py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#27a085] transition text-sm"
          >
            <Brain size={16} />
            Take Quick Quiz on {topic}
          </a>
        </div>

      </div>
    </div>
  );
};

export default TopicResource;