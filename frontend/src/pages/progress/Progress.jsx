import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Trophy, Target, TrendingUp, MessageSquare, Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import API from "../../api/api.js";

const Progress = () => {
  const [stats, setStats] = useState({ totalSessions: 0, avgScore: 0, bestScore: 0, recentSessions: [] });
  const [allInterviews, setAllInterviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, interviewsRes] = await Promise.all([
        API.get("/progress/stats", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/interview/my", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setAllInterviews(interviewsRes.data);
    } catch (err) { console.log("Progress load error:", err); }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchData();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && token) fetchData();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this interview? This will update your progress stats.")) return;
    setDeletingId(id);
    try {
      await API.delete(`/interview/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.log("Delete error:", err);
      alert("Failed to delete. Please try again.");
    }
    setDeletingId(null);
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-green-100 text-green-600";
    if (score >= 60) return "bg-blue-100 text-blue-600";
    if (score >= 40) return "bg-yellow-100 text-yellow-600";
    return "bg-red-100 text-red-500";
  };

  const excellent = allInterviews.filter((i) => i.score >= 80).length;
  const good = allInterviews.filter((i) => i.score >= 60 && i.score < 80).length;
  const needsWork = allInterviews.filter((i) => i.score < 60).length;
  const maxBar = Math.max(excellent, good, needsWork, 1);
  const recentTrend = allInterviews.length > 0 ? allInterviews[0].score : stats.avgScore;
  const displayedInterviews = showAll ? allInterviews : allInterviews.slice(0, 10);

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-12 lg:mt-0">

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Progress Report</h1>
        <p className="text-gray-500 text-sm sm:text-base">Track your interview performance and identify areas for improvement</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Top Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
            {[
              { icon: <MessageSquare className="text-green-600" />, bg: "bg-green-100", label: "Total Sessions", value: stats.totalSessions },
              { icon: <Target className="text-blue-600" />, bg: "bg-blue-100", label: "Average Score", value: `${stats.avgScore}%` },
              { icon: <Trophy className="text-yellow-600" />, bg: "bg-yellow-100", label: "Best Score", value: `${stats.bestScore}%` },
              { icon: <TrendingUp className="text-purple-600" />, bg: "bg-purple-100", label: "Recent Score", value: `${recentTrend}%` },
            ].map((card, i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className={`${card.bg} p-2 sm:p-3 rounded-lg shrink-0`}>{card.icon}</div>
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm">{card.label}</p>
                    <h2 className="text-xl sm:text-2xl font-bold">{card.value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-xl shadow p-5 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={18} />
              <h2 className="text-base sm:text-lg font-semibold">Performance Overview</h2>
            </div>
            <p className="text-gray-500 mb-6 text-sm">Your score distribution across all sessions</p>
            <div className="space-y-4">
              {[
                { label: "Excellent (80%+)", color: "bg-green-500", textColor: "text-green-600", count: excellent },
                { label: "Good (60-79%)", color: "bg-blue-500", textColor: "text-blue-600", count: good },
                { label: "Needs Work (below 60%)", color: "bg-red-400", textColor: "text-red-500", count: needsWork },
              ].map((bar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className={`font-medium ${bar.textColor}`}>{bar.label}</span>
                    <span className="font-bold">{bar.count}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 ${bar.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(bar.count / maxBar) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview History */}
          <div className="bg-white rounded-xl shadow p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <h2 className="text-base sm:text-lg font-semibold">Interview History</h2>
              </div>
              <span className="text-xs sm:text-sm text-gray-400">{allInterviews.length} total</span>
            </div>
            <p className="text-gray-500 mb-6 text-sm">Your complete interview session history</p>

            {allInterviews.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-400 text-sm">No interviews yet</p>
                <a href="/mock-interview" className="mt-4 inline-block bg-[#2fb79c] text-white px-6 py-2 rounded-lg text-sm">
                  Start Interview
                </a>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {displayedInterviews.map((interview) => (
                    <div key={interview._id} className="bg-gray-50 p-3 sm:p-4 rounded-xl border hover:border-gray-300 transition cursor-pointer"
                      onClick={() => navigate(`/interview-detail/${interview._id}`)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3 flex-1">
                          <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                            <MessageSquare className="text-[#243A6F]" size={18} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{interview.company}</h3>
                            <p className="text-xs sm:text-sm text-gray-500">{interview.branch}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {interview.answeredQuestions}/{interview.totalQuestions} answered
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getScoreBadge(interview.score)}`}>
                              {interview.score}%
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(interview._id)}
                            disabled={deletingId === interview._id}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete this interview"
                          >
                            {deletingId === interview._id
                              ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 size={16} />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {allInterviews.length > 10 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-4 border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:border-gray-400 transition text-sm"
                  >
                    {showAll
                      ? <><ChevronUp size={18} />Show Less</>
                      : <><ChevronDown size={18} />View All ({allInterviews.length - 10} more)</>
                    }
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;