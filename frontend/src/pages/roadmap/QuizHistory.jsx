import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, Trophy, CheckCircle, XCircle,
  Calendar, Building2, Search, Trash2, ArrowLeft
} from "lucide-react";

const QuizHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScore, setFilterScore] = useState("All");

  useEffect(() => {
    const saved = localStorage.getItem("quiz_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleDelete = (index) => {
    if (!window.confirm("Delete this quiz result?")) return;
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("quiz_history", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (!window.confirm("Delete all quiz history?")) return;
    setHistory([]);
    localStorage.removeItem("quiz_history");
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return { bg: "bg-green-500", badge: "bg-green-100 text-green-700", label: "Excellent" };
    if (percentage >= 60) return { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700", label: "Good" };
    if (percentage >= 40) return { bg: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700", label: "Average" };
    return { bg: "bg-red-500", badge: "bg-red-100 text-red-700", label: "Needs Work" };
  };

  const filteredHistory = history.filter((h) => {
    const matchSearch =
      h.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchScore =
      filterScore === "All" ||
      (filterScore === "Excellent" && h.percentage >= 80) ||
      (filterScore === "Good" && h.percentage >= 60 && h.percentage < 80) ||
      (filterScore === "Needs Work" && h.percentage < 60);
    return matchSearch && matchScore;
  });

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / history.length)
    : 0;

  const bestScore = history.length > 0
    ? Math.max(...history.map(h => h.percentage))
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/roadmap")}
              className="text-gray-500 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Brain size={22} className="text-[#2fb79c]" /> Quiz History
              </h1>
              <p className="text-gray-500 text-sm">All your topic quiz attempts</p>
            </div>
          </div>
          {history.length > 0 && (
            <button onClick={handleClearAll}
              className="flex items-center gap-2 text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl text-sm transition">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {/* Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              { label: "Total Quizzes", value: history.length, color: "bg-blue-50 text-blue-600" },
              { label: "Average Score", value: `${avgScore}%`, color: "bg-purple-50 text-purple-600" },
              { label: "Best Score", value: `${bestScore}%`, color: "bg-green-50 text-green-600" },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-2xl p-3 sm:p-4 text-center`}>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filter */}
        {history.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by topic or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#243A6F] text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Excellent", "Good", "Needs Work"].map((f) => (
                <button key={f} onClick={() => setFilterScore(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filterScore === f
                    ? "bg-[#243A6F] text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                    }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History List */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Brain size={48} className="text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-500 mb-1">No Quiz History Yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Take quizzes from your roadmap topics to see history here
              </p>
              <button onClick={() => navigate("/roadmap")}
                className="bg-[#243A6F] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#1f3158] transition">
                Go to Roadmap
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No results found for your search</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => {
                const colors = getScoreColor(item.percentage);
                return (
                  <div key={index}
                    className="border rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">

                        {/* Topic + Badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-800 text-sm">{item.topic}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                            {colors.label}
                          </span>
                        </div>

                        {/* Company + Role */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 size={11} /> {item.company}
                          </span>
                          <span>•</span>
                          <span>{item.jobRole}</span>
                        </div>

                        {/* Score bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-2 ${colors.bg} rounded-full transition-all`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600 shrink-0">
                            {item.score}/{item.total} ({item.percentage}%)
                          </span>
                        </div>

                        {/* Date */}
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>

                      {/* Score Circle + Delete */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center shadow`}>
                          <span className="text-white font-bold text-sm">{item.percentage}%</span>
                        </div>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Retake button */}
                    <button
                      onClick={() => navigate(`/quiz?topic=${encodeURIComponent(item.topic)}&company=${encodeURIComponent(item.company)}&jobRole=${encodeURIComponent(item.jobRole)}`)}
                      className="mt-3 w-full border border-[#243A6F] text-[#243A6F] py-2 rounded-xl text-xs font-semibold hover:bg-[#243A6F] hover:text-white transition flex items-center justify-center gap-2"
                    >
                      <Brain size={13} /> Retake Quiz
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QuizHistory;