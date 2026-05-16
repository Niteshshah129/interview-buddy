import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MessageSquare, TrendingUp, Trophy, Upload, BarChart, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import API from "../../api/api.js";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalSessions: 0, avgScore: 0, bestScore: 0 });
  const [allSessions, setAllSessions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, interviewsRes] = await Promise.all([
        API.get("/progress/stats", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/interview/my", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setAllSessions(interviewsRes.data);
    } catch (err) {
      console.log("Dashboard load error:", err);
    }
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
    if (!window.confirm("Delete this interview session? This cannot be undone.")) return;
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
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-500 bg-red-100";
  };

  const displayedSessions = showAll ? allSessions : allSessions.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8 mt-12 lg:mt-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm sm:text-base">Ready to ace your next interview? Let's practice!</p>
        </div>
        <button
          onClick={() => navigate("/mock-interview")}
          className="bg-[#2fb79c] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#27a085] transition text-sm sm:text-base w-full sm:w-auto"
        >
          Start Mock Interview
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow flex gap-4 items-center hover:shadow-lg transition-shadow">
          <MessageSquare className="text-green-500 shrink-0" />
          <div>
            <p className="text-gray-500 text-sm">Total Sessions</p>
            <h2 className="text-2xl sm:text-3xl font-bold">{stats.totalSessions}</h2>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow flex gap-4 items-center hover:shadow-lg transition-shadow">
          <TrendingUp className="text-blue-500 shrink-0" />
          <div>
            <p className="text-gray-500 text-sm">Average Score</p>
            <h2 className="text-2xl sm:text-3xl font-bold">{stats.avgScore}%</h2>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow flex gap-4 items-center hover:shadow-lg transition-shadow">
          <Trophy className="text-yellow-500 shrink-0" />
          <div>
            <p className="text-gray-500 text-sm">Best Score</p>
            <h2 className="text-2xl sm:text-3xl font-bold">{stats.bestScore}%</h2>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
          <Link to="/mock-interview">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-50 p-2 sm:p-3 text-green-500 mb-2">
              <MessageSquare className="w-full h-full" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold">Mock Interview</h2>
            <p className="text-gray-500 text-sm">Practice with real interview questions</p>
          </Link>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
          <Link to="/resume">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 p-2 sm:p-3 text-blue-500 mb-2">
              <Upload className="w-full h-full" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold">Upload Resume</h2>
            <p className="text-gray-500 text-sm">Upload your resume</p>
          </Link>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
          <Link to="/progress">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 p-2 sm:p-3 text-purple-500 mb-2">
              <BarChart className="w-full h-full" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold">View Progress</h2>
            <p className="text-gray-500 text-sm">Track performance</p>
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white p-5 sm:p-8 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Interview Sessions</h2>
          {allSessions.length > 0 && (
            <span className="text-xs sm:text-sm text-gray-400">{allSessions.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allSessions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4 text-sm sm:text-base">No interview sessions yet</p>
            <button
              onClick={() => navigate("/mock-interview")}
              className="bg-[#2fb79c] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#27a085] transition text-sm sm:text-base">
              Start Your First Interview
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedSessions.map((session) => (
                <div key={session._id} className="bg-gray-50 p-3 sm:p-4 rounded-xl border hover:border-gray-300 transition cursor-pointer flex items-center justify-between"
                  onClick={() => navigate(`/interview-detail/${session._id}`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                      <MessageSquare className="text-[#243A6F]" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{session.company}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{session.branch}</p>
                      <p className="text-xs text-gray-400">{session.answeredQuestions}/{session.totalQuestions} questions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreBadge(session.score)}`}>
                        {session.score}%
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(session._id)}
                      disabled={deletingId === session._id}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete this session"
                    >
                      {deletingId === session._id
                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={16} />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {allSessions.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-4 border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:border-gray-400 transition text-sm"
              >
                {showAll ? <><ChevronUp size={18} /> Show Less</> : <><ChevronDown size={18} /> View All ({allSessions.length - 5} more)</>}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;