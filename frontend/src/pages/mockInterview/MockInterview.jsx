import { useState } from "react";
import { Sparkles, Building2, GraduationCap, ArrowRight, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MockInterview = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [branch, setBranch] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const companies = ["Google", "Amazon", "Microsoft", "TCS", "Infosys", "Other"];
  const branches = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Java Developer", "Python Developer", "Data Scientist",
    "DevOps Engineer", "Android Developer", "iOS Developer", "Other"
  ];

  const getCompany = () => company === "Other" ? customCompany : company;
  const getBranch = () => branch === "Other" ? customBranch : branch;

  const validate = () => {
    if (!company) { setError("Please select a company"); return false; }
    if (company === "Other" && !customCompany.trim()) { setError("Please enter company name"); return false; }
    if (!branch) { setError("Please select a job role"); return false; }
    if (branch === "Other" && !customBranch.trim()) { setError("Please enter job role"); return false; }
    return true;
  };

  const handleStartInterview = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const finalCompany = getCompany();
      const finalBranch = getBranch();

      const prompt = `Generate 5 interview questions for ${finalBranch} role at ${finalCompany}. Return ONLY JSON array:
[{"question":"q1","difficulty":"Easy"},{"question":"q2","difficulty":"Medium"},{"question":"q3","difficulty":"Medium"},{"question":"q4","difficulty":"Hard"},{"question":"q5","difficulty":"Hard"}]`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
          }),
        }
      );

      const geminiData = await geminiRes.json();
      if (geminiData.error) throw new Error(geminiData.error.message);

      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
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

      if (!Array.isArray(questions) || questions.length === 0) throw new Error("Questions not generated");

      const formattedQuestions = questions.map((q, index) => ({
        _id: `ai_${Date.now()}_${index}`,
        question: q.question,
        difficulty: q.difficulty || "Medium",
        company: finalCompany,
        branch: finalBranch,
      }));

      navigate("/interview-session", {
        state: { company: finalCompany, branch: finalBranch, questions: formattedQuestions },
      });

    } catch (err) {
      console.error("Error:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // AI Voice Interview
  const handleAIInterview = () => {
    if (!validate()) return;
    navigate("/ai-interview", {
      state: { company: getCompany(), branch: getBranch() },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">

      <div className="text-center mb-6 sm:mb-10">
        <div className="bg-gray-200 w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl flex items-center justify-center mb-4">
          <Sparkles size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">Start Mock Interview</h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-lg mx-auto">
          AI will generate fresh questions specific to your selected company and role
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 sm:p-8 max-w-3xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-1">Choose Your Interview Setup</h2>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Gemini AI will create personalized questions for you
        </p>

        {/* Company Select */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={18} />
            <label className="font-medium text-sm sm:text-base">Select Company</label>
          </div>
          <select
            className="w-full border rounded-lg p-3 outline-none text-sm sm:text-base"
            value={company}
            onChange={(e) => { setCompany(e.target.value); setCustomCompany(""); }}
          >
            <option value="">Choose a company...</option>
            {companies.map((comp) => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
          {company === "Other" && (
            <input
              type="text"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              placeholder="Enter company name..."
              className="w-full border rounded-lg p-3 outline-none mt-2 text-sm sm:text-base focus:ring-2 focus:ring-[#8bb7b3]"
            />
          )}
        </div>

        {/* Branch Select */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={18} />
            <label className="font-medium text-sm sm:text-base">Select Job Role</label>
          </div>
          <select
            className="w-full border rounded-lg p-3 outline-none text-sm sm:text-base"
            value={branch}
            onChange={(e) => { setBranch(e.target.value); setCustomBranch(""); }}
          >
            <option value="">Choose your role...</option>
            {branches.map((br) => (
              <option key={br} value={br}>{br}</option>
            ))}
          </select>
          {branch === "Other" && (
            <input
              type="text"
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              placeholder="Enter job role..."
              className="w-full border rounded-lg p-3 outline-none mt-2 text-sm sm:text-base focus:ring-2 focus:ring-[#8bb7b3]"
            />
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {/* Normal Interview */}
          <button
            onClick={handleStartInterview}
            disabled={loading || aiLoading}
            className="w-full bg-[#8bb7b3] hover:bg-[#6fa39e] disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Start Text Interview
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* AI Voice Interview */}
          <button
            onClick={handleAIInterview}
            disabled={loading || aiLoading}
            className="w-full bg-[#243A6F] hover:bg-[#1f3158] disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
          >
            <Mic size={18} />
            Start AI Voice Interview
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">New</span>
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-[#243A6F]/5 rounded-xl p-3 text-center border border-[#243A6F]/10">
            <p className="text-xs font-semibold text-gray-600">Text Interview</p>
            <p className="text-xs text-gray-400 mt-0.5">Type your answers</p>
          </div>
          <div className="bg-[#243A6F]/5 rounded-xl p-3 text-center border border-[#243A6F]/10">
            <p className="text-xs font-semibold text-[#243A6F]">AI Voice Interview</p>
            <p className="text-xs text-gray-400 mt-0.5">Speak or type answers</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 sm:p-6 max-w-3xl mx-auto mt-6 sm:mt-8">
        <h3 className="font-semibold mb-3 text-sm sm:text-base">💡 Interview Tips</h3>
        <ul className="text-gray-600 space-y-2 text-sm">
          <li>• Take your time to think before answering each question</li>
          <li>• Structure your answers using the STAR method</li>
          <li>• Practice explaining your thought process clearly</li>
          <li>• Review your feedback after each session to improve</li>
        </ul>
      </div>

    </div>
  );
};

export default MockInterview;